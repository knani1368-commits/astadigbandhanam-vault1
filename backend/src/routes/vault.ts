import express from 'express';
import { VaultController, createVaultItemValidation, updateVaultItemValidation, exportVaultValidation, importVaultValidation } from '../controllers/vaultController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * /api/vault/items:
 *   get:
 *     summary: Get all vault items
 *     tags: [Vault]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [login, secureNote, paymentCard, identity]
 *         description: Filter by vault item type
 *       - in: query
 *         name: tags
 *         schema:
 *           type: array
 *           items:
 *             type: string
 *         description: Filter by tags
 *       - in: query
 *         name: favorite
 *         schema:
 *           type: boolean
 *         description: Filter by favorite status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term
 *     responses:
 *       200:
 *         description: Vault items retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/items', authenticate, VaultController.getVaultItems);

/**
 * @swagger
 * /api/vault/items/{id}:
 *   get:
 *     summary: Get a specific vault item
 *     tags: [Vault]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vault item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - masterPassword
 *             properties:
 *               masterPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vault item retrieved successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Vault item not found
 */
router.get('/items/:id', authenticate, VaultController.getVaultItem);

/**
 * @swagger
 * /api/vault/items:
 *   post:
 *     summary: Create a new vault item
 *     tags: [Vault]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - data
 *               - masterPassword
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [login, secureNote, paymentCard, identity]
 *               data:
 *                 type: object
 *                 description: Vault item data
 *               masterPassword:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               favorite:
 *                 type: boolean
 *               algorithm:
 *                 type: string
 *                 enum: [aes, xchacha]
 *                 default: aes
 *     responses:
 *       201:
 *         description: Vault item created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/items', authenticate, createVaultItemValidation, VaultController.createVaultItem);

/**
 * @swagger
 * /api/vault/items/{id}:
 *   put:
 *     summary: Update a vault item
 *     tags: [Vault]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vault item ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - masterPassword
 *             properties:
 *               masterPassword:
 *                 type: string
 *               data:
 *                 type: object
 *                 description: Updated vault item data
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               favorite:
 *                 type: boolean
 *               algorithm:
 *                 type: string
 *                 enum: [aes, xchacha]
 *     responses:
 *       200:
 *         description: Vault item updated successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Vault item not found
 */
router.put('/items/:id', authenticate, updateVaultItemValidation, VaultController.updateVaultItem);

/**
 * @swagger
 * /api/vault/items/{id}:
 *   delete:
 *     summary: Delete a vault item
 *     tags: [Vault]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Vault item ID
 *     responses:
 *       200:
 *         description: Vault item deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Vault item not found
 */
router.delete('/items/:id', authenticate, VaultController.deleteVaultItem);

/**
 * @swagger
 * /api/vault/export:
 *   get:
 *     summary: Export vault data
 *     tags: [Vault]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - masterPassword
 *             properties:
 *               masterPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Vault exported successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.get('/export', authenticate, exportVaultValidation, VaultController.exportVault);

/**
 * @swagger
 * /api/vault/import:
 *   post:
 *     summary: Import vault data
 *     tags: [Vault]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - importData
 *               - masterPassword
 *             properties:
 *               importData:
 *                 type: object
 *                 description: Import data structure
 *               masterPassword:
 *                 type: string
 *               algorithm:
 *                 type: string
 *                 enum: [aes, xchacha]
 *                 default: aes
 *     responses:
 *       201:
 *         description: Vault imported successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post('/import', authenticate, importVaultValidation, VaultController.importVault);

export default router;
