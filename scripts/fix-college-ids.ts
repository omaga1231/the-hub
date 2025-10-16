import { db } from "../server/db";
import { firestoreStorage } from "../server/firestore";
import { courses, colleges } from "@shared/schema";
import { getFirestoreDb } from "../server/firestore";

async function fixCollegeIds() {
  console.log("Fixing college IDs in Firestore courses...");

  try {
    // Build college ID mapping: PostgreSQL ID -> Firestore ID
    const collegeIdMap = new Map<string, string>();
    
    const pgColleges = await db.select().from(colleges);
    const firestoreColleges = await firestoreStorage.getColleges();
    
    for (const pgCollege of pgColleges) {
      const matchingCollege = firestoreColleges.find(
        fc => fc.abbreviation === pgCollege.abbreviation && fc.name === pgCollege.name
      );
      if (matchingCollege) {
        collegeIdMap.set(pgCollege.id, matchingCollege.id);
        console.log(`Mapped ${pgCollege.abbreviation}: ${pgCollege.id} -> ${matchingCollege.id}`);
      } else {
        throw new Error(`No Firestore match for ${pgCollege.name}`);
      }
    }

    // Update all courses with correct Firestore college IDs
    const firestore = getFirestoreDb();
    const coursesSnapshot = await firestore.collection("courses").get();
    
    const batch = firestore.batch();
    let updateCount = 0;
    
    for (const doc of coursesSnapshot.docs) {
      const course = doc.data();
      const oldCollegeId = course.collegeId;
      const newCollegeId = collegeIdMap.get(oldCollegeId);
      
      if (newCollegeId && newCollegeId !== oldCollegeId) {
        batch.update(doc.ref, { collegeId: newCollegeId });
        updateCount++;
      }
    }
    
    await batch.commit();
    console.log(`✓ Updated ${updateCount} courses with correct college IDs`);
    
    console.log("\n🎉 College ID fix completed successfully!");
  } catch (error) {
    console.error("Fix failed:", error);
    process.exit(1);
  }
}

fixCollegeIds();
