"use client";

import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { checkPasswordStrength } from "@/lib/utils/auth";
import { PasswordStrength } from "@/lib/types/auth";
import { CheckCircle, XCircle } from "lucide-react";

interface PasswordStrengthIndicatorProps {
  password: string;
  showFeedback?: boolean;
}

const strengthColors: Record<PasswordStrength, string> = {
  weak: "bg-red-500",
  fair: "bg-orange-500", 
  good: "bg-yellow-500",
  strong: "bg-green-500",
};

const strengthLabels: Record<PasswordStrength, string> = {
  weak: "Weak",
  fair: "Fair",
  good: "Good", 
  strong: "Strong",
};

const strengthVariants: Record<PasswordStrength, "destructive" | "secondary" | "default" | "outline"> = {
  weak: "destructive",
  fair: "secondary",
  good: "default",
  strong: "default",
};

export function PasswordStrengthIndicator({ 
  password, 
  showFeedback = true 
}: PasswordStrengthIndicatorProps) {
  if (!password) {
    return null;
  }

  const result = checkPasswordStrength(password);
  const progressValue = (result.score / 5) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">Password strength</span>
        <Badge variant={strengthVariants[result.strength]} className="text-xs">
          {strengthLabels[result.strength]}
        </Badge>
      </div>
      
      <Progress 
        value={progressValue} 
        className="h-2"
        // Apply custom color based on strength
        style={{
          background: "var(--muted)",
        }}
      />
      
      {showFeedback && result.feedback.length > 0 && (
        <div className="space-y-1">
          <p className="text-xs text-muted-foreground">Suggestions:</p>
          <ul className="space-y-1">
            {result.feedback.map((feedback, index) => (
              <li key={index} className="flex items-center space-x-2 text-xs">
                <XCircle className="h-3 w-3 text-muted-foreground" />
                <span className="text-muted-foreground">{feedback}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {result.strength === "strong" && (
        <div className="flex items-center space-x-2 text-xs text-green-600 dark:text-green-400">
          <CheckCircle className="h-3 w-3" />
          <span>Great! Your password is strong</span>
        </div>
      )}
    </div>
  );
}
