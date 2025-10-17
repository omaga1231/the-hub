# ✅ Quick Deployment Checklist

## Before You Start
- [ ] GitHub account ready (username: omaga1231)
- [ ] Railway account created (https://railway.app)
- [ ] Firebase credentials accessible in Replit Secrets

## Step-by-Step (5 Minutes)

### 1️⃣ GitHub (2 min)
- [ ] Create repo: https://github.com/new
  - Name: `the-hub`
  - Public or Private
  - Don't add README
- [ ] Copy repo URL: `https://github.com/omaga1231/the-hub.git`

### 2️⃣ Push Code (1 min)
Open Replit Shell and run:
```bash
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/omaga1231/the-hub.git
git push -u origin main
```

### 3️⃣ Railway Deploy (1 min)
- [ ] Go to https://railway.app
- [ ] New Project → Deploy from GitHub
- [ ] Select: omaga1231/the-hub
- [ ] Railway auto-detects and builds

### 4️⃣ Environment Variables (2 min)
Copy from Replit Secrets → Add to Railway Variables:
- [ ] FIREBASE_ADMIN_SERVICE_ACCOUNT (from Replit Secrets)
- [ ] VITE_FIREBASE_API_KEY (from Replit Secrets)
- [ ] VITE_FIREBASE_PROJECT_ID (from Replit Secrets)
- [ ] VITE_FIREBASE_APP_ID (from Replit Secrets)
- [ ] SESSION_SECRET (generate random 32+ char string)
- [ ] NODE_ENV = `production`

### 5️⃣ Firebase Setup (30 sec)
- [ ] Copy Railway URL (e.g., `xxx.up.railway.app`)
- [ ] Add to Firebase Console → Authentication → Authorized Domains

### 6️⃣ Done! 🎉
- [ ] Visit Railway URL
- [ ] Test login
- [ ] Share with students!

---

## 🆘 Quick Fixes

**Build fails?** → Check Railway logs, verify all env vars set

**Can't login?** → Add Railway URL to Firebase authorized domains

**Database error?** → Verify FIREBASE_ADMIN_SERVICE_ACCOUNT is complete JSON

---

📖 **Full Guide**: See RAILWAY_DEPLOYMENT_GUIDE.md
