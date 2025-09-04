import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { SecurityFeature, SecurityDirection } from '../models/SecurityFeature';
import { User } from '../models/User';
import { AuditLog, AuditEventType, AuditSeverity } from '../models/AuditLog';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

/**
 * Security Features Service implementing Aṣṭa Digbandhanam
 * Manages the eight-directional security protection system
 */
export class SecurityFeaturesService {
  /**
   * Initialize default security features for a new user
   */
  static async initializeUserSecurityFeatures(userId: string): Promise<void> {
    try {
      const defaultFeatures = [
        {
          direction: SecurityDirection.EAST,
          name: 'Master Password Protection',
          description: 'Argon2id KDF with zero-knowledge architecture',
          maxScore: 100,
          configuration: { algorithm: 'argon2id', iterations: 100000 },
        },
        {
          direction: SecurityDirection.SOUTHEAST,
          name: 'Multi-Factor Authentication',
          description: 'TOTP + WebAuthn hardware key support',
          maxScore: 100,
          configuration: { totpEnabled: false, webauthnEnabled: false },
        },
        {
          direction: SecurityDirection.SOUTH,
          name: 'Device Binding',
          description: 'Trusted device registration and jailbreak detection',
          maxScore: 100,
          configuration: { trustedDevices: [], jailbreakDetection: false },
        },
        {
          direction: SecurityDirection.SOUTHWEST,
          name: 'Vault Encryption',
          description: 'AES-256-GCM or XChaCha20-Poly1305 per secret',
          maxScore: 100,
          configuration: { algorithm: 'aes-256-gcm', envelopeEncryption: true },
        },
        {
          direction: SecurityDirection.WEST,
          name: 'Secrets Vault',
          description: 'End-to-end encrypted vault storage',
          maxScore: 100,
          configuration: { encryptionEnabled: true, backupEnabled: false },
        },
        {
          direction: SecurityDirection.NORTHWEST,
          name: 'Network Protection',
          description: 'HTTPS/TLS 1.3 with certificate pinning',
          maxScore: 100,
          configuration: { httpsEnabled: true, certificatePinning: false },
        },
        {
          direction: SecurityDirection.NORTH,
          name: 'Biometric Unlock',
          description: 'FaceID/TouchID via WebAuthn with fallback',
          maxScore: 100,
          configuration: { biometricEnabled: false, fallbackEnabled: true },
        },
        {
          direction: SecurityDirection.NORTHEAST,
          name: 'Watchtower AI',
          description: 'Breach alerts and password strength analysis',
          maxScore: 100,
          configuration: { breachMonitoring: false, strengthAnalysis: false },
        },
        {
          direction: SecurityDirection.ABOVE,
          name: 'Cloud Backup',
          description: 'Optional encrypted sync with Shamir Secret Sharing',
          maxScore: 100,
          configuration: { cloudBackup: false, shamirSharing: false },
        },
        {
          direction: SecurityDirection.BELOW,
          name: 'Local Secure Storage',
          description: 'IndexedDB with OS secure storage fallback',
          maxScore: 100,
          configuration: { indexedDB: true, osSecureStorage: false },
        },
      ];

      for (const feature of defaultFeatures) {
        await SecurityFeature.create({
          userId,
          ...feature,
          enabled: false,
          score: 0,
        });
      }

      logger.info('Security features initialized for user', { userId });
    } catch (error) {
      logger.error('Failed to initialize security features:', error);
      throw new AppError('Failed to initialize security features', 500, 'INIT_ERROR');
    }
  }

  /**
   * Get all security features for a user
   */
  static async getUserSecurityFeatures(userId: string): Promise<any[]> {
    try {
      const features = await SecurityFeature.find({ userId }).sort({ direction: 1 });
      return features;
    } catch (error) {
      logger.error('Failed to get security features:', error);
      throw new AppError('Failed to get security features', 500, 'FETCH_ERROR');
    }
  }

