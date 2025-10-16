import admin from "firebase-admin";

let firebaseAdmin: admin.app.App | null = null;

export function initializeFirebaseAdmin() {
  if (firebaseAdmin) {
    return firebaseAdmin;
  }

  try {
    const serviceAccount = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT;
    
    if (!serviceAccount) {
      console.warn("FIREBASE_ADMIN_SERVICE_ACCOUNT not configured. Custom domain email sending will not be available.");
      return null;
    }

    const serviceAccountObj = JSON.parse(serviceAccount);

    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccountObj),
      projectId: serviceAccountObj.project_id,
    });

    console.log("Firebase Admin SDK initialized successfully");
    return firebaseAdmin;
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    return null;
  }
}

export function getFirebaseAdmin() {
  if (!firebaseAdmin) {
    return initializeFirebaseAdmin();
  }
  return firebaseAdmin;
}

export async function verifyFirebaseToken(idToken: string) {
  const app = getFirebaseAdmin();
  if (!app) {
    throw new Error("Firebase Admin not initialized");
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

export async function generateEmailVerificationLink(email: string, returnUrl?: string) {
  const app = getFirebaseAdmin();
  if (!app) {
    throw new Error("Firebase Admin not initialized");
  }

  const actionCodeSettings = {
    url: returnUrl || process.env.REPLIT_DEV_DOMAIN || "http://localhost:5000",
    handleCodeInApp: false,
  };

  try {
    const link = await admin.auth().generateEmailVerificationLink(email, actionCodeSettings);
    return link;
  } catch (error) {
    console.error("Failed to generate email verification link:", error);
    throw error;
  }
}
