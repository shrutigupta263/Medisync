import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, CheckCircle2, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setError("Email is required");
      return;
    }
    
    if (!validateEmail(email)) {
      setError("Invalid email address");
      return;
    }
    
    setError("");
    // Mock password reset
    setSubmitted(true);
    toast.success("Password reset link sent!");
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
        <Card className="w-full max-w-md shadow-lg border-0">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto bg-success/10 w-16 h-16 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <CardTitle className="text-3xl">Check your email</CardTitle>
            <CardDescription className="text-base">
              We've sent a password reset link to<br />
              <span className="font-medium text-foreground">{email}</span>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Click the link in the email to reset your password. If you don't see it, check your spam folder.
            </p>
          </CardContent>
          <CardFooter>
            <Button asChild variant="outline" className="w-full">
              <Link to="/signin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      <Card className="w-full max-w-md shadow-lg border-0">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto bg-primary/10 w-16 h-16 rounded-2xl flex items-center justify-center">
            <Activity className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl">Reset your password</CardTitle>
          <CardDescription>
            Enter your email and we'll send you a reset link
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={error ? "border-error" : ""}
                aria-invalid={!!error}
                aria-describedby={error ? "email-error" : undefined}
              />
              {error && (
                <p id="email-error" className="text-sm text-error" role="alert">
                  {error}
                </p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full" size="lg">
              Send Reset Link
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/signin">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Sign In
              </Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default ForgotPassword;
