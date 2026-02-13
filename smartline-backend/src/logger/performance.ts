import { createLogger } from '../logger';

const perfLogger = createLogger('performance');

export interface QueryLogOptions {
  query: string;
  duration_ms: number;
  rows?: number;
  params?: any[];
  source?: string;
}

export interface HttpDependencyLogOptions {
  name: string;
  url: string;
  method: string;
  status: number;
  duration_ms: number;
  error?: string;
}

/**
 * Log a database query. Warns when a query is slow (>500ms by default).
 */
export const logQuery = (options: QueryLogOptions) => {
  const { query, duration_ms, rows, params, source } = options;
  const isSlow = duration_ms > 500;

  const logData = {
    event: 'db_query',
    query: query.substring(0, 500), // Truncate long queries
    duration_ms,
    rows,
    source,
    // Never log raw params in production — could contain PII
    ...(process.env.NODE_ENV === 'development' ? { params } : {}),
  };

  if (isSlow) {
    perfLogger.warn({ msg: `Slow query (${duration_ms}ms)`, ...logData });
  } else {
    perfLogger.debug({ msg: `DB query (${duration_ms}ms)`, ...logData });
  }
};

/**
 * Log an external HTTP dependency call (e.g. payment gateway, map API).
 * Warns when calls exceed 1000ms.
 */
export const logHttpDependency = (options: HttpDependencyLogOptions) => {
  const { name, url, method, status, duration_ms, error } = options;
  const isSlow = duration_ms > 1000;

  const logData = {
    event: 'http_dependency_call',
    dependency: name,
    url,
    method,
    status,
    duration_ms,
    ...(error ? { error } : {}),
  };

  if (error || status >= 500) {
    perfLogger.error({ msg: `Dependency ${name} error (${status}, ${duration_ms}ms)`, ...logData });
  } else if (isSlow) {
    perfLogger.warn({ msg: `Slow dependency ${name} (${duration_ms}ms)`, ...logData });
  } else {
    perfLogger.debug({ msg: `Dependency ${name} (${status}, ${duration_ms}ms)`, ...logData });
  }
};

/**
 * Utility: time a function and log its execution.
 * Usage:
 *   const result = await timedExec('fetchUser', async () => db.getUser(id));
 */
export const timedExec = async <T>(
  label: string,
  fn: () => Promise<T>,
): Promise<T> => {
  const start = process.hrtime();
  try {
    const result = await fn();
    const diff = process.hrtime(start);
    const ms = parseFloat((diff[0] * 1000 + diff[1] / 1e6).toFixed(2));
    perfLogger.debug({ msg: `${label} completed in ${ms}ms`, event: 'timed_exec', label, duration_ms: ms });
    return result;
  } catch (err: any) {
    const diff = process.hrtime(start);
    const ms = parseFloat((diff[0] * 1000 + diff[1] / 1e6).toFixed(2));
    perfLogger.error({ msg: `${label} failed after ${ms}ms`, event: 'timed_exec_error', label, duration_ms: ms, error: err.message });
    throw err;
  }
};
