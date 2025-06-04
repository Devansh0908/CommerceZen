
"use client";

import { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const signupSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"], // path of error
});

type SignupFormValues = z.infer<typeof signupSchema>;

interface SignupFormProps {
  onSignupSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

export default function SignupForm({ onSignupSuccess, onSwitchToLogin }: SignupFormProps) {
  const { signup } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const success = await signup(data.email, data.password);
      if (success) {
        onSignupSuccess?.();
      } else {
        setError("Signup failed. Please try again."); // Mock error
      }
    } catch (err) {
       setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle className="font-headline text-primary">Create Account</DialogTitle>
        <DialogDescription className="font-body">
          Fill in the details below to create your new account.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="email-signup" className="font-body">Email</Label>
          <Input
            id="email-signup"
            type="email"
            placeholder="you@example.com"
            {...form.register("email")}
            className="font-body"
            disabled={isLoading}
          />
          {form.formState.errors.email && (
            <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password-signup" className="font-body">Password</Label>
          <Input
            id="password-signup"
            type="password"
            placeholder="••••••••"
            {...form.register("password")}
            className="font-body"
            disabled={isLoading}
          />
          {form.formState.errors.password && (
            <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword-signup" className="font-body">Confirm Password</Label>
          <Input
            id="confirmPassword-signup"
            type="password"
            placeholder="••••••••"
            {...form.register("confirmPassword")}
            className="font-body"
            disabled={isLoading}
          />
          {form.formState.errors.confirmPassword && (
            <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
          )}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-center gap-2 pt-2">
           <Button type="button" variant="link" onClick={onSwitchToLogin} disabled={isLoading} className="font-body text-sm p-0 h-auto">
            Already have an account? Login
          </Button>
          <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 font-headline" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign Up
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
