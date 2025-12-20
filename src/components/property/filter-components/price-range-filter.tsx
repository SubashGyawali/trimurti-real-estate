"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { formatPrice } from "../price-display";
import type { ListingType } from "@/types";
import { cn } from "@/lib/utils";

// Price ranges by listing type
const RENT_RANGE = { min: 5000, max: 50000, step: 1000 };
const SALE_RANGE = { min: 1000000, max: 20000000, step: 500000 };

// Quick presets
const RENT_PRESETS = [
  { label: "Under ₹15k", min: undefined, max: 15000 },
  { label: "₹15-25k", min: 15000, max: 25000 },
  { label: "₹25-35k", min: 25000, max: 35000 },
  { label: "₹35k+", min: 35000, max: undefined },
];

const SALE_PRESETS = [
  { label: "Under ₹30L", min: undefined, max: 3000000 },
  { label: "₹30-50L", min: 3000000, max: 5000000 },
  { label: "₹50L-1Cr", min: 5000000, max: 10000000 },
  { label: "₹1Cr+", min: 10000000, max: undefined },
];

interface PriceRangeFilterProps {
  minPrice?: number;
  maxPrice?: number;
  listingType?: ListingType;
  onMinChange: (value: number | undefined) => void;
  onMaxChange: (value: number | undefined) => void;
  className?: string;
}

export function PriceRangeFilter({
  minPrice,
  maxPrice,
  listingType,
  onMinChange,
  onMaxChange,
  className,
}: PriceRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [localMin, setLocalMin] = useState<string>("");
  const [localMax, setLocalMax] = useState<string>("");

  // Determine range based on listing type
  const range = listingType === "sale" ? SALE_RANGE : RENT_RANGE;
  const presets = listingType === "sale" ? SALE_PRESETS : RENT_PRESETS;
  const effectiveListingType = listingType || "rent";

  // Sync local state with props
  useEffect(() => {
    setLocalMin(minPrice?.toString() || "");
    setLocalMax(maxPrice?.toString() || "");
  }, [minPrice, maxPrice]);

  const handleSliderChange = (values: number[]) => {
    const [min, max] = values;
    onMinChange(min === range.min ? undefined : min);
    onMaxChange(max === range.max ? undefined : max);
  };

  const handleMinInputChange = (value: string) => {
    setLocalMin(value);
    const num = parseInt(value, 10);
    if (!value) {
      onMinChange(undefined);
    } else if (!isNaN(num)) {
      onMinChange(num);
    }
  };

  const handleMaxInputChange = (value: string) => {
    setLocalMax(value);
    const num = parseInt(value, 10);
    if (!value) {
      onMaxChange(undefined);
    } else if (!isNaN(num)) {
      onMaxChange(num);
    }
  };

  const handlePreset = (preset: (typeof RENT_PRESETS)[0]) => {
    onMinChange(preset.min);
    onMaxChange(preset.max);
  };

  const clearPrice = () => {
    onMinChange(undefined);
    onMaxChange(undefined);
  };

  const hasValue = minPrice !== undefined || maxPrice !== undefined;

  const getLabel = () => {
    if (!hasValue) return "Price";
    if (minPrice && maxPrice) {
      return `${formatPrice(minPrice, effectiveListingType)} - ${formatPrice(maxPrice, effectiveListingType)}`;
    }
    if (minPrice) {
      return `${formatPrice(minPrice, effectiveListingType)}+`;
    }
    if (maxPrice) {
      return `Up to ${formatPrice(maxPrice, effectiveListingType)}`;
    }
    return "Price";
  };

  const sliderValue = [
    minPrice ?? range.min,
    maxPrice ?? range.max,
  ];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between",
            hasValue && "border-primary text-primary",
            className
          )}
        >
          <span className="truncate">{getLabel()}</span>
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-4" align="start">
        <div className="space-y-4">
          {/* Quick presets */}
          <div className="flex flex-wrap gap-2">
            {presets.map((preset, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className={cn(
                  "text-xs",
                  minPrice === preset.min &&
                    maxPrice === preset.max &&
                    "bg-primary text-primary-foreground"
                )}
                onClick={() => handlePreset(preset)}
              >
                {preset.label}
              </Button>
            ))}
          </div>

          {/* Slider */}
          <div className="px-2">
            <Slider
              value={sliderValue}
              min={range.min}
              max={range.max}
              step={range.step}
              onValueChange={handleSliderChange}
              className="my-4"
            />
          </div>

          {/* Manual inputs */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Min</Label>
              <Input
                type="number"
                placeholder={range.min.toString()}
                value={localMin}
                onChange={(e) => handleMinInputChange(e.target.value)}
                className="mt-1"
              />
            </div>
            <span className="mt-6 text-muted-foreground">-</span>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Max</Label>
              <Input
                type="number"
                placeholder={range.max.toString()}
                value={localMax}
                onChange={(e) => handleMaxInputChange(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {hasValue && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-muted-foreground"
              onClick={clearPrice}
            >
              Clear price filter
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
