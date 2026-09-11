"use client";

import Link from "next/link";
import { useState } from "react";
import { BookmarkCheck, Clock3, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { signInWithGoogle } from "@/lib/supabase/auth";

interface AuthPromptProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnPath: string;
}

const benefits = [
  { icon: BookmarkCheck, text: "Save your favourite properties" },
  { icon: Clock3, text: "Pick up your shortlist whenever you return" },
  { icon: ShieldCheck, text: "Sign in securely with Google" },
];

export function AuthPrompt({
  open,
  onOpenChange,
  returnPath,
}: AuthPromptProps) {
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const loginHref = `/login?redirect=${encodeURIComponent(returnPath)}`;

  const handleGoogleSignIn = async () => {
    setIsGoogleLoading(true);

    try {
      const result = await signInWithGoogle(returnPath);
      if (!result.success) {
        throw new Error(result.error);
      }
      // The browser is redirected to Google after Supabase accepts the request.
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Unable to sign in with Google"
      );
      setIsGoogleLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden border-slate-200 p-0 shadow-2xl sm:rounded-2xl">
        <div className="h-1.5 bg-gradient-to-r from-[#1a4b8c] via-[#2d6fbd] to-[#5e9de6]" />
        <div className="p-6 sm:p-7">
          <DialogHeader className="pr-7 text-left">
            <DialogTitle className="font-plus-jakarta text-2xl font-bold text-[#0a1628]">
              Save properties you love
            </DialogTitle>
            <DialogDescription className="mt-2 leading-relaxed text-slate-600">
              Sign in with Google to create your free account and keep your
              shortlist in one place.
            </DialogDescription>
          </DialogHeader>

          <div className="my-6 space-y-3 rounded-xl bg-slate-50 p-4">
            {benefits.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-3 text-sm text-slate-700">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1a4b8c]/10 text-[#1a4b8c]">
                  <Icon className="h-4 w-4" />
                </div>
                <span>{text}</span>
              </div>
            ))}
          </div>

          <Button
            type="button"
            size="lg"
            className="w-full bg-[#1a4b8c] hover:bg-[#153d73]"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading}
          >
            {isGoogleLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <GoogleIcon />
            )}
            Continue with Google
          </Button>

          <p className="mt-4 text-center text-sm text-slate-500">
            Prefer email?{" "}
            <Link
              href={loginHref}
              className="font-medium text-[#1a4b8c] underline-offset-4 hover:underline"
            >
              Use email instead
            </Link>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function GoogleIcon() {
  return (
    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M21.35 12.27c0-.78-.07-1.53-.2-2.24H12v4.24h5.22a4.46 4.46 0 0 1-1.93 2.93v2.77h3.14c1.84-1.7 2.92-4.2 2.92-7.7Z" />
      <path fill="#34A853" d="M12 21.72c2.64 0 4.86-.88 6.48-2.4l-3.14-2.77c-.88.59-2  .94-3.34.94-2.57 0-4.75-1.73-5.53-4.06H3.24v2.86A9.78 9.78 0 0 0 12 21.72Z" />
      <path fill="#FBBC05" d="M6.47 13.43A5.86 5.86 0 0 1 6.16 12c0-.5.1-.98.31-1.43V7.71H3.24A9.72 9.72 0 0 0 2.22 12c0 1.57.38 3.06 1.02 4.29l3.23-2.86Z" />
      <path fill="#EA4335" d="M12 6.51c1.44 0 2.73.5 3.75 1.48l2.81-2.81C16.86 3.61 14.64 2.28 12 2.28a9.78 9.78 0 0 0-8.76 5.43l3.23 2.86C7.25 8.24 9.43 6.51 12 6.51Z" />
    </svg>
  );
}
