"use client";

import { useEffect, useState } from "react";
import { WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export function OfflineIndicator() {
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        function onOffline() {
            setIsOffline(true);
        }

        function onOnline() {
            setIsOffline(false);
        }

        if (typeof window !== "undefined") {
            window.addEventListener("offline", onOffline);
            window.addEventListener("online", onOnline);

            // Initial check
            if (!navigator.onLine) {
                setIsOffline(true);
            }
        }

        return () => {
            window.removeEventListener("offline", onOffline);
            window.removeEventListener("online", onOnline);
        };
    }, []);

    if (!isOffline) return null;

    return (
        <div className="fixed bottom-4 left-4 z-[100] flex items-center gap-2 rounded-md bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground shadow-lg animate-in slide-in-from-bottom-2">
            <WifiOff className="h-4 w-4" />
            <span>You are currently offline</span>
        </div>
    );
}
