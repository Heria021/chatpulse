import { PasswordStrength, PasswordStrengthResult } from "@/lib/types/auth";

// Password strength checker
export function checkPasswordStrength(password: string): PasswordStrengthResult {
  let score = 0;
  const feedback: string[] = [];

  // Length check
  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push("Use at least 8 characters");
  }

  // Uppercase check
  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add uppercase letters");
  }

  // Lowercase check
  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add lowercase letters");
  }

  // Number check
  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add numbers");
  }

  // Special character check
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push("Add special characters");
  }

  // Common patterns check
  const commonPatterns = [
    /123456/,
    /password/i,
    /qwerty/i,
    /abc123/i,
    /admin/i,
  ];

  if (commonPatterns.some(pattern => pattern.test(password))) {
    score -= 1;
    feedback.push("Avoid common patterns");
  }

  // Determine strength
  let strength: PasswordStrength;
  if (score <= 1) {
    strength = "weak";
  } else if (score <= 2) {
    strength = "fair";
  } else if (score <= 3) {
    strength = "good";
  } else {
    strength = "strong";
  }

  return {
    score: Math.max(0, score),
    strength,
    feedback,
  };
}

// Form persistence utilities
const FORM_STORAGE_PREFIX = "chatpulse_form_";

export function saveFormData(formName: string, data: Record<string, any>) {
  try {
    const sanitizedData = { ...data };
    // Never persist sensitive data
    delete sanitizedData.password;
    delete sanitizedData.confirmPassword;
    
    localStorage.setItem(
      `${FORM_STORAGE_PREFIX}${formName}`,
      JSON.stringify(sanitizedData)
    );
  } catch (error) {
    console.warn("Failed to save form data:", error);
  }
}

export function loadFormData(formName: string): Record<string, any> | null {
  try {
    const data = localStorage.getItem(`${FORM_STORAGE_PREFIX}${formName}`);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.warn("Failed to load form data:", error);
    return null;
  }
}

export function clearFormData(formName: string) {
  try {
    localStorage.removeItem(`${FORM_STORAGE_PREFIX}${formName}`);
  } catch (error) {
    console.warn("Failed to clear form data:", error);
  }
}

// Session management
const SESSION_TOKEN_KEY = "chatpulse_session_token";

export function saveSessionToken(token: string) {
  try {
    localStorage.setItem(SESSION_TOKEN_KEY, token);
    // Also save in cookie for middleware access
    document.cookie = `chatpulse_session_token=${token}; path=/; max-age=${30 * 24 * 60 * 60}; SameSite=Lax`;
  } catch (error) {
    console.warn("Failed to save session token:", error);
  }
}

export function getSessionToken(): string | null {
  try {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(SESSION_TOKEN_KEY);
  } catch (error) {
    console.warn("Failed to get session token:", error);
    return null;
  }
}

export function clearSessionToken() {
  try {
    localStorage.removeItem(SESSION_TOKEN_KEY);
    // Also clear cookie
    document.cookie = "chatpulse_session_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  } catch (error) {
    console.warn("Failed to clear session token:", error);
  }
}

// Username validation
export function validateUsername(username: string): { valid: boolean; message?: string } {
  if (username.length < 3) {
    return { valid: false, message: "Username must be at least 3 characters" };
  }

  if (username.length > 20) {
    return { valid: false, message: "Username must be less than 20 characters" };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return { 
      valid: false, 
      message: "Username can only contain letters, numbers, and underscores" 
    };
  }

  // Check for reserved usernames
  const reservedUsernames = [
    "admin", "administrator", "root", "system", "guest", "user",
    "support", "help", "api", "www", "mail", "email", "test",
    "demo", "sample", "example", "null", "undefined", "bot"
  ];

  if (reservedUsernames.includes(username.toLowerCase())) {
    return { valid: false, message: "This username is reserved" };
  }

  return { valid: true };
}

// Email validation
export function validateEmail(email: string): { valid: boolean; message?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, message: "Please enter a valid email address" };
  }

  // Check for common disposable email domains
  const disposableDomains = [
    "10minutemail.com", "tempmail.org", "guerrillamail.com",
    "mailinator.com", "throwaway.email"
  ];

  const domain = email.split("@")[1]?.toLowerCase();
  if (domain && disposableDomains.includes(domain)) {
    return { 
      valid: false, 
      message: "Please use a permanent email address" 
    };
  }

  return { valid: true };
}

// Age validation
export function validateAge(age: number): { valid: boolean; message?: string } {
  if (age < 18) {
    return { valid: false, message: "You must be at least 18 years old" };
  }

  if (age > 120) {
    return { valid: false, message: "Please enter a valid age" };
  }

  return { valid: true };
}

// Debounce utility for username availability check
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Generate secure random string for guest sessions
export function generateSecureId(length: number = 16): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

// Format time remaining for guest sessions
export function formatTimeRemaining(expiresAt: number): string {
  const now = Date.now();
  const remaining = expiresAt - now;
  
  if (remaining <= 0) {
    return "Expired";
  }
  
  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  } else {
    return `${minutes}m remaining`;
  }
}
