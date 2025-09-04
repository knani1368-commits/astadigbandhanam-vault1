import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';
import { VaultItem, VaultItemType } from '../models/VaultItem';
import { EncryptionService } from '../services/encryption';
import { AuthService } from '../services/auth';
import { logger } from '../utils/logger';
import { AppError } from '../middleware/errorHandler';

/**
 * Vault Controller
 * Handles CRUD operations for vault items with end-to-end encryption
 */
export class VaultController {
  /**
   * Get all vault items for the authenticated user
   * @route GET /api/vault/items
   */
  static async getVaultItems(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { type, tags, favorite, search } = req.query;

      if (!userId) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Build query
      const query: any = { userId, isDeleted: false };

      if (type) {
        query.type = type;
      }

      if (tags) {
        const tagArray = Array.isArray(tags) ? tags : [tags];
        query.tags = { $in: tagArray };
      }

      if (favorite !== undefined) {
        query.favorite = favorite === 'true';
      }

      // Get vault items
      let vaultItems = await VaultItem.find(query).sort({ createdAt: -1 });

      // Apply search filter if provided
      if (search) {
        // Note: In a real implementation, you'd want to decrypt and search
        // For now, we'll just filter by tags
        const searchTerm = (search as string).toLowerCase();
        vaultItems = vaultItems.filter(item => 
          item.tags.some(tag => tag.toLowerCase().includes(searchTerm))
        );
      }

      res.status(200).json({
        success: true,
        message: 'Vault items retrieved successfully',
        data: {
          items: vaultItems,
          count: vaultItems.length,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific vault item
   * @route GET /api/vault/items/:id
   */
  static async getVaultItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;
      const { masterPassword } = req.body;

      if (!userId) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      if (!masterPassword) {
        throw new AppError('Master password required for decryption', 400, 'MASTER_PASSWORD_REQUIRED');
      }

      // Find vault item
      const vaultItem = await VaultItem.findOne({ _id: id, userId, isDeleted: false });
      if (!vaultItem) {
        throw new AppError('Vault item not found', 404, 'VAULT_ITEM_NOT_FOUND');
      }

      // Get user to access master key salt
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Generate master key
      const masterKey = AuthService.generateMasterKey(masterPassword, user.masterKeySalt);

      // Decrypt vault item data
      const decryptedData = EncryptionService.envelopeDecrypt(
        vaultItem.encryptedData,
        vaultItem.encryptedDataKey,
        vaultItem.iv,
        vaultItem.tag,
        masterKey,
        vaultItem.algorithm
      );

      res.status(200).json({
        success: true,
        message: 'Vault item retrieved successfully',
        data: {
          ...vaultItem.toJSON(),
          decryptedData: JSON.parse(decryptedData),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a new vault item
   * @route POST /api/vault/items
   */
  static async createVaultItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      }

      const userId = req.user?.id;
      const { type, data, tags, favorite, masterPassword, algorithm = 'aes' } = req.body;

      if (!userId) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      if (!masterPassword) {
        throw new AppError('Master password required for encryption', 400, 'MASTER_PASSWORD_REQUIRED');
      }

      // Get user to access master key salt
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Generate master key
      const masterKey = AuthService.generateMasterKey(masterPassword, user.masterKeySalt);

      // Encrypt vault item data
      const encrypted = EncryptionService.envelopeEncrypt(
        JSON.stringify(data),
        masterKey,
        algorithm as 'aes' | 'xchacha'
      );

      // Create vault item
      const vaultItem = new VaultItem({
        userId,
        type,
        encryptedData: encrypted.encryptedData,
        encryptedDataKey: encrypted.encryptedDataKey,
        iv: encrypted.iv,
        tag: encrypted.tag,
        algorithm,
        tags: tags || [],
        favorite: favorite || false,
      });

      await vaultItem.save();

      logger.info('Vault item created successfully', { userId, itemId: vaultItem._id, type });

      res.status(201).json({
        success: true,
        message: 'Vault item created successfully',
        data: vaultItem,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a vault item
   * @route PUT /api/vault/items/:id
   */
  static async updateVaultItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      }

      const userId = req.user?.id;
      const { id } = req.params;
      const { data, tags, favorite, masterPassword, algorithm = 'aes' } = req.body;

      if (!userId) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      if (!masterPassword) {
        throw new AppError('Master password required for encryption', 400, 'MASTER_PASSWORD_REQUIRED');
      }

      // Find vault item
      const vaultItem = await VaultItem.findOne({ _id: id, userId, isDeleted: false });
      if (!vaultItem) {
        throw new AppError('Vault item not found', 404, 'VAULT_ITEM_NOT_FOUND');
      }

      // Get user to access master key salt
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Generate master key
      const masterKey = AuthService.generateMasterKey(masterPassword, user.masterKeySalt);

      // Encrypt updated data if provided
      if (data) {
        const encrypted = EncryptionService.envelopeEncrypt(
          JSON.stringify(data),
          masterKey,
          algorithm as 'aes' | 'xchacha'
        );

        vaultItem.encryptedData = encrypted.encryptedData;
        vaultItem.encryptedDataKey = encrypted.encryptedDataKey;
        vaultItem.iv = encrypted.iv;
        vaultItem.tag = encrypted.tag;
        vaultItem.algorithm = algorithm;
      }

      // Update other fields
      if (tags !== undefined) {
        vaultItem.tags = tags;
      }
      if (favorite !== undefined) {
        vaultItem.favorite = favorite;
      }

      await vaultItem.save();

      logger.info('Vault item updated successfully', { userId, itemId: vaultItem._id });

      res.status(200).json({
        success: true,
        message: 'Vault item updated successfully',
        data: vaultItem,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a vault item (soft delete)
   * @route DELETE /api/vault/items/:id
   */
  static async deleteVaultItem(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { id } = req.params;

      if (!userId) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Find vault item
      const vaultItem = await VaultItem.findOne({ _id: id, userId, isDeleted: false });
      if (!vaultItem) {
        throw new AppError('Vault item not found', 404, 'VAULT_ITEM_NOT_FOUND');
      }

      // Soft delete
      await vaultItem.softDelete();

      logger.info('Vault item deleted successfully', { userId, itemId: vaultItem._id });

      res.status(200).json({
        success: true,
        message: 'Vault item deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export vault data
   * @route GET /api/vault/export
   */
  static async exportVault(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.user?.id;
      const { masterPassword } = req.body;

      if (!userId) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      if (!masterPassword) {
        throw new AppError('Master password required for export', 400, 'MASTER_PASSWORD_REQUIRED');
      }

      // Get all vault items
      const vaultItems = await VaultItem.find({ userId, isDeleted: false });

      // Get user to access master key salt
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Generate master key
      const masterKey = AuthService.generateMasterKey(masterPassword, user.masterKeySalt);

      // Decrypt all vault items
      const decryptedItems = await Promise.all(
        vaultItems.map(async (item) => {
          const decryptedData = EncryptionService.envelopeDecrypt(
            item.encryptedData,
            item.encryptedDataKey,
            item.iv,
            item.tag,
            masterKey,
            item.algorithm
          );

          return {
            id: item._id,
            type: item.type,
            data: JSON.parse(decryptedData),
            tags: item.tags,
            favorite: item.favorite,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
          };
        })
      );

      const exportData = {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        items: decryptedItems,
      };

      logger.info('Vault exported successfully', { userId, itemCount: decryptedItems.length });

      res.status(200).json({
        success: true,
        message: 'Vault exported successfully',
        data: exportData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Import vault data
   * @route POST /api/vault/import
   */
  static async importVault(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new AppError('Validation failed', 400, 'VALIDATION_ERROR');
      }

      const userId = req.user?.id;
      const { importData, masterPassword, algorithm = 'aes' } = req.body;

      if (!userId) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      if (!masterPassword) {
        throw new AppError('Master password required for import', 400, 'MASTER_PASSWORD_REQUIRED');
      }

      // Validate import data
      if (!importData || !importData.items || !Array.isArray(importData.items)) {
        throw new AppError('Invalid import data format', 400, 'INVALID_IMPORT_DATA');
      }

      // Get user to access master key salt
      const user = await User.findById(userId);
      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Generate master key
      const masterKey = AuthService.generateMasterKey(masterPassword, user.masterKeySalt);

      // Import vault items
      const importedItems = [];
      for (const itemData of importData.items) {
        const encrypted = EncryptionService.envelopeEncrypt(
          JSON.stringify(itemData.data),
          masterKey,
          algorithm as 'aes' | 'xchacha'
        );

        const vaultItem = new VaultItem({
          userId,
          type: itemData.type,
          encryptedData: encrypted.encryptedData,
          encryptedDataKey: encrypted.encryptedDataKey,
          iv: encrypted.iv,
          tag: encrypted.tag,
          algorithm,
          tags: itemData.tags || [],
          favorite: itemData.favorite || false,
        });

        await vaultItem.save();
        importedItems.push(vaultItem);
      }

      logger.info('Vault imported successfully', { userId, itemCount: importedItems.length });

      res.status(201).json({
        success: true,
        message: 'Vault imported successfully',
        data: {
          importedCount: importedItems.length,
          items: importedItems,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

// Validation rules
export const createVaultItemValidation = [
  body('type')
    .isIn(Object.values(VaultItemType))
    .withMessage('Invalid vault item type'),
  body('data')
    .isObject()
    .withMessage('Data must be an object'),
  body('masterPassword')
    .notEmpty()
    .withMessage('Master password is required'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('favorite')
    .optional()
    .isBoolean()
    .withMessage('Favorite must be a boolean'),
  body('algorithm')
    .optional()
    .isIn(['aes', 'xchacha'])
    .withMessage('Algorithm must be either aes or xchacha'),
];

export const updateVaultItemValidation = [
  body('masterPassword')
    .notEmpty()
    .withMessage('Master password is required'),
  body('data')
    .optional()
    .isObject()
    .withMessage('Data must be an object'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('favorite')
    .optional()
    .isBoolean()
    .withMessage('Favorite must be a boolean'),
  body('algorithm')
    .optional()
    .isIn(['aes', 'xchacha'])
    .withMessage('Algorithm must be either aes or xchacha'),
];

export const exportVaultValidation = [
  body('masterPassword')
    .notEmpty()
    .withMessage('Master password is required'),
];

export const importVaultValidation = [
  body('importData')
    .isObject()
    .withMessage('Import data must be an object'),
  body('masterPassword')
    .notEmpty()
    .withMessage('Master password is required'),
  body('algorithm')
    .optional()
    .isIn(['aes', 'xchacha'])
    .withMessage('Algorithm must be either aes or xchacha'),
];
