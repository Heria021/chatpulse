"use client";

import { useState, useEffect, Suspense } from "react";
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

import { useAuth } from "@/lib/contexts/auth-context";
import { guestSchema, GuestFormData } from "@/lib/types/auth";
import { saveFormData, loadFormData, clearFormData } from "@/lib/utils/auth";
import {
  Loader2,
  AlertCircle,
  Ghost,
  ShieldAlert,
  Terminal,
  ArrowRight,
  Clock,
  Activity
} from "lucide-react";

// --- VISUAL MOCKUP ---
const GuestConsoleMockup = () => {
  return (
    <div className="w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl flex flex-col border border-neutral-800 relative group">
      {/* Header */}
      <div className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 justify-between">
        <div className="text-white text-sm font-bold tracking-wide flex items-center gap-2">
          <Ghost className="w-4 h-4 text-white" />
          GHOST_PROTOCOL_V4
        </div>
        <div className="flex gap-2 items-center">
          <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></div>
          <span className="text-[10px] text-red-500 font-mono font-bold">TEMP_ACCESS</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 bg-black font-mono text-xs relative overflow-hidden flex flex-col justify-center">
         {/* Grid Background */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
         
         <div className="relative z-10 space-y-6 max-w-[80%] mx-auto">
            <div className="text-center">
                <ShieldAlert className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                <div className="text-neutral-500 mb-1">UNREGISTERED_USER_DETECTED</div>
                <div className="text-white font-bold text-lg tracking-widest">GUEST ACCESS</div>
            </div>

            <div className="space-y-3 border-t border-dashed border-neutral-800 pt-6">
                <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Session_Type:</span>
                    <span className="text-white">EPHEMERAL</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Data_Retention:</span>
                    <span className="text-red-500">24_HOURS</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Anonymity:</span>
                    <span className="text-green-500">MAXIMUM</span>
                </div>
            </div>
            
            <div className="bg-neutral-900/50 border border-neutral-800 p-3 rounded flex items-center gap-3">
               <Clock className="w-4 h-4 text-neutral-500" />
               <span className="text-neutral-400">Auto-deletion timer set.</span>
            </div>
         </div>
      </div>
      
      {/* Footer */}
      <div className="p-3 bg-neutral-900 border-t border-neutral-800 text-center">
         <span className="text-[10px] text-neutral-500 font-mono">ID: NULL</span>
      </div>
    </div>
  );
};

function GuestForm() {
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
                   <h2 className="text-4xl font-black tracking-tighter mb-4">GO DARK.<br/>STAY SAFE.</h2>
                   <p className="text-neutral-500 font-medium max-w-xs">
                      Access the network anonymously. No email required. Data auto-destructs in 24 hours.
                   </p>
                </div>
                <div className="flex-1 relative">
                   <div className="absolute inset-0 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                      <GuestConsoleMockup />
                   </div>
                </div>
             </div>
          </div>

          {/* Right Side: Form */}
          <div className="max-w-md mx-auto w-full">
            <div className="mb-8">
               <div className="flex items-center gap-2 mb-2">
                  <Terminal className="w-5 h-5 text-neutral-400" />
                  <span className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-widest">Guest Protocol</span>
               </div>
               <h1 className="text-4xl font-black tracking-tight mb-2">QUICK ACCESS.</h1>
               <p className="text-neutral-500 font-medium">Enter minimal details to proceed.</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
                      <FormLabel className="text-xs font-bold uppercase tracking-wide text-neutral-500">Display Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="How should others see you?"
                          disabled={isLoading}
                          className="h-12 bg-neutral-50 border-2 border-neutral-200 rounded-lg focus:border-black focus:ring-0 transition-all font-medium"
                          {...field}
                        />
                      </FormControl>
                      <p className="text-xs font-mono text-neutral-400 mt-1">
                        * Prefix "Guest_" will be added automatically.
                      </p>
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

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-black text-white hover:bg-neutral-800 rounded-lg font-bold uppercase tracking-widest text-sm transition-all" 
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowRight className="mr-2 h-4 w-4" />}
                  {isLoading ? "Initiating..." : "Enter as Guest"}
                </Button>
              </form>
            </Form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-neutral-400 font-bold tracking-wider">Want More Features?</span>
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
                <Link href="/auth/signin" className="text-xs font-mono text-neutral-500 hover:text-black transition-colors border-b border-transparent hover:border-black pb-0.5">
                  EXISTING_USER_LOGIN
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function GuestPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
         <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <GuestForm />
    </Suspense>
  );
}