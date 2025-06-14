"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import {
  AuthContextType,
  User,
  SignInFormData,
  SignUpFormData,
  GuestFormData,
} from "@/lib/types/auth";
import {
  saveSessionToken,
  getSessionToken,
  clearSessionToken,
} from "@/lib/utils/auth";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sessionToken, setSessionTokenState] = useState<string | null>(null);

  // Convex mutations
  const registerUserMutation = useMutation(api.auth.registerUser);
  const signInUserMutation = useMutation(api.auth.signInUser);
  const createGuestUserMutation = useMutation(api.auth.createGuestUser);
  const signOutUserMutation = useMutation(api.auth.signOutUser);
  const checkUsernameAvailabilityQuery = useMutation(api.auth.checkUsernameAvailability);

  // Get user by session token
  const userBySession = useQuery(
    api.auth.getUserBySession,
    sessionToken ? { sessionToken } : "skip"
  );

  // Initialize session on mount
  useEffect(() => {
    const token = getSessionToken();
    if (token) {
      setSessionTokenState(token);
    } else {
      setIsLoading(false);
    }
  }, []);

  // Update user when session data changes
  useEffect(() => {
    if (sessionToken) {
      if (userBySession !== undefined) {
        setUser(userBySession);
        setIsLoading(false);
        
        // If session is invalid, clear it
        if (!userBySession) {
          clearSessionToken();
          setSessionTokenState(null);
        }
      }
    } else {
      setUser(null);
      setIsLoading(false);
    }
  }, [userBySession, sessionToken]);

  const signIn = async (data: SignInFormData) => {
    try {
      setIsLoading(true);
      const result = await signInUserMutation({
        emailOrUsername: data.emailOrUsername,
        password: data.password,
      });

      if (result.user && result.sessionToken) {
        setUser(result.user);
        setSessionTokenState(result.sessionToken);
        saveSessionToken(result.sessionToken);
        toast.success("Welcome back!");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign in failed";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (data: SignUpFormData) => {
    try {
      setIsLoading(true);
      const result = await registerUserMutation({
        username: data.username,
        email: data.email,
        password: data.password,
        age: data.age,
        gender: data.gender,
      });

      if (result.user && result.sessionToken) {
        setUser(result.user);
        setSessionTokenState(result.sessionToken);
        saveSessionToken(result.sessionToken);
        toast.success("Account created successfully!");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Sign up failed";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signInAsGuest = async (data: GuestFormData) => {
    try {
      setIsLoading(true);
      const result = await createGuestUserMutation({
        username: data.username,
        age: data.age,
        gender: data.gender,
      });

      if (result.user && result.sessionToken) {
        setUser(result.user);
        setSessionTokenState(result.sessionToken);
        saveSessionToken(result.sessionToken);
        toast.success(`Welcome, ${result.user.username}!`);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Guest sign in failed";
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    try {
      if (sessionToken) {
        await signOutUserMutation({ sessionToken });
      }
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      setUser(null);
      setSessionTokenState(null);
      clearSessionToken();
      toast.success("Signed out successfully");
    }
  };

  const checkUsernameAvailability = async (username: string): Promise<boolean> => {
    try {
      const result = await checkUsernameAvailabilityQuery({ username });
      return result.available;
    } catch (error) {
      console.error("Username availability check failed:", error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signInAsGuest,
    signOut,
    checkUsernameAvailability,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
