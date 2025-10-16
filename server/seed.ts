import { db } from "./db";
import { eq } from "drizzle-orm";
import { colleges, courses, studyCircles, users } from "@shared/schema";

async function seed() {
  console.log("Seeding database...");

  // Check if test user exists, if not create it
  const existingUsers = await db.select().from(users).where(eq(users.id, "current-user-id"));
  let user;
  
  if (existingUsers.length === 0) {
    [user] = await db
      .insert(users)
      .values({
        id: "current-user-id",
        username: "testuser",
        email: "test@example.com",
        password: "hashedpassword",
        fullName: "Test User",
        bio: "A student exploring the platform",
      })
      .returning();
    console.log("Created test user with ID: current-user-id");
  } else {
    user = existingUsers[0];
    console.log("Test user already exists with ID:", user.id);
  }

  // Create colleges
  const [dtcc] = await db
    .insert(colleges)
    .values({
      name: "Delaware Technical Community College",
      abbreviation: "DTCC",
      description: "Delaware's premier community college offering associate degrees and technical programs",
    })
    .returning();

  const [udel] = await db
    .insert(colleges)
    .values({
      name: "University of Delaware",
      abbreviation: "UDel",
      description: "Delaware's flagship public research university",
    })
    .returning();

  console.log("Created colleges");

  // Create courses for DTCC
  const [cis211] = await db
    .insert(courses)
    .values({
      collegeId: dtcc.id,
      code: "CIS211",
      name: "Data Structures and Algorithms",
      description: "Introduction to fundamental data structures and algorithms. Covers arrays, linked lists, stacks, queues, trees, and sorting algorithms.",
      department: "Computer Information Systems",
    })
    .returning();

  const [cis110] = await db
    .insert(courses)
    .values({
      collegeId: dtcc.id,
      code: "CIS110",
      name: "Introduction to Programming",
      description: "Fundamentals of programming using Python. Learn variables, control structures, functions, and basic algorithms.",
      department: "Computer Information Systems",
    })
    .returning();

  // Create courses for UDel
  const [cisc220] = await db
    .insert(courses)
    .values({
      collegeId: udel.id,
      code: "CISC220",
      name: "Data Structures",
      description: "Advanced data structures including trees, graphs, hash tables, and their applications.",
      department: "Computer Science",
    })
    .returning();

  const [math241] = await db
    .insert(courses)
    .values({
      collegeId: udel.id,
      code: "MATH241",
      name: "Calculus I",
      description: "Limits, continuity, derivatives, and applications. Introduction to integration.",
      department: "Mathematics",
    })
    .returning();

  console.log("Created courses");

  // Create study circles
  await db
    .insert(studyCircles)
    .values([
      {
        courseId: cis211.id,
        name: "CIS211 Final Exam Prep",
        description: "Study group focused on preparing for the final exam. We meet weekly to review concepts and solve practice problems.",
        isPrivate: false,
      },
      {
        courseId: cis211.id,
        name: "Data Structures Study Group",
        description: "Collaborative learning group for mastering data structures. Open to all students.",
        isPrivate: false,
      },
      {
        courseId: cis110.id,
        name: "Python Beginners Circle",
        description: "Friendly group for students new to programming. We help each other understand Python basics.",
        isPrivate: false,
      },
      {
        courseId: cisc220.id,
        name: "Advanced DS Study Team",
        description: "For students who want to dive deeper into advanced data structures and algorithms.",
        isPrivate: false,
      },
      {
        courseId: math241.id,
        name: "Calculus Study Session",
        description: "Weekly calculus study sessions. We work through problem sets together.",
        isPrivate: false,
      },
    ]);

  console.log("Created study circles");

  console.log("Seeding complete!");
  process.exit(0);
}

seed().catch((error) => {
  console.error("Seed error:", error);
  process.exit(1);
});
