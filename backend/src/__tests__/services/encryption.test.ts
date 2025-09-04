import { EncryptionService } from '../../services/encryption';

describe('EncryptionService', () => {
  describe('generateKey', () => {
    it('should generate a 32-byte key', () => {
      const key = EncryptionService.generateKey();
      expect(key).toBeInstanceOf(Buffer);
      expect(key.length).toBe(32);
    });

    it('should generate unique keys', () => {
      const key1 = EncryptionService.generateKey();
      const key2 = EncryptionService.generateKey();
      expect(key1).not.toEqual(key2);
    });
  });

  describe('generateIV', () => {
    it('should generate a 12-byte IV for AES', () => {
      const iv = EncryptionService.generateIV('aes');
      expect(iv).toBeInstanceOf(Buffer);
      expect(iv.length).toBe(12);
    });

    it('should generate a 24-byte IV for XChaCha', () => {
      const iv = EncryptionService.generateIV('xchacha');
      expect(iv).toBeInstanceOf(Buffer);
      expect(iv.length).toBe(24);
    });
  });

  describe('deriveKeyFromPassword', () => {
    it('should derive a key from password and salt', () => {
      const password = 'TestPassword123!';
      const salt = EncryptionService.generateSalt();
      const key = EncryptionService.deriveKeyFromPassword(password, salt);
      
      expect(key).toBeInstanceOf(Buffer);
      expect(key.length).toBe(32);
    });

    it('should generate same key for same password and salt', () => {
      const password = 'TestPassword123!';
      const salt = EncryptionService.generateSalt();
      
      const key1 = EncryptionService.deriveKeyFromPassword(password, salt);
      const key2 = EncryptionService.deriveKeyFromPassword(password, salt);
      
      expect(key1).toEqual(key2);
    });

    it('should generate different keys for different salts', () => {
      const password = 'TestPassword123!';
      const salt1 = EncryptionService.generateSalt();
      const salt2 = EncryptionService.generateSalt();
      
      const key1 = EncryptionService.deriveKeyFromPassword(password, salt1);
      const key2 = EncryptionService.deriveKeyFromPassword(password, salt2);
      
      expect(key1).not.toEqual(key2);
    });
  });

  describe('AES encryption/decryption', () => {
    it('should encrypt and decrypt data correctly', () => {
      const data = 'This is a test message';
      const key = EncryptionService.generateKey();
      
      const encrypted = EncryptionService.encryptAES(data, key);
      const decrypted = EncryptionService.decryptAES(encrypted, key);
      
      expect(decrypted).toBe(data);
    });

    it('should fail to decrypt with wrong key', () => {
      const data = 'This is a test message';
      const key1 = EncryptionService.generateKey();
      const key2 = EncryptionService.generateKey();
      
      const encrypted = EncryptionService.encryptAES(data, key1);
      
      expect(() => {
        EncryptionService.decryptAES(encrypted, key2);
      }).toThrow();
    });

    it('should fail to decrypt with corrupted data', () => {
      const data = 'This is a test message';
      const key = EncryptionService.generateKey();
      
      const encrypted = EncryptionService.encryptAES(data, key);
      encrypted.encrypted = 'corrupted_data';
      
      expect(() => {
        EncryptionService.decryptAES(encrypted, key);
      }).toThrow();
    });
  });

  describe('envelope encryption/decryption', () => {
    it('should encrypt and decrypt data using envelope encryption', () => {
      const data = 'This is a test message for envelope encryption';
      const masterKey = EncryptionService.generateKey();
      
      const encrypted = EncryptionService.envelopeEncrypt(data, masterKey);
      const decrypted = EncryptionService.envelopeDecrypt(
        encrypted.encryptedData,
        encrypted.encryptedDataKey,
        encrypted.iv,
        encrypted.tag,
        masterKey
      );
      
      expect(decrypted).toBe(data);
    });

    it('should fail to decrypt with wrong master key', () => {
      const data = 'This is a test message';
      const masterKey1 = EncryptionService.generateKey();
      const masterKey2 = EncryptionService.generateKey();
      
      const encrypted = EncryptionService.envelopeEncrypt(data, masterKey1);
      
      expect(() => {
        EncryptionService.envelopeDecrypt(
          encrypted.encryptedData,
          encrypted.encryptedDataKey,
          encrypted.iv,
          encrypted.tag,
          masterKey2
        );
      }).toThrow();
    });
  });

  describe('hash', () => {
    it('should hash data using SHA-256', () => {
      const data = 'test data';
      const hash = EncryptionService.hash(data);
      
      expect(hash).toBeDefined();
      expect(typeof hash).toBe('string');
      expect(hash.length).toBe(64); // SHA-256 produces 64 character hex string
    });

    it('should produce same hash for same input', () => {
      const data = 'test data';
      const hash1 = EncryptionService.hash(data);
      const hash2 = EncryptionService.hash(data);
      
      expect(hash1).toBe(hash2);
    });

    it('should produce different hashes for different inputs', () => {
      const data1 = 'test data 1';
      const data2 = 'test data 2';
      const hash1 = EncryptionService.hash(data1);
      const hash2 = EncryptionService.hash(data2);
      
      expect(hash1).not.toBe(hash2);
    });
  });

  describe('constantTimeCompare', () => {
    it('should return true for identical strings', () => {
      const str1 = 'test string';
      const str2 = 'test string';
      
      expect(EncryptionService.constantTimeCompare(str1, str2)).toBe(true);
    });

    it('should return false for different strings', () => {
      const str1 = 'test string 1';
      const str2 = 'test string 2';
      
      expect(EncryptionService.constantTimeCompare(str1, str2)).toBe(false);
    });

    it('should return false for strings of different lengths', () => {
      const str1 = 'short';
      const str2 = 'much longer string';
      
      expect(EncryptionService.constantTimeCompare(str1, str2)).toBe(false);
    });
  });

  describe('generateToken', () => {
    it('should generate a random token', () => {
      const token = EncryptionService.generateToken();
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.length).toBe(64); // 32 bytes = 64 hex characters
    });

    it('should generate unique tokens', () => {
      const token1 = EncryptionService.generateToken();
      const token2 = EncryptionService.generateToken();
      
      expect(token1).not.toBe(token2);
    });
  });
});
