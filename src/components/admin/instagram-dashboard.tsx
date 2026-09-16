'use client';

import { useState, useMemo } from 'react';
import { Bot, MessageSquare, Settings2, Sparkles } from 'lucide-react';

import { StatsGrid } from './stats-grid';
import { InstagramCommentsTable } from './instagram-comments-table';
import { TeachPanel } from './instagram-teach-panel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import type { InstagramCommentCategory, InstagramCommentStatus, InstagramAgentComment, InstagramAgentTeaching } from '@/types/database';

interface InstagramDashboardProps {
    comments: InstagramAgentComment[];
    teachings: InstagramAgentTeaching[];
}

// Map grouped filter values to actual status filters
function resolveFilter(filter: string | null): 'all' | InstagramCommentStatus {
    if (!filter) return 'all';
    // Direct status values
    const validStatuses: InstagramCommentStatus[] = ['pending', 'queued', 'awaiting_approval', 'approved', 'sent', 'failed', 'ignored'];
    if (validStatuses.includes(filter as InstagramCommentStatus)) {
        return filter as InstagramCommentStatus;
    }
    // Grouped values are handled differently — they don't map to a single status
    return 'all';
}

export function InstagramDashboard({ comments, teachings }: InstagramDashboardProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<'all' | InstagramCommentCategory>('all');
    const [activeStatsFilter, setActiveStatsFilter] = useState<string | null>(null);

    // Compute status filter from stats card clicks
    const statusFilter = resolveFilter(activeStatsFilter);

    // For grouped filters (attention, pipeline), we filter manually
    const effectiveStatusFilter = activeStatsFilter === 'attention' || activeStatsFilter === 'pipeline'
        ? 'all' as const
        : statusFilter;

    const setStatusFilter = (value: 'all' | InstagramCommentStatus) => {
        if (value === 'all') {
            setActiveStatsFilter(null);
        } else {
            setActiveStatsFilter(value);
        }
    };

    // Compute stats
    const stats = useMemo(() => {
        const totalCount = comments.length;
        const pendingCount = comments.filter(c => c.status === 'pending').length;
        const sentCount = comments.filter(c => c.status === 'sent').length;
        const queuedCount = comments.filter(c => c.status === 'queued').length;
        const awaitingApprovalCount = comments.filter(c => c.status === 'awaiting_approval').length;
        const approvedCount = comments.filter(c => c.status === 'approved').length;
        const ignoredCount = comments.filter(c => c.status === 'ignored').length;
        const failedCount = comments.filter(c => c.status === 'failed').length;

        return { totalCount, pendingCount, sentCount, queuedCount, awaitingApprovalCount, approvedCount, ignoredCount, failedCount };
    }, [comments]);

    const activeTeachingsCount = useMemo(() => teachings.filter(t => t.is_active).length, [teachings]);

    // Additional filter for grouped stats
    const commentsForTable = useMemo(() => {
        if (activeStatsFilter === 'attention') {
            return comments.filter(c => c.status === 'awaiting_approval' || c.status === 'failed');
        }
        if (activeStatsFilter === 'pipeline') {
            return comments.filter(c => c.status === 'queued' || c.status === 'approved');
        }
        return comments;
    }, [comments, activeStatsFilter]);

    return (
        <div className="min-w-0 space-y-6">
            <div className="flex flex-col gap-5 border-b pb-6 lg:flex-row lg:items-end lg:justify-between">
                <div>
                    <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                        <Bot className="h-4 w-4 text-primary" />
                        Instagram operations
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight">AI comment control center</h1>
                    <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                        Review automation decisions, keep replies on-brand, and intervene only where human judgment matters.
                    </p>
                </div>
                <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span><strong className="text-foreground">{activeTeachingsCount}</strong> active agent rules</span>
                </div>
            </div>

            {/* Stats */}
            <StatsGrid
                {...stats}
                activeFilter={activeStatsFilter}
                onFilterClick={setActiveStatsFilter}
            />

            <Tabs defaultValue="comments" className="w-full">
                <div className="flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto bg-transparent p-0 sm:w-auto">
                        <TabsTrigger value="comments" className="gap-2 rounded-md border bg-background px-4 py-2 data-[state=active]:border-primary/40 data-[state=active]:bg-primary/5">
                            <MessageSquare className="h-4 w-4" /> All activity <span className="text-muted-foreground">{stats.totalCount}</span>
                        </TabsTrigger>
                        <TabsTrigger value="approvals" className="gap-2 rounded-md border bg-background px-4 py-2 data-[state=active]:border-status-warning/30 data-[state=active]:bg-status-warning/10">
                            Needs approval <span className="text-status-warning">{stats.awaitingApprovalCount}</span>
                        </TabsTrigger>
                        <TabsTrigger value="queue" className="gap-2 rounded-md border bg-background px-4 py-2 data-[state=active]:border-status-info/30 data-[state=active]:bg-status-info/10">
                            Queued <span className="text-status-info">{stats.queuedCount}</span>
                        </TabsTrigger>
                        <TabsTrigger value="teachings" className="gap-2 rounded-md border bg-background px-4 py-2 data-[state=active]:border-status-warning/30 data-[state=active]:bg-status-warning/10">
                            <Settings2 className="h-4 w-4" /> Agent rules
                        </TabsTrigger>
                    </TabsList>
                </div>

                <TabsContent value="comments" className="mt-5">
                    <InstagramCommentsTable initialComments={commentsForTable} searchTerm={searchTerm} setSearchTerm={setSearchTerm} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} statusFilter={effectiveStatusFilter} setStatusFilter={setStatusFilter} />
                </TabsContent>
                <TabsContent value="approvals" className="mt-5">
                    <InstagramCommentsTable initialComments={comments.filter(comment => comment.status === 'awaiting_approval')} searchTerm={searchTerm} setSearchTerm={setSearchTerm} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} statusFilter="awaiting_approval" setStatusFilter={setStatusFilter} />
                </TabsContent>
                <TabsContent value="queue" className="mt-5">
                    <InstagramCommentsTable initialComments={comments.filter(comment => comment.status === 'queued' || comment.status === 'approved')} searchTerm={searchTerm} setSearchTerm={setSearchTerm} categoryFilter={categoryFilter} setCategoryFilter={setCategoryFilter} statusFilter="all" setStatusFilter={setStatusFilter} />
                </TabsContent>
                <TabsContent value="teachings" className="mt-5">
                    <TeachPanel initialTeachings={teachings} activeCount={activeTeachingsCount} />
                </TabsContent>
            </Tabs>
        </div>
    );
}
