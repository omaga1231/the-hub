import { db } from "../server/db";
import { firestoreStorage } from "../server/firestore";
import { courses, colleges, programs, programCourses } from "@shared/schema";

async function importToFirestore() {
  console.log("Starting import to Firestore...");

  try {
    // Create ID mappings
    const collegeIdMap = new Map<string, string>(); // PostgreSQL ID -> Firestore ID
    const courseIdMap = new Map<string, string>(); // PostgreSQL ID -> Firestore ID
    const programIdMap = new Map<string, string>(); // PostgreSQL ID -> Firestore ID

    // Import colleges with ID mapping
    const existingColleges = await firestoreStorage.getColleges();
    if (existingColleges.length === 0) {
      console.log("Importing colleges...");
      const collegesData = await db.select().from(colleges);
      for (const college of collegesData) {
        const newCollege = await firestoreStorage.createCollege({
          name: college.name,
          abbreviation: college.abbreviation,
          description: college.description,
        });
        collegeIdMap.set(college.id, newCollege.id);
      }
      console.log(`✓ Imported ${collegesData.length} colleges`);
    } else {
      console.log(`✓ Colleges already imported (${existingColleges.length})`);
      // Rebuild mapping by matching unique fields (abbreviation + name)
      const collegesData = await db.select().from(colleges);
      for (const pgCollege of collegesData) {
        const matchingCollege = existingColleges.find(
          fc => fc.abbreviation === pgCollege.abbreviation && fc.name === pgCollege.name
        );
        if (matchingCollege) {
          collegeIdMap.set(pgCollege.id, matchingCollege.id);
        } else {
          throw new Error(`College mapping failed: Could not find Firestore match for ${pgCollege.name} (${pgCollege.abbreviation})`);
        }
      }
      console.log(`✓ Mapped ${collegeIdMap.size} colleges`);
    }

    // Import courses with ID mapping
    const existingCourses = await firestoreStorage.getCourses();
    if (existingCourses.length === 0) {
      console.log("Importing courses...");
      const coursesData = await db.select().from(courses);
      for (const course of coursesData) {
        const firestoreCollegeId = collegeIdMap.get(course.collegeId) || course.collegeId;
        const newCourse = await firestoreStorage.createCourse({
          collegeId: firestoreCollegeId,
          code: course.code,
          name: course.name,
          description: course.description,
          department: course.department,
        });
        courseIdMap.set(course.id, newCourse.id);
      }
      console.log(`✓ Imported ${coursesData.length} courses`);
    } else {
      console.log(`✓ Courses already imported (${existingCourses.length})`);
      // Rebuild mapping - match by code and name
      const coursesData = await db.select().from(courses);
      for (const pgCourse of coursesData) {
        const matchingCourse = existingCourses.find(
          fc => fc.code === pgCourse.code && fc.name === pgCourse.name
        );
        if (matchingCourse) {
          courseIdMap.set(pgCourse.id, matchingCourse.id);
        }
      }
      console.log(`✓ Mapped ${courseIdMap.size} courses`);
    }

    // Import programs with ID mapping
    const existingPrograms = await firestoreStorage.getPrograms();
    if (existingPrograms.length === 0) {
      console.log("Importing programs...");
      const programsData = await db.select().from(programs);
      for (const program of programsData) {
        const programData: any = {
          name: program.name,
          degree: program.degree,
        };
        if (program.description !== null && program.description !== undefined) {
          programData.description = program.description;
        }
        if (program.department !== null && program.department !== undefined) {
          programData.department = program.department;
        }
        const newProgram = await firestoreStorage.createProgram(programData);
        programIdMap.set(program.id, newProgram.id);
      }
      console.log(`✓ Imported ${programsData.length} programs`);
    } else {
      console.log(`✓ Programs already imported (${existingPrograms.length})`);
      // Rebuild mapping - match by name and degree
      const programsData = await db.select().from(programs);
      for (const pgProgram of programsData) {
        const matchingProgram = existingPrograms.find(
          fp => fp.name === pgProgram.name && fp.degree === pgProgram.degree
        );
        if (matchingProgram) {
          programIdMap.set(pgProgram.id, matchingProgram.id);
        }
      }
      console.log(`✓ Mapped ${programIdMap.size} programs`);
    }

    // Delete old program courses and reimport with correct IDs
    console.log("Clearing old program-course relationships...");
    const db2 = firestoreStorage;
    // Note: We need to manually delete from Firestore
    const { getFirestoreDb } = await import("../server/firestore");
    const firestore = getFirestoreDb();
    const oldProgramCourses = await firestore.collection("program_courses").get();
    const batch = firestore.batch();
    oldProgramCourses.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`✓ Cleared ${oldProgramCourses.size} old relationships`);

    // Import program courses with correct Firestore IDs
    console.log("Importing program-course relationships...");
    const programCoursesData = await db.select().from(programCourses);
    let imported = 0;
    let skipped = 0;
    for (const pc of programCoursesData) {
      const firestoreProgramId = programIdMap.get(pc.programId);
      const firestoreCourseId = courseIdMap.get(pc.courseId);
      
      if (!firestoreProgramId) {
        throw new Error(`Program-course mapping failed: No Firestore ID found for program ${pc.programId}`);
      }
      if (!firestoreCourseId) {
        throw new Error(`Program-course mapping failed: No Firestore ID found for course ${pc.courseId}`);
      }
      
      await firestoreStorage.createProgramCourse({
        programId: firestoreProgramId,
        courseId: firestoreCourseId,
        isRequired: pc.isRequired,
      });
      imported++;
    }
    console.log(`✓ Imported ${imported} program-course relationships`);

    console.log("\n🎉 Import completed successfully!");
  } catch (error) {
    console.error("Import failed:", error);
    process.exit(1);
  }
}

importToFirestore();
