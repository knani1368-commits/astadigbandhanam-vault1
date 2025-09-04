import mongoose, { Document, Schema } from 'mongoose';

/**
 * User interface
 */
export interface IUser extends Document {
  email: string;
  password: string;
  masterPassword: string;
  masterKeySalt: string;
  isEmailVerified: boolean;
  twoFactorEnabled: boolean;
  twoFactorSecret?: string;
  securityScore: number;
  isActive: boolean;
  lastLoginAt: Date | null;
  loginAttempts: number;
  lockoutUntil: Date | null;
  refreshToken: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User schema
 */
const UserSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
  },
  masterPassword: {
    type: String,
    required: [true, 'Master password is required'],
    minlength: [8, 'Master password must be at least 8 characters long'],
  },
  masterKeySalt: {
    type: String,
    required: [true, 'Master key salt is required'],
  },
  isEmailVerified: {
    type: Boolean,
    default: false,
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorSecret: {
    type: String,
    default: null,
  },
  securityScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLoginAt: {
    type: Date,
    default: null,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockoutUntil: {
    type: Date,
    default: null,
  },
  refreshToken: {
    type: String,
    default: null,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
}, {
  timestamps: true,
  toJSON: {
    transform: function(doc, ret) {
      delete ret.password;
      delete ret.masterPassword;
      delete ret.masterKeySalt;
      delete ret.twoFactorSecret;
      delete ret.refreshToken;
      delete ret.__v;
      return ret;
    },
  },
});

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ createdAt: -1 });

// Pre-save middleware
UserSchema.pre('save', function(next) {
  if (this.isModified('email')) {
    this.email = this.email.toLowerCase().trim();
  }
  next();
});

export const User = mongoose.model<IUser>('User', UserSchema);
