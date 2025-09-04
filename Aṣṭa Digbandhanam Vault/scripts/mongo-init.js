// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the application database
db = db.getSiblingDB('astadigbandhanam');

// Create application user
db.createUser({
  user: 'astadigbandhanam_user',
  pwd: 'astadigbandhanam_password',
  roles: [
    {
      role: 'readWrite',
      db: 'astadigbandhanam'
    }
  ]
});

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['email', 'password', 'masterPassword', 'masterKeySalt'],
      properties: {
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$',
          description: 'Email must be a valid email address'
        },
        password: {
          bsonType: 'string',
          minLength: 8,
          description: 'Password must be at least 8 characters long'
        },
        masterPassword: {
          bsonType: 'string',
          minLength: 8,
          description: 'Master password must be at least 8 characters long'
        },
        masterKeySalt: {
          bsonType: 'string',
          description: 'Master key salt is required'
        },
        isEmailVerified: {
          bsonType: 'bool',
          description: 'Email verification status must be a boolean'
        },
        twoFactorEnabled: {
          bsonType: 'bool',
          description: 'Two-factor authentication status must be a boolean'
        },
        securityScore: {
          bsonType: 'number',
          minimum: 0,
          maximum: 100,
          description: 'Security score must be between 0 and 100'
        },
        isActive: {
          bsonType: 'bool',
          description: 'Account active status must be a boolean'
        },
        role: {
          bsonType: 'string',
          enum: ['user', 'admin'],
          description: 'Role must be either user or admin'
        }
      }
    }
  }
});

db.createCollection('vaultitems', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'type', 'encryptedData', 'encryptedDataKey', 'iv', 'tag'],
      properties: {
        userId: {
          bsonType: 'objectId',
          description: 'User ID must be a valid ObjectId'
        },
        type: {
          bsonType: 'string',
          enum: ['login', 'secureNote', 'paymentCard', 'identity'],
          description: 'Vault item type must be one of the allowed values'
        },
        encryptedData: {
          bsonType: 'string',
          description: 'Encrypted data is required'
        },
        encryptedDataKey: {
          bsonType: 'string',
          description: 'Encrypted data key is required'
        },
        iv: {
          bsonType: 'string',
          description: 'Initialization vector is required'
        },
        tag: {
          bsonType: 'string',
          description: 'Authentication tag is required'
        },
        algorithm: {
          bsonType: 'string',
          enum: ['aes', 'xchacha'],
          description: 'Encryption algorithm must be either aes or xchacha'
        },
        tags: {
          bsonType: 'array',
          items: {
            bsonType: 'string'
          },
          description: 'Tags must be an array of strings'
        },
        favorite: {
          bsonType: 'bool',
          description: 'Favorite status must be a boolean'
        },
        isDeleted: {
          bsonType: 'bool',
          description: 'Deleted status must be a boolean'
        }
      }
    }
  }
});

db.createCollection('securityfeatures', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'direction', 'name', 'description'],
      properties: {
        userId: {
          bsonType: 'objectId',
          description: 'User ID must be a valid ObjectId'
        },
        direction: {
          bsonType: 'string',
          enum: ['east', 'southeast', 'south', 'southwest', 'west', 'northwest', 'north', 'northeast', 'above', 'below'],
          description: 'Security direction must be one of the allowed values'
        },
        name: {
          bsonType: 'string',
          description: 'Feature name is required'
        },
        description: {
          bsonType: 'string',
          description: 'Feature description is required'
        },
        enabled: {
          bsonType: 'bool',
          description: 'Enabled status must be a boolean'
        },
        score: {
          bsonType: 'number',
          minimum: 0,
          maximum: 100,
          description: 'Score must be between 0 and 100'
        },
        maxScore: {
          bsonType: 'number',
          minimum: 0,
          maximum: 100,
          description: 'Maximum score must be between 0 and 100'
        }
      }
    }
  }
});

db.createCollection('auditlogs', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['eventType', 'severity', 'description', 'ipAddress', 'userAgent'],
      properties: {
        userId: {
          bsonType: 'objectId',
          description: 'User ID must be a valid ObjectId'
        },
        eventType: {
          bsonType: 'string',
          enum: ['login', 'logout', 'register', 'password_change', 'master_password_change', 'two_factor_enable', 'two_factor_disable', 'vault_item_create', 'vault_item_update', 'vault_item_delete', 'security_feature_enable', 'security_feature_disable', 'account_locked', 'account_unlocked', 'suspicious_activity', 'data_export', 'data_import'],
          description: 'Event type must be one of the allowed values'
        },
        severity: {
          bsonType: 'string',
          enum: ['low', 'medium', 'high', 'critical'],
          description: 'Severity must be one of the allowed values'
        },
        description: {
          bsonType: 'string',
          description: 'Description is required'
        },
        ipAddress: {
          bsonType: 'string',
          description: 'IP address is required'
        },
        userAgent: {
          bsonType: 'string',
          description: 'User agent is required'
        },
        metadata: {
          bsonType: 'object',
          description: 'Metadata must be an object'
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ isActive: 1 });
db.users.createIndex({ createdAt: -1 });

db.vaultitems.createIndex({ userId: 1, type: 1 });
db.vaultitems.createIndex({ userId: 1, favorite: 1 });
db.vaultitems.createIndex({ userId: 1, tags: 1 });
db.vaultitems.createIndex({ userId: 1, isDeleted: 1 });
db.vaultitems.createIndex({ userId: 1, createdAt: -1 });

db.securityfeatures.createIndex({ userId: 1, direction: 1 }, { unique: true });
db.securityfeatures.createIndex({ userId: 1, enabled: 1 });

db.auditlogs.createIndex({ userId: 1, timestamp: -1 });
db.auditlogs.createIndex({ eventType: 1, timestamp: -1 });
db.auditlogs.createIndex({ severity: 1, timestamp: -1 });
db.auditlogs.createIndex({ ipAddress: 1, timestamp: -1 });
db.auditlogs.createIndex({ timestamp: -1 });

// Create TTL index for audit logs (auto-delete after 1 year)
db.auditlogs.createIndex({ timestamp: 1 }, { expireAfterSeconds: 365 * 24 * 60 * 60 });

print('Database initialization completed successfully!');
