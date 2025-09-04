import { User } from '../models/User';
import { VaultItem, VaultItemType } from '../models/VaultItem';
import { SecurityFeature, SecurityDirection } from '../models/SecurityFeature';
import { AuditLog, AuditEventType, AuditSeverity } from '../models/AuditLog';

/**
 * Mock data for testing purposes
 * Provides realistic test data for all models
 */

export const mockUsers = [
  {
    email: 'test@example.com',
    password: '$argon2id$v=19$m=65536,t=3,p=1$salt$hash', // Mock Argon2id hash
    masterPassword: '$argon2id$v=19$m=65536,t=3,p=1$salt$hash',
    masterKeySalt: 'mock_salt_123456789012345678901234567890',
    isEmailVerified: true,
    twoFactorEnabled: false,
    securityScore: 75,
    isActive: true,
    role: 'user',
  },
  {
    email: 'admin@example.com',
    password: '$argon2id$v=19$m=65536,t=3,p=1$salt$hash',
    masterPassword: '$argon2id$v=19$m=65536,t=3,p=1$salt$hash',
    masterKeySalt: 'mock_salt_123456789012345678901234567890',
    isEmailVerified: true,
    twoFactorEnabled: true,
    twoFactorSecret: 'JBSWY3DPEHPK3PXP',
    securityScore: 95,
    isActive: true,
    role: 'admin',
  },
  {
    email: 'inactive@example.com',
    password: '$argon2id$v=19$m=65536,t=3,p=1$salt$hash',
    masterPassword: '$argon2id$v=19$m=65536,t=3,p=1$salt$hash',
    masterKeySalt: 'mock_salt_123456789012345678901234567890',
    isEmailVerified: false,
    twoFactorEnabled: false,
    securityScore: 25,
    isActive: false,
    role: 'user',
  },
];

export const mockVaultItems = [
  {
    type: VaultItemType.LOGIN,
    encryptedData: 'encrypted_login_data_123',
    encryptedDataKey: 'encrypted_data_key_123',
    iv: 'initialization_vector_123',
    tag: 'authentication_tag_123',
    algorithm: 'aes' as const,
    tags: ['work', 'important'],
    favorite: true,
    isDeleted: false,
  },
  {
    type: VaultItemType.SECURE_NOTE,
    encryptedData: 'encrypted_note_data_456',
    encryptedDataKey: 'encrypted_data_key_456',
    iv: 'initialization_vector_456',
    tag: 'authentication_tag_456',
    algorithm: 'xchacha' as const,
    tags: ['personal', 'private'],
    favorite: false,
    isDeleted: false,
  },
  {
    type: VaultItemType.PAYMENT_CARD,
    encryptedData: 'encrypted_card_data_789',
    encryptedDataKey: 'encrypted_data_key_789',
    iv: 'initialization_vector_789',
    tag: 'authentication_tag_789',
    algorithm: 'aes' as const,
    tags: ['finance', 'credit'],
    favorite: true,
    isDeleted: false,
  },
  {
    type: VaultItemType.IDENTITY,
    encryptedData: 'encrypted_identity_data_101',
    encryptedDataKey: 'encrypted_data_key_101',
    iv: 'initialization_vector_101',
    tag: 'authentication_tag_101',
    algorithm: 'aes' as const,
    tags: ['personal', 'identity'],
    favorite: false,
    isDeleted: true,
    deletedAt: new Date(),
  },
];

export const mockSecurityFeatures = [
  {
    direction: SecurityDirection.EAST,
    name: 'Master Password Protection',
    description: 'Argon2id KDF with zero-knowledge architecture',
    enabled: true,
    score: 100,
    maxScore: 100,
    configuration: {
      algorithm: 'argon2id',
      iterations: 100000,
    },
  },
  {
    direction: SecurityDirection.SOUTHEAST,
    name: 'Multi-Factor Authentication',
    description: 'TOTP + WebAuthn hardware key support',
    enabled: true,
    score: 100,
    maxScore: 100,
    configuration: {
      totpEnabled: true,
      webauthnEnabled: false,
    },
  },
  {
    direction: SecurityDirection.SOUTH,
    name: 'Device Binding',
    description: 'Trusted device registration and jailbreak detection',
    enabled: false,
    score: 0,
    maxScore: 100,
    configuration: {
      trustedDevices: [],
      jailbreakDetection: false,
    },
  },
  {
    direction: SecurityDirection.SOUTHWEST,
    name: 'Vault Encryption',
    description: 'AES-256-GCM or XChaCha20-Poly1305 per secret',
    enabled: true,
    score: 100,
    maxScore: 100,
    configuration: {
      algorithm: 'aes-256-gcm',
      envelopeEncryption: true,
    },
  },
  {
    direction: SecurityDirection.WEST,
    name: 'Secrets Vault',
    description: 'End-to-end encrypted vault storage',
    enabled: true,
    score: 80,
    maxScore: 100,
    configuration: {
      encryptionEnabled: true,
      backupEnabled: false,
    },
  },
  {
    direction: SecurityDirection.NORTHWEST,
    name: 'Network Protection',
    description: 'HTTPS/TLS 1.3 with certificate pinning',
    enabled: true,
    score: 100,
    maxScore: 100,
    configuration: {
      httpsEnabled: true,
      certificatePinning: false,
    },
  },
  {
    direction: SecurityDirection.NORTH,
    name: 'Biometric Unlock',
    description: 'FaceID/TouchID via WebAuthn with fallback',
    enabled: false,
    score: 0,
    maxScore: 100,
    configuration: {
      biometricEnabled: false,
      fallbackEnabled: true,
    },
  },
  {
    direction: SecurityDirection.NORTHEAST,
    name: 'Watchtower AI',
    description: 'Breach alerts and password strength analysis',
    enabled: true,
    score: 75,
    maxScore: 100,
    configuration: {
      breachMonitoring: true,
      strengthAnalysis: true,
    },
  },
  {
    direction: SecurityDirection.ABOVE,
    name: 'Cloud Backup',
    description: 'Optional encrypted sync with Shamir Secret Sharing',
    enabled: false,
    score: 0,
    maxScore: 100,
    configuration: {
      cloudBackup: false,
      shamirSharing: false,
    },
  },
  {
    direction: SecurityDirection.BELOW,
    name: 'Local Secure Storage',
    description: 'IndexedDB with OS secure storage fallback',
    enabled: true,
    score: 100,
    maxScore: 100,
    configuration: {
      indexedDB: true,
      osSecureStorage: false,
    },
  },
];

