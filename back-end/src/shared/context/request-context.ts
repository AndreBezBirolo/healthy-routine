import { AsyncLocalStorage } from 'node:async_hooks';

export interface RequestContextData {
  requestId: string;
  userId?: string;
  workspaceId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export const requestContext = new AsyncLocalStorage<RequestContextData>();

export function getRequestContext(): RequestContextData | undefined {
  return requestContext.getStore();
}
