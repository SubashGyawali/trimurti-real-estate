"use client";

import { Button } from "@/components/ui/button";
import { Inter, Plus_Jakarta_Sans } from "next/font/google"; // Import fonts again as this replaces root layout
import "./globals.css";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
});

const plusJakartaSans = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-plus-jakarta",
});

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html lang="en" className={`${inter.variable} ${plusJakartaSans.variable}`}>
            <body className={inter.className}>
                <div className="flex h-screen flex-col items-center justify-center gap-4 text-center">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tighter sm:text-6xl text-red-600">
                            System Error
                        </h1>
                        <h2 className="text-2xl font-semibold tracking-tight">
                            Something went wrong globally
                        </h2>
                        <p className="text-muted-foreground max-w-[500px] mx-auto">
                            A critical error occurred. Please try refreshing the page.
                        </p>
                    </div>
                    <Button onClick={() => reset()} variant="default" size="lg">
                        Try again
                    </Button>
                </div>
            </body>
        </html>
    );
}
