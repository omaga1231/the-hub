# The Hub - Deployment Guide

## 🚀 Deploying Outside Replit

This guide will help you deploy The Hub academic collaboration platform to any hosting provider.

## 📋 Prerequisites

- Node.js 18+ installed
- Firebase project with Firestore configured
- Your Firebase credentials (from Firebase Console)

## 🔧 Environment Variables Required

Create a `.env` file with these variables:

```bash
# Firebase Admin (Backend)
FIREBASE_ADMIN_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key":"...",...}'

# Firebase Client (Frontend - must be prefixed with VITE_)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_APP_ID=your-app-id

# Server
NODE_ENV=production
PORT=5000
```

## 📦 Installation & Build

```bash
# 1. Install dependencies
npm install

# 2. Build the application
npm run build

# This creates:
# - dist/public (frontend static files)
# - dist/index.js (backend server)
```

## 🌐 Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel):**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

**Backend (Railway):**
1. Push code to GitHub
2. Connect Railway to your repo
3. Add environment variables
4. Railway auto-deploys!

### Option 2: Single Server (VPS/EC2)

```bash
# On your server:
git clone <your-repo>
cd the-hub
npm install
npm run build

# Set environment variables
export FIREBASE_ADMIN_SERVICE_ACCOUNT='...'
export VITE_FIREBASE_API_KEY='...'
# ... etc

# Run with PM2 (process manager)
npm i -g pm2
pm2 start dist/index.js --name the-hub
pm2 save
pm2 startup
```

### Option 3: Docker

```dockerfile
# Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["node", "dist/index.js"]
EXPOSE 5000
```

```bash
docker build -t the-hub .
docker run -p 5000:5000 --env-file .env the-hub
```

### Option 4: Render.com

1. Create a new Web Service on Render
2. Connect your GitHub repo
3. Configure:
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `node dist/index.js`
   - **Environment**: Add all variables above
4. Deploy!

## 🔒 Security Checklist

- ✅ Never commit `.env` or Firebase credentials
- ✅ Use environment variables for all secrets
- ✅ Enable CORS only for your domain in production
- ✅ Set `NODE_ENV=production`
- ✅ Use HTTPS (most platforms provide this automatically)

## 🗄️ Database

Firebase Firestore is already configured and will work automatically with your credentials. No additional database setup needed!

## 📝 Important Files

- `package.json` - Dependencies
- `vite.config.ts` - Build configuration
- `server/index.ts` - Backend entry point
- `client/src/main.tsx` - Frontend entry point

## 🔗 Platform-Specific Guides

### Railway
- https://railway.app/
- Supports Node.js out of the box
- Free tier available

### Render
- https://render.com/
- Free tier for web services
- Easy GitHub integration

### Vercel
- https://vercel.com/
- Best for frontend
- Serverless functions for API

### Fly.io
- https://fly.io/
- Deploy globally
- Docker-based

## 🆘 Troubleshooting

**Port Issues:**
- Make sure to bind to `0.0.0.0:${PORT}` not `localhost`
- Most platforms set PORT via environment variable

**Build Errors:**
- Run `npm run build` locally first to catch errors
- Check Node.js version matches (18+)

**Firebase Auth Issues:**
- Verify all Firebase env variables are set
- Check Firebase Console for authorized domains
- Add your production domain to Firebase Auth settings

## 📊 Monitoring

After deployment, monitor:
- Server logs for errors
- Firebase usage/quotas
- Application performance

## 🎉 Success!

Once deployed, your app will be live at your custom domain or platform URL!

For questions or issues, check the platform's documentation or community forums.
