import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
    icon?: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    actionHref?: string;
    onAction?: () => void;
    className?: string;
}

export function EmptyState({
    icon: Icon,
    title,
    description,
    actionLabel,
    actionHref,
    onAction,
    className,
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-12 text-center rounded-lg border border-dashed bg-muted/20 ${className}`}>
            {Icon && (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted shadow-sm mb-4">
                    <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
            )}
            <h3 className="text-xl font-semibold tracking-tight">{title}</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm">
                {description}
            </p>
            {actionLabel && (
                <div className="mt-8">
                    {actionHref ? (
                        <Button asChild variant="outline">
                            <Link href={actionHref}>{actionLabel}</Link>
                        </Button>
                    ) : onAction ? (
                        <Button onClick={onAction} variant="outline">
                            {actionLabel}
                        </Button>
                    ) : null}
                </div>
            )}
        </div>
    );
}
