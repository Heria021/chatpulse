"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { forgotPasswordSchema, ForgotPasswordFormData } from "@/lib/types/auth";
import { 
  Loader2, 
  AlertCircle, 
  CheckCircle, 
  Mail, 
  ArrowLeft,
  Terminal,
  ShieldCheck,
  KeyRound,
  RefreshCw
} from "lucide-react";
import { toast } from "sonner";

// --- VISUAL MOCKUP ---
const RecoveryConsoleMockup = () => {
  return (
    <div className="w-full h-full bg-black rounded-xl overflow-hidden shadow-2xl flex flex-col border border-neutral-800 relative group">
      {/* Header */}
      <div className="h-14 bg-neutral-900 border-b border-neutral-800 flex items-center px-4 justify-between">
        <div className="text-white text-sm font-bold tracking-wide flex items-center gap-2">
          <KeyRound className="w-4 h-4 text-white" />
          RECOVERY_PROTOCOL_V1
        </div>
        <div className="flex gap-2 items-center">
          <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse"></div>
          <span className="text-[10px] text-orange-500 font-mono font-bold">SYSTEM_ALERT</span>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-6 bg-black font-mono text-xs relative overflow-hidden flex flex-col justify-center">
         {/* Grid Background */}
         <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px]"></div>
         
         <div className="relative z-10 space-y-6 max-w-[80%] mx-auto">
            <div className="text-center">
                <RefreshCw className="w-12 h-12 text-neutral-700 mx-auto mb-4" />
                <div className="text-neutral-500 mb-1">CREDENTIAL_LOSS_DETECTED</div>
                <div className="text-white font-bold text-lg tracking-widest">RESET SEQUENCE</div>
            </div>

            <div className="space-y-3 border-t border-dashed border-neutral-800 pt-6">
                <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Verification:</span>
                    <span className="text-white">EMAIL_REQUIRED</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Security_Level:</span>
                    <span className="text-orange-500">HIGH</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-neutral-600">Link_Expiry:</span>
                    <span className="text-white">60_MINUTES</span>
                </div>
            </div>
         </div>
      </div>
      
      {/* Footer */}
      <div className="p-3 bg-neutral-900 border-t border-neutral-800 text-center">
         <span className="text-[10px] text-neutral-500 font-mono">ID: AUTH_RESET</span>
      </div>
    </div>
  );
};

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setIsSubmitted(true);
      toast.success("Password reset instructions sent!");
      
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to send reset email";
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-black selection:text-white flex flex-col">
      <div className="flex-1 flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: Visual Mockup */}
          <div className="hidden lg:block h-[600px] p-8 bg-neutral-100 rounded-3xl border border-neutral-200 relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50"></div>
             <div className="relative h-full flex flex-col">
                <div className="mb-8">
                   <h2 className="text-4xl font-black tracking-tighter mb-4">RECOVER<br/>ACCESS.</h2>
                   <p className="text-neutral-500 font-medium max-w-xs">
                      Initiate secure credential reset protocol. Verification required.
                   </p>
                </div>
                <div className="flex-1 relative">
                   <div className="absolute inset-0 transform rotate-2 hover:rotate-0 transition-transform duration-500">
                      <RecoveryConsoleMockup />
                   </div>
                </div>
             </div>
          </div>

          {/* Right Side: Form */}
          <div className="max-w-md mx-auto w-full">
            {isSubmitted ? (
              // Submitted State
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                   <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-5 h-5 text-green-500" />
                      <span className="font-mono text-xs font-bold text-green-500 uppercase tracking-widest">DISPATCH CONFIRMED</span>
                   </div>
                   <h1 className="text-4xl font-black tracking-tight mb-2">CHECK INBOX.</h1>
                   <p className="text-neutral-500 font-medium">
                      Reset protocol initiated for <span className="text-black font-bold">{form.getValues("email")}</span>.
                   </p>
                </div>

                <div className="p-6 bg-neutral-50 border-2 border-neutral-200 rounded-xl space-y-4">
                   <div className="flex gap-3">
                      <div className="mt-1"><Terminal className="w-4 h-4 text-black"/></div>
                      <div className="text-sm font-medium text-neutral-600">
                         <p className="mb-2 text-black font-bold">NEXT STEPS:</p>
                         <ul className="space-y-1 font-mono text-xs list-disc list-inside">
                            <li>Locate transmission in inbox</li>
                            <li>Verify digital signature (Click Link)</li>
                            <li>Establish new credentials</li>
                         </ul>
                      </div>
                   </div>
                </div>

                <div className="space-y-4 pt-4">
                   <Button
                      variant="outline"
                      onClick={() => {
                        setIsSubmitted(false);
                        setError(null);
                        form.reset();
                      }}
                      className="w-full h-12 border-2 border-neutral-200 hover:border-black text-neutral-600 hover:text-black font-bold uppercase tracking-widest text-sm"
                    >
                      Resend Link
                    </Button>
                    <div className="text-center">
                      <Link href="/auth/signin" className="text-xs font-mono text-neutral-500 hover:text-black transition-colors border-b border-transparent hover:border-black pb-0.5">
                        RETURN_TO_LOGIN
                      </Link>
                    </div>
                </div>
              </div>
            ) : (
              // Initial Form State
              <div className="space-y-8">
                <div>
                   <div className="flex items-center gap-2 mb-2">
                      <Terminal className="w-5 h-5 text-neutral-400" />
                      <span className="font-mono text-xs font-bold text-neutral-400 uppercase tracking-widest">Recovery Mode</span>
                   </div>
                   <h1 className="text-4xl font-black tracking-tight mb-2">FORGOT PASSWORD?</h1>
                   <p className="text-neutral-500 font-medium">Enter your registered email to reset access.</p>
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
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-xs font-bold uppercase tracking-wide text-neutral-500">Email Address</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="user@example.com"
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

                    <Button 
                      type="submit" 
                      className="w-full h-12 bg-black text-white hover:bg-neutral-800 rounded-lg font-bold uppercase tracking-widest text-sm transition-all" 
                      disabled={isLoading}
                    >
                      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Mail className="mr-2 h-4 w-4" />}
                      {isLoading ? "Transmitting..." : "Send Instructions"}
                    </Button>
                  </form>
                </Form>

                <div className="text-center pt-4">
                  <Link href="/auth/signin" className="text-xs font-mono text-neutral-500 hover:text-black transition-colors border-b border-transparent hover:border-black pb-0.5 flex items-center justify-center gap-2">
                    <ArrowLeft className="w-3 h-3" /> ABORT_PROTOCOL / BACK_TO_LOGIN
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}