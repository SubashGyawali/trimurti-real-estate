'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    Search,
    MoreHorizontal,
    Trash,
    Calendar,
    Phone,
    Mail,
    ExternalLink,
    Check,
    X,
    CheckCircle,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import type { VisitStatus } from '@/types/database';

interface VisitWithProperty {
    id: string;
    property_id: string;
    name: string;
    phone: string;
    email: string | null;
    preferred_date: string | null;
    preferred_time: string | null;
    message: string | null;
    status: VisitStatus;
    created_at: string;
    property: { id: string; title: string; slug: string };
}

interface VisitsTableProps {
    initialVisits: VisitWithProperty[];
}

const STATUS_COLORS: Record<VisitStatus, string> = {
    pending: 'bg-status-warning',
    confirmed: 'bg-status-info',
    completed: 'bg-status-success',
    cancelled: 'bg-muted-foreground',
};

const STATUS_LABELS: Record<VisitStatus, string> = {
    pending: 'Pending',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
};

const TIME_LABELS: Record<string, string> = {
    morning: 'Morning (9-12)',
    afternoon: 'Afternoon (12-4)',
    evening: 'Evening (4-7)',
};

export function VisitsTable({ initialVisits }: VisitsTableProps) {
    const router = useRouter();
    const [visits, setVisits] = useState(initialVisits);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [visitToDelete, setVisitToDelete] = useState<VisitWithProperty | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter visits
    const filteredVisits = visits.filter(visit => {
        const matchesSearch =
            visit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            visit.phone.includes(searchTerm) ||
            visit.property.title.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || visit.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Status update handler
    const handleStatusChange = async (visit: VisitWithProperty, newStatus: VisitStatus) => {
        const previousStatus = visit.status;

        // Optimistic update
        setVisits(prev =>
            prev.map(v => (v.id === visit.id ? { ...v, status: newStatus } : v))
        );

        try {
            const response = await fetch(`/api/admin/visits/${visit.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) throw new Error('Failed to update');
            toast.success(`Visit ${STATUS_LABELS[newStatus].toLowerCase()}`);
            router.refresh();
        } catch {
            // Revert on error
            setVisits(prev =>
                prev.map(v => (v.id === visit.id ? { ...v, status: previousStatus } : v))
            );
            toast.error('Failed to update status');
        }
    };

    // Delete handler
    const handleDelete = async () => {
        if (!visitToDelete) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/admin/visits/${visitToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete');

            setVisits(prev => prev.filter(v => v.id !== visitToDelete.id));
            toast.success('Visit deleted');
            router.refresh();
        } catch {
            toast.error('Failed to delete visit');
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setVisitToDelete(null);
        }
    };

    // WhatsApp confirmation URL
    const getWhatsAppConfirmationUrl = (visit: VisitWithProperty) => {
        const dateStr = visit.preferred_date
            ? new Date(visit.preferred_date).toLocaleDateString('en-IN', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
            })
            : 'the requested date';

        const timeSlot = visit.preferred_time
            ? TIME_LABELS[visit.preferred_time] || visit.preferred_time
            : 'the agreed time';

        const message = encodeURIComponent(
            `Hi ${visit.name}, your visit to "${visit.property.title}" is confirmed for ${dateStr} (${timeSlot}). Please call us 30 minutes before you arrive. - Trimurti Real Estate`
        );
        return `https://wa.me/91${visit.phone}?text=${message}`;
    };

    // Format date
    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    // Get available actions based on status
    const getAvailableActions = (status: VisitStatus) => {
        switch (status) {
            case 'pending':
                return [
                    { label: 'Confirm', status: 'confirmed' as VisitStatus, icon: Check },
                    { label: 'Cancel', status: 'cancelled' as VisitStatus, icon: X },
                ];
            case 'confirmed':
                return [
                    { label: 'Complete', status: 'completed' as VisitStatus, icon: CheckCircle },
                    { label: 'Cancel', status: 'cancelled' as VisitStatus, icon: X },
                ];
            default:
                return [];
        }
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, phone, or property..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Status</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date / Time</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="hidden sm:table-cell">Phone</TableHead>
                            <TableHead className="hidden md:table-cell">Property</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[120px]">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredVisits.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <Calendar className="h-8 w-8" />
                                        <span>No visits found.</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredVisits.map((visit) => {
                                const actions = getAvailableActions(visit.status);
                                return (
                                    <TableRow key={visit.id}>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <div className="font-medium">
                                                    {formatDate(visit.preferred_date)}
                                                </div>
                                                {visit.preferred_time && (
                                                    <div className="text-sm text-muted-foreground">
                                                        {TIME_LABELS[visit.preferred_time] || visit.preferred_time}
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="font-medium">{visit.name}</div>
                                            <div className="text-sm text-muted-foreground sm:hidden">
                                                {visit.phone}
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <div className="flex items-center gap-2">
                                                <span>{visit.phone}</span>
                                                <a
                                                    href={getWhatsAppConfirmationUrl(visit)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-green-600 hover:text-green-700"
                                                    title="Send WhatsApp confirmation"
                                                >
                                                    <Phone className="h-4 w-4" />
                                                </a>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <span className="text-sm truncate max-w-[200px] block">
                                                {visit.property.title}
                                            </span>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={`${STATUS_COLORS[visit.status]} text-white`}>
                                                {STATUS_LABELS[visit.status]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                {actions.map((action) => (
                                                    <Button
                                                        key={action.status}
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        title={action.label}
                                                        onClick={() => handleStatusChange(visit, action.status)}
                                                    >
                                                        <action.icon className="h-4 w-4" />
                                                    </Button>
                                                ))}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem asChild>
                                                            <a
                                                                href={getWhatsAppConfirmationUrl(visit)}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                            >
                                                                <Phone className="mr-2 h-4 w-4" />
                                                                WhatsApp
                                                            </a>
                                                        </DropdownMenuItem>
                                                        {visit.email && (
                                                            <DropdownMenuItem asChild>
                                                                <a href={`mailto:${visit.email}`}>
                                                                    <Mail className="mr-2 h-4 w-4" />
                                                                    Email
                                                                </a>
                                                            </DropdownMenuItem>
                                                        )}
                                                        <DropdownMenuItem asChild>
                                                            <a
                                                                href={`/properties/${visit.property.slug}`}
                                                                target="_blank"
                                                            >
                                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                                View Property
                                                            </a>
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            className="text-destructive focus:text-destructive"
                                                            onClick={() => {
                                                                setVisitToDelete(visit);
                                                                setDeleteDialogOpen(true);
                                                            }}
                                                        >
                                                            <Trash className="mr-2 h-4 w-4" />
                                                            Delete
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Visit</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this visit from {visitToDelete?.name}?
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
