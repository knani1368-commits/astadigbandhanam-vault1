import express from 'express';
import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { authenticate } from '../middleware/auth';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

const router = express.Router();

/**
 * @swagger
 * /api/user/profile:
 *   get:
 *     summary: Get user profile
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    res.status(200).json({
      success: true,
      message: 'User profile retrieved successfully',
      data: { user },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/user/stats:
 *   get:
 *     summary: Get user statistics
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', authenticate, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Get user statistics
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // In a real implementation, you would get vault item counts, security features, etc.
    const stats = {
      accountCreated: user.createdAt,
      lastLogin: user.lastLoginAt,
      securityScore: user.securityScore,
      twoFactorEnabled: user.twoFactorEnabled,
      emailVerified: user.isEmailVerified,
    };

    res.status(200).json({
      success: true,
      message: 'User statistics retrieved successfully',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
