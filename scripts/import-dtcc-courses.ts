import { db } from "../server/db";
import { colleges, courses } from "../shared/schema";
import { eq } from "drizzle-orm";
import { readFileSync } from "fs";

// Extract course information from the catalog text
function extractCourses(catalogText: string): Map<string, { code: string; name: string; department: string }> {
  const courseMap = new Map<string, { code: string; name: string; department: string }>();
  
  // Regex to match course patterns like "EDC 300 – The Effective Teacher (3 credits)"
  const coursePattern = /([A-Z]{2,4})\s+(\d{3})\s+[–—-]\s+([^(]+?)(?:\s*\(|;|\.|\n)/g;
  
  let match;
  while ((match = coursePattern.exec(catalogText)) !== null) {
    const prefix = match[1].trim();
    const number = match[2].trim();
    const name = match[3].trim();
    const code = `${prefix}-${number}`;
    
    // Determine department from prefix
    const department = getDepartmentFromPrefix(prefix);
    
    // Add to map (will automatically deduplicate)
    if (!courseMap.has(code)) {
      courseMap.set(code, { code, name, department });
    }
  }
  
  return courseMap;
}

// Map course prefixes to department names
function getDepartmentFromPrefix(prefix: string): string {
  const departmentMap: Record<string, string> = {
    'EDC': 'Education',
    'SPE': 'Special Education',
    'ENG': 'English',
    'MAT': 'Mathematics',
    'NUR': 'Nursing',
    'BIO': 'Biology',
    'HIS': 'History',
    'SOC': 'Sociology',
    'PSY': 'Psychology',
    'ASL': 'American Sign Language',
    'SSC': 'Student Success',
    'AGS': 'Agriculture',
    'AET': 'Architectural Engineering Technology',
    'CMT': 'Construction Management Technology',
    'AUT': 'Automotive Technology',
    'AVI': 'Aviation',
    'CHM': 'Chemistry',
    'CHE': 'Chemistry',
    'PHY': 'Physics',
    'ACC': 'Accounting',
    'BUS': 'Business',
    'MGT': 'Management',
    'MKT': 'Marketing',
    'ECO': 'Economics',
    'OAT': 'Office Administration Technology',
    'MIS': 'Management Information Systems',
    'FIN': 'Finance',
    'DMS': 'Diagnostic Medical Sonography',
    'CVS': 'Cardiovascular Sonography',
    'CET': 'Civil Engineering Technology',
    'EGR': 'Engineering',
    'EGG': 'Engineering Graphics',
    'CSC': 'Computer Science',
    'COM': 'Communication',
    'ITN': 'Information Technology',
    'VSC': 'Visual Communication',
    'CIS': 'Computing and Information Science',
    'CMG': 'Construction Management',
    'LAW': 'Law',
    'CRJ': 'Criminal Justice',
    'POL': 'Political Science',
    'CUL': 'Culinary Arts',
    'HRM': 'Hospitality Management',
    'SCI': 'Science',
    'DHY': 'Dental Hygiene',
    'DLT': 'Dental Laboratory Technology',
    'EMT': 'Emergency Medical Technology',
    'EMS': 'Emergency Medical Services',
    'PTA': 'Physical Therapist Assistant',
    'RAD': 'Radiologic Technology',
    'RET': 'Respiratory Care',
    'VET': 'Veterinary Technology',
    'HLT': 'Health',
    'CAR': 'Cardiac Sonography',
    'EET': 'Electrical Engineering Technology',
    'MEG': 'Mechanical Engineering',
    'PLS': 'Paralegal Studies',
    'GIS': 'Geographic Information Systems',
    'ENS': 'Environmental Science',
    'ENV': 'Environmental',
    'HON': 'Honors',
    'HUM': 'Humanities',
    'ART': 'Art',
    'MUS': 'Music',
    'THE': 'Theatre',
    'POS': 'Poultry Science',
    'WEB': 'Web Development',
    'GAM': 'Game Development',
  };
  
  return departmentMap[prefix] || prefix;
}

async function main() {
  console.log('🔍 Starting Delaware Tech course import...\n');
  
  // Read the catalog file
  const catalogPath = 'attached_assets/Pasted-Delaware-Tech-Academic-Programs-and-Required-Courses-Catalog-2025-2026-Delaware-Technical-Communi-1760653429081_1760653429083.txt';
  const catalogText = readFileSync(catalogPath, 'utf-8');
  
  // Check if DTCC exists, if not create it
  let dtcc = await db.select().from(colleges).where(eq(colleges.abbreviation, 'DTCC')).limit(1);
  
  if (dtcc.length === 0) {
    console.log('📚 Creating Delaware Technical Community College...');
    const [newCollege] = await db.insert(colleges).values({
      name: 'Delaware Technical Community College',
      abbreviation: 'DTCC',
      description: 'Delaware Technical Community College (Del Tech) offers bachelor degrees, associate degrees, diplomas, and certificates across multiple campuses.',
    }).returning();
    dtcc = [newCollege];
    console.log('✅ College created\n');
  } else {
    console.log('✅ Delaware Technical Community College found\n');
  }
  
  const collegeId = dtcc[0].id;
  
  // Extract courses
  console.log('📖 Parsing course catalog...');
  const courseMap = extractCourses(catalogText);
  console.log(`✅ Found ${courseMap.size} unique courses\n`);
  
  // Get existing courses to avoid duplicates
  const existingCourses = await db.select().from(courses).where(eq(courses.collegeId, collegeId));
  const existingCodesSet = new Set(existingCourses.map(c => c.code));
  
  // Filter out courses that already exist
  const newCourses = Array.from(courseMap.values()).filter(c => !existingCodesSet.has(c.code));
  
  console.log(`📝 Adding ${newCourses.length} new courses (${existingCourses.length} already exist)...\n`);
  
  // Insert courses in batches
  const batchSize = 50;
  let added = 0;
  
  for (let i = 0; i < newCourses.length; i += batchSize) {
    const batch = newCourses.slice(i, i + batchSize);
    
    await db.insert(courses).values(
      batch.map(course => ({
        collegeId,
        code: course.code,
        name: course.name,
        department: course.department,
        description: null,
      }))
    );
    
    added += batch.length;
    console.log(`  ✅ Added ${added}/${newCourses.length} courses...`);
  }
  
  console.log(`\n🎉 Import complete!`);
  console.log(`   Total courses in database: ${existingCourses.length + newCourses.length}`);
  console.log(`   New courses added: ${newCourses.length}`);
  
  process.exit(0);
}

main().catch((error) => {
  console.error('❌ Error:', error);
  process.exit(1);
});
