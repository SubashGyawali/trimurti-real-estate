'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Building } from '@/types/database';

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

interface CreatePropertyClientProps {
    buildings: Building[];
}

export function CreatePropertyClient({ buildings }: CreatePropertyClientProps) {
    const router = useRouter();

    const handleSubmit = async (data: any) => {
        try {
            const response = await fetch('/api/admin/properties', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create property');
            }

            toast.success('Property created successfully');
            router.push('/admin/properties');
            router.refresh();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Something went wrong');
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Add Property</h1>
            </div>
            <PropertyForm buildings={buildings} onSubmit={handleSubmit} />
        </div>
    );
}
