# 🚀 Deploy The Hub to Railway - Step-by-Step Guide

## GitHub Username: omaga1231

Follow these steps exactly to deploy your app to Railway!

---

## 📋 **STEP 1: Create GitHub Repository**

### 1.1 Go to GitHub
- Open: https://github.com/new
- **Repository name**: `the-hub`
- **Description**: "Academic collaboration platform for students"
- **Visibility**: Choose Public or Private
- ❌ **DO NOT** check "Add README" (we already have files)
- Click **"Create repository"**

### 1.2 Copy Your Repository URL
After creating, you'll see a URL like:
```
https://github.com/omaga1231/the-hub.git
```
**Keep this URL handy!**

---

## 📤 **STEP 2: Push Code to GitHub**

### 2.1 Open Replit Shell
Click the **Shell** tab in Replit

### 2.2 Run These Commands (one by one):

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit your code
git commit -m "Initial commit - The Hub platform"

# Add your GitHub repository
git remote add origin https://github.com/omaga1231/the-hub.git

# Push to GitHub
git push -u origin main
```

**Note**: If it asks for authentication:
- Use your GitHub username: `omaga1231`
- Use a **Personal Access Token** as password (not your GitHub password)
  - Create token at: https://github.com/settings/tokens
  - Select "repo" permissions
  - Generate and copy the token

### 2.3 Verify on GitHub
- Go to: https://github.com/omaga1231/the-hub
- You should see all your code!

---

## 🚂 **STEP 3: Deploy to Railway**

### 3.1 Sign Up/Login to Railway
- Go to: https://railway.app/
- Click **"Login"** or **"Start a New Project"**
- Sign in with GitHub (easiest option)

### 3.2 Create New Project
- Click **"New Project"**
- Select **"Deploy from GitHub repo"**
- Find and select: **omaga1231/the-hub**
- Railway will automatically detect it's a Node.js app

### 3.3 Configure Build Settings
Railway should auto-detect:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node dist/index.js`

If not, add these manually in Settings.

---

## 🔐 **STEP 4: Add Environment Variables**

### 4.1 In Railway Dashboard
- Click on your deployed service
- Go to **"Variables"** tab
- Click **"New Variable"**

### 4.2 Add These Variables (from your Replit Secrets):

**Copy these from Replit → Secrets (padlock icon):**

1. **FIREBASE_ADMIN_SERVICE_ACCOUNT**
   - Copy the entire JSON from Replit Secrets
   - Paste into Railway

2. **VITE_FIREBASE_API_KEY**
   - Copy from Replit Secrets
   - Paste into Railway

3. **VITE_FIREBASE_PROJECT_ID**
   - Copy from Replit Secrets
   - Paste into Railway

4. **VITE_FIREBASE_APP_ID**
   - Copy from Replit Secrets
   - Paste into Railway

5. **SESSION_SECRET**
   - Generate a random string (at least 32 characters)
   - Example: `railway-hub-secret-2024-production-key-xyz123`
   - Or use: https://randomkeygen.com/

6. **NODE_ENV**
   - Value: `production`

7. **PORT** (Railway sets this automatically)
   - Railway will automatically set this
   - You can skip this one

### 4.3 Save Variables
- Click **"Add"** for each variable
- Railway will automatically redeploy

---

## 🌐 **STEP 5: Get Your Live URL**

### 5.1 Find Your URL
- In Railway dashboard, click **"Settings"**
- Under **"Domains"**, you'll see your URL:
  ```
  https://the-hub-production-xxxx.up.railway.app
  ```

### 5.2 Update Firebase Settings
**IMPORTANT**: Add this Railway URL to Firebase:

1. Go to: https://console.firebase.google.com/
2. Select your project
3. Go to **Authentication** → **Settings**
4. Scroll to **"Authorized domains"**
5. Click **"Add domain"**
6. Add your Railway URL (without https://):
   ```
   the-hub-production-xxxx.up.railway.app
   ```

---

## ✅ **STEP 6: Verify Deployment**

### 6.1 Visit Your Live App
- Click your Railway URL
- Your app should load!

### 6.2 Test Features
- ✅ Sign in with .edu email
- ✅ Browse courses
- ✅ Create a study circle
- ✅ Join circles
- ✅ Chat and post

---

## 🔄 **Future Updates**

### When You Make Changes in Replit:

```bash
# In Replit Shell:
git add .
git commit -m "Description of changes"
git push
```

**Railway auto-deploys** when you push to GitHub! 🎉

---

## ❓ **Troubleshooting**

### Build Fails
- Check Railway logs for errors
- Verify all environment variables are set
- Make sure Firebase credentials are correct

### App Crashes
- Check Railway logs: Click "Deployments" → View logs
- Verify PORT is set to 5000
- Check NODE_ENV is "production"

### Can't Login
- Make sure Railway URL is in Firebase authorized domains
- Check VITE_FIREBASE_* variables are set correctly
- Verify Firebase project is active

### Database Issues
- Check FIREBASE_ADMIN_SERVICE_ACCOUNT is complete JSON
- Verify Firestore is enabled in Firebase Console
- Check Firebase project ID matches

---

## 🎉 **Success!**

Your Hub platform is now live on Railway! 

**Share your URL with students and start collaborating!** 🚀

---

## 📊 **Railway Dashboard Tips**

- **Logs**: Click "Deployments" to see real-time logs
- **Metrics**: View usage, memory, CPU in dashboard
- **Billing**: First $5/month is free!
- **Custom Domain**: Upgrade to add your own domain

---

## 🆘 **Need Help?**

- Railway Docs: https://docs.railway.app/
- Railway Discord: https://discord.gg/railway
- Firebase Docs: https://firebase.google.com/docs

**Questions?** Check the logs first, they usually show the exact error!
