"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ListingType } from "@/types";
import { cn } from "@/lib/utils";

interface ListingTypeToggleProps {
  value?: ListingType;
  onChange: (value: ListingType | undefined) => void;
  className?: string;
}

export function ListingTypeToggle({
  value,
  onChange,
  className,
}: ListingTypeToggleProps) {
  const handleChange = (newValue: string) => {
    if (newValue === "all") {
      onChange(undefined);
    } else {
      onChange(newValue as ListingType);
    }
  };

  return (
    <Tabs
      value={value || "all"}
      onValueChange={handleChange}
      className={cn("w-auto", className)}
    >
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="all" className="text-sm">
          All
        </TabsTrigger>
        <TabsTrigger value="rent" className="text-sm">
          Rent
        </TabsTrigger>
        <TabsTrigger value="sale" className="text-sm">
          Sale
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
