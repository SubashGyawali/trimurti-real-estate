"use client";

import { useState } from "react";
import { Check, ChevronsUpDown, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import type { Building } from "@/types";
import { cn } from "@/lib/utils";

interface BuildingSelectProps {
  value?: string;
  onChange: (value: string | undefined) => void;
  buildings: Building[];
  className?: string;
}

export function BuildingSelect({
  value,
  onChange,
  buildings,
  className,
}: BuildingSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedBuilding = buildings.find((b) => b.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "justify-between",
            value && "border-primary text-primary",
            className
          )}
        >
          <Building2 className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <span className="truncate">
            {selectedBuilding?.name || "Building"}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Search building..." />
          <CommandList>
            <CommandEmpty>No building found.</CommandEmpty>
            <CommandGroup>
              <CommandItem
                value="all"
                onSelect={() => {
                  onChange(undefined);
                  setOpen(false);
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    !value ? "opacity-100" : "opacity-0"
                  )}
                />
                All Buildings
              </CommandItem>
              {buildings.map((building) => (
                <CommandItem
                  key={building.id}
                  value={building.name}
                  onSelect={() => {
                    onChange(building.id);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === building.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{building.name}</span>
                    {building.address && (
                      <span className="text-xs text-muted-foreground">
                        {building.address}
                      </span>
                    )}
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
