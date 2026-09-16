"use client";

import { useMemo } from "react";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { checkPasswordStrength, type PasswordStrength } from "@/lib/validations/auth";

interface PasswordStrengthIndicatorProps {
  password: string;
  showRequirements?: boolean;
}

const strengthColors: Record<PasswordStrength["label"], string> = {
  weak: "bg-status-error",
  fair: "bg-status-warning",
  good: "bg-yellow-500",
  strong: "bg-status-success",
};

const strengthLabels: Record<PasswordStrength["label"], string> = {
  weak: "Weak",
  fair: "Fair",
  good: "Good",
  strong: "Strong",
};

export function PasswordStrengthIndicator({
  password,
  showRequirements = true,
}: PasswordStrengthIndicatorProps) {
  const strength = useMemo(() => checkPasswordStrength(password), [password]);

  if (!password) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Strength Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Password strength</span>
          <span
            className={cn(
              "text-xs font-medium",
              strength.label === "weak" && "text-status-error",
              strength.label === "fair" && "text-status-warning",
              strength.label === "good" && "text-yellow-600",
              strength.label === "strong" && "text-status-success"
            )}
          >
            {strengthLabels[strength.label]}
          </span>
        </div>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={cn(
                "h-1.5 flex-1 rounded-full transition-colors",
                strength.score >= level
                  ? strengthColors[strength.label]
                  : "bg-muted"
              )}
            />
          ))}
        </div>
      </div>

      {/* Requirements Checklist */}
      {showRequirements && (
        <div className="space-y-1.5">
          <RequirementItem
            met={strength.requirements.minLength}
            text="At least 8 characters"
          />
          <RequirementItem
            met={strength.requirements.hasUpperCase}
            text="One uppercase letter"
          />
          <RequirementItem
            met={strength.requirements.hasLowerCase}
            text="One lowercase letter"
          />
          <RequirementItem
            met={strength.requirements.hasNumber}
            text="One number"
          />
        </div>
      )}
    </div>
  );
}

function RequirementItem({ met, text }: { met: boolean; text: string }) {
  return (
    <div className="flex items-center gap-2">
      {met ? (
        <Check className="h-3.5 w-3.5 text-status-success" />
      ) : (
        <X className="h-3.5 w-3.5 text-muted-foreground" />
      )}
      <span
        className={cn(
          "text-xs",
          met ? "text-status-success" : "text-muted-foreground"
        )}
      >
        {text}
      </span>
    </div>
  );
}
