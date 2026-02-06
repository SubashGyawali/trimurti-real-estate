'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
    Search,
    MoreHorizontal,
    Trash,
    MessageSquare,
    Phone,
    Mail,
    ExternalLink,
    ChevronDown,
    ChevronUp,
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

import type { InquiryStatus, InquiryType } from '@/types/database';

interface InquiryWithProperty {
    id: string;
    property_id: string | null;
    name: string;
    email: string | null;
    phone: string;
    message: string | null;
    inquiry_type: InquiryType;
    status: InquiryStatus;
    requirements_data: any;
    created_at: string;
    property: { id: string; title: string; slug: string } | null;
}

interface InquiriesTableProps {
    initialInquiries: InquiryWithProperty[];
}

const STATUS_COLORS: Record<InquiryStatus, string> = {
    new: 'bg-blue-500 hover:bg-blue-600',
    contacted: 'bg-amber-500 hover:bg-amber-600',
    closed: 'bg-gray-500 hover:bg-gray-600',
};

const STATUS_LABELS: Record<InquiryStatus, string> = {
    new: 'New',
    contacted: 'Contacted',
    closed: 'Closed',
};

const TYPE_COLORS: Record<InquiryType, 'default' | 'secondary' | 'outline'> = {
    general: 'outline',
    property_specific: 'default',
    requirements: 'secondary',
};

const TYPE_LABELS: Record<InquiryType, string> = {
    general: 'General',
    property_specific: 'Property',
    requirements: 'Requirements',
};

