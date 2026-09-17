'use client';

import { useState, useMemo } from 'react';
import { Bot, MessageSquare, Settings2, Sparkles, AlertCircle, CheckCircle, Clock, Instagram } from 'lucide-react';

import { InstagramCommentsTable } from './instagram-comments-table';
import { TeachPanel } from './instagram-teach-panel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useRealtimeComments } from '@/hooks/useRealtimeComments';
import type { InstagramCommentCategory, InstagramCommentStatus, InstagramAgentComment, InstagramAgentTeaching } from '@/types/database';

interface InstagramDashboardProps {
    initialComments: InstagramAgentComment[];
    teachings: InstagramAgentTeaching[];
}

export function InstagramDashboard({ initialComments, teachings }: InstagramDashboardProps) {
    const { comments: realtimeComments, connected, setComments } = useRealtimeComments();
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<'all' | InstagramCommentCategory>('all');
    const [activeTab, setActiveTab] = useState<'all' | 'needs-review' | 'queue' | 'history' | 'rules'>('all');

    // Initialize realtime comments with initial server data
    const comments = realtimeComments.length > 0 ? realtimeComments : initialComments;

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

    // Filter comments based on active tab
    const filteredComments = useMemo(() => {
        switch (activeTab) {
            case 'needs-review':
                return comments.filter(c => c.status === 'awaiting_approval' || c.status === 'failed');
            case 'queue':
                return comments.filter(c => c.status === 'pending' || c.status === 'queued' || c.status === 'approved');
            case 'history':
                return comments.filter(c => c.status === 'sent' || c.status === 'ignored');
            case 'rules':
                return comments;
            default:
                return comments;
        }
    }, [comments, activeTab]);

    // Filter further by search and category
    const displayComments = useMemo(() => {
        return filteredComments.filter(comment => {
            const query = searchTerm.toLowerCase();
            const matchesSearch = [comment.username, comment.comment_text, comment.reply, comment.proposed_reply].filter(Boolean).some(value => value!.toLowerCase().includes(query));
            const matchesCategory = categoryFilter === 'all' || comment.category === categoryFilter;
            return matchesSearch && matchesCategory;
        });
    }, [filteredComments, searchTerm, categoryFilter]);

    const needsReviewCount = stats.awaitingApprovalCount + stats.failedCount;
    const inQueueCount = stats.pendingCount + stats.queuedCount + stats.approvedCount;
    const repliedCount = stats.sentCount;

    return (
        <div className="min-w-0 space-y-6">
            {/* ── Hero / Status Bar ── */}
            <div className="rounded-2xl border bg-card p-5 shadow-sm">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                        <div className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                            <Bot className="h-4 w-4 text-primary" />
                            Instagram AI Agent
                            <span className={cn('px-2 py-0.5 rounded text-xs', connected ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500')}>
                                {connected ? '● Live' : '○ Offline'}
                            </span>
                        </div>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight">
                            {needsReviewCount > 0
                                ? `${needsReviewCount} comment${needsReviewCount === 1 ? '' : 's'} need your review`
                                : 'All caught up — AI is handling comments'}
                        </h1>
                        <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
                            {needsReviewCount > 0
                                ? 'AI drafted replies but needs your approval before posting. One click to approve or edit.'
                                : `${repliedCount} replied · ${inQueueCount} in queue · ${stats.ignoredCount} filtered`}
                        </p>
                    </div>

                    {needsReviewCount > 0 && (
                        <div className="flex items-center gap-3 lg:flex-shrink-0">
                            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-status-warning/30 bg-status-warning/10 px-3 py-1.5 text-xs font-medium text-status-warning">
                                <AlertCircle className="h-3 w-3" />
                                {needsReviewCount} waiting for you
                            </span>
                            <button
                                onClick={() => setActiveTab('needs-review')}
                                className="btn primary gap-2 px-4 py-2"
                            >
                                <AlertCircle className="h-4 w-4" />
                                Review Now
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* ── Quick Stats ── */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard
                    label="Need Review"
                    count={needsReviewCount}
                    icon={AlertCircle}
                    color="text-status-warning"
                    bg="bg-status-warning/10"
                    border="border-status-warning/20"
                    highlight={needsReviewCount > 0}
                    onClick={() => setActiveTab('needs-review')}
                />
                <StatCard
                    label="In Queue"
                    count={inQueueCount}
                    icon={Clock}
                    color="text-primary"
                    bg="bg-primary/10"
                    border="border-primary/20"
                    onClick={() => setActiveTab('queue')}
                />
                <StatCard
                    label="Replied"
                    count={repliedCount}
                    icon={CheckCircle}
                    color="text-status-success"
                    bg="bg-status-success/10"
                    border="border-status-success/20"
                    onClick={() => setActiveTab('history')}
                />
                <StatCard
                    label="Filtered"
                    count={stats.ignoredCount + stats.failedCount}
                    icon={Instagram}
                    color="text-muted-foreground"
                    bg="bg-muted/10"
                    border="border-border"
                    onClick={() => setActiveTab('history')}
                />
            </div>

            {/* ── Active Rules (compact) ── */}
            {activeTeachingsCount > 0 && (
                <div className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                    <Sparkles className="h-4 w-4 text-amber-500" />
                    <span>
                        <strong className="text-foreground">{activeTeachingsCount}</strong> active agent rule{activeTeachingsCount === 1 ? '' : 's'}
                    </span>
                    <button
                        onClick={() => setActiveTab('rules')}
                        className="ml-auto text-xs font-medium text-primary hover:underline"
                    >
                        Manage →
                    </button>
                </div>
            )}

            {/* ── Tab Navigation ── */}
            <Tabs defaultValue={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'needs-review' | 'queue' | 'history' | 'rules')} className="w-full">
                <div className="flex flex-col gap-3 border-b pb-3 sm:flex-row sm:items-center sm:justify-between">
                    <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto bg-transparent p-0 sm:w-auto">
                        <TabsTrigger value="all" className={tabClassName('all')}>
                            <MessageSquare className="h-4 w-4" /> All <span className="text-muted-foreground">{stats.totalCount}</span>
                        </TabsTrigger>
                        <TabsTrigger value="needs-review" className={tabClassName('needs-review')}>
                            <AlertCircle className="h-4 w-4" /> Needs Review <span className="text-status-warning">{needsReviewCount}</span>
                        </TabsTrigger>
                        <TabsTrigger value="queue" className={tabClassName('queue')}>
                            <Clock className="h-4 w-4" /> In Queue <span className="text-primary">{inQueueCount}</span>
                        </TabsTrigger>
                        <TabsTrigger value="history" className={tabClassName('history')}>
                            <CheckCircle className="h-4 w-4" /> History <span className="text-status-success">{repliedCount}</span>
                        </TabsTrigger>
                        <TabsTrigger value="rules" className={tabClassName('rules')}>
                            <Settings2 className="h-4 w-4" /> Rules
                        </TabsTrigger>
                    </TabsList>

                    {/* Search & Filter */}
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end w-full sm:w-auto">
                        <div className="relative min-w-0 flex-1 sm:w-64">
                            <Instagram className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                placeholder="Search username, comment, or reply…"
                                className="border-0 bg-muted/40 pl-10 pr-4 py-2 rounded-lg text-sm shadow-none focus-visible:ring-1 focus-visible:ring-primary w-full"
                            />
                        </div>
                        <select
                            value={categoryFilter}
                            onChange={e => setCategoryFilter(e.target.value as 'all' | InstagramCommentCategory)}
                            className="border bg-background px-3 py-2 rounded-lg text-sm w-full sm:w-40"
                        >
                            <option value="all">All categories</option>
                            <option value="simple">Price/Info</option>
                            <option value="contact">Contact/Visit</option>
                            <option value="ignore">Spam/Ignore</option>
                        </select>
                    </div>
                </div>

                {/* Tab Content */}
                <TabsContent value="all" className="mt-5">
                    <InstagramCommentsTable
                        initialComments={displayComments}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        categoryFilter={categoryFilter}
                        setCategoryFilter={setCategoryFilter}
                        statusFilter="all"
                        setStatusFilter={() => {}}
                    />
                </TabsContent>
                <TabsContent value="needs-review" className="mt-5">
                    <InstagramCommentsTable
                        initialComments={displayComments}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        categoryFilter={categoryFilter}
                        setCategoryFilter={setCategoryFilter}
                        statusFilter="awaiting_approval"
                        setStatusFilter={() => {}}
                    />
                </TabsContent>
                <TabsContent value="queue" className="mt-5">
                    <InstagramCommentsTable
                        initialComments={displayComments}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        categoryFilter={categoryFilter}
                        setCategoryFilter={setCategoryFilter}
                        statusFilter="all"
                        setStatusFilter={() => {}}
                    />
                </TabsContent>
                <TabsContent value="history" className="mt-5">
                    <InstagramCommentsTable
                        initialComments={displayComments}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        categoryFilter={categoryFilter}
                        setCategoryFilter={setCategoryFilter}
                        statusFilter="all"
                        setStatusFilter={() => {}}
                    />
                </TabsContent>
                <TabsContent value="rules" className="mt-5">
                    <TeachPanel initialTeachings={teachings} activeCount={activeTeachingsCount} />
                </TabsContent>
            </Tabs>
        </div>
    );
}

function StatCard({
    label,
    count,
    icon: Icon,
    color,
    bg,
    border,
    highlight = false,
    onClick,
}: {
    label: string;
    count: number;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
    bg: string;
    border: string;
    highlight?: boolean;
    onClick?: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                'group relative overflow-hidden rounded-xl border bg-background p-4 text-left transition-all hover:shadow-md',
                border,
                highlight && 'ring-2 ring-status-warning shadow-md border-status-warning',
                onClick && 'cursor-pointer'
            )}
            style={{ minHeight: '96px' }}
        >
            <div className="flex items-start justify-between">
                <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground truncate">{label}</p>
                    <p className="mt-1.5 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{count}</p>
                </div>
                <div className={cn('flex-shrink-0 h-10 w-10 items-center justify-center rounded-lg', bg)}>
                    <Icon className={cn('h-5 w-5', color)} />
                </div>
            </div>
            {onClick && (
                <div className="mt-3 text-xs font-medium text-primary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Click to filter</span>
                </div>
            )}
        </button>
    );
}

function tabClassName(value: string) {
    const base = 'gap-2 rounded-md border bg-background px-4 py-2 data-[state=active]:border-primary/40 data-[state=active]:bg-primary/5';
    const variants: Record<string, string> = {
        all: base,
        'needs-review': 'gap-2 rounded-md border bg-background px-4 py-2 data-[state=active]:border-status-warning/30 data-[state=active]:bg-status-warning/10',
        queue: 'gap-2 rounded-md border bg-background px-4 py-2 data-[state=active]:border-primary/30 data-[state=active]:bg-primary/10',
        history: 'gap-2 rounded-md border bg-background px-4 py-2 data-[state=active]:border-status-success/30 data-[state=active]:bg-status-success/10',
        rules: 'gap-2 rounded-md border bg-background px-4 py-2 data-[state=active]:border-status-info/30 data-[state=active]:bg-status-info/10',
    };
    return variants[value] || base;
}