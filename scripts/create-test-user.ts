import { getFirestoreDb } from "../server/firestore";

async function createTestUser() {
  try {
    const db = getFirestoreDb();
    
    const testUser = {
      firebaseUid: "test-user-dev-123",
      email: "testuser@college.edu",
      username: "testuser",
      fullName: "Test User",
      bio: "Development test account - no Firebase auth",
      avatar: null,
      isAdmin: false,
      createdAt: new Date(),
    };

    const userRef = await db.collection("users").add(testUser);
    console.log("✅ Test user created successfully!");
    console.log("User ID:", userRef.id);
    console.log("Firebase UID:", testUser.firebaseUid);
    console.log("Email:", testUser.email);
    console.log("Username:", testUser.username);
    console.log("\nNote: This user is in the database but has no Firebase authentication.");
    console.log("You cannot log in with this account - it's for direct database testing only.");
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error creating test user:", error);
    process.exit(1);
  }
}

createTestUser();
