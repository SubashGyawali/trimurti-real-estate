"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";
import { useAuthContext } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";

interface AdminEditButtonProps {
  propertyId: string;
}

export function AdminEditButton({ propertyId }: AdminEditButtonProps) {
  const { isAdmin } = useAuthContext();

  if (!isAdmin) return null;

  return (
    <Button asChild size="sm" variant="outline" className="gap-1.5">
      <Link href={`/admin/properties/${propertyId}/edit`}>
        <Pencil className="h-3.5 w-3.5" />
        Edit Property
      </Link>
    </Button>
  );
}
