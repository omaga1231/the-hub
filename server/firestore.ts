import { getFirebaseAdmin } from "./firebase-admin";
import { getFirestore, Timestamp } from "firebase-admin/firestore";
import type {
  User,
  College,
  Course,
  Program,
  ProgramCourse,
  StudyCircle,
  CircleMember,
  Post,
  Comment,
  Rating,
  Message,
  File,
  InsertUser,
  InsertCollege,
  InsertCourse,
  InsertProgram,
  InsertProgramCourse,
  InsertStudyCircle,
  InsertCircleMember,
  InsertPost,
  InsertComment,
  InsertRating,
  InsertMessage,
  InsertFile,
} from "@shared/schema";

export function getFirestoreDb() {
  const app = getFirebaseAdmin();
  if (!app) {
    throw new Error("Firebase Admin not initialized");
  }
  return getFirestore(app);
}

function convertTimestamps<T>(data: any): T {
  if (!data) return data;
  
  const result: any = { ...data };
  
  if (data.createdAt && data.createdAt instanceof Timestamp) {
    result.createdAt = data.createdAt.toDate();
  }
  if (data.updatedAt && data.updatedAt instanceof Timestamp) {
    result.updatedAt = data.updatedAt.toDate();
  }
  
  return result as T;
}

export const firestoreStorage = {
  async getUserByFirebaseUid(firebaseUid: string): Promise<User | null> {
    const db = getFirestoreDb();
    const snapshot = await db.collection("users").where("firebaseUid", "==", firebaseUid).limit(1).get();
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return convertTimestamps<User>({ id: doc.id, ...doc.data() });
  },

  async getUserByEmail(email: string): Promise<User | null> {
    const db = getFirestoreDb();
    const snapshot = await db.collection("users").where("email", "==", email).limit(1).get();
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return convertTimestamps<User>({ id: doc.id, ...doc.data() });
  },

  async createUser(data: InsertUser): Promise<User> {
    const db = getFirestoreDb();
    const docRef = await db.collection("users").add({
      ...data,
      createdAt: Timestamp.now(),
    });
    
    const doc = await docRef.get();
    return convertTimestamps<User>({ id: doc.id, ...doc.data() });
  },

  async getUser(id: string): Promise<User | null> {
    const db = getFirestoreDb();
    const doc = await db.collection("users").doc(id).get();
    
    if (!doc.exists) return null;
    
    return convertTimestamps<User>({ id: doc.id, ...doc.data() });
  },

  async updateUser(id: string, data: Partial<InsertUser>): Promise<User> {
    const db = getFirestoreDb();
    await db.collection("users").doc(id).update(data);
    
    const doc = await db.collection("users").doc(id).get();
    return convertTimestamps<User>({ id: doc.id, ...doc.data() });
  },

  async getColleges(): Promise<College[]> {
    const db = getFirestoreDb();
    const snapshot = await db.collection("colleges").get();
    
    return snapshot.docs.map(doc => 
      convertTimestamps<College>({ id: doc.id, ...doc.data() })
    );
  },

  async getCollege(id: string): Promise<College | null> {
    const db = getFirestoreDb();
    const doc = await db.collection("colleges").doc(id).get();
    
    if (!doc.exists) return null;
    
    return convertTimestamps<College>({ id: doc.id, ...doc.data() });
  },

  async createCollege(data: InsertCollege): Promise<College> {
    const db = getFirestoreDb();
    const docRef = await db.collection("colleges").add({
      ...data,
      createdAt: Timestamp.now(),
    });
    
    const doc = await docRef.get();
    return convertTimestamps<College>({ id: doc.id, ...doc.data() });
  },

  async getCourses(): Promise<Course[]> {
    const db = getFirestoreDb();
    const snapshot = await db.collection("courses").get();
    
    return snapshot.docs.map(doc => 
      convertTimestamps<Course>({ id: doc.id, ...doc.data() })
    );
  },

  async getCourse(id: string): Promise<Course | null> {
    const db = getFirestoreDb();
    const doc = await db.collection("courses").doc(id).get();
    
    if (!doc.exists) return null;
    
    return convertTimestamps<Course>({ id: doc.id, ...doc.data() });
  },

  async getCoursesByCollege(collegeId: string): Promise<Course[]> {
    const db = getFirestoreDb();
    const snapshot = await db.collection("courses").where("collegeId", "==", collegeId).get();
    
    return snapshot.docs.map(doc => 
      convertTimestamps<Course>({ id: doc.id, ...doc.data() })
    );
  },

  async createCourse(data: InsertCourse): Promise<Course> {
    const db = getFirestoreDb();
    const docRef = await db.collection("courses").add({
      ...data,
      createdAt: Timestamp.now(),
    });
    
    const doc = await docRef.get();
    return convertTimestamps<Course>({ id: doc.id, ...doc.data() });
  },

  async getPrograms(): Promise<Program[]> {
    const db = getFirestoreDb();
    const snapshot = await db.collection("programs").get();
    
    return snapshot.docs.map(doc => 
      convertTimestamps<Program>({ id: doc.id, ...doc.data() })
    );
  },

  async getProgram(id: string): Promise<Program | null> {
    const db = getFirestoreDb();
    const doc = await db.collection("programs").doc(id).get();
    
    if (!doc.exists) return null;
    
    return convertTimestamps<Program>({ id: doc.id, ...doc.data() });
  },

  async createProgram(data: InsertProgram): Promise<Program> {
    const db = getFirestoreDb();
    const docRef = await db.collection("programs").add({
      ...data,
      createdAt: Timestamp.now(),
    });
    
    const doc = await docRef.get();
    return convertTimestamps<Program>({ id: doc.id, ...doc.data() });
  },

  async getProgramCourses(programId: string): Promise<Course[]> {
    const db = getFirestoreDb();
    
    const programCoursesSnapshot = await db.collection("program_courses")
      .where("programId", "==", programId)
      .get();
    
    const courseIds = programCoursesSnapshot.docs.map(doc => doc.data().courseId);
    
    if (courseIds.length === 0) return [];
    
    const courses: Course[] = [];
    for (const courseId of courseIds) {
      const course = await this.getCourse(courseId);
      if (course) courses.push(course);
    }
    
    return courses;
  },

  async createProgramCourse(data: InsertProgramCourse): Promise<void> {
    const db = getFirestoreDb();
    await db.collection("program_courses").add(data);
  },

  async getStudyCircles(): Promise<StudyCircle[]> {
    const db = getFirestoreDb();
    const snapshot = await db.collection("study_circles").get();
    
    return snapshot.docs.map(doc => 
      convertTimestamps<StudyCircle>({ id: doc.id, ...doc.data() })
    );
  },

  async getStudyCircle(id: string): Promise<StudyCircle | null> {
    const db = getFirestoreDb();
    const doc = await db.collection("study_circles").doc(id).get();
    
    if (!doc.exists) return null;
    
    return convertTimestamps<StudyCircle>({ id: doc.id, ...doc.data() });
  },

  async getStudyCirclesByCourse(courseId: string): Promise<StudyCircle[]> {
    const db = getFirestoreDb();
    const snapshot = await db.collection("study_circles").where("courseId", "==", courseId).get();
    
    return snapshot.docs.map(doc => 
      convertTimestamps<StudyCircle>({ id: doc.id, ...doc.data() })
    );
  },

  async createStudyCircle(data: InsertStudyCircle): Promise<StudyCircle> {
    const db = getFirestoreDb();
    const docRef = await db.collection("study_circles").add({
      ...data,
      createdAt: Timestamp.now(),
    });
    
    const doc = await docRef.get();
    return convertTimestamps<StudyCircle>({ id: doc.id, ...doc.data() });
  },

  async getCircleMember(circleId: string, userId: string): Promise<CircleMember | null> {
    const db = getFirestoreDb();
    const snapshot = await db.collection("circle_members")
      .where("circleId", "==", circleId)
      .where("userId", "==", userId)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    
    const doc = snapshot.docs[0];
    return convertTimestamps<CircleMember>({ id: doc.id, ...doc.data() });
  },

  async getCircleMembers(circleId: string): Promise<CircleMember[]> {
    const db = getFirestoreDb();
    const snapshot = await db.collection("circle_members").where("circleId", "==", circleId).get();
    
    return snapshot.docs.map(doc => 
      convertTimestamps<CircleMember>({ id: doc.id, ...doc.data() })
    );
  },

  async getUserCircles(userId: string): Promise<StudyCircle[]> {
    const db = getFirestoreDb();
    const membersSnapshot = await db.collection("circle_members").where("userId", "==", userId).get();
    
    const circleIds = membersSnapshot.docs.map(doc => doc.data().circleId);
    
    if (circleIds.length === 0) return [];
    
    const circles: StudyCircle[] = [];
    for (const circleId of circleIds) {
      const circle = await this.getStudyCircle(circleId);
      if (circle) circles.push(circle);
    }
    
    return circles;
  },

  async addCircleMember(data: InsertCircleMember): Promise<CircleMember> {
    const db = getFirestoreDb();
    const docRef = await db.collection("circle_members").add({
      ...data,
      joinedAt: Timestamp.now(),
    });
    
    const doc = await docRef.get();
    return convertTimestamps<CircleMember>({ id: doc.id, ...doc.data() });
  },

  async removeCircleMember(circleId: string, userId: string): Promise<void> {
    const db = getFirestoreDb();
    const snapshot = await db.collection("circle_members")
      .where("circleId", "==", circleId)
      .where("userId", "==", userId)
      .get();
    
    const batch = db.batch();
    snapshot.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
  },

  async getCirclePosts(circleId: string): Promise<Post[]> {
    const db = getFirestoreDb();
    const snapshot = await db.collection("posts")
      .where("circleId", "==", circleId)
      .get();
    
    const posts = snapshot.docs.map(doc => 
      convertTimestamps<Post>({ id: doc.id, ...doc.data() })
    );
    
    // Sort in memory instead of requiring a Firestore index
    return posts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  async createPost(data: InsertPost): Promise<Post> {
    const db = getFirestoreDb();
    const docRef = await db.collection("posts").add({
      ...data,
      createdAt: Timestamp.now(),
    });
    
    const doc = await docRef.get();
    return convertTimestamps<Post>({ id: doc.id, ...doc.data() });
  },

  async updatePost(id: string, data: Partial<InsertPost>): Promise<Post> {
    const db = getFirestoreDb();
    await db.collection("posts").doc(id).update(data);
    
    const doc = await db.collection("posts").doc(id).get();
    return convertTimestamps<Post>({ id: doc.id, ...doc.data() });
  },

  async deletePost(id: string): Promise<void> {
    const db = getFirestoreDb();
    await db.collection("posts").doc(id).delete();
  },

  async getPostComments(postId: string): Promise<Comment[]> {
    const db = getFirestoreDb();
    const snapshot = await db.collection("comments")
      .where("postId", "==", postId)
      .get();
    
    const comments = snapshot.docs.map(doc => 
      convertTimestamps<Comment>({ id: doc.id, ...doc.data() })
    );
    
    // Sort in memory instead of requiring a Firestore index
    return comments.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  },

  async createComment(data: InsertComment): Promise<Comment> {
    const db = getFirestoreDb();
    const docRef = await db.collection("comments").add({
      ...data,
      createdAt: Timestamp.now(),
    });
    
    const doc = await docRef.get();
    return convertTimestamps<Comment>({ id: doc.id, ...doc.data() });
  },

  async getCourseRatings(courseId: string): Promise<Rating[]> {
    const db = getFirestoreDb();
    const snapshot = await db.collection("ratings")
      .where("courseId", "==", courseId)
      .get();
    
    const ratings = snapshot.docs.map(doc => 
      convertTimestamps<Rating>({ id: doc.id, ...doc.data() })
    );
    
    // Sort in memory instead of requiring a Firestore index
    return ratings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  async createRating(data: InsertRating): Promise<Rating> {
    const db = getFirestoreDb();
    const docRef = await db.collection("ratings").add({
      ...data,
      createdAt: Timestamp.now(),
    });
    
    const doc = await docRef.get();
    return convertTimestamps<Rating>({ id: doc.id, ...doc.data() });
  },

  async getCircleMessages(circleId: string): Promise<Message[]> {
    const db = getFirestoreDb();
    const snapshot = await db.collection("messages")
      .where("circleId", "==", circleId)
      .get();
    
    const messages = snapshot.docs.map(doc => 
      convertTimestamps<Message>({ id: doc.id, ...doc.data() })
    );
    
    // Sort in memory instead of requiring a Firestore index
    return messages.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  },

  async createMessage(data: InsertMessage): Promise<Message> {
    const db = getFirestoreDb();
    const docRef = await db.collection("messages").add({
      ...data,
      createdAt: Timestamp.now(),
    });
    
    const doc = await docRef.get();
    return convertTimestamps<Message>({ id: doc.id, ...doc.data() });
  },

  async getCircleFiles(circleId: string): Promise<File[]> {
    const db = getFirestoreDb();
    const snapshot = await db.collection("files")
      .where("circleId", "==", circleId)
      .get();
    
    const files = snapshot.docs.map(doc => 
      convertTimestamps<File>({ id: doc.id, ...doc.data() })
    );
    
    // Sort in memory instead of requiring a Firestore index
    return files.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  },

  async createFile(data: InsertFile): Promise<File> {
    const db = getFirestoreDb();
    const docRef = await db.collection("files").add({
      ...data,
      createdAt: Timestamp.now(),
    });
    
    const doc = await docRef.get();
    return convertTimestamps<File>({ id: doc.id, ...doc.data() });
  },

  async getRatings(courseId: string): Promise<Rating[]> {
    return this.getCourseRatings(courseId);
  },

  async getStudyCirclesByUser(userId: string): Promise<StudyCircle[]> {
    return this.getUserCircles(userId);
  },

  async getPosts(circleId: string): Promise<Post[]> {
    return this.getCirclePosts(circleId);
  },

  async getComments(postId: string): Promise<Comment[]> {
    return this.getPostComments(postId);
  },

  async deleteRating(id: string): Promise<void> {
    const db = getFirestoreDb();
    await db.collection("ratings").doc(id).delete();
  },

  async deleteStudyCircle(id: string): Promise<void> {
    const db = getFirestoreDb();
    
    // Delete all related data
    const batch = db.batch();
    
    // Delete circle members
    const membersSnapshot = await db.collection("circle_members").where("circleId", "==", id).get();
    membersSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    
    // Delete posts and their comments
    const postsSnapshot = await db.collection("posts").where("circleId", "==", id).get();
    for (const postDoc of postsSnapshot.docs) {
      batch.delete(postDoc.ref);
      
      // Delete comments for this post
      const commentsSnapshot = await db.collection("comments").where("postId", "==", postDoc.id).get();
      commentsSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    }
    
    // Delete messages
    const messagesSnapshot = await db.collection("messages").where("circleId", "==", id).get();
    messagesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    
    // Delete files
    const filesSnapshot = await db.collection("files").where("circleId", "==", id).get();
    filesSnapshot.docs.forEach(doc => batch.delete(doc.ref));
    
    // Delete the circle itself
    batch.delete(db.collection("study_circles").doc(id));
    
    // Commit all deletions
    await batch.commit();
  },

  async getMessages(circleId: string): Promise<Message[]> {
    return this.getCircleMessages(circleId);
  },

  async getFiles(circleId: string): Promise<File[]> {
    return this.getCircleFiles(circleId);
  },

  async search(query: string): Promise<any[]> {
    const db = getFirestoreDb();
    const results: any[] = [];
    
    const lowerQuery = query.toLowerCase();
    
    const coursesSnapshot = await db.collection("courses").get();
    coursesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.name?.toLowerCase().includes(lowerQuery) || 
          data.code?.toLowerCase().includes(lowerQuery) ||
          data.description?.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'course',
          ...convertTimestamps({ id: doc.id, ...data })
        });
      }
    });
    
    const circlesSnapshot = await db.collection("study_circles").get();
    circlesSnapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.name?.toLowerCase().includes(lowerQuery) || 
          data.description?.toLowerCase().includes(lowerQuery)) {
        results.push({
          type: 'study_circle',
          ...convertTimestamps({ id: doc.id, ...data })
        });
      }
    });
    
    return results;
  },
};
