import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { onAuthStateChanged, signOut as firebaseSignOut, type User as FirebaseUser } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { useLocation } from "wouter";

interface User {
  id: string; // PostgreSQL UUID
  firebaseUid: string;
  username: string;
  email: string;
  fullName: string;
  avatar?: string | null;
  bio?: string | null;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const publicPaths = ["/login", "/signup"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [location, setLocation] = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDatabaseUser = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const token = await firebaseUser.getIdToken();
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const dbUser = await response.json();
        return dbUser;
      }
      
      return null;
    } catch (error) {
      console.error("Failed to fetch database user:", error);
      return null;
    }
  };

  const refreshUser = async () => {
    if (auth.currentUser && auth.currentUser.emailVerified) {
      const dbUser = await fetchDatabaseUser(auth.currentUser);
      if (dbUser) {
        setUser(dbUser);
      }
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser && firebaseUser.emailVerified) {
        setFirebaseUser(firebaseUser);
        
        // Fetch the database user with PostgreSQL UUID
        const dbUser = await fetchDatabaseUser(firebaseUser);
        setUser(dbUser);
        
        // Only set loading to false after we've tried to fetch the DB user
        setIsLoading(false);
      } else {
        setFirebaseUser(null);
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Only redirect if we're done loading and there's no user
    if (!isLoading && !user && !publicPaths.includes(location)) {
      setLocation("/login");
    }
  }, [user, isLoading, location, setLocation]);

  const logout = async () => {
    await firebaseSignOut(auth);
    setUser(null);
    setFirebaseUser(null);
    setLocation("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoading,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