export function InquiriesTable({ initialInquiries }: InquiriesTableProps) {
    const router = useRouter();
    const [inquiries, setInquiries] = useState(initialInquiries);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [expandedRow, setExpandedRow] = useState<string | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [inquiryToDelete, setInquiryToDelete] = useState<InquiryWithProperty | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter inquiries
    const filteredInquiries = inquiries.filter(inquiry => {
        const matchesSearch =
            inquiry.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            inquiry.phone.includes(searchTerm) ||
            (inquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

        const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    // Status update handler
    const handleStatusChange = async (inquiry: InquiryWithProperty, newStatus: InquiryStatus) => {
        const previousStatus = inquiry.status;

        // Optimistic update
        setInquiries(prev =>
            prev.map(i => (i.id === inquiry.id ? { ...i, status: newStatus } : i))
        );

        try {
            const response = await fetch(`/api/admin/inquiries/${inquiry.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });

            if (!response.ok) throw new Error('Failed to update');
            toast.success(`Status updated to ${STATUS_LABELS[newStatus]}`);
            router.refresh();
        } catch {
            // Revert on error
            setInquiries(prev =>
                prev.map(i => (i.id === inquiry.id ? { ...i, status: previousStatus } : i))
            );
            toast.error('Failed to update status');
        }
    };

    // Delete handler
    const handleDelete = async () => {
        if (!inquiryToDelete) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/admin/inquiries/${inquiryToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) throw new Error('Failed to delete');

            setInquiries(prev => prev.filter(i => i.id !== inquiryToDelete.id));
            toast.success('Inquiry deleted');
            router.refresh();
        } catch {
            toast.error('Failed to delete inquiry');
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setInquiryToDelete(null);
        }
    };

    // WhatsApp URL generator
    const getWhatsAppUrl = (phone: string, name: string) => {
        const message = encodeURIComponent(
            `Hi ${name}, this is Trimurti Real Estate. We received your inquiry and wanted to follow up. How can we help you?`
        );
        return `https://wa.me/91${phone}?text=${message}`;
    };

    // Format date
    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, phone, or email..."
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
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="contacted">Contacted</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Table */}
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[50px]"></TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead className="hidden sm:table-cell">Phone</TableHead>
                            <TableHead className="hidden md:table-cell">Type</TableHead>
                            <TableHead className="hidden lg:table-cell">Property</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="w-[50px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredInquiries.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} className="h-24 text-center">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <MessageSquare className="h-8 w-8" />
                                        <span>No inquiries found.</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredInquiries.map((inquiry) => (
                                <React.Fragment key={inquiry.id}>
                                    <TableRow className="group">
                                        <TableCell>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-8 w-8"
                                                onClick={() => setExpandedRow(expandedRow === inquiry.id ? null : inquiry.id)}
                                            >
                                                {expandedRow === inquiry.id ? (
                                                    <ChevronUp className="h-4 w-4" />
                                                ) : (
                                                    <ChevronDown className="h-4 w-4" />
                                                )}
                                            </Button>
                                        </TableCell>
                                        <TableCell className="text-muted-foreground">
                                            {formatDate(inquiry.created_at)}
                                        </TableCell>
                                        <TableCell className="font-medium">{inquiry.name}</TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            <div className="flex items-center gap-2">
                                                <span>{inquiry.phone}</span>
                                                <a
                                                    href={getWhatsAppUrl(inquiry.phone, inquiry.name)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-green-600 hover:text-green-700"
                                                    title="Open WhatsApp"
                                                >
                                                    <Phone className="h-4 w-4" />
                                                </a>
                                            </div>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell">
                                            <Badge variant={TYPE_COLORS[inquiry.inquiry_type]}>
                                                {TYPE_LABELS[inquiry.inquiry_type]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden lg:table-cell">
                                            {inquiry.property ? (
                                                <span className="text-sm truncate max-w-[200px] block">
                                                    {inquiry.property.title}
                                                </span>
                                            ) : (
                                                <span className="text-muted-foreground">-</span>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className={`${STATUS_COLORS[inquiry.status]} text-white`}
                                                    >
                                                        {STATUS_LABELS[inquiry.status]}
                                                        <ChevronDown className="ml-1 h-3 w-3" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => handleStatusChange(inquiry, 'new')}
                                                        disabled={inquiry.status === 'new'}
                                                    >
                                                        New
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleStatusChange(inquiry, 'contacted')}
                                                        disabled={inquiry.status === 'contacted'}
                                                    >
                                                        Contacted
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleStatusChange(inquiry, 'closed')}
                                                        disabled={inquiry.status === 'closed'}
                                                    >
                                                        Closed
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem asChild>
                                                        <a
                                                            href={getWhatsAppUrl(inquiry.phone, inquiry.name)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                        >
                                                            <Phone className="mr-2 h-4 w-4" />
                                                            WhatsApp
                                                        </a>
                                                    </DropdownMenuItem>
                                                    {inquiry.email && (
                                                        <DropdownMenuItem asChild>
                                                            <a href={`mailto:${inquiry.email}`}>
                                                                <Mail className="mr-2 h-4 w-4" />
                                                                Email
                                                            </a>
                                                        </DropdownMenuItem>
                                                    )}
                                                    {inquiry.property && (
                                                        <DropdownMenuItem asChild>
                                                            <a
                                                                href={`/properties/${inquiry.property.slug}`}
                                                                target="_blank"
                                                            >
                                                                <ExternalLink className="mr-2 h-4 w-4" />
                                                                View Property
                                                            </a>
                                                        </DropdownMenuItem>
                                                    )}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => {
                                                            setInquiryToDelete(inquiry);
                                                            setDeleteDialogOpen(true);
                                                        }}
                                                    >
                                                        <Trash className="mr-2 h-4 w-4" />
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                    {expandedRow === inquiry.id && (
                                        <TableRow className="bg-muted/50">
                                            <TableCell colSpan={8}>
                                                <div className="p-4 space-y-3">
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div>
                                                            <p className="text-sm font-medium text-muted-foreground">Contact</p>
                                                            <p className="text-sm">{inquiry.phone}</p>
                                                            {inquiry.email && (
                                                                <p className="text-sm">{inquiry.email}</p>
                                                            )}
                                                        </div>
                                                        {inquiry.property && (
                                                            <div>
                                                                <p className="text-sm font-medium text-muted-foreground">Property</p>
                                                                <p className="text-sm">{inquiry.property.title}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                    {inquiry.message && (
                                                        <div>
                                                            <p className="text-sm font-medium text-muted-foreground">Message</p>
                                                            <p className="text-sm whitespace-pre-wrap">{inquiry.message}</p>
                                                        </div>
                                                    )}
                                                    {inquiry.inquiry_type === 'requirements' && inquiry.requirements_data && (
                                                        <div>
                                                            <p className="text-sm font-medium text-muted-foreground mb-2">Requirements</p>
                                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                                                                {inquiry.requirements_data.listing_type && (
                                                                    <div>
                                                                        <span className="text-muted-foreground">Looking for: </span>
                                                                        <span className="capitalize">{inquiry.requirements_data.listing_type}</span>
                                                                    </div>
                                                                )}
                                                                {(inquiry.requirements_data.budget_min || inquiry.requirements_data.budget_max) && (
                                                                    <div>
                                                                        <span className="text-muted-foreground">Budget: </span>
                                                                        {inquiry.requirements_data.budget_min && inquiry.requirements_data.budget_max
                                                                            ? `₹${inquiry.requirements_data.budget_min.toLocaleString()} - ₹${inquiry.requirements_data.budget_max.toLocaleString()}`
                                                                            : inquiry.requirements_data.budget_max
                                                                                ? `Up to ₹${inquiry.requirements_data.budget_max.toLocaleString()}`
                                                                                : `From ₹${inquiry.requirements_data.budget_min?.toLocaleString()}`
                                                                        }
                                                                    </div>
                                                                )}
                                                                {inquiry.requirements_data.property_types?.length > 0 && (
                                                                    <div>
                                                                        <span className="text-muted-foreground">Types: </span>
                                                                        {inquiry.requirements_data.property_types.join(', ').toUpperCase()}
                                                                    </div>
                                                                )}
                                                                {inquiry.requirements_data.notes && (
                                                                    <div className="col-span-full">
                                                                        <span className="text-muted-foreground">Notes: </span>
                                                                        {inquiry.requirements_data.notes}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </React.Fragment>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Delete Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Inquiry</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this inquiry from {inquiryToDelete?.name}?
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
