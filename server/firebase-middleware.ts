import { Request, Response, NextFunction } from "express";
import { verifyFirebaseToken } from "./firebase-admin";

export interface AuthRequest extends Request {
  user?: {
    uid: string;
    email?: string;
    emailVerified?: boolean;
  };
}

export async function requireFirebaseAuth(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "No authentication token provided" });
    }

    const idToken = authHeader.split("Bearer ")[1];
    
    const decodedToken = await verifyFirebaseToken(idToken);
    
    if (!decodedToken.email_verified) {
      return res.status(403).json({ error: "Email not verified" });
    }

    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified,
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}
