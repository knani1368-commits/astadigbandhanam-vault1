# 🚀 Deploy to Render + MongoDB Atlas

This guide will help you deploy your Aṣṭa Digbandhanam password manager to Render with MongoDB Atlas.

## 📋 Prerequisites

1. **GitHub Repository** - Push your code to GitHub
2. **Render Account** - Sign up at [render.com](https://render.com)
3. **MongoDB Atlas Account** - Sign up at [mongodb.com/atlas](https://mongodb.com/atlas)

## 🗄️ Step 1: Set up MongoDB Atlas

### 1.1 Create Cluster
1. Go to [MongoDB Atlas](https://cloud.mongodb.com)
2. Click "Build a Database"
3. Choose **FREE** tier (M0)
4. Select your preferred region
5. Click "Create"

### 1.2 Configure Database Access
1. Go to "Database Access" in the left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a strong password
5. Set privileges to "Read and write to any database"
6. Click "Add User"

### 1.3 Configure Network Access
1. Go to "Network Access" in the left sidebar
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### 1.4 Get Connection String
1. Go to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database user password
6. Replace `<dbname>` with `astadigbandhanam`

## 🌐 Step 2: Deploy to Render

### 2.1 Create Backend Service
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: `astadigbandhanam-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

### 2.2 Set Environment Variables
Add these environment variables in Render:

```bash
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://astadigbandhanam_user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/astadigbandhanam?retryWrites=true&w=majority
JWT_SECRET=your-super-secure-jwt-secret-key-here-min-32-chars
JWT_EXPIRES_IN=7d
ENCRYPTION_KEY=your-32-byte-encryption-key-here
REDIS_URL=redis://localhost:6379
CORS_ORIGIN=https://astadigbandhanam-frontend.onrender.com
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

### 2.3 Create Frontend Service
1. Click "New +" → "Static Site"
2. Connect your GitHub repository
3. Configure the service:
   - **Name**: `astadigbandhanam-frontend`
   - **Build Command**: `cd frontend && npm install && npm run build`
   - **Publish Directory**: `frontend/dist`
   - **Plan**: Free

### 2.4 Set Frontend Environment Variables
```bash
VITE_API_URL=https://astadigbandhanam-backend.onrender.com/api
VITE_APP_NAME=Aṣṭa Digbandhanam Vault
VITE_APP_VERSION=1.0.0
```

### 2.5 Create Redis Service (Optional)
1. Click "New +" → "Redis"
2. Configure:
   - **Name**: `astadigbandhanam-redis`
   - **Plan**: Free
3. Update your backend environment variables with the Redis URL

## 🔧 Step 3: Alternative - Use render.yaml

Instead of manual setup, you can use the included `render.yaml`:

1. Push your code to GitHub
2. In Render, click "New +" → "Blueprint"
3. Connect your repository
4. Render will automatically detect and use `render.yaml`

## 🔐 Step 4: Security Configuration

### 4.1 Generate Secure Keys
```bash
# Generate JWT Secret (32+ characters)
openssl rand -base64 32

# Generate Encryption Key (32 bytes)
openssl rand -hex 32
```

### 4.2 Update Environment Variables
Replace the placeholder values in your Render environment variables with the generated keys.

## 🧪 Step 5: Test Deployment

1. **Backend Health Check**: `https://astadigbandhanam-backend.onrender.com/health`
2. **API Documentation**: `https://astadigbandhanam-backend.onrender.com/api-docs`
3. **Frontend**: `https://astadigbandhanam-frontend.onrender.com`

## 📊 Step 6: Monitor and Maintain

### 6.1 Render Dashboard
- Monitor service health
- View logs
- Check resource usage
- Set up alerts

### 6.2 MongoDB Atlas
- Monitor database performance
- Set up alerts
- Configure backups
- Review access logs

## 🚨 Troubleshooting

### Common Issues:

1. **Build Failures**
   - Check Node.js version (18+)
   - Verify all dependencies in package.json
   - Check build logs in Render dashboard

2. **Database Connection Issues**
   - Verify MongoDB Atlas network access
   - Check connection string format
   - Ensure database user has correct permissions

3. **CORS Errors**
   - Update CORS_ORIGIN with your frontend URL
   - Check environment variables are set correctly

4. **Memory Issues**
   - Free tier has limited memory
   - Consider upgrading to paid plan for production

## 💰 Cost Considerations

### Free Tier Limits:
- **Render**: 750 hours/month per service
- **MongoDB Atlas**: 512MB storage
- **Redis**: 25MB memory

### Production Recommendations:
- Upgrade to paid plans for production use
- Set up monitoring and alerts
- Configure automated backups
- Use custom domains with SSL

## 🔄 Continuous Deployment

Once set up, Render will automatically deploy when you push to your main branch:

```bash
git add .
git commit -m "Deploy to production"
git push origin main
```

Your application will be automatically updated! 🎉
