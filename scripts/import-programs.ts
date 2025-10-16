import { db } from "../server/db";
import { colleges, courses, programs, programCourses } from "../shared/schema";
import { eq } from "drizzle-orm";
import { readFileSync } from "fs";

interface ProgramData {
  name: string;
  degree: string;
  courses: string[];
}

// Parse programs from catalog text
function parsePrograms(catalogText: string): ProgramData[] {
  const programList: ProgramData[] = [];
  
  // Pattern to match program headers like "Bachelor of Science in Education (B.S.Ed.)"
  const programPattern = /([A-Za-z\s\-&\/]+?)\s+\(([A-Z][A-Za-z.]+?)\)\s+(?:[–—-]|–)/g;
  
  // Pattern to match course codes like "EDC 300", "NUR 310", etc.
  const courseCodePattern = /\b([A-Z]{2,4})\s+(\d{3})\b/g;
  
  const sections = catalogText.split(/\n(?=[A-Z][A-Za-z\s]+?\s+\([A-Z])/);
  
  for (const section of sections) {
    const programMatch = section.match(/^([A-Za-z\s\-&\/]+?)\s+\(([A-Z][A-Za-z.]+?)\)/);
    
    if (programMatch) {
      const name = programMatch[1].trim();
      const degree = programMatch[2].trim();
      const courses = new Set<string>();
      
      let match;
      while ((match = courseCodePattern.exec(section)) !== null) {
        const code = `${match[1]}-${match[2]}`;
        courses.add(code);
      }
      
      if (courses.size > 0) {
        programList.push({
          name,
          degree,
          courses: Array.from(courses),
        });
      }
    }
  }
  
  return programList;
}

async function importPrograms() {
  try {
    console.log("Starting program import...");
    
    // Read the catalog file
    const catalogPath = "attached_assets/Pasted-Delaware-Tech-Academic-Programs-and-Required-Courses-Catalog-2025-2026-Delaware-Technical-Communi-1760653429081_1760653429083.txt";
    const catalogText = readFileSync(catalogPath, "utf-8");
    
    // Get Delaware Tech college ID
    const dtcc = await db.query.colleges.findFirst({
      where: eq(colleges.abbreviation, "DTCC"),
    });
    
    if (!dtcc) {
      console.error("Delaware Tech college not found!");
      return;
    }
    
    // Parse programs from catalog
    const programData = parsePrograms(catalogText);
    console.log(`Found ${programData.length} programs`);
    
    // Get all existing courses for mapping
    const allCourses = await db.query.courses.findMany({
      where: eq(courses.collegeId, dtcc.id),
    });
    
    const courseCodeToId = new Map(
      allCourses.map(c => [c.code, c.id])
    );
    
    let importedCount = 0;
    let skippedCount = 0;
    
    for (const prog of programData) {
      // Check if program already exists
      const existing = await db.query.programs.findFirst({
        where: eq(programs.name, prog.name),
      });
      
      if (existing) {
        console.log(`Skipping existing program: ${prog.name}`);
        skippedCount++;
        continue;
      }
      
      // Insert program
      const [newProgram] = await db.insert(programs).values({
        collegeId: dtcc.id,
        name: prog.name,
        degree: prog.degree,
        description: `${prog.degree} program in ${prog.name}`,
      }).returning();
      
      // Link courses to program
      const validCourses = prog.courses
        .map(code => {
          const courseId = courseCodeToId.get(code);
          return courseId ? {
            programId: newProgram.id,
            courseId,
            isRequired: true,
          } : null;
        })
        .filter((item): item is { programId: string; courseId: string; isRequired: boolean } => item !== null);
      
      if (validCourses.length > 0) {
        await db.insert(programCourses).values(validCourses);
        console.log(`✓ Imported: ${prog.name} (${prog.degree}) with ${validCourses.length} courses`);
        importedCount++;
      } else {
        console.log(`⚠ Imported: ${prog.name} (${prog.degree}) with 0 matched courses`);
        importedCount++;
      }
    }
    
    console.log(`\n✅ Import complete!`);
    console.log(`   - Programs imported: ${importedCount}`);
    console.log(`   - Programs skipped (already exist): ${skippedCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error("Import failed:", error);
    process.exit(1);
  }
}

importPrograms();
