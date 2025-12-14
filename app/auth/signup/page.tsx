"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
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
import { PasswordStrengthIndicator } from "@/components/auth/password-strength";
import { useAuth } from "@/lib/contexts/auth-context";
import { signUpSchema, SignUpFormData } from "@/lib/types/auth";
import { saveFormData, loadFormData, clearFormData, debounce } from "@/lib/utils/auth";
import { Eye, EyeOff, Loader2, AlertCircle, CheckCircle, XCircle, Shield, UserPlus, Terminal, ArrowRight, Activity } from "lucide-react";

// --- VISUAL MOCKUP ---
const SignUpConsoleMockup = () => {
  return (
    <div className="w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl flex flex-col border border-neutral-800 relative group">
      {/* Header */}
      <div className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 justify-between">
        <div className="text-white text-sm font-bold tracking-wide flex items-center gap-2">
          <UserPlus className="w-4 h-4 text-white" />
          IDENTITY_PROTOCOL_V1
        </div>
        <div className="flex gap-2 items-center">
          <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
          <span className="text-[10px] text-green-500 font-mono font-bold">SYSTEM_READY</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 bg-black font-mono text-xs relative overflow-hidden flex flex-col justify-center">
         {/* Grid Background */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
         
         <div className="relative z-10 space-y-6 max-w-[80%] mx-auto">
            <div className="text-center">
                <Shield className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                <div className="text-neutral-500 mb-1">INITIALIZING_NEW_USER</div>
                <div className="text-white font-bold text-lg tracking-widest">CREATE IDENTITY</div>
            </div>

            <div className="space-y-3 border-t border-dashed border-neutral-800 pt-6">
                <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Username_Check:</span>
                    <span className="text-green-500">[AVAILABLE]</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Encryption_Keys:</span>
                    <span className="text-white">GENERATING...</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Access_Level:</span>
                    <span className="text-yellow-500">STANDARD_USER</span>
                </div>
            </div>
         </div>
      </div>
      
      {/* Footer */}
      <div className="p-3 bg-neutral-900 border-t border-neutral-800 text-center">
         <span className="text-[10px] text-neutral-500 font-mono">STATUS: WAITING_FOR_INPUT</span>
      </div>
    </div>
  );
};

function SignUpForm() {
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
          <div className="hidden lg:block h-[800px] p-8 bg-neutral-100 rounded-3xl border border-neutral-200 relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
             <div className="relative h-full flex flex-col">
                <div className="mb-8">
                   <h2 className="text-4xl font-black tracking-tighter mb-4">JOIN THE<br/>NETWORK.</h2>
                   <p className="text-neutral-500 font-medium max-w-xs">
                      Create your secure identity to access global communication channels.
                   </p>
                </div>
                <div className="flex-1 relative">
                   <div className="absolute inset-0 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                      <SignUpConsoleMockup />
                   </div>
                </div>
             </div>
          </div>

          {/* Right Side: Form */}
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
               <div className="flex items-center gap-2 mb-2">
                  <Terminal className="w-5 h-5 text-neutral-400" />
                  <span className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-widest">Registration Protocol</span>
               </div>
               <h1 className="text-4xl font-black tracking-tight mb-2">CREATE ACCOUNT.</h1>
               <p className="text-neutral-500 font-medium">Initialize your digital presence.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
                {error && (
                  <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-900 rounded-lg">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="font-medium">{error}</AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wide text-neutral-500">Username</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Choose a username"
                            autoComplete="username"
                            disabled={isLoading}
                            className="h-12 bg-neutral-50 border-2 border-neutral-200 rounded-lg focus:border-black focus:ring-0 transition-all font-medium"
                            {...field}
                          />
                          {usernameStatus.checking && (
                            <Loader2 className="absolute right-3 top-4 h-4 w-4 animate-spin text-neutral-400" />
                          )}
                          {!usernameStatus.checking && usernameStatus.available === true && (
                            <CheckCircle className="absolute right-3 top-4 h-4 w-4 text-green-500" />
                          )}
                          {!usernameStatus.checking && usernameStatus.available === false && (
                            <XCircle className="absolute right-3 top-4 h-4 w-4 text-red-500" />
                          )}
                        </div>
                      </FormControl>
                      {usernameStatus.message && (
                        <p className={`text-xs font-medium mt-1 ${
                          usernameStatus.available === true 
                            ? "text-green-600" 
                            : usernameStatus.available === false
                            ? "text-red-600"
                            : "text-neutral-500"
                        }`}>
                          {usernameStatus.message}
                        </p>
                      )}
                      <FormMessage className="font-mono text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wide text-neutral-500">Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your email"
                          type="email"
                          autoComplete="email"
                          disabled={isLoading}
                          className="h-12 bg-neutral-50 border-2 border-neutral-200 rounded-lg focus:border-black focus:ring-0 transition-all font-medium"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="font-mono text-xs" />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="age"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wide text-neutral-500">Age</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="18"
                            type="number"
                            min="18"
                            max="120"
                            disabled={isLoading}
                            className="h-12 bg-neutral-50 border-2 border-neutral-200 rounded-lg focus:border-black focus:ring-0 transition-all font-medium"
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value) || 18)}
                          />
                        </FormControl>
                        <FormMessage className="font-mono text-xs" />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-bold uppercase tracking-wide text-neutral-500">Gender</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value} disabled={isLoading}>
                          <FormControl>
                            <SelectTrigger className="h-12 bg-neutral-50 border-2 border-neutral-200 rounded-lg focus:border-black focus:ring-0 transition-all font-medium">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage className="font-mono text-xs" />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wide text-neutral-500">Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Create a strong password"
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
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
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage className="font-mono text-xs" />
                      <PasswordStrengthIndicator password={field.value} />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-bold uppercase tracking-wide text-neutral-500">Confirm Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            placeholder="Confirm your password"
                            type={showConfirmPassword ? "text" : "password"}
                            autoComplete="new-password"
                            disabled={isLoading}
                            className="h-12 bg-neutral-50 border-2 border-neutral-200 rounded-lg focus:border-black focus:ring-0 transition-all font-medium pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-neutral-400 hover:text-black"
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
                      <FormMessage className="font-mono text-xs" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acceptTerms"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4 border-2 border-neutral-100 rounded-lg bg-white">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isLoading}
                          className="mt-1 border-2 border-neutral-300 data-[state=checked]:bg-black data-[state=checked]:border-black rounded-sm"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium text-neutral-600">
                          I agree to the{" "}
                          <Link href="/terms" className="text-black font-bold hover:underline">
                            Terms
                          </Link>{" "}
                          and{" "}
                          <Link href="/privacy" className="text-black font-bold hover:underline">
                            Privacy Policy
                          </Link>
                        </FormLabel>
                        <FormMessage className="font-mono text-xs" />
                      </div>
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full h-12 bg-black text-white hover:bg-neutral-800 rounded-lg font-bold uppercase tracking-widest text-sm transition-all"
                  disabled={isLoading || usernameStatus.available === false}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                  {isLoading ? "Creating Account..." : "Create Account"}
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
                href="/auth/signin" 
                className="flex items-center justify-center w-full py-3 border-2 border-neutral-200 rounded-lg font-bold text-sm hover:border-black hover:bg-neutral-50 transition-all uppercase tracking-wide"
              >
                Sign In
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

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
         <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}