  /**
   * Update security feature configuration
   */
  static async updateSecurityFeature(
    userId: string,
    direction: SecurityDirection,
    updates: Partial<any>
  ): Promise<any> {
    try {
      const feature = await SecurityFeature.findOneAndUpdate(
        { userId, direction },
        { $set: updates },
        { new: true, upsert: false }
      );

      if (!feature) {
        throw new AppError('Security feature not found', 404, 'FEATURE_NOT_FOUND');
      }

      // Log the update
      await this.logSecurityEvent(
        userId,
        updates.enabled ? AuditEventType.SECURITY_FEATURE_ENABLE : AuditEventType.SECURITY_FEATURE_DISABLE,
        `Security feature ${direction} updated`,
        { direction, updates }
      );

      return feature;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Failed to update security feature:', error);
      throw new AppError('Failed to update security feature', 500, 'UPDATE_ERROR');
    }
  }

  /**
   * Calculate overall security score
   */
  static async calculateSecurityScore(userId: string): Promise<number> {
    try {
      const features = await SecurityFeature.find({ userId });
      const totalScore = features.reduce((sum, feature) => sum + feature.score, 0);
      const maxPossibleScore = features.reduce((sum, feature) => sum + feature.maxScore, 0);
      
      const securityScore = maxPossibleScore > 0 ? Math.round((totalScore / maxPossibleScore) * 100) : 0;
      
      // Update user's security score
      await User.findByIdAndUpdate(userId, { securityScore });
      
      return securityScore;
    } catch (error) {
      logger.error('Failed to calculate security score:', error);
      throw new AppError('Failed to calculate security score', 500, 'CALCULATION_ERROR');
    }
  }

  /**
   * Enable Two-Factor Authentication (SOUTHEAST - Agneya)
   */
  static async enableTwoFactor(userId: string): Promise<{ secret: string; qrCodeUrl: string }> {
    try {
      const secret = speakeasy.generateSecret({
        name: 'Aṣṭa Digbandhanam Vault',
        issuer: 'Aṣṭa Digbandhanam',
        length: 32,
      });

      const qrCodeUrl = await QRCode.toDataURL(secret.otpauth_url!);

      // Update user with 2FA secret
      await User.findByIdAndUpdate(userId, {
        twoFactorSecret: secret.base32,
        twoFactorEnabled: false, // Will be enabled after verification
      });

      // Update security feature
      await this.updateSecurityFeature(userId, SecurityDirection.SOUTHEAST, {
        enabled: false,
        score: 50, // Partial score until verified
        configuration: { totpEnabled: true, secret: secret.base32 },
      });

      await this.logSecurityEvent(
        userId,
        AuditEventType.TWO_FACTOR_ENABLE,
        'Two-factor authentication setup initiated',
        { direction: SecurityDirection.SOUTHEAST }
      );

      return { secret: secret.base32, qrCodeUrl };
    } catch (error) {
      logger.error('Failed to enable two-factor authentication:', error);
      throw new AppError('Failed to enable two-factor authentication', 500, 'TWO_FACTOR_ERROR');
    }
  }

  /**
   * Verify Two-Factor Authentication token
   */
  static async verifyTwoFactor(userId: string, token: string): Promise<boolean> {
    try {
      const user = await User.findById(userId);
      if (!user || !user.twoFactorSecret) {
        throw new AppError('Two-factor authentication not set up', 400, 'TWO_FACTOR_NOT_SETUP');
      }

      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: 'base32',
        token,
        window: 2, // Allow 2 time steps tolerance
      });

      if (verified) {
        // Enable 2FA and update security score
        await User.findByIdAndUpdate(userId, { twoFactorEnabled: true });
        await this.updateSecurityFeature(userId, SecurityDirection.SOUTHEAST, {
          enabled: true,
          score: 100,
          configuration: { totpEnabled: true, verified: true },
        });

        await this.logSecurityEvent(
          userId,
          AuditEventType.TWO_FACTOR_ENABLE,
          'Two-factor authentication verified and enabled',
          { direction: SecurityDirection.SOUTHEAST }
        );
      }

