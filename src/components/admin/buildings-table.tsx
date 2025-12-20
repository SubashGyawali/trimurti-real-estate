'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Pencil, Trash, MoreHorizontal, Plus, Search, Building2, Home } from 'lucide-react';
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

import type { Building, BuildingType } from '@/types/database';

interface BuildingWithCount extends Building {
    property_count: number;
}

interface BuildingsTableProps {
    initialBuildings: BuildingWithCount[];
}

const BUILDING_TYPE_LABELS: Record<BuildingType, string> = {
    mhada_7_storey: 'MHADA 7-Storey',
    mhada_tower: 'MHADA Tower',
    private: 'Private',
};

const BUILDING_TYPE_COLORS: Record<BuildingType, 'default' | 'secondary' | 'outline'> = {
    mhada_7_storey: 'default',
    mhada_tower: 'secondary',
    private: 'outline',
};

export function BuildingsTable({ initialBuildings }: BuildingsTableProps) {
    const router = useRouter();
    const [buildings, setBuildings] = useState(initialBuildings);
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [buildingToDelete, setBuildingToDelete] = useState<BuildingWithCount | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Filter buildings locally
    const filteredBuildings = buildings.filter(building => {
        const matchesSearch = building.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (building.address?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

        const matchesType = typeFilter === 'all' || building.type === typeFilter;

        return matchesSearch && matchesType;
    });

    const handleDeleteClick = (building: BuildingWithCount) => {
        setBuildingToDelete(building);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!buildingToDelete) return;

        setIsDeleting(true);
        try {
            const response = await fetch(`/api/admin/buildings/${buildingToDelete.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete');
            }

            const result = await response.json();
            toast.success(
                result.properties_affected > 0
                    ? `Building deleted. ${result.properties_affected} properties now have no building assigned.`
                    : 'Building deleted successfully'
            );
            setBuildings(prev => prev.filter(b => b.id !== buildingToDelete.id));
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete building');
        } finally {
            setIsDeleting(false);
            setDeleteDialogOpen(false);
            setBuildingToDelete(null);
        }
    };

    return (
        <>
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
                    <div className="flex gap-2 w-full sm:w-auto">
                        <div className="relative w-full sm:w-64">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search buildings..."
                                className="pl-8"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="Building Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Types</SelectItem>
                                <SelectItem value="mhada_7_storey">MHADA 7-Storey</SelectItem>
                                <SelectItem value="mhada_tower">MHADA Tower</SelectItem>
                                <SelectItem value="private">Private</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <Link href="/admin/buildings/new">
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Building
                        </Button>
                    </Link>
                </div>

                <div className="border rounded-md">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead className="hidden md:table-cell">Address</TableHead>
                                <TableHead className="hidden sm:table-cell">Floors</TableHead>
                                <TableHead className="hidden sm:table-cell">Year</TableHead>
                                <TableHead>Properties</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredBuildings.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-24 text-center">
                                        <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                            <Building2 className="h-8 w-8" />
                                            <span>No buildings found.</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredBuildings.map((building) => (
                                    <TableRow key={building.id}>
                                        <TableCell className="font-medium">
                                            <div className="flex items-center gap-2">
                                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                                {building.name}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant={BUILDING_TYPE_COLORS[building.type]}>
                                                {BUILDING_TYPE_LABELS[building.type]}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="hidden md:table-cell max-w-[200px] truncate" title={building.address || ''}>
                                            {building.address || '-'}
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            {building.total_floors || '-'}
                                        </TableCell>
                                        <TableCell className="hidden sm:table-cell">
                                            {building.year_built || '-'}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-1">
                                                <Home className="h-3 w-3 text-muted-foreground" />
                                                <span>{building.property_count}</span>
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
                                                    <Link href={`/admin/buildings/${building.id}/edit`}>
                                                        <DropdownMenuItem>
                                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                                        </DropdownMenuItem>
                                                    </Link>
                                                    <DropdownMenuItem
                                                        className="text-destructive focus:text-destructive"
                                                        onClick={() => handleDeleteClick(building)}
                                                    >
                                                        <Trash className="mr-2 h-4 w-4" /> Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
                <div className="text-xs text-muted-foreground text-center">
                    Showing {filteredBuildings.length} of {buildings.length} buildings
                </div>
            </div>

            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Building</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete &quot;{buildingToDelete?.name}&quot;?
                            {buildingToDelete && buildingToDelete.property_count > 0 && (
                                <span className="block mt-2 text-amber-600 font-medium">
                                    Warning: This building has {buildingToDelete.property_count} associated properties.
                                    They will have their building reference removed.
                                </span>
                            )}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            disabled={isDeleting}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
