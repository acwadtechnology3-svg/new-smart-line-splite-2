
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestContext {
  requestId: string;
  userId?: string;
  userRole?: string;
  traceId?: string;
  path?: string;
  method?: string;
  startTime?: [number, number];
}

const asyncLocalStorage = new AsyncLocalStorage<RequestContext>();

export const requestContext = {
  // Get current store
  get: (): RequestContext | undefined => asyncLocalStorage.getStore(),

  // Run within context
  run: (store: RequestContext, callback: () => void) => asyncLocalStorage.run(store, callback),

  // Update current context
  set: (key: keyof RequestContext, value: any) => {
    const store = asyncLocalStorage.getStore();
    if (store) {
      (store as Record<string, any>)[key] = value;
    }
  },

  // Helpers
  getRequestId: () => asyncLocalStorage.getStore()?.requestId,
  getUserId: () => asyncLocalStorage.getStore()?.userId,
};
