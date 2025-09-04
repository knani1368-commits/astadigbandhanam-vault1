import argon2 from 'argon2';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { EncryptionService } from './encryption';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

/**
 * Authentication service implementing Argon2id and JWT
 * Provides secure authentication with zero-knowledge architecture
 */
export class AuthService {
  private static readonly JWT_EXPIRES_IN = '7d';
  private static readonly REFRESH_TOKEN_EXPIRES_IN = '30d';
  private static readonly ARGON2_OPTIONS = {
    type: argon2.argon2id,
    memoryCost: 2 ** 16, // 64 MB
    timeCost: 3,
    parallelism: 1,
    hashLength: 32,
  };

  /**
   * Hash password using Argon2id
   */
  static async hashPassword(password: string): Promise<string> {
    try {
      const salt = EncryptionService.generateSalt();
      const hash = await argon2.hash(password, {
        ...this.ARGON2_OPTIONS,
        salt,
      });
      return hash;
    } catch (error) {
      logger.error('Password hashing failed:', error);
      throw new AppError('Password hashing failed', 500, 'HASH_ERROR');
    }
  }

  /**
   * Verify password against Argon2id hash
   */
  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    try {
      return await argon2.verify(hash, password);
    } catch (error) {
      logger.error('Password verification failed:', error);
      return false;
    }
  }

  /**
   * Generate JWT access token
   */
  static generateAccessToken(userId: string, email: string): string {
    try {
      const payload = {
        userId,
        email,
        type: 'access',
        iat: Math.floor(Date.now() / 1000),
      };

      return jwt.sign(payload, process.env.JWT_SECRET!, {
        expiresIn: this.JWT_EXPIRES_IN,
        issuer: 'astadigbandhanam',
        audience: 'astadigbandhanam-client',
      });
    } catch (error) {
      logger.error('Access token generation failed:', error);
      throw new AppError('Token generation failed', 500, 'TOKEN_ERROR');
    }
  }

  /**
   * Generate JWT refresh token
   */
  static generateRefreshToken(userId: string): string {
    try {
      const payload = {
        userId,
        type: 'refresh',
        iat: Math.floor(Date.now() / 1000),
      };

      return jwt.sign(payload, process.env.JWT_REFRESH_SECRET!, {
        expiresIn: this.REFRESH_TOKEN_EXPIRES_IN,
        issuer: 'astadigbandhanam',
        audience: 'astadigbandhanam-client',
      });
    } catch (error) {
      logger.error('Refresh token generation failed:', error);
      throw new AppError('Token generation failed', 500, 'TOKEN_ERROR');
    }
  }

  /**
   * Verify JWT access token
   */
  static verifyAccessToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_SECRET!, {
        issuer: 'astadigbandhanam',
        audience: 'astadigbandhanam-client',
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Token expired', 401, 'TOKEN_EXPIRED');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid token', 401, 'INVALID_TOKEN');
      }
      throw error;
    }
  }

  /**
   * Verify JWT refresh token
   */
  static verifyRefreshToken(token: string): any {
    try {
      return jwt.verify(token, process.env.JWT_REFRESH_SECRET!, {
        issuer: 'astadigbandhanam',
        audience: 'astadigbandhanam-client',
      });
    } catch (error) {
      if (error instanceof jwt.TokenExpiredError) {
        throw new AppError('Refresh token expired', 401, 'REFRESH_TOKEN_EXPIRED');
      } else if (error instanceof jwt.JsonWebTokenError) {
        throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
      }
      throw error;
    }
  }

  /**
   * Register a new user
   */
  static async register(email: string, password: string, masterPassword: string): Promise<{
    user: any;
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      // Check if user already exists
      const existingUser = await User.findOne({ email: email.toLowerCase() });
      if (existingUser) {
        throw new AppError('User already exists', 409, 'USER_EXISTS');
      }

      // Validate password strength
      this.validatePasswordStrength(password);
      this.validatePasswordStrength(masterPassword);

      // Hash passwords
      const hashedPassword = await this.hashPassword(password);
      const hashedMasterPassword = await this.hashPassword(masterPassword);

      // Generate master key from master password
      const salt = EncryptionService.generateSalt();
      const masterKey = EncryptionService.deriveKeyFromPassword(masterPassword, salt);

      // Create user
      const user = new User({
        email: email.toLowerCase(),
        password: hashedPassword,
        masterPassword: hashedMasterPassword,
        masterKeySalt: salt.toString('hex'),
        isEmailVerified: false,
        twoFactorEnabled: false,
        securityScore: 0,
        isActive: true,
        lastLoginAt: null,
        loginAttempts: 0,
        lockoutUntil: null,
      });

      await user.save();

      // Generate tokens
      const accessToken = this.generateAccessToken(user._id.toString(), user.email);
      const refreshToken = this.generateRefreshToken(user._id.toString());

      // Update user with refresh token
      user.refreshToken = refreshToken;
      await user.save();

      logger.info('User registered successfully', { userId: user._id, email: user.email });

      return {
        user: {
          id: user._id,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          twoFactorEnabled: user.twoFactorEnabled,
          securityScore: user.securityScore,
          createdAt: user.createdAt,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('User registration failed:', error);
      throw new AppError('Registration failed', 500, 'REGISTRATION_ERROR');
    }
  }

  /**
   * Login user
   */
  static async login(email: string, password: string): Promise<{
    user: any;
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      // Find user
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }

      // Check if account is locked
      if (user.lockoutUntil && user.lockoutUntil > new Date()) {
        throw new AppError('Account is temporarily locked', 423, 'ACCOUNT_LOCKED');
      }

      // Verify password
      const isPasswordValid = await this.verifyPassword(password, user.password);
      if (!isPasswordValid) {
        // Increment login attempts
        user.loginAttempts += 1;
        
        // Lock account after 5 failed attempts
        if (user.loginAttempts >= 5) {
          user.lockoutUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes
        }
        
        await user.save();
        throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
      }

      // Reset login attempts on successful login
      user.loginAttempts = 0;
      user.lockoutUntil = null;
      user.lastLoginAt = new Date();
      await user.save();

      // Generate tokens
      const accessToken = this.generateAccessToken(user._id.toString(), user.email);
      const refreshToken = this.generateRefreshToken(user._id.toString());

      // Update user with refresh token
      user.refreshToken = refreshToken;
      await user.save();

      logger.info('User logged in successfully', { userId: user._id, email: user.email });

      return {
        user: {
          id: user._id,
          email: user.email,
          isEmailVerified: user.isEmailVerified,
          twoFactorEnabled: user.twoFactorEnabled,
          securityScore: user.securityScore,
          lastLoginAt: user.lastLoginAt,
        },
        accessToken,
        refreshToken,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('User login failed:', error);
      throw new AppError('Login failed', 500, 'LOGIN_ERROR');
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    try {
      // Verify refresh token
      const decoded = this.verifyRefreshToken(refreshToken);
      
      // Find user
      const user = await User.findById(decoded.userId);
      if (!user || user.refreshToken !== refreshToken) {
        throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
      }

      // Generate new tokens
      const newAccessToken = this.generateAccessToken(user._id.toString(), user.email);
      const newRefreshToken = this.generateRefreshToken(user._id.toString());

      // Update user with new refresh token
      user.refreshToken = newRefreshToken;
      await user.save();

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Token refresh failed:', error);
      throw new AppError('Token refresh failed', 500, 'REFRESH_ERROR');
    }
  }

  /**
   * Logout user
   */
  static async logout(userId: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, { refreshToken: null });
      logger.info('User logged out successfully', { userId });
    } catch (error) {
      logger.error('Logout failed:', error);
      throw new AppError('Logout failed', 500, 'LOGOUT_ERROR');
    }
  }

  /**
   * Validate password strength
   */
  private static validatePasswordStrength(password: string): void {
    if (password.length < 8) {
      throw new AppError('Password must be at least 8 characters long', 400, 'WEAK_PASSWORD');
    }

    if (!/(?=.*[a-z])/.test(password)) {
      throw new AppError('Password must contain at least one lowercase letter', 400, 'WEAK_PASSWORD');
    }

    if (!/(?=.*[A-Z])/.test(password)) {
      throw new AppError('Password must contain at least one uppercase letter', 400, 'WEAK_PASSWORD');
    }

    if (!/(?=.*\d)/.test(password)) {
      throw new AppError('Password must contain at least one number', 400, 'WEAK_PASSWORD');
    }

    if (!/(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/.test(password)) {
      throw new AppError('Password must contain at least one special character', 400, 'WEAK_PASSWORD');
    }
  }

  /**
   * Generate master key from master password
   */
  static generateMasterKey(masterPassword: string, salt: string): Buffer {
    return EncryptionService.deriveKeyFromPassword(masterPassword, Buffer.from(salt, 'hex'));
  }
}
