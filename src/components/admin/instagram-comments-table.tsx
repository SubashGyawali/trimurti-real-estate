'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Check, Clock3, EyeOff, ExternalLink, FileText, GraduationCap, Instagram, Loader2, MessageCircle, Pencil, Search, Send, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import type { InstagramAgentComment, InstagramCommentCategory, InstagramCommentStatus } from '@/types/database';

interface Props {
    initialComments: InstagramAgentComment[];
    searchTerm: string;
    setSearchTerm: (value: string) => void;
    categoryFilter: 'all' | InstagramCommentCategory;
    setCategoryFilter: (value: 'all' | InstagramCommentCategory) => void;
    statusFilter: 'all' | InstagramCommentStatus;
    setStatusFilter: (value: 'all' | InstagramCommentStatus) => void;
}

const STATUS: Record<InstagramCommentStatus, { label: string; className: string; icon: typeof Check }> = {
    pending: { label: 'Pending', className: 'border-status-warning/20 bg-status-warning/10 text-status-warning', icon: Clock3 },
    queued: { label: 'Queued', className: 'border-status-info/20 bg-status-info/10 text-status-info', icon: Clock3 },
    awaiting_approval: { label: 'Needs approval', className: 'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300', icon: Clock3 },
    approved: { label: 'Approved', className: 'border-teal-200 bg-teal-50 text-teal-700 dark:border-teal-800 dark:bg-teal-950/40 dark:text-teal-300', icon: Check },
    sent: { label: 'Sent', className: 'border-status-success/20 bg-status-success/10 text-status-success', icon: Send },
    failed: { label: 'Failed', className: 'border-status-error/20 bg-status-error/10 text-status-error', icon: XCircle },
    ignored: { label: 'Ignored', className: 'border-border bg-muted text-muted-foreground', icon: XCircle },
};

const ago = (value: string) => {
    const minutes = Math.floor((Date.now() - new Date(value).getTime()) / 60000);
    return minutes < 1 ? 'just now' : minutes < 60 ? `${minutes}m ago` : minutes < 1440 ? `${Math.floor(minutes / 60)}h ago` : `${Math.floor(minutes / 1440)}d ago`;
};

const until = (value: string | null) => {
    if (!value) return '';
    const minutes = Math.ceil((new Date(value).getTime() - Date.now()) / 60000);
    return minutes <= 0 ? 'sending soon' : minutes < 60 ? `in ${minutes}m` : `in ${Math.floor(minutes / 60)}h ${minutes % 60}m`;
};

function priceLabel(comment: InstagramAgentComment) {
    if (comment.property_price_text) return comment.property_price_text;
    if (!comment.property_price) return null;
    return comment.property_listing_type === 'rent' ? `₹${comment.property_price.toLocaleString('en-IN')}/month` : `₹${(comment.property_price / 100000).toFixed(2)} Lac`;
}

