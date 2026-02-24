import { apiRequest } from './backend';
import { realtimeClient } from './realtimeClient';
import { NavigationContainerRef } from '@react-navigation/native';
import { Alert } from 'react-native';

/**
 * Global Trip Status Service
 * This service monitors trip status independently of React components
 * It will continue working even during screen transitions.
 * Uses realtime WebSocket as primary + polling fallback every 5s.
 */
class TripStatusService {
    private static instance: TripStatusService;
    private navigationRef: NavigationContainerRef<any> | null = null;
    private activeTripId: string | null = null;
    private unsubscribe: (() => void) | null = null;
    private lastStatus: string = '';
    private pollTimer: ReturnType<typeof setInterval> | null = null;
    private static POLL_INTERVAL = 5000; // 5 seconds

    private constructor() { }

    static getInstance(): TripStatusService {
        if (!TripStatusService.instance) {
            TripStatusService.instance = new TripStatusService();
        }
        return TripStatusService.instance;
    }

    setNavigationRef(ref: NavigationContainerRef<any>) {
        this.navigationRef = ref;
        console.log('[TripService] Navigation ref set');
    }

    startMonitoring(tripId: string) {
        if (this.activeTripId === tripId) {
            console.log(`[TripService] Already monitoring trip: ${tripId}`);
            return;
        }

        // Stop any existing monitoring
        this.stopMonitoring();

        this.activeTripId = tripId;
        console.log(`[TripService] Starting monitoring for trip: ${tripId}`);

        // Initial status fetch
        this.pollStatus();

        // Start realtime subscription
        (async () => {
            try {
                this.unsubscribe = await realtimeClient.subscribe(
                    { channel: 'trip:status', tripId },
                    (payload) => {
                        const newStatus = payload?.new?.status;
                        if (!newStatus) return;

                        console.log(`[TripService] Realtime: ${this.lastStatus} -> ${newStatus}`);
                        if (newStatus !== this.lastStatus) {
                            this.lastStatus = newStatus;
                            this.handleStatusChange(newStatus);
                        }
                    }
                );
            } catch (err) {
                console.error('[TripService] Realtime subscription error:', err);
            }
        })();

        // Start polling fallback
        this.pollTimer = setInterval(() => this.pollStatus(), TripStatusService.POLL_INTERVAL);
    }

    private async pollStatus() {
        if (!this.activeTripId) return;

        try {
            const data = await apiRequest<{ trip: any }>(`/trips/${this.activeTripId}`);
            const newStatus = data.trip?.status;
            if (newStatus && newStatus !== this.lastStatus) {
                console.log(`[TripService] Poll: ${this.lastStatus} -> ${newStatus}`);
                this.lastStatus = newStatus;
                this.handleStatusChange(newStatus);
            }
        } catch {
            // Ignore poll errors silently
        }
    }

    private handleStatusChange(status: string) {
        if (!this.navigationRef || !this.activeTripId) {
            console.log('[TripService] No navigation ref or trip ID');
            return;
        }

        console.log(`[TripService] Handling status: ${status}`);

        const tripId = this.activeTripId;

        (async () => {
            try {
                const data = await apiRequest<{ trip: any }>(`/trips/${tripId}`);
                const isTravel = data.trip?.is_travel_request;

                if (isTravel) {
                    console.log('[TripService] Trip is a Travel Request, skipping auto-navigation');
                    return;
                }

                if (!this.navigationRef || !this.activeTripId) return;

                switch (status) {
                    case 'accepted':
                        console.log('[TripService] Trip ACCEPTED - navigating to DriverFound');
                        this.navigationRef.navigate('DriverFound', { tripId });
                        break;

                    case 'arrived':
                        console.log('[TripService] Driver ARRIVED');
                        break;

                    case 'started':
                        console.log('[TripService] Trip STARTED');
                        this.navigationRef.navigate('OnTrip', { tripId });
                        break;

                    case 'completed':
                        console.log('[TripService] Trip COMPLETED');
                        this.navigationRef.navigate('TripComplete', { tripId });
                        this.stopMonitoring();
                        break;

                    case 'cancelled':
                        console.log('[TripService] Trip CANCELLED');
                        Alert.alert('Trip Cancelled', 'The trip has been cancelled.');
                        this.navigationRef.reset({ index: 0, routes: [{ name: 'CustomerHome' }] });
                        this.stopMonitoring();
                        break;
                }
            } catch (err) {
                console.error('[TripService] Error checking trip type:', err);
            }
        })();
    }

    stopMonitoring() {
        console.log('[TripService] Stopping monitoring');

        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }

        if (this.pollTimer) {
            clearInterval(this.pollTimer);
            this.pollTimer = null;
        }

        this.activeTripId = null;
        this.lastStatus = '';
    }

    isMonitoring(): boolean {
        return this.activeTripId !== null;
    }

    getCurrentTripId(): string | null {
        return this.activeTripId;
    }
}

export const tripStatusService = TripStatusService.getInstance();
