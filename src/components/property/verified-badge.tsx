import { Badge } from "@/components/ui/badge"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface VerifiedBadgeProps {
  className?: string
  showText?: boolean
}

export function VerifiedBadge({ className, showText = true }: VerifiedBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant="secondary" 
            className={cn(
              "gap-1 bg-status-info/10 text-status-info hover:bg-status-info/20 border-status-info/20 cursor-help transition-colors", 
              className
            )}
          >
            <ShieldCheck className="h-3.5 w-3.5" />
            {showText && <span>Verified</span>}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Verified Listing: Vetted by Trimurti Real Estate</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}