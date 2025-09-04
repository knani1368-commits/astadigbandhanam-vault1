# Aṣṭa Digbandhanam Vault

A production-ready, secure password manager inspired by the ancient concept of **Aṣṭa Digbandhanam** (eight-directional protection). This application implements comprehensive security measures across eight directions plus above and below, creating a fortress-like protection for your digital secrets.

## 🛡️ Security Features

### Eight-Directional Protection (Aṣṭa Digbandhanam)

1. **East (Purva) - Master Password Protection**
   - Argon2id key derivation function
   - Zero-knowledge architecture
   - Optional WebAuthn passkeys

2. **South-East (Agneya) - Multi-Factor Authentication**
   - TOTP (Time-based One-Time Password)
   - WebAuthn hardware key support
   - Backup codes

3. **South (Dakshina) - Device Binding**
   - Trusted device registration
   - Jailbreak/root detection
   - Device fingerprinting

4. **South-West (Nairrtya) - Vault Encryption**
   - AES-256-GCM encryption
   - XChaCha20-Poly1305 support
   - Envelope encryption per item

5. **West (Paschima) - Secrets Vault**
   - End-to-end encrypted storage
   - Multiple item types (logins, notes, cards, identities)
   - Secure search and filtering

6. **North-West (Vayavya) - Network Protection**
   - HTTPS/TLS 1.3 enforcement
   - Certificate pinning
   - Signed requests per session

7. **North (Uttara) - Biometric Unlock**
   - FaceID/TouchID via WebAuthn
   - Fallback to master password
   - Biometric template protection

8. **North-East (Ishanya) - Watchtower AI**
   - Breach monitoring (HaveIBeenPwned integration)
   - Password strength analysis
   - Dark web leak detection

9. **Above (Ūrdhva) - Cloud Backup**
   - Optional encrypted sync
   - Shamir Secret Sharing for recovery
   - Cross-device synchronization

10. **Below (Adhaḥ) - Local Secure Storage**
    - IndexedDB with encryption
    - OS secure storage fallback
    - Offline-first architecture

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- MongoDB 7.0+
- Docker and Docker Compose (optional)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/astadigbandhanam-vault.git
   cd astadigbandhanam-vault
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd backend && npm install
   cd ../frontend && npm install
   ```

3. **Environment setup**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

4. **Start the application**
   ```bash
   # Development mode
   npm run dev

   # Or using Docker
   docker-compose up -d
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001
   - API Documentation: http://localhost:3001/api-docs

## 🏗️ Architecture

### Backend (Node.js + Express + TypeScript)

```
backend/
├── src/
│   ├── config/          # Database, Swagger configuration
│   ├── controllers/     # API route handlers
│   ├── middleware/      # Authentication, error handling
│   ├── models/          # MongoDB schemas
│   ├── routes/          # API route definitions
│   ├── services/        # Business logic
│   └── utils/           # Helper functions
├── tests/               # Unit and integration tests
└── Dockerfile          # Container configuration
```

### Frontend (React + TypeScript + TailwindCSS)

```
frontend/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components
│   ├── services/       # API client services
│   ├── store/          # State management (Zustand)
│   ├── types/          # TypeScript type definitions
│   └── utils/          # Helper functions
├── public/             # Static assets
└── Dockerfile         # Container configuration
```

## 🔧 Configuration

### Environment Variables

Key environment variables to configure:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/astadigbandhanam

# Security
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key

# Application
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-domain.com
```

### Security Configuration

- **Password Requirements**: Minimum 8 characters with uppercase, lowercase, numbers, and special characters
- **Master Password**: Separate from login password, used for vault encryption
- **JWT Expiration**: 7 days for access tokens, 30 days for refresh tokens
- **Rate Limiting**: 100 requests per 15 minutes per IP

## 🧪 Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# All tests
npm test
```

### Test Coverage

```bash
# Backend coverage
cd backend
npm run test:coverage

# Frontend coverage
cd frontend
npm run test:coverage
```

## 🐳 Docker Deployment

### Development

```bash
docker-compose up -d
```

### Production

```bash
# Build and start production services
docker-compose --profile production up -d

# With custom environment file
docker-compose --env-file .env.production up -d
```

### Services

- **Frontend**: Nginx serving React app
- **Backend**: Node.js API server
- **Database**: MongoDB with authentication
- **Cache**: Redis for session storage
- **Proxy**: Nginx reverse proxy (production)

## 📊 API Documentation

### Authentication Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user profile

### Vault Endpoints

- `GET /api/vault/items` - Get vault items
- `POST /api/vault/items` - Create vault item
- `PUT /api/vault/items/:id` - Update vault item
- `DELETE /api/vault/items/:id` - Delete vault item
- `GET /api/vault/export` - Export vault data
- `POST /api/vault/import` - Import vault data

### Security Endpoints

- `GET /api/security/features` - Get security features
- `PUT /api/security/features/:direction` - Update security feature
- `POST /api/security/two-factor/enable` - Enable 2FA
- `POST /api/security/two-factor/verify` - Verify 2FA token
- `POST /api/security/analyze-password` - Analyze password strength

## 🔐 Security Considerations

### Encryption

- **At Rest**: All vault data encrypted with AES-256-GCM or XChaCha20-Poly1305
- **In Transit**: TLS 1.3 for all communications
- **Key Management**: Envelope encryption with per-item keys
- **Password Hashing**: Argon2id with configurable parameters

### Authentication

- **Multi-Factor**: TOTP and WebAuthn support
- **Session Management**: JWT with refresh token rotation
- **Rate Limiting**: Protection against brute force attacks
- **Account Lockout**: Automatic lockout after failed attempts

### Privacy

- **Zero-Knowledge**: Server cannot decrypt vault contents
- **No Logging**: Sensitive data never logged
- **Audit Trail**: Security events logged without sensitive data
- **Data Minimization**: Only necessary data collected

## 🚀 Production Deployment

### Security Checklist

- [ ] Change all default passwords and secrets
- [ ] Enable HTTPS with valid SSL certificates
- [ ] Configure firewall and network security
- [ ] Set up monitoring and alerting
- [ ] Enable database authentication
- [ ] Configure backup and recovery
- [ ] Review and update security headers
- [ ] Enable audit logging

### Performance Optimization

- [ ] Enable gzip compression
- [ ] Configure CDN for static assets
- [ ] Set up database indexing
- [ ] Enable Redis caching
- [ ] Configure load balancing
- [ ] Monitor and optimize queries

### Monitoring

- [ ] Set up application monitoring (Sentry, DataDog)
- [ ] Configure log aggregation
- [ ] Set up health checks
- [ ] Monitor security events
- [ ] Track performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Write comprehensive tests
- Update documentation
- Follow security best practices
- Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the ancient concept of Aṣṭa Digbandhanam
- Built with modern security best practices
- Uses industry-standard encryption algorithms
- Implements zero-knowledge architecture

## 📞 Support

- **Documentation**: [Wiki](https://github.com/your-username/astadigbandhanam-vault/wiki)
- **Issues**: [GitHub Issues](https://github.com/your-username/astadigbandhanam-vault/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-username/astadigbandhanam-vault/discussions)
- **Security**: [Security Policy](SECURITY.md)

## 🔄 Changelog

### v1.0.0 (Current)
- Initial release with full Aṣṭa Digbandhanam implementation
- Complete authentication and authorization system
- Interactive security mandala visualization
- Comprehensive vault management
- Docker containerization
- Full test coverage

---

**⚠️ Security Notice**: This is a demonstration project. For production use, ensure all security configurations are properly set up and regularly updated.
