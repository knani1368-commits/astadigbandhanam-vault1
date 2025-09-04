import express from 'express';
import { SecurityController, verifyTwoFactorValidation, analyzePasswordValidation, checkBreachValidation, enableVaultEncryptionValidation } from '../controllers/securityController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/security/features:
 *   get:
 *     summary: Get all security features
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Security features retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/features', authenticate, SecurityController.getSecurityFeatures);

/**
 * @swagger
 * /api/security/features/{direction}:
 *   put:
 *     summary: Update a security feature
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: direction
 *         required: true
 *         schema:
 *           type: string
 *           enum: [east, southeast, south, southwest, west, northwest, north, northeast, above, below]
 *         description: Security direction
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               enabled:
 *                 type: boolean
 *               score:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 100
 *               configuration:
 *                 type: object
 *     responses:
 *       200:
 *         description: Security feature updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Security feature not found
 */
router.put('/features/:direction', authenticate, SecurityController.updateSecurityFeature);

/**
 * @swagger
 * /api/security/two-factor/enable:
 *   post:
 *     summary: Enable two-factor authentication
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Two-factor authentication setup initiated
 *       401:
 *         description: Unauthorized
 */
router.post('/two-factor/enable', authenticate, SecurityController.enableTwoFactor);

/**
 * @swagger
 * /api/security/two-factor/verify:
 *   post:
 *     summary: Verify two-factor authentication token
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - token
 *             properties:
 *               token:
 *                 type: string
 *                 pattern: '^[0-9]{6}$'
 *                 description: 6-digit TOTP token
 *     responses:
 *       200:
 *         description: Two-factor authentication verified successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Invalid token or unauthorized
 */
router.post('/two-factor/verify', authenticate, verifyTwoFactorValidation, SecurityController.verifyTwoFactor);

/**
 * @swagger
 * /api/security/two-factor/disable:
 *   delete:
 *     summary: Disable two-factor authentication
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Two-factor authentication disabled successfully
 *       401:
 *         description: Unauthorized
 */
router.delete('/two-factor/disable', authenticate, SecurityController.disableTwoFactor);

/**
 * @swagger
 * /api/security/analyze-password:
 *   post:
 *     summary: Analyze password strength
 *     tags: [Security]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password analysis completed
 *       400:
 *         description: Validation error
 */
router.post('/analyze-password', analyzePasswordValidation, SecurityController.analyzePasswordStrength);

/**
 * @swagger
 * /api/security/check-breach:
 *   post:
 *     summary: Check if password has been breached
 *     tags: [Security]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - password
 *             properties:
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Breach check completed
 *       400:
 *         description: Validation error
 */
router.post('/check-breach', checkBreachValidation, SecurityController.checkPasswordBreach);

/**
 * @swagger
 * /api/security/vault-encryption/enable:
 *   post:
 *     summary: Enable vault encryption
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               algorithm:
 *                 type: string
 *                 enum: [aes, xchacha]
 *                 default: aes
 *     responses:
 *       200:
 *         description: Vault encryption enabled successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/vault-encryption/enable', authenticate, enableVaultEncryptionValidation, SecurityController.enableVaultEncryption);

/**
 * @swagger
 * /api/security/watchtower/enable:
 *   post:
 *     summary: Enable Watchtower AI
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Watchtower AI enabled successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/watchtower/enable', authenticate, SecurityController.enableWatchtowerAI);

/**
 * @swagger
 * /api/security/dashboard:
 *   get:
 *     summary: Get security dashboard data
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Security dashboard data retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/dashboard', authenticate, SecurityController.getSecurityDashboard);

export default router;