      return verified;
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }
      logger.error('Failed to verify two-factor authentication:', error);
      throw new AppError('Failed to verify two-factor authentication', 500, 'VERIFICATION_ERROR');
    }
  }

  /**
   * Disable Two-Factor Authentication
   */
  static async disableTwoFactor(userId: string): Promise<void> {
    try {
      await User.findByIdAndUpdate(userId, {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      });

      await this.updateSecurityFeature(userId, SecurityDirection.SOUTHEAST, {
        enabled: false,
        score: 0,
        configuration: { totpEnabled: false, webauthnEnabled: false },
      });

      await this.logSecurityEvent(
        userId,
        AuditEventType.TWO_FACTOR_DISABLE,
        'Two-factor authentication disabled',
        { direction: SecurityDirection.SOUTHEAST }
      );
    } catch (error) {
      logger.error('Failed to disable two-factor authentication:', error);
      throw new AppError('Failed to disable two-factor authentication', 500, 'DISABLE_ERROR');
    }
  }

  /**
   * Enable Vault Encryption (SOUTHWEST - Nairrtya)
   */
  static async enableVaultEncryption(userId: string, algorithm: 'aes' | 'xchacha' = 'aes'): Promise<void> {
    try {
      await this.updateSecurityFeature(userId, SecurityDirection.SOUTHWEST, {
        enabled: true,
        score: 100,
        configuration: { algorithm, envelopeEncryption: true },
      });

      await this.logSecurityEvent(
        userId,
        AuditEventType.SECURITY_FEATURE_ENABLE,
        'Vault encryption enabled',
        { direction: SecurityDirection.SOUTHWEST, algorithm }
      );
    } catch (error) {
      logger.error('Failed to enable vault encryption:', error);
      throw new AppError('Failed to enable vault encryption', 500, 'ENCRYPTION_ERROR');
    }
  }

  /**
   * Enable Watchtower AI (NORTHEAST - Ishanya)
   */
  static async enableWatchtowerAI(userId: string): Promise<void> {
    try {
      await this.updateSecurityFeature(userId, SecurityDirection.NORTHEAST, {
        enabled: true,
        score: 100,
        configuration: { breachMonitoring: true, strengthAnalysis: true },
      });

      await this.logSecurityEvent(
        userId,
        AuditEventType.SECURITY_FEATURE_ENABLE,
        'Watchtower AI enabled',
        { direction: SecurityDirection.NORTHEAST }
      );
    } catch (error) {
      logger.error('Failed to enable Watchtower AI:', error);
      throw new AppError('Failed to enable Watchtower AI', 500, 'WATCHTOWER_ERROR');
    }
  }

  /**
   * Check password strength and provide recommendations
   */
  static analyzePasswordStrength(password: string): {
    score: number;
    feedback: string[];
    recommendations: string[];
  } {
    const feedback: string[] = [];
    const recommendations: string[] = [];
    let score = 0;

    // Length check
    if (password.length >= 12) {
      score += 25;
    } else if (password.length >= 8) {
      score += 15;
      feedback.push('Password could be longer');
      recommendations.push('Use at least 12 characters');
    } else {
      feedback.push('Password is too short');
      recommendations.push('Use at least 8 characters');
    }

    // Character variety checks
    if (/[a-z]/.test(password)) score += 10;
    else {
      feedback.push('Missing lowercase letters');
      recommendations.push('Include lowercase letters');
    }

    if (/[A-Z]/.test(password)) score += 10;
    else {
      feedback.push('Missing uppercase letters');
      recommendations.push('Include uppercase letters');
    }

    if (/\d/.test(password)) score += 10;
    else {
      feedback.push('Missing numbers');
      recommendations.push('Include numbers');
    }

    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score += 15;
    else {
      feedback.push('Missing special characters');
      recommendations.push('Include special characters');
    }

    // Common patterns check
    if (!/(.)\1{2,}/.test(password)) score += 10;
    else {
      feedback.push('Avoid repeated characters');
      recommendations.push('Avoid repeating the same character');
    }

    if (!/123|abc|qwe|password|admin/i.test(password)) score += 10;
    else {
      feedback.push('Avoid common patterns');
      recommendations.push('Avoid common words and patterns');
    }

    // Entropy check
    const uniqueChars = new Set(password).size;
    if (uniqueChars >= password.length * 0.7) score += 10;
    else {
      feedback.push('Low character diversity');
      recommendations.push('Use more diverse characters');
    }

    return {
      score: Math.min(score, 100),
      feedback,
      recommendations,
    };
  }

  /**
   * Mock breach check (in production, this would integrate with HaveIBeenPwned API)
   */
  static async checkPasswordBreach(password: string): Promise<{
    isBreached: boolean;
    breachCount: number;
    recommendations: string[];
  }> {
    // Mock implementation - in production, use HaveIBeenPwned API
    const mockBreachedPasswords = [
      'password123',
      '123456',
      'admin',
      'qwerty',
      'letmein',
    ];

    const isBreached = mockBreachedPasswords.includes(password.toLowerCase());
    const breachCount = isBreached ? Math.floor(Math.random() * 1000000) + 1000 : 0;

    const recommendations = isBreached
      ? ['This password has been found in data breaches', 'Change this password immediately']
      : ['Password appears to be secure'];

    return {
      isBreached,
      breachCount,
      recommendations,
    };
  }

  /**
   * Log security events for audit trail
   */
  private static async logSecurityEvent(
    userId: string,
    eventType: AuditEventType,
    description: string,
    metadata: Record<string, any> = {}
  ): Promise<void> {
    try {
      await AuditLog.create({
        userId,
        eventType,
        severity: this.getEventSeverity(eventType),
        description,
        ipAddress: '127.0.0.1', // In production, get from request
        userAgent: 'SecurityFeaturesService',
        metadata,
      });
    } catch (error) {
      logger.error('Failed to log security event:', error);
      // Don't throw error for logging failures
    }
  }

  /**
   * Get severity level for audit events
   */
  private static getEventSeverity(eventType: AuditEventType): AuditSeverity {
    const severityMap: Record<AuditEventType, AuditSeverity> = {
      [AuditEventType.LOGIN]: AuditSeverity.LOW,
      [AuditEventType.LOGOUT]: AuditSeverity.LOW,
      [AuditEventType.REGISTER]: AuditSeverity.MEDIUM,
      [AuditEventType.PASSWORD_CHANGE]: AuditSeverity.HIGH,
      [AuditEventType.MASTER_PASSWORD_CHANGE]: AuditSeverity.CRITICAL,
      [AuditEventType.TWO_FACTOR_ENABLE]: AuditSeverity.HIGH,
      [AuditEventType.TWO_FACTOR_DISABLE]: AuditSeverity.HIGH,
      [AuditEventType.VAULT_ITEM_CREATE]: AuditSeverity.MEDIUM,
      [AuditEventType.VAULT_ITEM_UPDATE]: AuditSeverity.MEDIUM,
      [AuditEventType.VAULT_ITEM_DELETE]: AuditSeverity.MEDIUM,
      [AuditEventType.SECURITY_FEATURE_ENABLE]: AuditSeverity.HIGH,
      [AuditEventType.SECURITY_FEATURE_DISABLE]: AuditSeverity.HIGH,
      [AuditEventType.ACCOUNT_LOCKED]: AuditSeverity.HIGH,
      [AuditEventType.ACCOUNT_UNLOCKED]: AuditSeverity.MEDIUM,
      [AuditEventType.SUSPICIOUS_ACTIVITY]: AuditSeverity.CRITICAL,
      [AuditEventType.DATA_EXPORT]: AuditSeverity.HIGH,
      [AuditEventType.DATA_IMPORT]: AuditSeverity.HIGH,
    };

    return severityMap[eventType] || AuditSeverity.MEDIUM;
  }
}
