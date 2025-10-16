# Firebase Authentication Setup Instructions

## Current Status

The Hub has been successfully migrated from Passport.js to Firebase Authentication. All code is in place, but you need to add Firebase configuration secrets to make it work.

## Required Secrets

You need to add the following secrets in your Replit Secrets panel:

### 1. Firebase Web App Secrets (Frontend)

These are used by the React frontend to connect to Firebase. Add exactly as shown:

```
Key: VITE_FIREBASE_PROJECT_ID
Value: schwab-dbe8d
```

```
Key: VITE_FIREBASE_APP_ID
Value: 1:705973992387:web:48200726a68a680d95db76
```

```
Key: VITE_FIREBASE_API_KEY
Value: AIzaSyBVZffeUAXU230_UnyfZAuV-6jxw9k3AxM
```

**Note**: Other Firebase config values (authDomain, storageBucket, messagingSenderId, measurementId) are either hardcoded or derived from the projectId in the code.

### 2. Firebase Admin SDK Secret (Backend)

This is used by the Express backend to verify authentication tokens and send custom domain emails:

```
Key: FIREBASE_ADMIN_SERVICE_ACCOUNT
Value: (JSON object from Firebase Console - see below)
```

#### How to get the Admin Service Account:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`schwab-dbe8d`)
3. Click the gear icon ⚙️ → **Project Settings**
4. Navigate to **Service Accounts** tab
5. Click **Generate New Private Key**
6. **Download the JSON file** (it will have a name like `schwab-dbe8d-firebase-adminsdk-xxxxx.json`)
7. Open the JSON file and **copy the ENTIRE content** (including all braces, quotes, and newlines)
8. In Replit Secrets, paste the **complete JSON** as the value

**IMPORTANT**: The JSON must be pasted exactly as-is, preserving all formatting, quotes, and escaped characters. It should look like:
```json
{
  "type": "service_account",
  "project_id": "schwab-dbe8d",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  ...
}
```

Do not modify or reformat the JSON - Replit will handle it correctly.

## How to Add Secrets in Replit

1. Open the **Tools** panel in Replit (left sidebar)
2. Click on **Secrets** (lock icon 🔒)
3. Add each secret:
   - Click **New Secret**
   - Enter the key name (e.g., `VITE_FIREBASE_PROJECT_ID`)
   - Enter the value
   - Click **Add Secret**
4. Repeat for all 4 secrets

## After Adding Secrets

Once all **4 secrets** are added:

1. **Restart the application**: Click the "Stop" button in Replit, then run `npm run dev` again (or wait for auto-restart)
2. **Refresh your browser** to load the new Firebase configuration
3. Test the authentication flow:
   - Go to `/signup` to create a new account
   - Use a `.edu` email address (required for college verification)
   - Check your email for the verification link from Firebase
   - After verifying, return to `/login` and sign in
   - You'll be automatically synced to the PostgreSQL database and redirected to the home page

**Important**: If you see "Firebase: Error (auth/invalid-api-key)" after adding secrets, make sure to restart the app and refresh your browser.

## Custom Domain Email (Optional)

To send verification emails from your own domain instead of Firebase's default:

1. Ensure `FIREBASE_ADMIN_SERVICE_ACCOUNT` is configured
2. In Firebase Console → Authentication → Templates
3. Customize your email templates
4. Set up a custom domain under Project Settings → Authorized Domains

## Authentication Flow

The new Firebase authentication system works as follows:

1. **Signup**: User creates account with email/password → Email verification sent
2. **Email Verification**: User clicks link in email to verify
3. **Login**: User signs in → Firebase checks email verification → Syncs to PostgreSQL
4. **Session**: Firebase ID token stored in browser → Sent with each API request
5. **Backend**: Express middleware verifies Firebase token → Links to database user

## Benefits

- ✅ Email verification required (ensures valid college emails)
- ✅ Secure token-based authentication
- ✅ Custom domain email support (via Firebase Admin SDK)
- ✅ Hybrid architecture: Firebase handles auth, PostgreSQL stores user data
- ✅ Auto-generated usernames from email (users can change later)

## Current Error

You'll see this error until secrets are added:
```
Firebase: Error (auth/invalid-api-key)
```

This is expected and will resolve once you add the Firebase API key and other secrets.
