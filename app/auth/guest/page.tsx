"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { useAuth } from "@/lib/contexts/auth-context";
import { guestSchema, GuestFormData } from "@/lib/types/auth";
import { saveFormData, loadFormData, clearFormData } from "@/lib/utils/auth";
import {
  Loader2,
  AlertCircle
} from "lucide-react";

export default function GuestPage() {
  const router = useRouter();
  const { signInAsGuest, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<GuestFormData>({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      username: "",
      age: 18,
      gender: undefined,
    },
  });

  // Load saved form data on mount
  useEffect(() => {
    const savedData = loadFormData("guest");
    if (savedData) {
      form.reset({
        username: savedData.username || "",
        age: savedData.age || 18,
        gender: savedData.gender || undefined,
      });
    }
  }, [form]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push("/chat");
    }
  }, [isAuthenticated, authLoading, router]);

  // Save form data on change
  useEffect(() => {
    const subscription = form.watch((data) => {
      saveFormData("guest", data);
    });
    return () => subscription.unsubscribe();
  }, [form]);

  const onSubmit = async (data: GuestFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      await signInAsGuest(data);
      
      // Clear form data on successful guest login
      clearFormData("guest");
      
      // Redirect will happen via useEffect
    } catch (error) {
      const message = error instanceof Error ? error.message : "Guest sign in failed";
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
      title="Continue as Guest" 
      subtitle="Quick access without creating an account"
    >
      <div className="space-y-6">
        {/* Guest Form */}
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
                  <FormLabel>Display Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="How should others see you?"
                      disabled={isLoading}
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    This will be your display name in chats. We'll add "Guest_" prefix automatically.
                  </p>
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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enter as Guest
            </Button>
          </form>
        </Form>

        {/* Account Creation CTA */}
        <div className="text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            Want the full experience?
          </p>
          <div className="flex space-x-2">
            <Link href="/auth/signup" className="flex-1">
              <Button variant="outline" className="w-full">
                Create Account
              </Button>
            </Link>
            <Link href="/auth/signin" className="flex-1">
              <Button variant="ghost" className="w-full">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  );
}
