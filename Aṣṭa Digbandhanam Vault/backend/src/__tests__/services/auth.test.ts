import { AuthService } from '../../services/auth';
import { User } from '../../models/User';
import { AppError } from '../../middleware/errorHandler';

describe('AuthService', () => {
  describe('hashPassword', () => {
    it('should hash a password using Argon2id', async () => {
      const password = 'TestPassword123!';
      const hash = await AuthService.hashPassword(password);
      
      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(0);
    });
  });

  describe('verifyPassword', () => {
    it('should verify a correct password', async () => {
      const password = 'TestPassword123!';
      const hash = await AuthService.hashPassword(password);
      
      const isValid = await AuthService.verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject an incorrect password', async () => {
      const password = 'TestPassword123!';
      const wrongPassword = 'WrongPassword123!';
      const hash = await AuthService.hashPassword(password);
      
      const isValid = await AuthService.verifyPassword(wrongPassword, hash);
      expect(isValid).toBe(false);
    });
  });

  describe('generateAccessToken', () => {
    it('should generate a valid JWT access token', () => {
      const userId = '507f1f77bcf86cd799439011';
      const email = 'test@example.com';
      
      const token = AuthService.generateAccessToken(userId, email);
      
      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a valid access token', () => {
      const userId = '507f1f77bcf86cd799439011';
      const email = 'test@example.com';
      
      const token = AuthService.generateAccessToken(userId, email);
      const decoded = AuthService.verifyAccessToken(token);
      
      expect(decoded.userId).toBe(userId);
      expect(decoded.email).toBe(email);
      expect(decoded.type).toBe('access');
    });

    it('should throw error for invalid token', () => {
      const invalidToken = 'invalid.token.here';
      
      expect(() => {
        AuthService.verifyAccessToken(invalidToken);
      }).toThrow(AppError);
    });
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123!',
        masterPassword: 'MasterPassword123!',
      };

      const result = await AuthService.register(
        userData.email,
        userData.password,
        userData.masterPassword
      );

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe(userData.email);
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
      expect(result.user.password).toBeUndefined(); // Should not include password in response
    });

    it('should throw error for duplicate email', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'TestPassword123!',
        masterPassword: 'MasterPassword123!',
      };

      // Register first user
      await AuthService.register(
        userData.email,
        userData.password,
        userData.masterPassword
      );

      // Try to register with same email
      await expect(
        AuthService.register(
          userData.email,
          userData.password,
          userData.masterPassword
        )
      ).rejects.toThrow(AppError);
    });

    it('should throw error for weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'weak',
        masterPassword: 'MasterPassword123!',
      };

      await expect(
        AuthService.register(
          userData.email,
          userData.password,
          userData.masterPassword
        )
      ).rejects.toThrow(AppError);
    });
  });

  describe('login', () => {
    beforeEach(async () => {
      // Create a test user
      await AuthService.register(
        'test@example.com',
        'TestPassword123!',
        'MasterPassword123!'
      );
    });

    it('should login with correct credentials', async () => {
      const result = await AuthService.login('test@example.com', 'TestPassword123!');

      expect(result.user).toBeDefined();
      expect(result.user.email).toBe('test@example.com');
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should throw error for incorrect password', async () => {
      await expect(
        AuthService.login('test@example.com', 'WrongPassword123!')
      ).rejects.toThrow(AppError);
    });

    it('should throw error for non-existent user', async () => {
      await expect(
        AuthService.login('nonexistent@example.com', 'TestPassword123!')
      ).rejects.toThrow(AppError);
    });
  });

  describe('logout', () => {
    it('should logout user successfully', async () => {
      // Register and login a user
      const registerResult = await AuthService.register(
        'test@example.com',
        'TestPassword123!',
        'MasterPassword123!'
      );

      await AuthService.logout(registerResult.user.id);

      // Verify user's refresh token is cleared
      const user = await User.findById(registerResult.user.id);
      expect(user?.refreshToken).toBeNull();
    });
  });
});
