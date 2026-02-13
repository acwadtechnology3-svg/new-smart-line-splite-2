import { logger } from '../logger';

export interface AuditLogOptions {
  actorId?: string;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: Record<string, any>;
  status?: 'success' | 'failure';
}

/**
 * Dedicated logger for auditing sensitive actions.
 * All audit logs carry `type: "audit"` for easy filtering in log aggregation.
 *
 * Example events:
 *   login_success, login_failed, password_changed,
 *   admin_user_updated, payout_requested, role_changed
 */
export const auditLog = (options: AuditLogOptions) => {
  const { actorId, action, targetType, targetId, metadata, status = 'success' } = options;

  logger.info({
    msg: `Audit: ${action} by ${actorId || 'system'}`,
    type: 'audit',
    event: `audit_${action}`,
    audit: {
      actorId,
      action,
      targetType,
      targetId,
      status,
      metadata,
      timestamp: new Date().toISOString(),
    },
  });
};

/**
 * Convenience helper for auth events
 */
export const logAuthEvent = (
  action: 'login_success' | 'login_failed' | 'logout' | 'password_changed' | 'token_refreshed',
  actorId: string,
  metadata?: Record<string, any>,
) => {
  const status = action.includes('failed') ? 'failure' : 'success';
  auditLog({
    action,
    actorId,
    status,
    targetType: 'user',
    targetId: actorId,
    metadata,
  });
};

/**
 * Convenience helper for admin actions
 */
export const logAdminAction = (
  action: string,
  adminId: string,
  targetType: string,
  targetId: string,
  metadata?: Record<string, any>,
) => {
  auditLog({
    action: `admin_${action}`,
    actorId: adminId,
    targetType,
    targetId,
    metadata,
  });
};
