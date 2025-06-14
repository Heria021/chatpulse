"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";
import Link from "next/link";

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle?: string;
  showBackToHome?: boolean;
}

export function AuthLayout({
  children,
  title,
  subtitle,
  showBackToHome = true
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Main content */}
        <Card className="shadow-lg">
          <CardHeader className="space-y-4 pb-4">
            {/* Header inside card */}
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2">
                <div className="p-2 bg-primary rounded-lg">
                  <MessageCircle className="h-6 w-6 text-primary-foreground" />
                </div>
                <h1 className="text-2xl font-bold">ChatNow</h1>
              </div>

              <div>
                <h2 className="text-xl font-semibold">{title}</h2>
                {subtitle && (
                  <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
                )}
              </div>
            </div>

            <div className="w-full h-1 bg-gradient-to-r from-primary/20 via-primary to-primary/20 rounded-full" />
          </CardHeader>
          <CardContent className="space-y-4">
            {children}
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center space-y-4">
          {showBackToHome && (
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← Back to Home
              </Button>
            </Link>
          )}

          <div className="text-xs text-muted-foreground space-y-1">
            <p>By using ChatNow, you agree to our</p>
            <div className="space-x-4">
              <Link href="/terms" className="hover:underline">
                Terms of Service
              </Link>
              <Link href="/privacy" className="hover:underline">
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
