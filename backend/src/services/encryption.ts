import crypto from 'crypto';
import { logger } from '../utils/logger';

/**
 * Encryption service implementing AES-256-GCM and XChaCha20-Poly1305
 * Provides envelope encryption for vault items
 */
export class EncryptionService {
  private static readonly ALGORITHM_AES = 'aes-256-gcm';
  private static readonly ALGORITHM_XCHACHA = 'xchacha20-poly1305';
  private static readonly KEY_LENGTH = 32; // 256 bits
  private static readonly IV_LENGTH = 12; // 96 bits for GCM
  private static readonly XCHACHA_IV_LENGTH = 24; // 192 bits for XChaCha20
  private static readonly TAG_LENGTH = 16; // 128 bits for authentication tag

  /**
   * Generate a cryptographically secure random key
   */
  static generateKey(): Buffer {
    return crypto.randomBytes(this.KEY_LENGTH);
  }

  /**
   * Generate a cryptographically secure random IV
   */
  static generateIV(algorithm: 'aes' | 'xchacha' = 'aes'): Buffer {
    const length = algorithm === 'aes' ? this.IV_LENGTH : this.XCHACHA_IV_LENGTH;
    return crypto.randomBytes(length);
  }

  /**
   * Derive key from master password using PBKDF2
   */
  static deriveKeyFromPassword(password: string, salt: Buffer, iterations: number = 100000): Buffer {
    return crypto.pbkdf2Sync(password, salt, iterations, this.KEY_LENGTH, 'sha512');
  }

  /**
   * Encrypt data using AES-256-GCM
   */
  static encryptAES(data: string, key: Buffer): { encrypted: string; iv: string; tag: string } {
    try {
      const iv = this.generateIV('aes');
      const cipher = crypto.createCipher(this.ALGORITHM_AES, key);
      cipher.setAAD(Buffer.from('astadigbandhanam', 'utf8')); // Additional authenticated data
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
      };
    } catch (error) {
      logger.error('AES encryption failed:', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt data using AES-256-GCM
   */
  static decryptAES(encryptedData: { encrypted: string; iv: string; tag: string }, key: Buffer): string {
    try {
      const decipher = crypto.createDecipher(this.ALGORITHM_AES, key);
      decipher.setAAD(Buffer.from('astadigbandhanam', 'utf8'));
      decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      logger.error('AES decryption failed:', error);
      throw new Error('Decryption failed');
    }
  }

  /**
   * Encrypt data using XChaCha20-Poly1305 (if available)
   */
  static encryptXChaCha(data: string, key: Buffer): { encrypted: string; iv: string; tag: string } {
    try {
      // Fallback to AES if XChaCha20 is not available
      if (!crypto.getCiphers().includes('xchacha20-poly1305')) {
        logger.warn('XChaCha20-Poly1305 not available, falling back to AES-256-GCM');
        return this.encryptAES(data, key);
      }

      const iv = this.generateIV('xchacha');
      const cipher = crypto.createCipher(this.ALGORITHM_XCHACHA, key);
      
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      const tag = cipher.getAuthTag();
      
      return {
        encrypted,
        iv: iv.toString('hex'),
        tag: tag.toString('hex'),
      };
    } catch (error) {
      logger.error('XChaCha20 encryption failed:', error);
      throw new Error('Encryption failed');
    }
  }

  /**
   * Decrypt data using XChaCha20-Poly1305
   */
  static decryptXChaCha(encryptedData: { encrypted: string; iv: string; tag: string }, key: Buffer): string {
    try {
      // Fallback to AES if XChaCha20 is not available
      if (!crypto.getCiphers().includes('xchacha20-poly1305')) {
        return this.decryptAES(encryptedData, key);
      }

      const decipher = crypto.createDecipher(this.ALGORITHM_XCHACHA, key);
      decipher.setAuthTag(Buffer.from(encryptedData.tag, 'hex'));
      
      let decrypted = decipher.update(encryptedData.encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      logger.error('XChaCha20 decryption failed:', error);
      throw new Error('Decryption failed');
    }
  }

  /**
   * Envelope encryption: encrypt data with a data key, then encrypt the data key with master key
   */
  static envelopeEncrypt(data: string, masterKey: Buffer, algorithm: 'aes' | 'xchacha' = 'aes'): {
    encryptedData: string;
    encryptedDataKey: string;
    iv: string;
    tag: string;
  } {
    try {
      // Generate a unique data key for this encryption
      const dataKey = this.generateKey();
      
      // Encrypt the data with the data key
      const encrypted = algorithm === 'aes' 
        ? this.encryptAES(data, dataKey)
        : this.encryptXChaCha(data, dataKey);
      
      // Encrypt the data key with the master key
      const encryptedDataKey = this.encryptAES(dataKey.toString('hex'), masterKey);
      
      return {
        encryptedData: encrypted.encrypted,
        encryptedDataKey: encryptedDataKey.encrypted,
        iv: encrypted.iv,
        tag: encrypted.tag,
      };
    } catch (error) {
      logger.error('Envelope encryption failed:', error);
      throw new Error('Envelope encryption failed');
    }
  }

  /**
   * Envelope decryption: decrypt data key with master key, then decrypt data with data key
   */
  static envelopeDecrypt(
    encryptedData: string,
    encryptedDataKey: string,
    iv: string,
    tag: string,
    masterKey: Buffer,
    algorithm: 'aes' | 'xchacha' = 'aes'
  ): string {
    try {
      // Decrypt the data key with the master key
      const decryptedDataKeyHex = this.decryptAES(
        { encrypted: encryptedDataKey, iv: '', tag: '' },
        masterKey
      );
      const dataKey = Buffer.from(decryptedDataKeyHex, 'hex');
      
      // Decrypt the data with the data key
      const decrypted = algorithm === 'aes'
        ? this.decryptAES({ encrypted: encryptedData, iv, tag }, dataKey)
        : this.decryptXChaCha({ encrypted: encryptedData, iv, tag }, dataKey);
      
      return decrypted;
    } catch (error) {
      logger.error('Envelope decryption failed:', error);
      throw new Error('Envelope decryption failed');
    }
  }

  /**
   * Generate a secure random salt
   */
  static generateSalt(length: number = 32): Buffer {
    return crypto.randomBytes(length);
  }

  /**
   * Hash data using SHA-256
   */
  static hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate a secure random token
   */
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Constant-time string comparison to prevent timing attacks
   */
  static constantTimeCompare(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    
    let result = 0;
    for (let i = 0; i < a.length; i++) {
      result |= a.charCodeAt(i) ^ b.charCodeAt(i);
    }
    
    return result === 0;
  }
}
