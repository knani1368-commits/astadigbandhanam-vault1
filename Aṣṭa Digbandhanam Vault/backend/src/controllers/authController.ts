import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { AuthService } from '../services/auth';
import { SecurityFeaturesService } from '../services/securityFeatures';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

/**
 * Authentication Controller
 * Handles user registration, login, logout, and token management
 */
export class AuthController {
  /**
   * Register a new user
   * @route POST /api/auth/register
   */
  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      }

      const { email, password, masterPassword } = req.body;

      // Register user
      const result = await AuthService.register(email, password, masterPassword);

      // Initialize security features for new user
      await SecurityFeaturesService.initializeUserSecurityFeatures(result.user.id);

      // Enable master password protection (East direction)
      await SecurityFeaturesService.updateSecurityFeature(
        result.user.id,
        'east' as any,
        { enabled: true, score: 100 }
      );

      logger.info('User registered successfully', { userId: result.user.id, email });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * @route POST /api/auth/login
   */
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      }

      const { email, password, twoFactorToken } = req.body;

      // Login user
      const result = await AuthService.login(email, password);

      // Check if 2FA is enabled
      if (result.user.twoFactorEnabled) {
        if (!twoFactorToken) {
          res.status(200).json({
            success: true,
            message: 'Two-factor authentication required',
            data: {
              requiresTwoFactor: true,
              userId: result.user.id,
            },
          });
          return;
        }

        // Verify 2FA token
        const isTwoFactorValid = await SecurityFeaturesService.verifyTwoFactor(
          result.user.id,
          twoFactorToken
        );

        if (!isTwoFactorValid) {
          throw new AppError('Invalid two-factor authentication token', 401, 'INVALID_2FA_TOKEN');
        }
      }

      logger.info('User logged in successfully', { userId: result.user.id, email });

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   * @route POST /api/auth/logout
   */
  static async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (userId) {
        await AuthService.logout(userId);
        logger.info('User logged out successfully', { userId });
      }

      res.status(200).json({
        success: true,
        message: 'Logout successful',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   * @route POST /api/auth/refresh
   */
  static async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        throw new AppError('Refresh token required', 400, 'REFRESH_TOKEN_REQUIRED');
      }

      const result = await AuthService.refreshToken(refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user profile
   * @route GET /api/auth/me
   */
  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const user = req.user;

      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      res.status(200).json({
        success: true,
        message: 'Profile retrieved successfully',
        data: { user },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change password
   * @route PUT /api/auth/change-password
   */
  static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      }

      const { currentPassword, newPassword } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Verify current password
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const isCurrentPasswordValid = await AuthService.verifyPassword(currentPassword, user.password);
      if (!isCurrentPasswordValid) {
        throw new AppError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD');
      }

      // Hash new password
      const hashedNewPassword = await AuthService.hashPassword(newPassword);

      // Update password
      user.password = hashedNewPassword;
      await user.save();

      logger.info('Password changed successfully', { userId });

      res.status(200).json({
        success: true,
        message: 'Password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change master password
   * @route PUT /api/auth/change-master-password
   */
  static async changeMasterPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      }

      const { currentMasterPassword, newMasterPassword } = req.body;
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Verify current master password
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const isCurrentMasterPasswordValid = await AuthService.verifyPassword(
        currentMasterPassword,
        user.masterPassword
      );
      if (!isCurrentMasterPasswordValid) {
        throw new AppError('Current master password is incorrect', 400, 'INVALID_CURRENT_MASTER_PASSWORD');
      }

      // Hash new master password
      const hashedNewMasterPassword = await AuthService.hashPassword(newMasterPassword);

      // Generate new master key salt
      const newSalt = EncryptionService.generateSalt();

      // Update master password and salt
      user.masterPassword = hashedNewMasterPassword;
      user.masterKeySalt = newSalt.toString('hex');
      await user.save();

      logger.info('Master password changed successfully', { userId });

      res.status(200).json({
        success: true,
        message: 'Master password changed successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

// Validation rules
export const registerValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
  body('masterPassword')
    .isLength({ min: 8 })
    .withMessage('Master password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage('Master password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
];

export const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage('New password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
];

export const changeMasterPasswordValidation = [
  body('currentMasterPassword')
    .notEmpty()
    .withMessage('Current master password is required'),
  body('newMasterPassword')
    .isLength({ min: 8 })
    .withMessage('New master password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/)
    .withMessage('New master password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),
];
