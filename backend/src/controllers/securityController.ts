import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { SecurityFeaturesService } from '../services/securityFeatures';
import { SecurityDirection } from '../models/SecurityFeature';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

/**
 * Security Controller
 * Handles security features management and analysis
 */
export class SecurityController {
  /**
   * Get all security features for the authenticated user
   * @route GET /api/security/features
   */
  static async getSecurityFeatures(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const features = await SecurityFeaturesService.getUserSecurityFeatures(userId);
      const securityScore = await SecurityFeaturesService.calculateSecurityScore(userId);

      res.status(200).json({
        success: true,
        message: 'Security features retrieved successfully',
        data: {
          features,
          securityScore,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a security feature
   * @route PUT /api/security/features/:direction
   */
  static async updateSecurityFeature(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      }

      const userId = req.user?.id;
      const { direction } = req.params;
      const updates = req.body;

      if (!userId) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      if (!Object.values(SecurityDirection).includes(direction as SecurityDirection)) {
        throw new AppError('Invalid security direction', 400, 'INVALID_DIRECTION');
      }

      const feature = await SecurityFeaturesService.updateSecurityFeature(
        userId,
        direction as SecurityDirection,
        updates
      );

      // Recalculate security score
      const securityScore = await SecurityFeaturesService.calculateSecurityScore(userId);

      res.status(200).json({
        success: true,
        message: 'Security feature updated successfully',
        data: {
          feature,
          securityScore,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Enable Two-Factor Authentication
   * @route POST /api/security/two-factor/enable
   */
  static async enableTwoFactor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const result = await SecurityFeaturesService.enableTwoFactor(userId);

      res.status(200).json({
        success: true,
        message: 'Two-factor authentication setup initiated',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify Two-Factor Authentication token
   * @route POST /api/security/two-factor/verify
   */
  static async verifyTwoFactor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      }

      const userId = req.user?.id;
      const { token } = req.body;

      if (!userId) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const isValid = await SecurityFeaturesService.verifyTwoFactor(userId, token);

      if (!isValid) {
        throw new AppError('Invalid two-factor authentication token', 401, 'INVALID_2FA_TOKEN');
      }

      res.status(200).json({
        success: true,
        message: 'Two-factor authentication verified successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Disable Two-Factor Authentication
   * @route DELETE /api/security/two-factor/disable
   */
  static async disableTwoFactor(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      await SecurityFeaturesService.disableTwoFactor(userId);

      res.status(200).json({
        success: true,
        message: 'Two-factor authentication disabled successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Analyze password strength
   * @route POST /api/security/analyze-password
   */
  static async analyzePasswordStrength(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      }

      const { password } = req.body;

      const analysis = SecurityFeaturesService.analyzePasswordStrength(password);
      const breachCheck = await SecurityFeaturesService.checkPasswordBreach(password);

      res.status(200).json({
        success: true,
        message: 'Password analysis completed',
        data: {
          strength: analysis,
          breach: breachCheck,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Check password breach status
   * @route POST /api/security/check-breach
   */
  static async checkPasswordBreach(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      }

      const { password } = req.body;

      const breachCheck = await SecurityFeaturesService.checkPasswordBreach(password);

      res.status(200).json({
        success: true,
        message: 'Breach check completed',
        data: breachCheck,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Enable Vault Encryption
   * @route POST /api/security/vault-encryption/enable
   */
  static async enableVaultEncryption(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      }

      const userId = req.user?.id;
      const { algorithm = 'aes' } = req.body;

      if (!userId) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      if (!['aes', 'xchacha'].includes(algorithm)) {
        throw new AppError('Invalid encryption algorithm', 400, 'INVALID_ALGORITHM');
      }

      await SecurityFeaturesService.enableVaultEncryption(userId, algorithm);

      res.status(200).json({
        success: true,
        message: 'Vault encryption enabled successfully',
        data: { algorithm },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Enable Watchtower AI
   * @route POST /api/security/watchtower/enable
   */
  static async enableWatchtowerAI(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      await SecurityFeaturesService.enableWatchtowerAI(userId);

      res.status(200).json({
        success: true,
        message: 'Watchtower AI enabled successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get security dashboard data
   * @route GET /api/security/dashboard
   */
  static async getSecurityDashboard(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      const features = await SecurityFeaturesService.getUserSecurityFeatures(userId);
      const securityScore = await SecurityFeaturesService.calculateSecurityScore(userId);

      // Calculate feature statistics
      const enabledFeatures = features.filter(f => f.enabled).length;
      const totalFeatures = features.length;
      const averageScore = features.reduce((sum, f) => sum + f.score, 0) / totalFeatures;

      // Get feature recommendations
      const recommendations = features
        .filter(f => !f.enabled || f.score < f.maxScore)
        .map(f => ({
          direction: f.direction,
          name: f.name,
          description: f.description,
          currentScore: f.score,
          maxScore: f.maxScore,
          recommendation: f.enabled 
            ? `Improve ${f.name} configuration to increase security score`
            : `Enable ${f.name} to improve overall security`,
        }));

      res.status(200).json({
        success: true,
        message: 'Security dashboard data retrieved successfully',
        data: {
          securityScore,
          enabledFeatures,
          totalFeatures,
          averageScore: Math.round(averageScore),
          features,
          recommendations,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

// Validation rules
export const verifyTwoFactorValidation = [
  body('token')
    .isLength({ min: 6, max: 6 })
    .isNumeric()
    .withMessage('Token must be a 6-digit number'),
];

export const analyzePasswordValidation = [
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const checkBreachValidation = [
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
];

export const enableVaultEncryptionValidation = [
  body('algorithm')
    .optional()
    .isIn(['aes', 'xchacha'])
    .withMessage('Algorithm must be either aes or xchacha'),
];
