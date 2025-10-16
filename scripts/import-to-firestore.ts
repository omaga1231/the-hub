import { db } from "../server/db";
import { firestoreStorage } from "../server/firestore";
import { courses, colleges, programs, programCourses } from "@shared/schema";

async function importToFirestore() {
  console.log("Starting import to Firestore...");

  try {
    // Import colleges
    console.log("Importing colleges...");
    const collegesData = await db.select().from(colleges);
    for (const college of collegesData) {
      await firestoreStorage.createCollege({
        name: college.name,
        abbreviation: college.abbreviation,
        description: college.description,
      });
    }
    console.log(`✓ Imported ${collegesData.length} colleges`);

    // Import courses
    console.log("Importing courses...");
    const coursesData = await db.select().from(courses);
    for (const course of coursesData) {
      await firestoreStorage.createCourse({
        collegeId: course.collegeId,
        code: course.code,
        name: course.name,
        description: course.description,
        department: course.department,
      });
    }
    console.log(`✓ Imported ${coursesData.length} courses`);

    // Import programs
    console.log("Importing programs...");
    const programsData = await db.select().from(programs);
    for (const program of programsData) {
      await firestoreStorage.createProgram({
        name: program.name,
        degree: program.degree,
        description: program.description,
        department: program.department,
      });
    }
    console.log(`✓ Imported ${programsData.length} programs`);

    // Import program courses
    console.log("Importing program-course relationships...");
    const programCoursesData = await db.select().from(programCourses);
    for (const pc of programCoursesData) {
      await firestoreStorage.createProgramCourse({
        programId: pc.programId,
        courseId: pc.courseId,
        isRequired: pc.isRequired,
      });
    }
    console.log(`✓ Imported ${programCoursesData.length} program-course relationships`);

    console.log("\n🎉 Import completed successfully!");
  } catch (error) {
    console.error("Import failed:", error);
    process.exit(1);
  }
}

importToFirestore();