export const mockAuditLogs = [
  {
    eventType: AuditEventType.LOGIN,
    severity: AuditSeverity.LOW,
    description: 'User logged in successfully',
    ipAddress: '192.168.1.100',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    metadata: {
      loginMethod: 'password',
      twoFactorUsed: false,
    },
  },
  {
    eventType: AuditEventType.REGISTER,
    severity: AuditSeverity.MEDIUM,
    description: 'New user registered',
    ipAddress: '192.168.1.101',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
    metadata: {
      registrationMethod: 'email',
      emailVerified: false,
    },
  },
  {
    eventType: AuditEventType.TWO_FACTOR_ENABLE,
    severity: AuditSeverity.HIGH,
    description: 'Two-factor authentication enabled',
    ipAddress: '192.168.1.102',
    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
    metadata: {
      method: 'TOTP',
      backupCodesGenerated: true,
    },
  },
  {
    eventType: AuditEventType.VAULT_ITEM_CREATE,
    severity: AuditSeverity.MEDIUM,
    description: 'New vault item created',
    ipAddress: '192.168.1.103',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
    metadata: {
      itemType: 'login',
      encrypted: true,
    },
  },
  {
    eventType: AuditEventType.SUSPICIOUS_ACTIVITY,
    severity: AuditSeverity.CRITICAL,
    description: 'Multiple failed login attempts detected',
    ipAddress: '192.168.1.104',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
    metadata: {
      attemptCount: 5,
      timeWindow: '5 minutes',
      blocked: true,
    },
  },
];

export const mockPasswordAnalysis = {
  strong: {
    password: 'MyStr0ng!P@ssw0rd2024',
    score: 95,
    feedback: [],
    recommendations: ['Excellent password strength'],
  },
  medium: {
    password: 'Password123!',
    score: 65,
    feedback: ['Password could be longer'],
    recommendations: ['Use at least 12 characters', 'Include more diverse characters'],
  },
  weak: {
    password: 'password123',
    score: 25,
    feedback: ['Missing uppercase letters', 'Missing special characters', 'Common pattern detected'],
    recommendations: ['Include uppercase letters', 'Include special characters', 'Avoid common words'],
  },
};

export const mockBreachCheck = {
  breached: {
    password: 'password123',
    isBreached: true,
    breachCount: 1234567,
    recommendations: ['This password has been found in data breaches', 'Change this password immediately'],
  },
  safe: {
    password: 'MyStr0ng!P@ssw0rd2024',
    isBreached: false,
    breachCount: 0,
    recommendations: ['Password appears to be secure'],
  },
};

export const mockVaultExport = {
  version: '1.0',
  exportedAt: new Date().toISOString(),
  items: [
    {
      id: '507f1f77bcf86cd799439011',
      type: VaultItemType.LOGIN,
      data: {
        username: 'testuser',
        password: 'TestPassword123!',
        url: 'https://example.com',
        notes: 'Work account',
      },
      tags: ['work', 'important'],
      favorite: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '507f1f77bcf86cd799439012',
      type: VaultItemType.SECURE_NOTE,
      data: {
        title: 'Personal Notes',
        content: 'This is a secure note with sensitive information.',
      },
      tags: ['personal', 'private'],
      favorite: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
};

/**
 * Helper function to create mock user with vault items and security features
 */
export const createMockUserWithData = async (userData: any) => {
  const user = new User(userData);
  await user.save();

  // Create vault items for the user
  for (const itemData of mockVaultItems) {
    const vaultItem = new VaultItem({
      ...itemData,
      userId: user._id,
    });
    await vaultItem.save();
  }

  // Create security features for the user
  for (const featureData of mockSecurityFeatures) {
    const securityFeature = new SecurityFeature({
      ...featureData,
      userId: user._id,
    });
    await securityFeature.save();
  }

  // Create audit logs for the user
  for (const logData of mockAuditLogs) {
    const auditLog = new AuditLog({
      ...logData,
      userId: user._id,
    });
    await auditLog.save();
  }

  return user;
};

/**
 * Helper function to generate test JWT tokens
 */
export const generateTestTokens = (userId: string, email: string) => {
  const jwt = require('jsonwebtoken');
  const accessToken = jwt.sign(
    { userId, email, type: 'access' },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
  const refreshToken = jwt.sign(
    { userId, type: 'refresh' },
    process.env.JWT_REFRESH_SECRET || 'test-refresh-secret',
    { expiresIn: '7d' }
  );
  return { accessToken, refreshToken };
};
