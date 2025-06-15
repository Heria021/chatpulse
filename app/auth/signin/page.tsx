"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { AuthLayout } from "@/components/auth/auth-layout";
import { SocialLogin } from "@/components/auth/social-login";
import { useAuth } from "@/lib/contexts/auth-context";
import { signInSchema } from "@/lib/types/auth";
import { saveFormData, loadFormData, clearFormData } from "@/lib/utils/auth";
import { Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signIn, isAuthenticated, isLoading: authLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      emailOrUsername: "",
      password: "",
      rememberMe: false,
    },
  });

  // Load saved form data on mount
  useEffect(() => {
    const savedData = loadFormData("signin");
    if (savedData) {
      form.reset({
        emailOrUsername: savedData.emailOrUsername || "",
        password: "", // Never load password
        rememberMe: savedData.rememberMe || false,
      });
    }
  }, [form]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      const redirectTo = searchParams.get('redirect') || '/chat';
      router.push(redirectTo);
    }
  }, [isAuthenticated, authLoading, router, searchParams]);

  // Save form data on change (except password)
  useEffect(() => {
    const subscription = form.watch((data) => {
      if (data.emailOrUsername) {
        saveFormData("signin", {
          emailOrUsername: data.emailOrUsername,
          rememberMe: data.rememberMe,
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: any) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await signIn(data);

      // Clear form data on successful login
      clearFormData("signin");

      // Redirect to intended page or chat
      const redirectTo = searchParams.get('redirect') || '/chat';
      router.push(redirectTo);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign in failed";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <AuthLayout title="Loading..." showBackToHome={false}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout 
      title="Welcome back" 
      subtitle="Sign in to your account to continue"
    >
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="emailOrUsername"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email or Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your email or username"
                    type="text"
                    autoComplete="username"
                    disabled={isLoading}
                    {...field}
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
                  <div className="relative">
                    <Input
                      placeholder="Enter your password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      disabled={isLoading}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                      <span className="sr-only">
                        {showPassword ? "Hide password" : "Show password"}
                      </span>
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center justify-between">
            <FormField
              control={form.control}
              name="rememberMe"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal">
                      Remember me
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:underline"
            >
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sign In
          </Button>
        </form>
      </Form>

      <SocialLogin isLoading={isLoading} />

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/auth/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
        
        <p className="text-sm text-muted-foreground">
          Or{" "}
          <Link href="/auth/guest" className="text-primary hover:underline">
            continue as guest
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <AuthLayout title="Loading..." showBackToHome={false}>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </AuthLayout>
    }>
      <SignInForm />
    </Suspense>
  );
}
