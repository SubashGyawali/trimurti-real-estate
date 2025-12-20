"use client";

import { ArrowUpDown } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePropertyFilters } from "@/hooks/use-property-filters";
import { cn } from "@/lib/utils";

const SORT_OPTIONS = [
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "area_asc", label: "Area: Small to Large" },
  { value: "area_desc", label: "Area: Large to Small" },
] as const;

interface SortDropdownProps {
  className?: string;
}

export function SortDropdown({ className }: SortDropdownProps) {
  const { filters, setFilter } = usePropertyFilters();

  return (
    <Select
      value={filters.sort_by || "newest"}
      onValueChange={(value) =>
        setFilter("sort_by", value as typeof filters.sort_by)
      }
    >
      <SelectTrigger className={cn("w-[180px]", className)}>
        <ArrowUpDown className="mr-2 h-4 w-4 shrink-0" />
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        {SORT_OPTIONS.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
