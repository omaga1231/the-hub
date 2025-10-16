import { relations, sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, integer, boolean, primaryKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  fullName: text("full_name").notNull(),
  avatar: text("avatar"),
  bio: text("bio"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  circleMembers: many(circleMembers),
  posts: many(posts),
  comments: many(comments),
  ratings: many(ratings),
  messages: many(messages),
}));

// Colleges
export const colleges = pgTable("colleges", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  abbreviation: text("abbreviation").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const collegesRelations = relations(colleges, ({ many }) => ({
  courses: many(courses),
}));

// Courses
export const courses = pgTable("courses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  collegeId: varchar("college_id").notNull().references(() => colleges.id, { onDelete: 'cascade' }),
  code: text("code").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  department: text("department"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const coursesRelations = relations(courses, ({ one, many }) => ({
  college: one(colleges, {
    fields: [courses.collegeId],
    references: [colleges.id],
  }),
  studyCircles: many(studyCircles),
  ratings: many(ratings),
}));

// Study Circles
export const studyCircles = pgTable("study_circles", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description"),
  isPrivate: boolean("is_private").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const studyCirclesRelations = relations(studyCircles, ({ one, many }) => ({
  course: one(courses, {
    fields: [studyCircles.courseId],
    references: [courses.id],
  }),
  members: many(circleMembers),
  posts: many(posts),
  messages: many(messages),
}));

// Circle Members (join table)
export const circleMembers = pgTable("circle_members", {
  circleId: varchar("circle_id").notNull().references(() => studyCircles.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  role: text("role").notNull().default("member"), // member, admin
  joinedAt: timestamp("joined_at").defaultNow().notNull(),
}, (table) => ({
  pk: primaryKey({ columns: [table.circleId, table.userId] }),
}));

export const circleMembersRelations = relations(circleMembers, ({ one }) => ({
  circle: one(studyCircles, {
    fields: [circleMembers.circleId],
    references: [studyCircles.id],
  }),
  user: one(users, {
    fields: [circleMembers.userId],
    references: [users.id],
  }),
}));

// Posts (discussion threads)
export const posts = pgTable("posts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  circleId: varchar("circle_id").notNull().references(() => studyCircles.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  content: text("content").notNull(),
  isPinned: boolean("is_pinned").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const postsRelations = relations(posts, ({ one, many }) => ({
  circle: one(studyCircles, {
    fields: [posts.circleId],
    references: [studyCircles.id],
  }),
  user: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
  comments: many(comments),
}));

// Comments (for threaded discussions)
export const comments = pgTable("comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  postId: varchar("post_id").notNull().references(() => posts.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  parentId: varchar("parent_id").references(() => comments.id, { onDelete: 'cascade' }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const commentsRelations = relations(comments, ({ one, many }) => ({
  post: one(posts, {
    fields: [comments.postId],
    references: [posts.id],
  }),
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  parent: one(comments, {
    fields: [comments.parentId],
    references: [comments.id],
    relationName: "comment_replies",
  }),
  replies: many(comments, { relationName: "comment_replies" }),
}));

// Course Ratings
export const ratings = pgTable("ratings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  courseId: varchar("course_id").notNull().references(() => courses.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  difficulty: integer("difficulty").notNull(), // 1-5
  quality: integer("quality").notNull(), // 1-5
  workload: integer("workload").notNull(), // 1-5
  comment: text("comment"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const ratingsRelations = relations(ratings, ({ one }) => ({
  course: one(courses, {
    fields: [ratings.courseId],
    references: [courses.id],
  }),
  user: one(users, {
    fields: [ratings.userId],
    references: [users.id],
  }),
}));

// Real-time Messages
export const messages = pgTable("messages", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  circleId: varchar("circle_id").notNull().references(() => studyCircles.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const messagesRelations = relations(messages, ({ one }) => ({
  circle: one(studyCircles, {
    fields: [messages.circleId],
    references: [studyCircles.id],
  }),
  user: one(users, {
    fields: [messages.userId],
    references: [users.id],
  }),
}));

// Files
export const files = pgTable("files", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  circleId: varchar("circle_id").notNull().references(() => studyCircles.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  url: text("url").notNull(),
  type: text("type").notNull(),
  size: integer("size").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const filesRelations = relations(files, ({ one }) => ({
  circle: one(studyCircles, {
    fields: [files.circleId],
    references: [studyCircles.id],
  }),
  user: one(users, {
    fields: [files.userId],
    references: [users.id],
  }),
}));

// Insert Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertCollegeSchema = createInsertSchema(colleges).omit({
  id: true,
  createdAt: true,
});

export const insertCourseSchema = createInsertSchema(courses).omit({
  id: true,
  createdAt: true,
});

export const insertStudyCircleSchema = createInsertSchema(studyCircles).omit({
  id: true,
  createdAt: true,
});

export const insertCircleMemberSchema = createInsertSchema(circleMembers).omit({
  joinedAt: true,
});

export const insertPostSchema = createInsertSchema(posts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCommentSchema = createInsertSchema(comments).omit({
  id: true,
  createdAt: true,
});

export const insertRatingSchema = createInsertSchema(ratings).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export const insertFileSchema = createInsertSchema(files).omit({
  id: true,
  createdAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertCollege = z.infer<typeof insertCollegeSchema>;
export type College = typeof colleges.$inferSelect;

export type InsertCourse = z.infer<typeof insertCourseSchema>;
export type Course = typeof courses.$inferSelect;

export type InsertStudyCircle = z.infer<typeof insertStudyCircleSchema>;
export type StudyCircle = typeof studyCircles.$inferSelect;

export type InsertCircleMember = z.infer<typeof insertCircleMemberSchema>;
export type CircleMember = typeof circleMembers.$inferSelect;

export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;

export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Comment = typeof comments.$inferSelect;

export type InsertRating = z.infer<typeof insertRatingSchema>;
export type Rating = typeof ratings.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertFile = z.infer<typeof insertFileSchema>;
export type File = typeof files.$inferSelect;
