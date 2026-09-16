'use client';

import { Instagram, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { InstagramCommentStatus } from '@/types/database';

interface StatsGridProps {
    totalCount: number;
    sentCount: number;
    queuedCount: number;
    awaitingApprovalCount: number;
    approvedCount: number;
    ignoredCount: number;
    failedCount: number;
    pendingCount: number;
    activeFilter: string | null;
    onFilterClick: (filter: string | null) => void;
}

const primaryCards = [
    {
        label: 'Total Comments',
        icon: Instagram,
        color: 'text-brand-blue',
        bg: 'bg-brand-blue/10',
        border: 'border-brand-blue/20',
        filterValue: null,
        getCount: (p: StatsGridProps) => p.totalCount,
    },
    {
        label: 'Replied',
        icon: CheckCircle,
        color: 'text-status-success',
        bg: 'bg-status-success/10',
        border: 'border-status-success/20',
        filterValue: 'sent',
        getCount: (p: StatsGridProps) => p.sentCount,
    },
    {
        label: 'Needs Attention',
        icon: AlertTriangle,
        color: 'text-status-warning',
        bg: 'bg-status-warning/10',
        border: 'border-status-warning/20',
        filterValue: 'attention',
        getCount: (p: StatsGridProps) => p.awaitingApprovalCount + p.failedCount,
    },
    {
        label: 'In Pipeline',
        icon: Clock,
        color: 'text-violet-600 dark:text-violet-400',
        bg: 'bg-violet-50 dark:bg-violet-950/40',
        border: 'border-violet-200 dark:border-violet-800',
        filterValue: 'pipeline',
        getCount: (p: StatsGridProps) => p.queuedCount + p.approvedCount,
    },
] as const;

const statusPills: { label: string; key: InstagramCommentStatus; color: string; border: string }[] = [
    { label: 'Pending', key: 'pending', color: 'bg-status-warning/10 text-status-warning', border: 'border-status-warning/20' },
    { label: 'Queued', key: 'queued', color: 'bg-status-info/10 text-status-info', border: 'border-status-info/20' },
    { label: 'Approval', key: 'awaiting_approval', color: 'bg-violet-100 text-violet-700 dark:bg-violet-950/40 dark:text-violet-300', border: 'border-violet-200 dark:border-violet-800' },
    { label: 'Approved', key: 'approved', color: 'bg-teal-100 text-teal-700 dark:bg-teal-950/40 dark:text-teal-300', border: 'border-teal-200 dark:border-teal-800' },
    { label: 'Sent', key: 'sent', color: 'bg-status-success/10 text-status-success', border: 'border-status-success/20' },
    { label: 'Failed', key: 'failed', color: 'bg-status-error/10 text-status-error', border: 'border-status-error/20' },
    { label: 'Ignored', key: 'ignored', color: 'bg-muted text-muted-foreground', border: 'border-border' },
];

const pillCountMap: Record<string, (p: StatsGridProps) => number> = {
    pending: (p) => p.pendingCount,
    queued: (p) => p.queuedCount,
    awaiting_approval: (p) => p.awaitingApprovalCount,
    approved: (p) => p.approvedCount,
    sent: (p) => p.sentCount,
    failed: (p) => p.failedCount,
    ignored: (p) => p.ignoredCount,
};

export function StatsGrid(props: StatsGridProps) {
    const { activeFilter, onFilterClick } = props;

    return (
        <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {primaryCards.map((card) => {
                    const count = card.getCount(props);
                    const isActive = activeFilter === card.filterValue;
                    const isAttention = card.filterValue === 'attention' && count > 0;

                    return (
                        <button
                            key={card.label}
                            onClick={() => onFilterClick(isActive ? null : (card.filterValue ?? null))}
                            className={cn(
                                'group relative overflow-hidden rounded-xl border bg-background p-4 text-left transition-all hover:shadow-md',
                                isActive && 'ring-2 ring-primary shadow-md border-primary',
                                isAttention && !isActive && 'border-status-warning/30 bg-status-warning/10 animate-pulse-subtle',
                                card.border
                            )}
                            style={{ minHeight: '100px' }}
                        >
                            <div className="flex items-start justify-between">
                                <div className="min-w-0">
                                    <p className="text-xs font-medium text-muted-foreground truncate">
                                        {card.label}
                                    </p>
                                    <p className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{count}</p>
                                </div>
                                <div
                                    className={cn(
                                        'flex-shrink-0 h-10 w-10 items-center justify-center rounded-lg',
                                        card.bg
                                    )}
                                >
                                    <card.icon className={cn('h-5 w-5', card.color)} />
                                </div>
                            </div>
                            {isActive && (
                                <div className="mt-2 text-xs font-medium text-primary flex items-center gap-1">
                                    <span className="relative top-[1px] h-1.5 w-1.5 rounded-full bg-primary" />
                                    Filtered · Click to clear
                                </div>
                            )}
                            {isAttention && !isActive && count > 0 && (
                                <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-status-warning animate-pulse" />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-wrap items-center gap-2 px-1">
                {statusPills.map((pill) => {
                    const count = pillCountMap[pill.key](props);
                    const isActive = activeFilter === pill.key;

                    return (
                        <button
                            key={pill.key}
                            onClick={() => onFilterClick(isActive ? null : pill.key)}
                            className={cn(
                                'inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-all border',
                                pill.color,
                                pill.border,
                                isActive && 'ring-2 ring-primary ring-offset-1 shadow-sm',
                                count === 0 && 'opacity-40',
                                'hover:shadow-sm'
                            )}
                        >
                            {pill.label}
                            <span className={cn('font-bold', isActive ? 'text-foreground' : '')}>{count}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}