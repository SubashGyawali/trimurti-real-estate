"use client";

import { MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const WHATSAPP_NUMBER = "919819446163";
const DEFAULT_MESSAGE = "Hello! I'm interested in learning more about properties.";

interface WhatsAppButtonProps {
  message?: string;
  propertyTitle?: string;
  className?: string;
}

export function WhatsAppButton({
  message,
  propertyTitle,
  className,
}: WhatsAppButtonProps) {
  const handleClick = () => {
    let text = message || DEFAULT_MESSAGE;
    if (propertyTitle) {
      text = `Hello! I'm interested in the property: ${propertyTitle}`;
    }
    const encodedMessage = encodeURIComponent(text);
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <button
      onClick={handleClick}
      style={{ animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}
      className={cn(
        "hidden md:flex fixed bottom-6 right-6 z-50",
        "h-14 w-14 items-center justify-center",
        "rounded-full bg-[#25D366] text-white shadow-lg",
        "transition-all duration-300 ease-in-out",
        "hover:scale-110 hover:shadow-xl",
        "focus:outline-none focus:ring-2 focus:ring-[#25D366] focus:ring-offset-2",
        "hover:!animate-none",
        className
      )}
      aria-label="Contact us on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" fill="currentColor" />
    </button>
  );
}
