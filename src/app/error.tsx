"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 text-center p-4">
            <div className="flex flex-col items-center gap-2">
                <div className="rounded-full bg-status-error/10 p-3">
                    <AlertCircle className="h-10 w-10 text-status-error" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">
                    Something went wrong!
                </h2>
                <p className="text-muted-foreground max-w-[500px]">
                    We apologize for the inconvenience. Please try again later or contact
                    support if the issue persists.
                </p>
            </div>
            <div className="flex gap-4">
                <Button onClick={() => reset()} variant="default">
                    Try again
                </Button>
                <Button
                    onClick={() => (window.location.href = "/")}
                    variant="outline"
                >
                    Go Home
                </Button>
            </div>
        </div>
    );
}
