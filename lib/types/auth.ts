import { z } from "zod";

// Simple ID type for build compatibility
type Id<T extends string> = string & { __tableName: T };

// User types
export interface User {
  _id: Id<"users">;
  username: string;
  age: number;
  gender: "male" | "female" | "other";
  isGuest: boolean;
  email?: string;
  bio?: string;
  isOnline: boolean;
  lastSeen: number;
  allowGuestMessages: boolean;
  showOnlineStatus: boolean;
  isActive: boolean;
  isBanned: boolean;
  banReason?: string;
  banExpiresAt?: number;
  guestSessionId?: string;
  guestExpiresAt?: number;
  createdAt: number;
  updatedAt: number;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// User list types for chat interface
export interface ActiveUser {
  _id: Id<"users">;
  username: string;
  isOnline: boolean; // Keep for backward compatibility
  currentStatus: "online" | "recently_active" | "away" | "offline";
  lastSeen: number;
  lastActivity?: number;
  isGuest: boolean;
  bio?: string;
  age: number;
  gender: "male" | "female" | "other";
  allowGuestMessages: boolean;
  showOnlineStatus: boolean;
  unreadCount: number;
}

export interface ChatUser extends ActiveUser {
  conversationId: Id<"conversations">;
  lastMessage: {
    content: string;
    timestamp: number;
    senderId: Id<"users">;
  } | null;
  lastMessageAt: number;
  unreadCount: number;
}

// Chat interface types
export interface ChatMessage {
  _id: Id<"messages">;
  content: string;
  type: "text" | "image" | "file" | "system";
  senderId: Id<"users">;
  senderUsername: string;
  isOwn: boolean;
  createdAt: number;
  readBy: Array<{
    userId: Id<"users">;
    readAt: number;
  }>;
  replyToMessageId?: Id<"messages">;
  replyToMessage?: {
    _id: Id<"messages">;
    content: string;
    type: "text" | "image" | "file" | "system";
    senderUsername: string;
    fileName?: string;
    fileMimeType?: string;
  } | null;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
}

export interface ChatConversation {
  conversationId: Id<"conversations">;
  otherUser: {
    _id: Id<"users">;
    username: string;
    isOnline: boolean;
    lastSeen: number;
    lastActivity?: number;
    currentStatus?: "online" | "recently_active" | "away" | "offline";
    showOnlineStatus: boolean;
    isGuest: boolean;
    bio?: string;
    age: number;
    gender: "male" | "female" | "other";
  };
}

// Form validation schemas
export const signInSchema = z.object({
  emailOrUsername: z
    .string()
    .min(1, "Email or username is required")
    .refine(
      (value) => {
        // Check if it's an email or username
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value) || value.length >= 3;
      },
      {
        message: "Please enter a valid email or username (min 3 characters)",
      }
    ),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().default(false),
});

export const signUpSchema = z
  .object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be less than 20 characters")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "Username can only contain letters, numbers, and underscores"
      ),
    email: z.string().email("Please enter a valid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        "Password must contain at least one uppercase letter, one lowercase letter, and one number"
      ),
    confirmPassword: z.string(),
    age: z
      .number()
      .min(18, "You must be at least 18 years old")
      .max(120, "Please enter a valid age"),
    gender: z.enum(["male", "female", "other"], {
      required_error: "Please select your gender",
    }),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms of service",
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

export const guestSchema = z.object({
  username: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(20, "Name must be less than 20 characters")
    .regex(
      /^[a-zA-Z0-9_\s]+$/,
      "Name can only contain letters, numbers, underscores, and spaces"
    ),
  age: z
    .number()
    .min(18, "You must be at least 18 years old")
    .max(120, "Please enter a valid age"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select your gender",
  }),
});

// Profile update schema
export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be less than 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers, and underscores"
    ),
  bio: z
    .string()
    .max(200, "Bio must be less than 200 characters")
    .optional()
    .or(z.literal("")),
  age: z
    .number()
    .min(18, "You must be at least 18 years old")
    .max(120, "Please enter a valid age"),
  gender: z.enum(["male", "female", "other"], {
    required_error: "Please select your gender",
  }),
  allowGuestMessages: z.boolean(),
  showOnlineStatus: z.boolean(),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

// Form types
export type SignInFormData = z.infer<typeof signInSchema>;
export type SignUpFormData = z.infer<typeof signUpSchema>;
export type GuestFormData = z.infer<typeof guestSchema>;
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Password strength levels
export type PasswordStrength = "weak" | "fair" | "good" | "strong";

export interface PasswordStrengthResult {
  score: number;
  strength: PasswordStrength;
  feedback: string[];
}

// Auth context types
export interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (data: SignInFormData) => Promise<void>;
  signUp: (data: SignUpFormData) => Promise<void>;
  signInAsGuest: (data: GuestFormData) => Promise<void>;
  signOut: () => Promise<void>;
  upgradeGuestAccount: (email: string, password: string) => Promise<void>;
  checkUsernameAvailability: (username: string) => Promise<boolean>;
}

// API response types
export interface AuthResponse {
  success: boolean;
  user?: User;
  message?: string;
  error?: string;
}

export interface UsernameCheckResponse {
  available: boolean;
  message?: string;
}
