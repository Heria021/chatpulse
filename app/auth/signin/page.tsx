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
import { useAuth } from "@/lib/contexts/auth-context";
import { signInSchema } from "@/lib/types/auth";
import { saveFormData, loadFormData, clearFormData } from "@/lib/utils/auth";
import { Eye, EyeOff, Loader2, AlertCircle, Shield, Lock, Terminal, ArrowRight } from "lucide-react";

// --- VISUAL MOCKUP ---
const AuthConsoleMockup = () => {
  return (
    <div className="w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl flex flex-col border border-neutral-800 relative group">
      {/* Header */}
      <div className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 justify-between">
        <div className="text-white text-sm font-bold tracking-wide flex items-center gap-2">
          <Shield className="w-4 h-4 text-white" />
          SECURE_GATEWAY_V2
        </div>
        <div className="flex gap-2 items-center">
          <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse"></div>
          <span className="text-[10px] text-yellow-500 font-mono font-bold">AWAITING_INPUT</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 bg-black font-mono text-xs relative overflow-hidden flex flex-col justify-center">
         {/* Grid Background */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
         
         <div className="relative z-10 space-y-6 max-w-[80%] mx-auto">
            <div className="text-center">
                <Lock className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                <div className="text-neutral-500 mb-1">AUTHENTICATION_REQUIRED</div>
                <div className="text-white font-bold text-lg tracking-widest">ACCESS CONTROL</div>
            </div>

            <div className="space-y-2 border-t border-dashed border-neutral-800 pt-6">
                <div className="flex justify-between">
                    <span className="text-neutral-600">Protocol:</span>
                    <span className="text-green-500">TLS_1.3</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-neutral-600">Encryption:</span>
                    <span className="text-white">AES-256</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-neutral-600">Status:</span>
                    <span className="text-yellow-500 animate-pulse">LOCKED</span>
                </div>
            </div>
         </div>
      </div>
      
      {/* Footer */}
      <div className="p-3 bg-neutral-900 border-t border-neutral-800 text-center">
         <span className="text-[10px] text-neutral-500 font-mono">ID: UNKNOWN_USER</span>
      </div>
    </div>
  );
};

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
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
         <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white flex flex-col">
      {/* Navigation Removed per request */}

      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: Visual Mockup (Hidden on mobile) */}
          <div className="hidden lg:block h-[600px] p-8 bg-neutral-100 rounded-3xl border border-neutral-200 relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
             <div className="relative h-full flex flex-col">
                <div className="mb-8">
                   <h2 className="text-4xl font-black tracking-tighter mb-4">ACCESS<br/>NETWORK.</h2>
                   <p className="text-neutral-500 font-medium max-w-xs">
                      Secure entry point for the ChatPulse real-time communication grid.
                   </p>
                </div>
                <div className="flex-1 relative">
                   <div className="absolute inset-0 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                      <AuthConsoleMockup />
                   </div>
                </div>
             </div>
          </div>

          {/* Right Side: Form */}
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
               <div className="flex items-center gap-2 mb-2">
                  <Terminal className="w-5 h-5 text-neutral-400" />
                  <span className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-widest">Login Protocol</span>
               </div>
               <h1 className="text-4xl font-black tracking-tight mb-2">WELCOME BACK.</h1>
               <p className="text-neutral-500 font-medium">Enter your credentials to access the system.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                {error && (
                  <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-medium">{error}</AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="emailOrUsername"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wide text-neutral-500">Email or Username</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="user@example.com"
                          type="text"
                          autoComplete="username"
                          disabled={isLoading}
                          className="h-12 bg-neutral-50 border-2 border-neutral-200 rounded-lg focus:border-black focus:ring-0 transition-all font-medium"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="font-mono text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel className="text-xs font-bold uppercase tracking-wide text-neutral-500">Password</FormLabel>
                        <Link
                          href="/auth/forgot-password"
                          className="text-xs font-bold text-neutral-400 hover:text-black transition-colors"
                        >
                          FORGOT?
                        </Link>
                      </div>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            autoComplete="current-password"
                            disabled={isLoading}
                            className="h-12 bg-neutral-50 border-2 border-neutral-200 rounded-lg focus:border-black focus:ring-0 transition-all font-medium pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-neutral-400 hover:text-black"
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
                      <FormMessage className="font-mono text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rememberMe"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                          className="border-2 border-neutral-300 data-[state=checked]:bg-black data-[state=checked]:border-black rounded-sm"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-bold text-neutral-600">
                          Keep me signed in
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-black text-white hover:bg-neutral-800 rounded-lg font-bold uppercase tracking-widest text-sm transition-all" 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                  {isLoading ? "Authenticating..." : "Sign In"}
                </Button>
              </form>
            </Form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-neutral-400 font-bold tracking-wider">OR</span>
                </div>
              </div>
            </div>

            <div className="mt-8 grid gap-4">
              <Link 
                href="/auth/signup" 
                className="flex items-center justify-center w-full py-3 border-2 border-neutral-200 rounded-lg font-bold text-sm hover:border-black hover:bg-neutral-50 transition-all uppercase tracking-wide"
              >
                Create Account
              </Link>
              
              <div className="text-center">
                <Link href="/auth/guest" className="text-xs font-mono text-neutral-500 hover:text-black transition-colors border-b border-transparent hover:border-black pb-0.5">
                  CONTINUE_AS_GUEST
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
         <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}