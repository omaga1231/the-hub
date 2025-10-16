// Reference: javascript_websocket blueprint integration
import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import passport from "./auth";
import bcrypt from "bcrypt";
import { storage } from "./storage";
import { z } from "zod";
import type { User } from "@shared/schema";
import {
  insertCollegeSchema,
  insertCourseSchema,
  insertStudyCircleSchema,
  insertCircleMemberSchema,
  insertPostSchema,
  insertCommentSchema,
  insertRatingSchema,
  insertMessageSchema,
  insertFileSchema,
} from "@shared/schema";

// Middleware to check if user is authenticated
function requireAuth(req: Request, res: Response, next: NextFunction) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.status(401).json({ error: "Unauthorized" });
}

const signupSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string()
    .email()
    .refine((email) => email.endsWith('.edu'), {
      message: "You must use a valid college email address (.edu domain)",
    }),
  password: z.string().min(6),
  fullName: z.string().min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const data = signupSchema.parse(req.body);
      
      const hashedPassword = await bcrypt.hash(data.password, 10);
      const user = await storage.createUser({
        username: data.username,
        email: data.email,
        password: hashedPassword,
        fullName: data.fullName,
      });

      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to login after signup" });
        }
        const { password, ...userWithoutPassword } = user;
        res.status(201).json(userWithoutPassword);
      });
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(422).json({ error: "Validation failed", details: error.errors });
      }
      if (error.message?.includes("unique")) {
        return res.status(409).json({ error: "Username or email already exists" });
      }
      res.status(400).json({ error: error.message });
    }
  });

  app.post("/api/auth/login", (req, res, next) => {
    passport.authenticate("local", (err: any, user: User | false, info: any) => {
      if (err) {
        return res.status(500).json({ error: "Internal server error" });
      }
      if (!user) {
        return res.status(401).json({ error: info?.message || "Invalid credentials" });
      }
      req.login(user, (err) => {
        if (err) {
          return res.status(500).json({ error: "Failed to login" });
        }
        const { password, ...userWithoutPassword } = user;
        res.json(userWithoutPassword);
      });
    })(req, res, next);
  });

  app.post("/api/auth/logout", (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.json({ message: "Logged out successfully" });
    });
  });

  app.get("/api/auth/me", (req, res) => {
    if (req.isAuthenticated() && req.user) {
      const { password, ...userWithoutPassword } = req.user as User;
      res.json(userWithoutPassword);
    } else {
      res.status(401).json({ error: "Not authenticated" });
    }
  });

  // Colleges
  app.get("/api/colleges", async (req, res) => {
    try {
      const colleges = await storage.getColleges();
      res.json(colleges);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/colleges/:id", async (req, res) => {
    try {
      const college = await storage.getCollege(req.params.id);
      if (!college) {
        return res.status(404).json({ error: "College not found" });
      }
      const courses = await storage.getCoursesByCollege(req.params.id);
      res.json({ ...college, courses });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/colleges", async (req, res) => {
    try {
      const data = insertCollegeSchema.parse(req.body);
      const college = await storage.createCollege(data);
      res.status(201).json(college);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Courses
  app.get("/api/courses", async (req, res) => {
    try {
      const courses = await storage.getCourses();
      res.json(courses);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.get("/api/courses/:id", async (req, res) => {
    try {
      const course = await storage.getCourse(req.params.id);
      if (!course) {
        return res.status(404).json({ error: "Course not found" });
      }
      const studyCircles = await storage.getStudyCirclesByCourse(req.params.id);
      const ratings = await storage.getRatings(req.params.id);
      res.json({ ...course, studyCircles, ratings });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/courses", async (req, res) => {
    try {
      const data = insertCourseSchema.parse(req.body);
      const course = await storage.createCourse(data);
      res.status(201).json(course);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Study Circles
  app.get("/api/circles/:id", async (req, res) => {
    try {
      const circle = await storage.getStudyCircle(req.params.id);
      if (!circle) {
        return res.status(404).json({ error: "Study circle not found" });
      }
      const course = await storage.getCourse(circle.courseId);
      res.json({ ...circle, course });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/circles", async (req, res) => {
    try {
      const data = insertStudyCircleSchema.parse(req.body);
      const circle = await storage.createStudyCircle(data);
      res.status(201).json(circle);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.get("/api/my-circles", async (req, res) => {
    try {
      // TODO: Get actual user ID from session/auth
      const userId = "current-user-id";
      const circles = await storage.getStudyCirclesByUser(userId);
      res.json(circles);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Circle Members
  app.post("/api/circles/:id/members", async (req, res) => {
    try {
      const data = insertCircleMemberSchema.parse({
        circleId: req.params.id,
        userId: req.body.userId,
      });
      const member = await storage.addCircleMember(data);
      res.status(201).json(member);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Posts (Discussions)
  app.get("/api/circles/:id/posts", async (req, res) => {
    try {
      const posts = await storage.getPosts(req.params.id);
      res.json(posts);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/posts", async (req, res) => {
    try {
      const data = insertPostSchema.parse(req.body);
      const post = await storage.createPost(data);
      res.status(201).json(post);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  app.patch("/api/posts/:id", async (req, res) => {
    try {
      // Validate update data - only allow title and content updates
      const updateSchema = insertPostSchema.pick({ title: true, content: true }).partial();
      const data = updateSchema.parse(req.body);
      
      const post = await storage.updatePost(req.params.id, data);
      if (!post) {
        return res.status(404).json({ error: "Post not found" });
      }
      res.json(post);
    } catch (error: any) {
      if (error.name === "ZodError") {
        return res.status(422).json({ error: "Validation failed", details: error.errors });
      }
      res.status(400).json({ error: error.message });
    }
  });

  app.delete("/api/posts/:id", async (req, res) => {
    try {
      await storage.deletePost(req.params.id);
      res.status(204).send();
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Comments
  app.get("/api/posts/:id/comments", async (req, res) => {
    try {
      const comments = await storage.getComments(req.params.id);
      res.json(comments);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/comments", async (req, res) => {
    try {
      const data = insertCommentSchema.parse(req.body);
      const comment = await storage.createComment(data);
      res.status(201).json(comment);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Ratings
  app.post("/api/ratings", async (req, res) => {
    try {
      const data = insertRatingSchema.parse(req.body);
      const rating = await storage.createRating(data);
      res.status(201).json(rating);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Messages
  app.get("/api/circles/:id/messages", async (req, res) => {
    try {
      const messages = await storage.getMessages(req.params.id);
      res.json(messages);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/messages", async (req, res) => {
    try {
      const data = insertMessageSchema.parse(req.body);
      const message = await storage.createMessage(data);
      
      // Broadcast message via WebSocket
      wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({
            type: "message",
            circleId: message.circleId,
            message,
          }));
        }
      });

      res.status(201).json(message);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Files
  app.get("/api/circles/:id/files", async (req, res) => {
    try {
      const files = await storage.getFiles(req.params.id);
      res.json(files);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  app.post("/api/files", async (req, res) => {
    try {
      const data = insertFileSchema.parse(req.body);
      const file = await storage.createFile(data);
      res.status(201).json(file);
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  });

  // Search
  app.get("/api/search", async (req, res) => {
    try {
      const query = req.query.query as string;
      if (!query || query.trim().length === 0) {
        return res.json({ colleges: [], courses: [], circles: [] });
      }
      const results = await storage.search(query);
      res.json(results);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);

  // WebSocket server for real-time chat - using distinct path to avoid conflict with Vite's HMR
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });

  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");

    ws.on("message", (data) => {
      try {
        const message = JSON.parse(data.toString());
        
        if (message.type === "join") {
          // Client joined a circle
          console.log(`Client joined circle: ${message.circleId}`);
        }
      } catch (error) {
        console.error("WebSocket error:", error);
      }
    });

    ws.on("close", () => {
      console.log("WebSocket client disconnected");
    });
  });

  return httpServer;
}
