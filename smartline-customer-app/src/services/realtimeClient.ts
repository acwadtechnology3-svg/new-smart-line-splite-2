import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config/api';

type SubscriptionHandler = (payload: any) => void;

type SubscribeParams =
  | { channel: 'driver:trip-requests' }
  | { channel: 'driver:offer-updates' }
  | { channel: 'driver:location'; tripId: string; driverId: string }
  | { channel: 'trip:offers'; tripId: string }
  | { channel: 'trip:status'; tripId: string }
  | { channel: 'trip:messages'; tripId: string }
  | { channel: 'support:messages'; ticketId: string };

type PendingSub = {
  handler: SubscriptionHandler;
  params: SubscribeParams;
};

class RealtimeClient {
  private ws: WebSocket | null = null;
  private handlers = new Map<string, SubscriptionHandler>();
  private pending = new Map<string, PendingSub>();
  private connecting: Promise<void> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectDelay = 1000;
  private maxReconnectDelay = 30000;
  private intentionallyClosed = false;

  private getWsUrl() {
    const base = API_URL.replace(/^http/, 'ws').replace(/\/api$/, '');
    return `${base}/ws`;
  }

  private async getToken() {
    const session = await AsyncStorage.getItem('userSession');
    if (!session) return null;
    try {
      const { token } = JSON.parse(session);
      return token as string | undefined;
    } catch {
      return null;
    }
  }

  private scheduleReconnect() {
    if (this.intentionallyClosed || this.reconnectTimer) return;
    if (this.pending.size === 0) return; // No active subscriptions, don't reconnect

    console.log(`[Realtime] Reconnecting in ${this.reconnectDelay}ms...`);
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      try {
        await this.connect();
        this.reconnectDelay = 1000; // Reset on success
      } catch {
        this.reconnectDelay = Math.min(this.reconnectDelay * 2, this.maxReconnectDelay);
        this.scheduleReconnect();
      }
    }, this.reconnectDelay);
  }

  private async connect() {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) return;
    if (this.connecting) return this.connecting;

    this.intentionallyClosed = false;

    this.connecting = new Promise<void>(async (resolve, reject) => {
      try {
        const ws = new WebSocket(this.getWsUrl());
        this.ws = ws;

        ws.onopen = async () => {
          console.log('[Realtime] WebSocket connected');
          const token = await this.getToken();
          if (token) {
            ws.send(JSON.stringify({ type: 'auth', token }));
          }

          // Re-subscribe all pending subscriptions
          for (const [subscriptionId, sub] of this.pending.entries()) {
            ws.send(JSON.stringify({ type: 'subscribe', subscriptionId, ...sub.params }));
          }

          resolve();
        };

        ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'event') {
              const handler = this.handlers.get(message.subscriptionId);
              if (handler) handler(message.payload);
            }
          } catch {
            // Ignore malformed payloads
          }
        };

        ws.onclose = () => {
          console.log('[Realtime] WebSocket closed');
          this.ws = null;
          this.connecting = null;
          this.scheduleReconnect();
        };

        ws.onerror = () => {
          this.ws = null;
          this.connecting = null;
          reject(new Error('Realtime connection failed'));
        };
      } catch (err) {
        this.connecting = null;
        reject(err);
      }
    });

    return this.connecting;
  }

  private generateId() {
    return `sub_${Math.random().toString(36).slice(2)}_${Date.now()}`;
  }

  async subscribe(params: SubscribeParams, handler: SubscriptionHandler) {
    const subscriptionId = this.generateId();
    this.handlers.set(subscriptionId, handler);
    this.pending.set(subscriptionId, { handler, params });

    try {
      await this.connect();

      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'subscribe', subscriptionId, ...params }));
      }
    } catch {
      // Connection failed, reconnect will retry
      this.scheduleReconnect();
    }

    return () => {
      this.handlers.delete(subscriptionId);
      this.pending.delete(subscriptionId);
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'unsubscribe', subscriptionId }));
      }
    };
  }

  disconnect() {
    this.intentionallyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connecting = null;
  }
}

export const realtimeClient = new RealtimeClient();
