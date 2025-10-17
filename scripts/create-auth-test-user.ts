import admin from "firebase-admin";
import { getFirebaseAdmin } from "../server/firebase-admin";
import { getFirestoreDb } from "../server/firestore";

async function createAuthTestUser() {
  try {
    const app = getFirebaseAdmin();
    if (!app) {
      console.error("❌ Firebase Admin SDK not initialized");
      process.exit(1);
    }

    const db = getFirestoreDb();
    const auth = admin.auth();

    const testEmail = "testdev@college.edu";
    const testPassword = "TestPass123!";
    const testUsername = "testdev";
    
    // Check if user already exists
    try {
      const existingUser = await auth.getUserByEmail(testEmail);
      console.log("⚠️  User already exists in Firebase Auth. Deleting...");
      await auth.deleteUser(existingUser.uid);
      
      // Also delete from Firestore
      const userSnapshot = await db.collection("users").where("firebaseUid", "==", existingUser.uid).get();
      for (const doc of userSnapshot.docs) {
        await doc.ref.delete();
      }
      console.log("✅ Deleted existing user");
    } catch (error: any) {
      if (error.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    // Create Firebase Auth user
    const firebaseUser = await auth.createUser({
      email: testEmail,
      password: testPassword,
      emailVerified: true, // Mark as verified so they can log in immediately
      displayName: "Test Developer",
    });

    console.log("✅ Created Firebase Auth user");
    console.log("Firebase UID:", firebaseUser.uid);

    // Create Firestore user record
    const firestoreUser = {
      firebaseUid: firebaseUser.uid,
      email: testEmail,
      username: testUsername,
      fullName: "Test Developer",
      bio: "Fully functional test account for development",
      avatar: null,
      isAdmin: false,
      createdAt: new Date(),
    };

    const userRef = await db.collection("users").add(firestoreUser);
    
    console.log("\n🎉 Test account created successfully!\n");
    console.log("═══════════════════════════════════════");
    console.log("📧 Email:    ", testEmail);
    console.log("🔑 Password: ", testPassword);
    console.log("👤 Username: ", testUsername);
    console.log("🆔 User ID:  ", userRef.id);
    console.log("═══════════════════════════════════════");
    console.log("\n✅ You can now log in with these credentials!");
    console.log("   Email verification is already completed.\n");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating test user:", error);
    process.exit(1);
  }
}

createAuthTestUser();
