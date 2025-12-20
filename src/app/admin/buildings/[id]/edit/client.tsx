'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash, Home } from 'lucide-react';

import { BuildingForm } from '@/components/admin/building-form';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { Building } from '@/types/database';

interface EditBuildingClientProps {
    building: Building;
    propertyCount: number;
}

export function EditBuildingClient({ building, propertyCount }: EditBuildingClientProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSubmit = async (data: any) => {
        try {
            const response = await fetch(`/api/admin/buildings/${building.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to update building');
            }

            toast.success('Building updated successfully');
            router.push('/admin/buildings');
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update building');
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/admin/buildings/${building.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete building');
            }

            const result = await response.json();
            toast.success(
                result.properties_affected > 0
                    ? `Building deleted. ${result.properties_affected} properties now have no building assigned.`
                    : 'Building deleted successfully'
            );
            router.push('/admin/buildings');
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete building');
            setIsDeleting(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Building</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-muted-foreground">{building.name}</span>
                        {propertyCount > 0 && (
                            <Badge variant="outline" className="gap-1">
                                <Home className="h-3 w-3" />
                                {propertyCount} properties
                            </Badge>
                        )}
                    </div>
                </div>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            <Trash className="mr-2 h-4 w-4" /> Delete Building
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the building.
                                {propertyCount > 0 && (
                                    <span className="block mt-2 text-amber-600 font-medium">
                                        Warning: This building has {propertyCount} associated properties.
                                        They will have their building reference removed.
                                    </span>
                                )}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
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

            <BuildingForm
                initialData={building}
                onSubmit={handleSubmit}
                isEdit
            />
        </div>
    );
}
