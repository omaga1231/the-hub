import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { signInWithEmailAndPassword, sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/contexts/auth-context";
import { LogIn } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginForm) => {
    setError("");
    setIsLoading(true);

    try {
      // Sign in with Firebase
      const userCredential = await signInWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Check if email is verified
      if (!userCredential.user.emailVerified) {
        setError("Please verify your email before signing in. Check your inbox for the verification link.");
        
        toast({
          title: "Email not verified",
          description: "Click below to resend the verification email.",
          variant: "destructive",
        });

        // Sign out the user since email is not verified
        await auth.signOut();
        setIsLoading(false);
        return;
      }

      // Sync user to database (creates user if first login)
      try {
        // Ensure username is at least 3 characters
        const emailPrefix = userCredential.user.email?.split('@')[0] || 'user';
        const username = emailPrefix.length >= 3 ? emailPrefix : `user${emailPrefix}`;
        
        const syncRes = await apiRequest("POST", "/api/auth/sync", {
          username: username,
          fullName: userCredential.user.displayName || username,
        });

        if (!syncRes.ok) {
          const errorData = await syncRes.json();
          throw new Error(errorData.error || "Failed to sync user");
        }

        // Refresh the auth context to load the database user
        await refreshUser();

        toast({
          title: "Welcome back!",
          description: "You've successfully logged in.",
        });

        // Redirect to home - database user is now loaded
        setLocation("/");
      } catch (syncError: any) {
        console.error("Failed to sync user to database:", syncError);
        
        // Sign out if sync fails
        await auth.signOut();
        
        setError(syncError.message || "Failed to complete login. Please try again or contact support.");
        setIsLoading(false);
        return;
      }
    } catch (error: any) {
      console.error("Login error:", error);
      
      // Handle Firebase auth errors
      let errorMessage = "Invalid email or password";
      if (error.code === "auth/user-not-found") {
        errorMessage = "No account found with this email";
      } else if (error.code === "auth/wrong-password") {
        errorMessage = "Incorrect password";
      } else if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const resendVerification = async () => {
    const email = form.getValues("email");
    const password = form.getValues("password");

    if (!email || !password) {
      setError("Please enter your email and password first");
      return;
    }

    try {
      setIsLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      if (!userCredential.user.emailVerified) {
        await sendEmailVerification(userCredential.user);
        toast({
          title: "Verification email sent",
          description: "Please check your inbox and spam folder.",
        });
      }
      
      await auth.signOut();
    } catch (error: any) {
      setError("Failed to resend verification email");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <LogIn className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl">Welcome to The Hub</CardTitle>
          </div>
          <CardDescription>
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        placeholder="your.name@college.edu"
                        data-testid="input-email"
                        autoComplete="email"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="Enter your password"
                        data-testid="input-password"
                        autoComplete="current-password"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {error && (
                <div className="space-y-2">
                  <div className="text-sm text-destructive" data-testid="text-error">
                    {error}
                  </div>
                  {error.includes("verify your email") && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={resendVerification}
                      disabled={isLoading}
                      data-testid="button-resend-verification"
                    >
                      Resend verification email
                    </Button>
                  )}
                </div>
              )}
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
                data-testid="button-login"
              >
                {isLoading ? "Signing in..." : "Sign in"}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <button
              type="button"
              className="text-primary underline-offset-4 hover:underline"
              onClick={() => setLocation("/signup")}
              data-testid="link-signup"
            >
              Sign up
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
