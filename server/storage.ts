// Reference: javascript_database blueprint integration
import { eq, ilike, or, desc } from "drizzle-orm";
import { db } from "./db";
import {
  users, colleges, courses, studyCircles, circleMembers, posts, comments, ratings, messages, files,
  type User, type InsertUser,
  type College, type InsertCollege,
  type Course, type InsertCourse,
  type StudyCircle, type InsertStudyCircle,
  type CircleMember, type InsertCircleMember,
  type Post, type InsertPost,
  type Comment, type InsertComment,
  type Rating, type InsertRating,
  type Message, type InsertMessage,
  type File, type InsertFile,
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Colleges
  getColleges(): Promise<College[]>;
  getCollege(id: string): Promise<College | undefined>;
  createCollege(college: InsertCollege): Promise<College>;

  // Courses
  getCourses(): Promise<Course[]>;
  getCourse(id: string): Promise<Course | undefined>;
  getCoursesByCollege(collegeId: string): Promise<Course[]>;
  createCourse(course: InsertCourse): Promise<Course>;

  // Study Circles
  getStudyCircles(): Promise<StudyCircle[]>;
  getStudyCircle(id: string): Promise<StudyCircle | undefined>;
  getStudyCirclesByCourse(courseId: string): Promise<StudyCircle[]>;
  getStudyCirclesByUser(userId: string): Promise<StudyCircle[]>;
  createStudyCircle(circle: InsertStudyCircle): Promise<StudyCircle>;

  // Circle Members
  addCircleMember(member: InsertCircleMember): Promise<CircleMember>;
  removeCircleMember(circleId: string, userId: string): Promise<void>;
  getCircleMembers(circleId: string): Promise<CircleMember[]>;

  // Posts
  getPosts(circleId: string): Promise<Post[]>;
  getPost(id: string): Promise<Post | undefined>;
  createPost(post: InsertPost): Promise<Post>;
  updatePost(id: string, post: Partial<InsertPost>): Promise<Post | undefined>;
  deletePost(id: string): Promise<void>;

  // Comments
  getComments(postId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  // Ratings
  getRatings(courseId: string): Promise<Rating[]>;
  createRating(rating: InsertRating): Promise<Rating>;

  // Messages
  getMessages(circleId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Files
  getFiles(circleId: string): Promise<File[]>;
  createFile(file: InsertFile): Promise<File>;

  // Search
  search(query: string): Promise<{
    colleges: College[];
    courses: Course[];
    circles: StudyCircle[];
  }>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByFirebaseUid(firebaseUid: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.firebaseUid, firebaseUid));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  // Colleges
  async getColleges(): Promise<College[]> {
    return await db.select().from(colleges).orderBy(colleges.name);
  }

  async getCollege(id: string): Promise<College | undefined> {
    const [college] = await db.select().from(colleges).where(eq(colleges.id, id));
    return college || undefined;
  }

  async createCollege(insertCollege: InsertCollege): Promise<College> {
    const [college] = await db
      .insert(colleges)
      .values(insertCollege)
      .returning();
    return college;
  }

  // Courses
  async getCourses(): Promise<Course[]> {
    return await db.select().from(courses).orderBy(courses.code);
  }

  async getCourse(id: string): Promise<Course | undefined> {
    const [course] = await db.select().from(courses).where(eq(courses.id, id));
    return course || undefined;
  }

  async getCoursesByCollege(collegeId: string): Promise<Course[]> {
    return await db.select().from(courses).where(eq(courses.collegeId, collegeId)).orderBy(courses.code);
  }

  async createCourse(insertCourse: InsertCourse): Promise<Course> {
    const [course] = await db
      .insert(courses)
      .values(insertCourse)
      .returning();
    return course;
  }

  // Study Circles
  async getStudyCircles(): Promise<StudyCircle[]> {
    return await db.select().from(studyCircles).orderBy(desc(studyCircles.createdAt));
  }

  async getStudyCircle(id: string): Promise<StudyCircle | undefined> {
    const [circle] = await db.select().from(studyCircles).where(eq(studyCircles.id, id));
    return circle || undefined;
  }

  async getStudyCirclesByCourse(courseId: string): Promise<StudyCircle[]> {
    return await db.select().from(studyCircles).where(eq(studyCircles.courseId, courseId)).orderBy(desc(studyCircles.createdAt));
  }

  async getStudyCirclesByUser(userId: string): Promise<StudyCircle[]> {
    const memberCircles = await db
      .select({ circle: studyCircles })
      .from(circleMembers)
      .innerJoin(studyCircles, eq(circleMembers.circleId, studyCircles.id))
      .where(eq(circleMembers.userId, userId))
      .orderBy(desc(studyCircles.createdAt));
    
    return memberCircles.map(mc => mc.circle);
  }

  async createStudyCircle(insertCircle: InsertStudyCircle): Promise<StudyCircle> {
    const [circle] = await db
      .insert(studyCircles)
      .values(insertCircle)
      .returning();
    return circle;
  }

  // Circle Members
  async addCircleMember(insertMember: InsertCircleMember): Promise<CircleMember> {
    const [member] = await db
      .insert(circleMembers)
      .values(insertMember)
      .returning();
    return member;
  }

  async removeCircleMember(circleId: string, userId: string): Promise<void> {
    await db
      .delete(circleMembers)
      .where(eq(circleMembers.circleId, circleId))
      .where(eq(circleMembers.userId, userId));
  }

  async getCircleMembers(circleId: string): Promise<CircleMember[]> {
    return await db.select().from(circleMembers).where(eq(circleMembers.circleId, circleId));
  }

  // Posts
  async getPosts(circleId: string): Promise<Post[]> {
    return await db.select().from(posts).where(eq(posts.circleId, circleId)).orderBy(desc(posts.createdAt));
  }

  async getPost(id: string): Promise<Post | undefined> {
    const [post] = await db.select().from(posts).where(eq(posts.id, id));
    return post || undefined;
  }

  async createPost(insertPost: InsertPost): Promise<Post> {
    const [post] = await db
      .insert(posts)
      .values(insertPost)
      .returning();
    return post;
  }

  async updatePost(id: string, updateData: Partial<InsertPost>): Promise<Post | undefined> {
    const [post] = await db
      .update(posts)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(posts.id, id))
      .returning();
    return post || undefined;
  }

  async deletePost(id: string): Promise<void> {
    await db.delete(posts).where(eq(posts.id, id));
  }

  // Comments
  async getComments(postId: string): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.postId, postId)).orderBy(comments.createdAt);
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db
      .insert(comments)
      .values(insertComment)
      .returning();
    return comment;
  }

  // Ratings
  async getRatings(courseId: string): Promise<Rating[]> {
    return await db.select().from(ratings).where(eq(ratings.courseId, courseId)).orderBy(desc(ratings.createdAt));
  }

  async createRating(insertRating: InsertRating): Promise<Rating> {
    const [rating] = await db
      .insert(ratings)
      .values(insertRating)
      .returning();
    return rating;
  }

  // Messages
  async getMessages(circleId: string): Promise<Message[]> {
    return await db.select().from(messages).where(eq(messages.circleId, circleId)).orderBy(messages.createdAt);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  // Files
  async getFiles(circleId: string): Promise<File[]> {
    return await db.select().from(files).where(eq(files.circleId, circleId)).orderBy(desc(files.createdAt));
  }

  async createFile(insertFile: InsertFile): Promise<File> {
    const [file] = await db
      .insert(files)
      .values(insertFile)
      .returning();
    return file;
  }

  // Search
  async search(query: string): Promise<{
    colleges: College[];
    courses: Course[];
    circles: Array<StudyCircle & { course: { code: string; name: string } }>;
  }> {
    const searchPattern = `%${query}%`;

    const collegesResult = await db
      .select()
      .from(colleges)
      .where(
        or(
          ilike(colleges.name, searchPattern),
          ilike(colleges.abbreviation, searchPattern)
        )
      )
      .limit(10);

    const coursesResult = await db
      .select()
      .from(courses)
      .where(
        or(
          ilike(courses.code, searchPattern),
          ilike(courses.name, searchPattern),
          ilike(courses.department, searchPattern)
        )
      )
      .limit(10);

    const circlesWithCourse = await db
      .select({
        id: studyCircles.id,
        courseId: studyCircles.courseId,
        name: studyCircles.name,
        description: studyCircles.description,
        isPrivate: studyCircles.isPrivate,
        createdAt: studyCircles.createdAt,
        course: {
          code: courses.code,
          name: courses.name,
        },
      })
      .from(studyCircles)
      .innerJoin(courses, eq(studyCircles.courseId, courses.id))
      .where(
        or(
          ilike(studyCircles.name, searchPattern),
          ilike(studyCircles.description, searchPattern)
        )
      )
      .limit(10);

    return {
      colleges: collegesResult,
      courses: coursesResult,
      circles: circlesWithCourse,
    };
  }
}

export const storage = new DatabaseStorage();
