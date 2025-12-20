import { z } from "zod";

// Password validation regex patterns
const hasUpperCase = /[A-Z]/;
const hasLowerCase = /[a-z]/;
const hasNumber = /[0-9]/;

// Login Schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
  rememberMe: z.boolean(),
});

export type LoginFormData = z.infer<typeof loginSchema>;

// Password strength validation for registration
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .regex(hasUpperCase, "Password must contain at least one uppercase letter")
  .regex(hasLowerCase, "Password must contain at least one lowercase letter")
  .regex(hasNumber, "Password must contain at least one number");

// Register Schema
export const registerSchema = z
  .object({
    full_name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(100, "Name must be less than 100 characters"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    phone: z
      .string()
      .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number")
      .optional()
      .or(z.literal("")),
    password: passwordSchema,
    confirm_password: z.string().min(1, "Please confirm your password"),
    acceptTerms: z.boolean().refine((val) => val === true, {
      message: "You must accept the terms and conditions",
    }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Forgot Password Schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

// Reset Password Schema
export const resetPasswordSchema = z
  .object({
    password: passwordSchema,
    confirm_password: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

// Password strength checker utility
export interface PasswordStrength {
  score: number; // 0-4
  label: "weak" | "fair" | "good" | "strong";
  requirements: {
    minLength: boolean;
    hasUpperCase: boolean;
    hasLowerCase: boolean;
    hasNumber: boolean;
  };
}

export function checkPasswordStrength(password: string): PasswordStrength {
  const requirements = {
    minLength: password.length >= 8,
    hasUpperCase: hasUpperCase.test(password),
    hasLowerCase: hasLowerCase.test(password),
    hasNumber: hasNumber.test(password),
  };

  const score = Object.values(requirements).filter(Boolean).length;

  let label: PasswordStrength["label"];
  if (score <= 1) label = "weak";
  else if (score === 2) label = "fair";
  else if (score === 3) label = "good";
  else label = "strong";

  return { score, label, requirements };
}
