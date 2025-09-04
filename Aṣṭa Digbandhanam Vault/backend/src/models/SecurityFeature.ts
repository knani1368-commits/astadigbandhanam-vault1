import mongoose, { Document, Schema } from 'mongoose';

/**
 * Security feature directions (Aṣṭa Digbandhanam)
 */
export enum SecurityDirection {
  EAST = 'east',           // Purva - Master Password
  SOUTHEAST = 'southeast', // Agneya - Multi-Factor Authentication
  SOUTH = 'south',         // Dakshina - Device Binding
  SOUTHWEST = 'southwest', // Nairrtya - Vault Encryption
  WEST = 'west',           // Paschima - Secrets Vault
  NORTHWEST = 'northwest', // Vayavya - Network Protection
  NORTH = 'north',         // Uttara - Biometric Unlock
  NORTHEAST = 'northeast', // Ishanya - Watchtower AI
  ABOVE = 'above',         // Ūrdhva - Cloud Backup
  BELOW = 'below',         // Adhaḥ - Local Secure Storage
}

/**
 * Security feature interface
 */
export interface ISecurityFeature extends Document {
  userId: mongoose.Types.ObjectId;
  direction: SecurityDirection;
  name: string;
  description: string;
  enabled: boolean;
  score: number;
  maxScore: number;
  configuration: Record<string, any>;
  lastUpdated: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Security feature schema
 */
const SecurityFeatureSchema = new Schema<ISecurityFeature>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  direction: {
    type: String,
    enum: Object.values(SecurityDirection),
    required: [true, 'Security direction is required'],
  },
  name: {
    type: String,
    required: [true, 'Feature name is required'],
  },
  description: {
    type: String,
    required: [true, 'Feature description is required'],
  },
  enabled: {
    type: Boolean,
    default: false,
  },
  score: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  maxScore: {
    type: Number,
    default: 100,
    min: 0,
    max: 100,
  },
  configuration: {
    type: Schema.Types.Mixed,
    default: {},
  },
  lastUpdated: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

// Indexes for performance
SecurityFeatureSchema.index({ userId: 1, direction: 1 }, { unique: true });
SecurityFeatureSchema.index({ userId: 1, enabled: 1 });

// Pre-save middleware to update lastUpdated
SecurityFeatureSchema.pre('save', function(next) {
  if (this.isModified('enabled') || this.isModified('score') || this.isModified('configuration')) {
    this.lastUpdated = new Date();
  }
  next();
});

export const SecurityFeature = mongoose.model<ISecurityFeature>('SecurityFeature', SecurityFeatureSchema);
