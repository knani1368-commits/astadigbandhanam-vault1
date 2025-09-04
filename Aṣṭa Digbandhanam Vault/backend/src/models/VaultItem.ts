import mongoose, { Document, Schema } from 'mongoose';

/**
 * Vault item types
 */
export enum VaultItemType {
  LOGIN = 'login',
  SECURE_NOTE = 'secureNote',
  PAYMENT_CARD = 'paymentCard',
  IDENTITY = 'identity',
}

/**
 * Vault item interface
 */
export interface IVaultItem extends Document {
  userId: mongoose.Types.ObjectId;
  type: VaultItemType;
  encryptedData: string;
  encryptedDataKey: string;
  iv: string;
  tag: string;
  algorithm: 'aes' | 'xchacha';
  tags: string[];
  favorite: boolean;
  isDeleted: boolean;
  deletedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Vault item schema
 */
const VaultItemSchema = new Schema<IVaultItem>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
    index: true,
  },
  type: {
    type: String,
    enum: Object.values(VaultItemType),
    required: [true, 'Vault item type is required'],
  },
  encryptedData: {
    type: String,
    required: [true, 'Encrypted data is required'],
  },
  encryptedDataKey: {
    type: String,
    required: [true, 'Encrypted data key is required'],
  },
  iv: {
    type: String,
    required: [true, 'IV is required'],
  },
  tag: {
    type: String,
    required: [true, 'Authentication tag is required'],
  },
  algorithm: {
    type: String,
    enum: ['aes', 'xchacha'],
    default: 'aes',
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
  }],
  favorite: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.encryptedData;
      delete ret.encryptedDataKey;
      delete ret.iv;
      delete ret.tag;
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes for performance
VaultItemSchema.index({ userId: 1, type: 1 });
VaultItemSchema.index({ userId: 1, favorite: 1 });
VaultItemSchema.index({ userId: 1, tags: 1 });
VaultItemSchema.index({ userId: 1, isDeleted: 1 });
VaultItemSchema.index({ userId: 1, createdAt: -1 });

// Soft delete middleware
VaultItemSchema.pre('find', function() {
  this.where({ isDeleted: false });
});

VaultItemSchema.pre('findOne', function() {
  this.where({ isDeleted: false });
});

VaultItemSchema.pre('findOneAndUpdate', function() {
  this.where({ isDeleted: false });
});

// Soft delete method
VaultItemSchema.methods.softDelete = function() {
  this.isDeleted = true;
  this.deletedAt = new Date();
  return this.save();
};

export const VaultItem = mongoose.model<IVaultItem>('VaultItem', VaultItemSchema);
