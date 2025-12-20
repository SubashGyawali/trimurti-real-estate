"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { PROPERTY_TYPE_OPTIONS } from "@/types/forms";
import type { PropertyType } from "@/types";
import { cn } from "@/lib/utils";

interface PropertyTypeSelectProps {
  value?: PropertyType[];
  onChange: (value: PropertyType[] | undefined) => void;
  className?: string;
}

export function PropertyTypeSelect({
  value = [],
  onChange,
  className,
}: PropertyTypeSelectProps) {
  const [open, setOpen] = useState(false);

  const handleToggle = (type: PropertyType) => {
    const newValue = value.includes(type)
      ? value.filter((v) => v !== type)
      : [...value, type];
    onChange(newValue.length > 0 ? newValue : undefined);
  };

  const getLabel = () => {
    if (value.length === 0) return "Property Type";
    if (value.length === 1) {
      const option = PROPERTY_TYPE_OPTIONS.find((o) => o.value === value[0]);
      return option?.label || "Property Type";
    }
    return `${value.length} Types`;
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between",
            value.length > 0 && "border-primary text-primary",
            className
          )}
        >
          {getLabel()}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-3" align="start">
        <div className="space-y-3">
          {PROPERTY_TYPE_OPTIONS.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <Checkbox
                id={`type-${option.value}`}
                checked={value.includes(option.value)}
                onCheckedChange={() => handleToggle(option.value)}
              />
              <Label
                htmlFor={`type-${option.value}`}
                className="flex-1 cursor-pointer text-sm font-normal"
              >
                {option.label}
              </Label>
            </div>
          ))}
        </div>
        {value.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-3 w-full text-muted-foreground"
            onClick={() => onChange(undefined)}
          >
            Clear selection
          </Button>
        )}
      </PopoverContent>
    </Popover>
  );
}
