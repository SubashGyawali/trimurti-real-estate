'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Trash } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';

// Dynamic import for heavy PropertyForm component
const PropertyForm = dynamic(
  () => import('@/components/admin/property-form').then((mod) => mod.PropertyForm),
  {
    loading: () => (
      <div className="space-y-6">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    ),
  }
);
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Building } from '@/types/database';

interface EditPropertyClientProps {
    property: any;
    buildings: Building[];
}

export function EditPropertyClient({ property, buildings }: EditPropertyClientProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const handleSubmit = async (data: any) => {
        try {
            const response = await fetch(`/api/admin/properties/${property.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error('Failed to update property');
            }

            toast.success('Property updated successfully');
            router.push('/admin/properties');
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error('Failed to update property');
        }
    };

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const response = await fetch(`/api/admin/properties/${property.id}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                throw new Error('Failed to delete property');
            }

            toast.success('Property deleted');
            router.push('/admin/properties');
            router.refresh();
        } catch (error) {
            console.error(error);
            toast.error('Failed to delete property');
            setIsDeleting(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Edit Property</h1>

                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                            <Trash className="mr-2 h-4 w-4" /> Delete Property
                        </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the property
                                and remove all associated data including images and inquiries.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>

            <PropertyForm
                initialData={property}
                buildings={buildings}
                onSubmit={handleSubmit}
                isEdit
            />
        </div>
    );
}
