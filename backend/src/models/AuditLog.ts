import mongoose, { Document, Schema } from 'mongoose';

/**
 * Audit log event types
 */
export enum AuditEventType {
  LOGIN = 'login',
  LOGOUT = 'logout',
  REGISTER = 'register',
  PASSWORD_CHANGE = 'password_change',
  MASTER_PASSWORD_CHANGE = 'master_password_change',
  TWO_FACTOR_ENABLE = 'two_factor_enable',
  TWO_FACTOR_DISABLE = 'two_factor_disable',
  VAULT_ITEM_CREATE = 'vault_item_create',
  VAULT_ITEM_UPDATE = 'vault_item_update',
  VAULT_ITEM_DELETE = 'vault_item_delete',
  SECURITY_FEATURE_ENABLE = 'security_feature_enable',
  SECURITY_FEATURE_DISABLE = 'security_feature_disable',
  ACCOUNT_LOCKED = 'account_locked',
  ACCOUNT_UNLOCKED = 'account_unlocked',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  DATA_EXPORT = 'data_export',
  DATA_IMPORT = 'data_import',
}

/**
 * Audit log severity levels
 */
export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

/**
 * Audit log interface
 */
export interface IAuditLog extends Document {
  userId: mongoose.Types.ObjectId | null;
  eventType: AuditEventType;
  severity: AuditSeverity;
  description: string;
  ipAddress: string;
  userAgent: string;
  metadata: Record<string, any>;
  timestamp: Date;
  createdAt: Date;
}

/**
 * Audit log schema
 */
const AuditLogSchema = new Schema<IAuditLog>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
    index: true,
  },
  eventType: {
    type: String,
    enum: Object.values(AuditEventType),
    required: [true, 'Event type is required'],
  },
  severity: {
    type: String,
    enum: Object.values(AuditSeverity),
    required: [true, 'Severity is required'],
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  ipAddress: {
    type: String,
    required: [true, 'IP address is required'],
  },
  userAgent: {
    type: String,
    required: [true, 'User agent is required'],
  },
  metadata: {
    type: Schema.Types.Mixed,
    default: {},
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
}, {
  timestamps: true,
});

// Indexes for performance and querying
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ eventType: 1, timestamp: -1 });
AuditLogSchema.index({ severity: 1, timestamp: -1 });
AuditLogSchema.index({ ipAddress: 1, timestamp: -1 });
AuditLogSchema.index({ timestamp: -1 });

// TTL index to automatically delete old logs (retain for 1 year)
AuditLogSchema.index({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
