
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

const loginSchema = z.object({
  email: z.string().email({ message: "Invalid email address." }),
  password: z.string().min(6, { message: "Password must be at least 6 characters." }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onLoginSuccess?: () => void;
  onSwitchToSignup?: () => void;
}

export default function LoginForm({ onLoginSuccess, onSwitchToSignup }: LoginFormProps) {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const success = await login(data.email, data.password);
      if (success) {
        onLoginSuccess?.();
      } else {
        setError("Login failed. Please check your credentials."); // Mock error
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
        <DialogTitle className="font-headline text-primary">Login</DialogTitle>
        <DialogDescription className="font-body">
          Enter your credentials to access your account.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="email-login" className="font-body">Email</Label>
          <Input
            id="email-login"
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
          <Label htmlFor="password-login" className="font-body">Password</Label>
          <Input
            id="password-login"
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
        {error && <p className="text-sm text-destructive">{error}</p>}
        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between items-center gap-2 pt-2">
           <Button type="button" variant="link" onClick={onSwitchToSignup} disabled={isLoading} className="font-body text-sm p-0 h-auto">
            Don't have an account? Sign Up
          </Button>
          <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90 font-headline" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Login
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  );
}
