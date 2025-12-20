import { z } from "zod";

const envSchema = z.object({
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),

  // Optional: Supabase Service Role Key (for admin operations)
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1).optional(),

  // Resend (for emails)
  RESEND_API_KEY: z.string().min(1).optional(),

  // Admin email used for simple admin check
  NEXT_PUBLIC_ADMIN_EMAIL: z.string().email().optional(),

  // Node environment
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Site URL
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
});

export type Env = z.infer<typeof envSchema>;

// Validate environment variables
function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues.map((issue) => issue.path.join("."));
      throw new Error(
        `Missing or invalid environment variables: ${missingVars.join(", ")}\n` +
        "Please check your .env.local file."
      );
    }
    throw error;
  }
}

// Export validated environment variables
// Note: Validation is skipped during build if env vars are not set
// This allows the project to build during initial setup
let env: Env;

try {
  env = validateEnv();
} catch (error) {
  // During build time without env vars, use defaults
  console.warn("Environment variables not fully configured. Using defaults for build.");
  env = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-key",
    NODE_ENV: (process.env.NODE_ENV as "development" | "production" | "test") || "development",
  } as Env;
}

export { env };
