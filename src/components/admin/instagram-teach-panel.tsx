'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import {
    Plus,
    Trash2,
    Check,
    X,
    BookOpen,
    Loader2,
    Sparkles,
    Edit2,
    Save,
    GripVertical,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface Teaching {
    id: string;
    rule: string;
    is_active: boolean;
    created_by: string | null;
    created_at: string;
    updated_at: string;
}

interface TeachPanelProps {
    initialTeachings: Teaching[];
    activeCount: number;
}

export function TeachPanel({ initialTeachings, activeCount }: TeachPanelProps) {
    const [teachings, setTeachings] = useState(initialTeachings);
    const [newRule, setNewRule] = useState('');
    const [adding, setAdding] = useState(false);
    const [toggling, setToggling] = useState<string | null>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editRule, setEditRule] = useState('');

    const handleAddRule = async () => {
        if (!newRule.trim()) return;

        setAdding(true);
        try {
            const response = await fetch('/api/admin/instagram/teachings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rule: newRule.trim() }),
            });

            if (!response.ok) throw new Error('Failed to add rule');

            const data = await response.json();
            setTeachings([data.teaching, ...teachings]);
            setNewRule('');
            toast.success('Teaching rule added');
        } catch (error) {
            toast.error('Failed to add rule');
        } finally {
            setAdding(false);
        }
    };

    const handleToggle = async (teaching: Teaching) => {
        setToggling(teaching.id);
        try {
            const response = await fetch(`/api/admin/instagram/teachings/${teaching.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !teaching.is_active }),
            });

            if (!response.ok) throw new Error('Failed to toggle');

            setTeachings(teachings.map(t =>
                t.id === teaching.id ? { ...t, is_active: !teaching.is_active } : t
            ));
            toast.success(teaching.is_active ? 'Rule deactivated' : 'Rule activated');
        } catch (error) {
            toast.error('Failed to toggle rule');
        } finally {
            setToggling(null);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Delete this teaching rule?')) return;

        setDeleting(id);
        try {
            const response = await fetch(`/api/admin/instagram/teachings/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete');

            setTeachings(teachings.filter(t => t.id !== id));
            toast.success('Teaching rule deleted');
        } catch (error) {
            toast.error('Failed to delete rule');
        } finally {
            setDeleting(null);
        }
    };

    const startEdit = (teaching: Teaching) => {
        setEditingId(teaching.id);
        setEditRule(teaching.rule);
    };

    const handleSaveEdit = async (teaching: Teaching) => {
        if (!editRule.trim()) return;

        try {
            const response = await fetch(`/api/admin/instagram/teachings/${teaching.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rule: editRule.trim() }),
            });

            if (!response.ok) throw new Error('Failed to update');

            setTeachings(teachings.map(t =>
                t.id === teaching.id ? { ...t, rule: editRule.trim() } : t
            ));
            setEditingId(null);
            setEditRule('');
            toast.success('Rule updated');
        } catch (error) {
            toast.error('Failed to update rule');
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setEditRule('');
    };

    const activeTeachings = teachings.filter(t => t.is_active);
    const inactiveTeachings = teachings.filter(t => !t.is_active);

    return (
        <Card className="h-full">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <div className="flex items-center gap-3">
                    <CardTitle className="text-base font-medium flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-amber-500" />
                        Teach the Agent
                    </CardTitle>
                    <Badge variant="outline" className="text-xs">
                        {activeCount} active
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                        {teachings.length} total
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">

                <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-medium text-muted-foreground">Start with a template:</span>
                        {[
                            ['Contact inquiries', 'For contact inquiries, ask for the person\'s phone number and preferred callback time.'],
                            ['Price inquiries', 'For price questions, share the latest listed price and invite the user to call 98194 46163.'],
                            ['Friendly Hinglish', 'Reply in warm, concise Hinglish and use at most one friendly emoji.'],
                        ].map(([label, rule]) => (
                            <button
                                key={label}
                                type="button"
                                onClick={() => setNewRule(rule)}
                                className="rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 hover:text-foreground"
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                    <Textarea
                        placeholder="Teach the agent a rule... e.g. 'Always reply in Hinglish with a joke', 'For price questions, say call us at 98194 46163'"
                        value={newRule}
                        onChange={(e) => setNewRule(e.target.value)}
                        className="min-h-[80px] resize-none"
                        rows={3}
                        disabled={adding}
                    />
                    <Button
                        onClick={handleAddRule}
                        disabled={adding || !newRule.trim()}
                        className="w-full sm:w-auto"
                    >
                        {adding ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                                Adding...
                            </>
                        ) : (
                            <>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Rule
                            </>
                        )}
                    </Button>
                </div>

                <Separator />

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-muted-foreground">Active Rules</h4>
                        <Badge variant="default" className="text-xs">{activeTeachings.length}</Badge>
                    </div>

                    {activeTeachings.length === 0 ? (
                        <div className="text-center py-6 text-muted-foreground border-2 border-dashed rounded-lg">
                            <Sparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No active rules. Add one above to guide the agent.</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {activeTeachings.map((teaching, index) => (
                                <TeachingRuleCard
                                    key={teaching.id}
                                    teaching={teaching}
                                    index={index}
                                    isActive={true}
                                    onToggle={handleToggle}
                                    onDelete={handleDelete}
                                    onEdit={startEdit}
                                    editingId={editingId}
                                    editRule={editRule}
                                    setEditRule={setEditRule}
                                    onSaveEdit={handleSaveEdit}
                                    onCancelEdit={handleCancelEdit}
                                    toggling={toggling}
                                    deleting={deleting}
                                />
                            ))}
                        </div>
                    )}

                    {inactiveTeachings.length > 0 && (
                        <div className="pt-2">
                            <div className="flex items-center justify-between">
                                <h4 className="text-sm font-medium text-muted-foreground">Inactive Rules</h4>
                                <Badge variant="outline" className="text-xs">{inactiveTeachings.length}</Badge>
                            </div>
                            <div className="space-y-2">
                                {inactiveTeachings.map((teaching, index) => (
                                    <TeachingRuleCard
                                        key={teaching.id}
                                        teaching={teaching}
                                        index={index}
                                        isActive={false}
                                        onToggle={handleToggle}
                                        onDelete={handleDelete}
                                        onEdit={startEdit}
                                        editingId={editingId}
                                        editRule={editRule}
                                        setEditRule={setEditRule}
                                        onSaveEdit={handleSaveEdit}
                                        onCancelEdit={handleCancelEdit}
                                        toggling={toggling}
                                        deleting={deleting}
                                    />
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}

interface TeachingRuleCardProps {
    teaching: Teaching;
    index: number;
    isActive: boolean;
    onToggle: (teaching: Teaching) => void;
    onDelete: (id: string) => void;
    onEdit: (teaching: Teaching) => void;
    editingId: string | null;
    editRule: string;
    setEditRule: (value: string) => void;
    onSaveEdit: (teaching: Teaching) => void;
    onCancelEdit: () => void;
    toggling: string | null;
    deleting: string | null;
}

function TeachingRuleCard({
    teaching,
    index,
    isActive,
    onToggle,
    onDelete,
    onEdit,
    editingId,
    editRule,
    setEditRule,
    onSaveEdit,
    onCancelEdit,
    toggling,
    deleting,
}: TeachingRuleCardProps) {
    const isEditing = editingId === teaching.id;
    const isToggling = toggling === teaching.id;
    const isDeleting = deleting === teaching.id;

    return (
        <div
            className={cn(
                'flex items-start gap-3 p-3 rounded-lg border transition-all',
                isActive ? 'bg-status-success/10 border-status-success/20' : 'bg-muted/30 border-muted',
                isEditing && 'ring-2 ring-primary bg-background shadow-md'
            )}
        >
            <div className="flex-shrink-0 mt-0.5 text-muted-foreground">
                <GripVertical className="h-4 w-4 opacity-50" />
            </div>

            <div className="flex-1 min-w-0">
                {isEditing ? (
                    <div className="space-y-2">
                        <Textarea
                            value={editRule}
                            onChange={(e) => setEditRule(e.target.value)}
                            placeholder="Edit rule..."
                            className="min-h-[60px] resize-none font-mono text-sm"
                            rows={2}
                            autoFocus
                        />
                        <div className="flex items-center gap-2">
                            <Button
                                size="sm"
                                onClick={() => onSaveEdit(teaching)}
                                disabled={!editRule.trim()}
                            >
                                <Save className="h-3.5 w-3.5 mr-1.5" />
                                Save
                            </Button>
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={onCancelEdit}
                            >
                                <X className="h-3.5 w-3.5 mr-1.5" />
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center gap-2 mb-1">
                            <Badge variant={isActive ? 'default' : 'outline'} className="text-xs">
                                {isActive ? 'Active' : 'Inactive'}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                                #{index + 1} · {new Date(teaching.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap text-foreground">{teaching.rule}</p>
                    </>
                )}
            </div>

            <div className="flex items-center gap-1">
                {!isEditing && (
                    <>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => onEdit(teaching)}
                            title="Edit rule"
                        >
                            <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className={cn('h-8 w-8', isActive ? 'text-green-600' : 'text-gray-400')}
                            onClick={() => onToggle(teaching)}
                            disabled={isToggling}
                            title={isActive ? 'Deactivate' : 'Activate'}
                        >
                            {isToggling ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : isActive ? (
                                <Check className="h-4 w-4" />
                            ) : (
                                <X className="h-4 w-4" />
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => onDelete(teaching.id)}
                            disabled={isDeleting}
                            title="Delete"
                        >
                            {isDeleting ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <Trash2 className="h-4 w-4" />
                            )}
                        </Button>
                    </>
                )}
            </div>
        </div>
    );
}