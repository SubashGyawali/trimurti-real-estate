"use client";

import { useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { FURNISHING_OPTIONS, BEDROOM_OPTIONS } from "@/types/forms";
import type { FurnishingType } from "@/types";
import { cn } from "@/lib/utils";

// Area range in sq ft
const AREA_RANGE = { min: 200, max: 2000, step: 50 };

interface MoreFiltersPopoverProps {
  furnishing?: FurnishingType[];
  bedrooms?: number[];
  minArea?: number;
  maxArea?: number;
  parking?: boolean;
  onFurnishingChange: (value: FurnishingType[] | undefined) => void;
  onBedroomsChange: (value: number[] | undefined) => void;
  onMinAreaChange: (value: number | undefined) => void;
  onMaxAreaChange: (value: number | undefined) => void;
  onParkingChange: (value: boolean | undefined) => void;
  className?: string;
}

export function MoreFiltersPopover({
  furnishing = [],
  bedrooms = [],
  minArea,
  maxArea,
  parking,
  onFurnishingChange,
  onBedroomsChange,
  onMinAreaChange,
  onMaxAreaChange,
  onParkingChange,
  className,
}: MoreFiltersPopoverProps) {
  const [open, setOpen] = useState(false);

  const handleFurnishingToggle = (type: FurnishingType) => {
    const newValue = furnishing.includes(type)
      ? furnishing.filter((v) => v !== type)
      : [...furnishing, type];
    onFurnishingChange(newValue.length > 0 ? newValue : undefined);
  };

  const handleBedroomToggle = (num: number) => {
    const newValue = bedrooms.includes(num)
      ? bedrooms.filter((v) => v !== num)
      : [...bedrooms, num];
    onBedroomsChange(newValue.length > 0 ? newValue : undefined);
  };

  const handleAreaChange = (values: number[]) => {
    const [min, max] = values;
    onMinAreaChange(min === AREA_RANGE.min ? undefined : min);
    onMaxAreaChange(max === AREA_RANGE.max ? undefined : max);
  };

  const activeCount =
    furnishing.length +
    bedrooms.length +
    (minArea || maxArea ? 1 : 0) +
    (parking ? 1 : 0);

  const clearAll = () => {
    onFurnishingChange(undefined);
    onBedroomsChange(undefined);
    onMinAreaChange(undefined);
    onMaxAreaChange(undefined);
    onParkingChange(undefined);
  };

  const areaValue = [minArea ?? AREA_RANGE.min, maxArea ?? AREA_RANGE.max];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between",
            activeCount > 0 && "border-primary text-primary",
            className
          )}
        >
          <SlidersHorizontal className="mr-2 h-4 w-4" />
          More Filters
          {activeCount > 0 && (
            <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {activeCount}
            </span>
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-4" align="end">
        <div className="space-y-4">
          {/* Furnishing */}
          <div>
            <Label className="text-sm font-medium">Furnishing</Label>
            <div className="mt-2 space-y-2">
              {FURNISHING_OPTIONS.map((option) => (
                <div key={option.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={`furnishing-${option.value}`}
                    checked={furnishing.includes(option.value)}
                    onCheckedChange={() => handleFurnishingToggle(option.value)}
                  />
                  <Label
                    htmlFor={`furnishing-${option.value}`}
                    className="cursor-pointer text-sm font-normal"
                  >
                    {option.label}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Bedrooms */}
          <div>
            <Label className="text-sm font-medium">Bedrooms</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {BEDROOM_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={bedrooms.includes(option.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleBedroomToggle(option.value)}
                >
                  {option.value === 4 ? "4+" : option.value}
                </Button>
              ))}
            </div>
          </div>

          <Separator />

          {/* Area Range */}
          <div>
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Area (sq ft)</Label>
              <span className="text-sm text-muted-foreground">
                {areaValue[0]} - {areaValue[1]} sq ft
              </span>
            </div>
            <Slider
              value={areaValue}
              min={AREA_RANGE.min}
              max={AREA_RANGE.max}
              step={AREA_RANGE.step}
              onValueChange={handleAreaChange}
              className="mt-3"
            />
          </div>

          <Separator />

          {/* Parking */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="parking"
              checked={parking || false}
              onCheckedChange={(checked) =>
                onParkingChange(checked ? true : undefined)
              }
            />
            <Label htmlFor="parking" className="cursor-pointer text-sm font-normal">
              Parking Required
            </Label>
          </div>

          {activeCount > 0 && (
            <>
              <Separator />
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-muted-foreground"
                onClick={clearAll}
              >
                Clear all filters
              </Button>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
