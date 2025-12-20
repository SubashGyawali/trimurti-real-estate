'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { BuildingForm } from '@/components/admin/building-form';

export function CreateBuildingClient() {
    const router = useRouter();

    const handleSubmit = async (data: any) => {
        try {
            const response = await fetch('/api/admin/buildings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to create building');
            }

            toast.success('Building created successfully');
            router.push('/admin/buildings');
            router.refresh();
        } catch (error: any) {
            console.error(error);
            toast.error(error.message || 'Something went wrong');
        }
    };

    return (
        <div className="max-w-3xl mx-auto py-8 px-4 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Add Building</h1>
                    <p className="text-muted-foreground">Add a new building or complex to the system</p>
                </div>
            </div>
            <BuildingForm onSubmit={handleSubmit} />
        </div>
    );
}
