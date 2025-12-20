"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  number: number;
  label: string;
  shortLabel?: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (step: number) => void;
  allowNavigation?: boolean;
}

export function StepIndicator({
  steps,
  currentStep,
  onStepClick,
  allowNavigation = false,
}: StepIndicatorProps) {
  const handleStepClick = (stepNumber: number) => {
    if (allowNavigation && onStepClick && stepNumber < currentStep) {
      onStepClick(stepNumber);
    }
  };

  return (
    <div className="w-full">
      {/* Desktop view */}
      <div className="hidden sm:flex items-center justify-between">
        {steps.map((step, index) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isClickable = allowNavigation && step.number < currentStep;

          return (
            <div key={step.number} className="flex items-center flex-1">
              {/* Step circle and label */}
              <div
                className={cn(
                  "flex flex-col items-center",
                  isClickable && "cursor-pointer"
                )}
                onClick={() => handleStepClick(step.number)}
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all",
                    isCompleted &&
                      "border-primary bg-primary text-primary-foreground",
                    isCurrent &&
                      "border-primary bg-primary/10 text-primary",
                    !isCompleted &&
                      !isCurrent &&
                      "border-muted-foreground/30 text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className={cn(
                    "mt-2 text-xs font-medium text-center max-w-[80px]",
                    isCurrent && "text-primary",
                    !isCurrent && "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="flex-1 mx-2">
                  <div
                    className={cn(
                      "h-0.5 w-full transition-colors",
                      step.number < currentStep
                        ? "bg-primary"
                        : "bg-muted-foreground/30"
                    )}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile view - compact */}
      <div className="flex sm:hidden items-center justify-center gap-2">
        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const isClickable = allowNavigation && step.number < currentStep;

          return (
            <div
              key={step.number}
              className={cn(
                "flex items-center justify-center rounded-full transition-all",
                isCurrent ? "h-8 w-8" : "h-3 w-3",
                isCompleted && "bg-primary",
                isCurrent && "bg-primary text-primary-foreground",
                !isCompleted && !isCurrent && "bg-muted-foreground/30",
                isClickable && "cursor-pointer"
              )}
              onClick={() => handleStepClick(step.number)}
            >
              {isCurrent && (
                <span className="text-xs font-semibold">{step.number}</span>
              )}
              {isCompleted && !isCurrent && (
                <Check className="h-2 w-2 text-primary-foreground" />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile step label */}
      <div className="sm:hidden mt-3 text-center">
        <span className="text-sm font-medium text-primary">
          Step {currentStep}:
        </span>{" "}
        <span className="text-sm text-muted-foreground">
          {steps.find((s) => s.number === currentStep)?.label}
        </span>
      </div>
    </div>
  );
}
