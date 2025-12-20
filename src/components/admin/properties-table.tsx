'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Pencil, Trash, MoreHorizontal, Plus, Search, Building2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

import { PropertyWithImages } from '@/types/database';

interface PropertiesTableProps {
    initialProperties: PropertyWithImages[];
}

export function PropertiesTable({ initialProperties }: PropertiesTableProps) {
    const router = useRouter();
    const [properties, setProperties] = useState(initialProperties);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    // Filter properties locally
    const filteredProperties = properties.filter(property => {
        const matchesSearch = property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            property.property_type.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all'
            ? true
            : statusFilter === 'active'
                ? property.is_active
                : !property.is_active;

        return matchesSearch && matchesStatus;
    });

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this property?')) return;

        setIsDeleting(id);
        try {
            const response = await fetch(`/api/admin/properties/${id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete');
            }

            toast.success('Property deleted');
            setProperties(prev => prev.filter(p => p.id !== id));
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete property');
        } finally {
            setIsDeleting(null);
        }
    };

    const handleToggleActive = async (property: PropertyWithImages) => {
        try {
            // Optimistic update
            setProperties(prev => prev.map(p =>
                p.id === property.id ? { ...p, is_active: !p.is_active } : p
            ));

            const response = await fetch(`/api/admin/properties/${property.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ is_active: !property.is_active }),
            });

            if (!response.ok) {
                throw new Error('Failed to update status');
            }

            toast.success(`Property ${!property.is_active ? 'activated' : 'deactivated'}`);
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update status');
            // Revert optimistic update
            setProperties(prev => prev.map(p =>
                p.id === property.id ? { ...p, is_active: property.is_active } : p
            ));
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                <div className="flex gap-2 w-full sm:w-auto">
                    <div className="relative w-full sm:w-64">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search properties..."
                            className="pl-8"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[130px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Status</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="inactive">Inactive</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <Link href="/admin/properties/new">
                    <Button>
                        <Plus className="mr-2 h-4 w-4" /> Add Property
                    </Button>
                </Link>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Image</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Type</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredProperties.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No properties found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProperties.map((property) => {
                                const primaryImage = property.property_images?.find(img => img.is_primary) || property.property_images?.[0];

                                return (
                                    <TableRow key={property.id}>
                                        <TableCell>
                                            <div className="relative h-12 w-16 rounded overflow-hidden bg-muted">
                                                {primaryImage ? (
                                                    <Image
                                                        src={primaryImage.image_url}
                                                        alt={property.title}
                                                        fill
                                                        sizes="64px"
                                                        className="object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                                        <Building2 className="h-6 w-6" />
                                                    </div>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            <div className="flex flex-col">
                                                <span>{property.title}</span>
                                                <span className="text-xs text-muted-foreground uppercase">{property.listing_type}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="uppercase">{property.property_type}</TableCell>
                                        <TableCell>
                                            ₹{property.price.toLocaleString()}
                                            {property.listing_type === 'rent' && <span className="text-muted-foreground text-xs">/mo</span>}
                                        </TableCell>
                                        <TableCell>
                                            <div onClick={() => handleToggleActive(property)} className="cursor-pointer">
                                                <Badge variant={property.is_active ? "default" : "secondary"}>
                                                    {property.is_active ? "Active" : "Inactive"}
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                                        <span className="sr-only">Open menu</span>
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <Link href={`/admin/properties/${property.id}/edit`}>
                                                        <DropdownMenuItem>
                                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => handleDelete(property.id)}
                                                    >
                                                        <Trash className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="text-xs text-muted-foreground text-center">
                Showing {filteredProperties.length} of {properties.length} properties
            </div>
        </div>
    );
}
