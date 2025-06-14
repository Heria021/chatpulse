"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { PasswordStrengthIndicator } from "@/components/auth/password-strength";
import { useAuth } from "@/lib/contexts/auth-context";
import { signUpSchema, SignUpFormData } from "@/lib/types/auth";
import { saveFormData, loadFormData, clearFormData, debounce } from "@/lib/utils/auth";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle, XCircle } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { signUp, isAuthenticated, isLoading: authLoading, checkUsernameAvailability } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usernameStatus, setUsernameStatus] = useState<{
    checking: boolean;
    available: boolean | null;
    message: string;
  }>({
    checking: false,
    available: null,
    message: "",
  });

  const form = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
      age: 18,
      gender: undefined,
      acceptTerms: false,
    },
  });

  // Load saved form data on mount
  useEffect(() => {
    const savedData = loadFormData("signup");
    if (savedData) {
      form.reset({
        username: savedData.username || "",
        email: savedData.email || "",
        password: "", // Never load passwords
        confirmPassword: "",
        age: savedData.age || 18,
        gender: savedData.gender || undefined,
        acceptTerms: false, // Never load terms acceptance
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

  // Save form data on change (except passwords and terms)
  useEffect(() => {
    const subscription = form.watch((data) => {
      saveFormData("signup", {
        username: data.username,
        email: data.email,
        age: data.age,
        gender: data.gender,
      });
    });
    return () => subscription.unsubscribe();
  }, [form]);

  // Debounced username availability check
  const checkUsername = useCallback(
    debounce(async (username: string) => {
      if (username.length < 3) {
        setUsernameStatus({
          checking: false,
          available: null,
          message: "",
        });
        return;
      }

      setUsernameStatus(prev => ({ ...prev, checking: true }));
      
      try {
        const available = await checkUsernameAvailability(username);
        setUsernameStatus({
          checking: false,
          available,
          message: available ? "Username is available" : "Username is already taken",
        });
      } catch (error) {
        setUsernameStatus({
          checking: false,
          available: null,
          message: "Error checking username",
        });
      }
    }, 500),
    [checkUsernameAvailability]
  );

  // Watch username changes
  useEffect(() => {
    const subscription = form.watch((data, { name }) => {
      if (name === "username" && data.username) {
        checkUsername(data.username);
      }
    });
    return () => subscription.unsubscribe();
  }, [form, checkUsername]);

  const onSubmit = async (data: SignUpFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Final username availability check
      if (usernameStatus.available === false) {
        setError("Username is not available");
        return;
      }
      
      await signUp(data);
      
      // Clear form data on successful signup
      clearFormData("signup");
      
      // Redirect will happen via useEffect
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign up failed";
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
      title="Create account" 
      subtitle="Join ChatNow to start connecting with people"
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
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Username</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Choose a username"
                      autoComplete="username"
                      disabled={isLoading}
                      {...field}
                    />
                    {usernameStatus.checking && (
                      <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin" />
                    )}
                    {!usernameStatus.checking && usernameStatus.available === true && (
                      <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />
                    )}
                    {!usernameStatus.checking && usernameStatus.available === false && (
                      <XCircle className="absolute right-3 top-3 h-4 w-4 text-red-500" />
                    )}
                  </div>
                </FormControl>
                {usernameStatus.message && (
                  <p className={`text-xs ${
                    usernameStatus.available === true 
                      ? "text-green-600 dark:text-green-400" 
                      : usernameStatus.available === false
                      ? "text-red-600 dark:text-red-400"
                      : "text-muted-foreground"
                  }`}>
                    {usernameStatus.message}
                  </p>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your email"
                    type="email"
                    autoComplete="email"
                    disabled={isLoading}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="18"
                      type="number"
                      min="18"
                      max="120"
                      disabled={isLoading}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 18)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Create a strong password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
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
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
                <PasswordStrengthIndicator password={field.value} />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Confirm your password"
                      type={showConfirmPassword ? "text" : "password"}
                      autoComplete="new-password"
                      disabled={isLoading}
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="acceptTerms"
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
                  <FormLabel className="text-sm">
                    I agree to the{" "}
                    <Link href="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link href="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading || usernameStatus.available === false}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Create Account
          </Button>
        </form>
      </Form>

      <SocialLogin isLoading={isLoading} />

      <div className="text-center space-y-2">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-primary hover:underline">
            Sign in
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
