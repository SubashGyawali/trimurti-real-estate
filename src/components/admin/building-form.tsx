'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2, Building2, MapPin } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

import type { Building, BuildingType } from '@/types/database';

// Simple schema - using strings for optional number fields to avoid form issues
const buildingFormSchema = z.object({
    name: z.string().min(1, 'Building name is required').max(100, 'Name is too long'),
    type: z.enum(['mhada_7_storey', 'mhada_tower', 'private']),
    address: z.string().max(500).optional(),
    total_floors: z.string().optional(),
    year_built: z.string().optional(),
    location_lat: z.string().optional(),
    location_lng: z.string().optional(),
});

type BuildingFormValues = z.infer<typeof buildingFormSchema>;

interface BuildingFormProps {
    initialData?: Building;
    onSubmit: (data: any) => Promise<void>;
    isEdit?: boolean;
}

const BUILDING_TYPE_OPTIONS: { value: BuildingType; label: string }[] = [
    { value: 'mhada_7_storey', label: 'MHADA 7-Storey' },
    { value: 'mhada_tower', label: 'MHADA Tower' },
    { value: 'private', label: 'Private Building' },
];

export function BuildingForm({ initialData, onSubmit, isEdit = false }: BuildingFormProps) {
    const form = useForm<BuildingFormValues>({
        resolver: zodResolver(buildingFormSchema),
        defaultValues: {
            name: initialData?.name || '',
            type: initialData?.type || undefined,
            address: initialData?.address || '',
            total_floors: initialData?.total_floors?.toString() || '',
            year_built: initialData?.year_built?.toString() || '',
            location_lat: initialData?.location_lat?.toString() || '',
            location_lng: initialData?.location_lng?.toString() || '',
        },
    });

    const { isSubmitting } = form.formState;

    const handleSubmit = async (data: BuildingFormValues) => {
        // Convert string values to proper types for API
        const cleanedData = {
            name: data.name,
            type: data.type,
            address: data.address || null,
            total_floors: data.total_floors ? parseInt(data.total_floors, 10) : null,
            year_built: data.year_built ? parseInt(data.year_built, 10) : null,
            location_lat: data.location_lat ? parseFloat(data.location_lat) : null,
            location_lng: data.location_lng ? parseFloat(data.location_lng) : null,
        };

        await onSubmit(cleanedData);
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                {/* Building Information Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5" />
                            Building Information
                        </CardTitle>
                        <CardDescription>
                            Basic details about the building or complex
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Building Name *</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., MHADA Building 1" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Building Type *</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {BUILDING_TYPE_OPTIONS.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="address"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Address</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="e.g., Sector 1, MHADA Complex, Kandivali West, Mumbai"
                                            className="resize-none"
                                            rows={2}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="total_floors"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Floors</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="e.g., 7"
                                                min={1}
                                                max={100}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="year_built"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Year Built</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="e.g., 1985"
                                                min={1900}
                                                max={new Date().getFullYear()}
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Location Card */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <MapPin className="h-5 w-5" />
                            Location
                        </CardTitle>
                        <CardDescription>
                            GPS coordinates for map display (optional)
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-6 md:grid-cols-2">
                            <FormField
                                control={form.control}
                                name="location_lat"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Latitude</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="any"
                                                placeholder="e.g., 19.2095"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Kandivali West is around 19.20
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="location_lng"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Longitude</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                step="any"
                                                placeholder="e.g., 72.8347"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>
                                            Kandivali West is around 72.83
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Submit Buttons */}
                <div className="flex justify-end gap-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.history.back()}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? 'Update Building' : 'Create Building'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