export function InstagramCommentsTable({ initialComments, searchTerm, setSearchTerm, categoryFilter, setCategoryFilter, statusFilter, setStatusFilter }: Props) {
    const [comments, setComments] = useState(initialComments);
    const [selected, setSelected] = useState<InstagramAgentComment | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editReply, setEditReply] = useState('');
    const [processing, setProcessing] = useState<string | null>(null);
    useEffect(() => setComments(initialComments), [initialComments]);

    const filtered = comments.filter(comment => {
        const query = searchTerm.toLowerCase();
        const matchesSearch = [comment.username, comment.comment_text, comment.reply, comment.proposed_reply].filter(Boolean).some(value => value!.toLowerCase().includes(query));
        return matchesSearch && (statusFilter === 'all' || comment.status === statusFilter);
    });

    const update = async (comment: InstagramAgentComment, body: Record<string, string>) => {
        setProcessing(comment.id);
        try {
            const response = await fetch(`/api/admin/instagram/${comment.comment_id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            if (!response.ok) throw new Error();
            const result = await response.json() as { comment?: InstagramAgentComment };
            if (body.action === 'hide') setComments(items => items.filter(item => item.id !== comment.id));
            else if (result.comment) setComments(items => items.map(item => item.id === comment.id ? result.comment! : item));
            setSelected(null);
            setEditingId(null);
            toast.success(body.action === 'hide' ? 'Removed from dashboard' : body.action === 'teach' ? 'Reply added to agent training' : 'Comment updated');
        } catch {
            toast.error('Could not update this comment');
        } finally {
            setProcessing(null);
        }
    };

    const startEdit = (comment: InstagramAgentComment) => {
        setEditingId(comment.id);
        setEditReply(comment.proposed_reply || comment.reply || '');
    };

    const teach = (comment: InstagramAgentComment) => {
        const reply = editReply.trim() || comment.proposed_reply || comment.reply || '';
        if (reply) void update(comment, { action: 'teach', reply });
    };

    return <div className="min-w-0 space-y-5">
        <div className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row">
            <div className="relative min-w-0 flex-1"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input value={searchTerm} onChange={event => setSearchTerm(event.target.value)} placeholder="Search username, comment, or reply" className="border-0 bg-muted/40 pl-10 shadow-none focus-visible:ring-1" /></div>
            <Select value={statusFilter} onValueChange={value => setStatusFilter(value as 'all' | InstagramCommentStatus)}><SelectTrigger className="w-full sm:w-[160px]"><SelectValue placeholder="Status" /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="awaiting_approval">Needs approval</SelectItem><SelectItem value="queued">Queued</SelectItem><SelectItem value="sent">Sent</SelectItem><SelectItem value="failed">Failed</SelectItem></SelectContent></Select>
        </div>
        <div className="flex items-center justify-between px-1 text-xs text-muted-foreground"><span><strong className="text-foreground">{filtered.length}</strong> conversations in view</span>{(searchTerm || statusFilter !== 'all') && <button className="font-medium text-primary hover:underline" onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}>Clear filters</button>}</div>
        {filtered.length === 0 ? <div className="flex min-h-56 flex-col items-center justify-center gap-2 rounded-xl border border-dashed text-muted-foreground"><Instagram className="h-8 w-8 opacity-40" /><p className="text-sm">{searchTerm ? 'No conversations match your search.' : 'No Instagram comments yet.'}</p></div> : <div className="space-y-3">{filtered.map(comment => {
            const status = STATUS[comment.status];
            const StatusIcon = status.icon;
            const reply = comment.reply || comment.proposed_reply;
            const needsApproval = comment.status === 'awaiting_approval';
            const confidence = comment.confidence === null ? null : Math.round(comment.confidence * 100);
            const price = priceLabel(comment);
            const isProcessing = processing === comment.id;
            return <article key={comment.id} className="relative overflow-hidden rounded-2xl border bg-card shadow-sm transition-shadow hover:shadow-md">
                <Button size="icon" variant="ghost" className="absolute right-3 top-3 z-10 h-8 w-8" title="Inspect details" aria-label="Inspect details" onClick={() => setSelected(comment)}><FileText className="h-4 w-4" /></Button>
                <div className="border-b px-4 py-3 pr-14 sm:px-5">
                    <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 via-rose-500 to-amber-400 text-sm font-bold text-white">{comment.username?.charAt(0).toUpperCase() || '?'}</div>
                        <div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><span className="font-semibold">@{comment.username || 'unknown'}</span><span className="text-xs text-muted-foreground">{ago(comment.created_at)}</span></div><div className="mt-1 flex flex-wrap items-center gap-2 text-xs">{comment.media_url ? <a href={comment.media_url} target="_blank" rel="noopener noreferrer" className="inline-flex min-w-0 items-center gap-1.5 font-semibold text-primary hover:underline"><Instagram className="h-3.5 w-3.5 shrink-0" /><span className="max-w-[260px] truncate sm:max-w-md">{comment.media_title || 'Instagram Reel'}</span><ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" /></a> : <span className="text-muted-foreground">{comment.media_title || 'Instagram Reel link pending'}</span>}{price && <span className="rounded-full border border-status-success/20 bg-status-success/10 px-2 py-0.5 font-semibold text-status-success">{price}</span>}</div></div><span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-1 text-[11px] font-semibold ${status.className}`}><StatusIcon className="h-3 w-3" />{status.label}</span></div>
                </div>
                <div className="space-y-4 px-4 py-4 sm:px-5"><div className="flex items-start gap-3"><MessageCircle className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" /><p className="min-w-0 whitespace-pre-wrap text-sm leading-6">{comment.comment_text}</p></div><div className="ml-5 flex items-start gap-3 border-l-2 border-primary/20 pl-4"><Send className="mt-1 h-4 w-4 shrink-0 text-primary" /><div className="min-w-0 flex-1"><p className="mb-1 text-xs font-semibold text-primary">Trimurti Real Estate</p>{editingId === comment.id ? <Textarea value={editReply} onChange={event => setEditReply(event.target.value)} className="min-h-20 bg-background" autoFocus /> : <p className="whitespace-pre-wrap text-sm leading-6">{reply || <span className="text-muted-foreground">No reply generated</span>}</p>}</div></div></div>
                <div className="flex flex-wrap items-center gap-2 border-t px-4 py-3 sm:px-5"><div className="flex items-center gap-2 text-xs text-muted-foreground">{confidence !== null && <span className="rounded-full border bg-background px-2 py-0.5 font-medium">{confidence}%</span>}{comment.scheduled_for && <span>{until(comment.scheduled_for)}</span>}</div><div className="ml-auto flex flex-wrap gap-2">{needsApproval && <Button size="sm" className="bg-status-success text-white hover:bg-status-success/90" disabled={isProcessing || !reply} onClick={() => update(comment, { status: 'approved', reply: reply || '' })}>{isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}Approve</Button>}{needsApproval && editingId !== comment.id && <Button size="sm" variant="outline" onClick={() => startEdit(comment)}><Pencil className="mr-2 h-4 w-4" />Edit</Button>}{editingId === comment.id && <><Button size="sm" onClick={() => update(comment, { status: 'approved', reply: editReply })} disabled={!editReply.trim() || isProcessing}><Check className="mr-2 h-4 w-4" />Save</Button><Button size="icon" variant="ghost" title="Teach this reply" aria-label="Teach this reply" onClick={() => teach(comment)} disabled={!editReply.trim() || isProcessing}><GraduationCap className="h-4 w-4" /></Button></>}{!needsApproval && editingId !== comment.id && reply && <Button size="sm" variant="outline" onClick={() => startEdit(comment)}><Pencil className="mr-2 h-4 w-4" />Edit</Button>}<Button size="sm" variant="ghost" onClick={() => void update(comment, { action: 'hide' })}><EyeOff className="mr-2 h-4 w-4" />Hide</Button></div></div>
            </article>;
        })}</div>}
        <Sheet open={Boolean(selected)} onOpenChange={open => !open && setSelected(null)}><SheetContent className="w-full overflow-y-auto sm:max-w-xl">{selected && <><SheetHeader><SheetTitle>Conversation inspection</SheetTitle><SheetDescription>Automation context for @{selected.username || 'unknown'} — confidence, decision, schedule, and media link.</SheetDescription></SheetHeader><div className="mt-6 space-y-5"><div className="rounded-lg border bg-muted/30 p-4"><p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Instagram conversation</p><p className="text-sm"><strong>Comment:</strong> {selected.comment_text}</p><p className="mt-3 text-sm"><strong>Reply:</strong> {selected.reply || selected.proposed_reply || 'No reply'}</p>{selected.proposed_reply && selected.reply && selected.proposed_reply !== selected.reply && <p className="mt-2 text-xs text-muted-foreground"><strong>Proposed:</strong> {selected.proposed_reply}</p>}{selected.decision_reason && <p className="mt-3 rounded-md border bg-background px-3 py-2 text-xs leading-relaxed"><span className="font-semibold text-muted-foreground">Decision:</span> {selected.decision_reason}{selected.confidence !== null && <span className="ml-2 font-mono text-muted-foreground">({Math.round(selected.confidence * 100)}%)</span>}</p>}</div><div className="grid gap-3 text-xs"><Detail label="Status" value={selected.status} /><Detail label="Category" value={selected.category || 'Not classified'} /><Detail label="Confidence" value={selected.confidence !== null ? `${Math.round(selected.confidence * 100)}%` : 'Not scored'} /><Detail label="Decision reason" value={selected.decision_reason || 'Not recorded'} /><Detail label="Scheduled for" value={selected.scheduled_for ? `${new Date(selected.scheduled_for).toLocaleString('en-IN')} (${until(selected.scheduled_for)})` : 'Not scheduled'} /><Detail label="Reply source" value={selected.reply_source || 'Not recorded'} /><Detail label="Admin action" value={selected.admin_action || 'None'} /><Detail label="Media ID" value={selected.media_id || 'Not available'} /><Detail label="Video URL" value={selected.media_url || 'Not available'} /><Detail label="Media title" value={selected.media_title || 'Not available'} /><Detail label="Property" value={selected.property_title ? `${selected.property_title} — ${priceLabel(selected) || 'price TBD'}` : 'Not linked'} /><Detail label="Created" value={new Date(selected.created_at).toLocaleString('en-IN')} /><Detail label="Updated" value={new Date(selected.updated_at).toLocaleString('en-IN')} />{selected.error_message && <Detail label="Error" value={selected.error_message} />}</div></div></>}</SheetContent></Sheet>
    </div>;
}

function Detail({ label, value }: { label: string; value: string }) { return <div className="rounded-md border p-3"><p className="text-muted-foreground">{label}</p><p className="mt-1 break-all font-mono text-foreground">{value}</p></div>; }
