'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

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
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { ImageUploader } from './image-uploader';
import { Building, PropertyImage, BuildingType, PropertyType, ListingType, FurnishingType } from '@/types/database';

// Schema Definition
const propertyFormSchema = z.object({
    title: z.string().min(5, 'Title must be at least 5 characters'),
    building_id: z.string().optional(), // Can be empty if standalone
    listing_type: z.enum(['sale', 'rent'] as const),
    property_type: z.enum(['1rk', '1bhk', '2bhk', '3bhk', 'shop', 'office'] as const),
    price: z.coerce.number().min(1, 'Price is required'),
    deposit: z.coerce.number().optional(),
    maintenance: z.coerce.number().optional(),

    description: z.string().min(100, 'Description must be at least 100 characters for SEO'),

    carpet_area: z.coerce.number().min(1, 'Carpet area is required'),
    floor_number: z.coerce.number().optional(),
    total_floors: z.coerce.number().optional(),

    furnishing: z.enum(['unfurnished', 'semi_furnished', 'fully_furnished'] as const),

    bedrooms: z.coerce.number().optional(),
    bathrooms: z.coerce.number().optional(),
    balconies: z.coerce.number().default(0),
    parking: z.boolean().default(false),
    facing: z.string().optional(),
    availability_date: z.string().optional(), // Date string YYYY-MM-DD

    location_lat: z.coerce.number().optional(),
    location_lng: z.coerce.number().optional(),

    amenities: z.array(z.string()).default([]),

    images: z.array(z.object({
        image_url: z.string(),
        is_primary: z.boolean(),
        display_order: z.number(),
    })).min(3, 'At least 3 images are required for quality control'),

    is_featured: z.boolean().default(false),
    is_active: z.boolean().default(true),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

interface PropertyFormProps {
    initialData?: any; // PropertyWithDetails ideally
    buildings: Building[];
    onSubmit: (data: PropertyFormValues) => Promise<void>;
    isEdit?: boolean;
}

const COMMON_AMENITIES = [
    'Lift',
    'Security',
    'CCTV',
    'Intercom',
    'Gym',
    'Swimming Pool',
    'Garden',
    'Kids Play Area',
    'Clubhouse',
    'Power Backup',
    'Water Supply',
    'Gas Pipeline',
    'Wifi',
    'Fire Safety',
    'Parking',
];

export function PropertyForm({ initialData, buildings, onSubmit, isEdit = false }: PropertyFormProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const router = useRouter();

    const defaultValues: Partial<PropertyFormValues> = initialData ? {
        ...initialData,
        building_id: initialData.building_id || undefined,
        // Ensure all optional numbers are handled or undefined
        deposit: initialData.deposit || undefined,
        maintenance: initialData.maintenance || undefined,
        bedrooms: initialData.bedrooms || undefined,
        bathrooms: initialData.bathrooms || undefined,
        floor_number: initialData.floor_number || undefined,
        total_floors: initialData.total_floors || undefined,
        location_lat: initialData.location_lat || undefined,
        location_lng: initialData.location_lng || undefined,
        availability_date: initialData.availability_date ? new Date(initialData.availability_date).toISOString().split('T')[0] : undefined,
        amenities: initialData.amenities || [],
        images: initialData.property_images || [],
    } : {
        title: '',
        listing_type: 'sale',
        property_type: '2bhk',
        price: 0,
        description: '',
        carpet_area: 0,
        furnishing: 'unfurnished',
        balconies: 0,
        parking: false,
        amenities: [],
        images: [],
        is_featured: false,
        is_active: true,
    };

    const form = useForm<PropertyFormValues>({
        resolver: zodResolver(propertyFormSchema) as any,
        defaultValues,
    });

    const watchBuildingId = form.watch('building_id');
    const watchListingType = form.watch('listing_type');

    // Auto-fill location when building is selected
    useEffect(() => {
        if (watchBuildingId) {
            const selectedBuilding = buildings.find(b => b.id === watchBuildingId);
            if (selectedBuilding) {
                if (selectedBuilding.location_lat) {
                    form.setValue('location_lat', selectedBuilding.location_lat);
                }
                if (selectedBuilding.location_lng) {
                    form.setValue('location_lng', selectedBuilding.location_lng);
                }
                if (selectedBuilding.total_floors) {
                    // Optional: suggest total floors
                    form.setValue('total_floors', selectedBuilding.total_floors);
                }
            }
        }
    }, [watchBuildingId, buildings, form]);

    const handleSubmit = async (data: PropertyFormValues) => {
        setIsSubmitting(true);
        try {
            await onSubmit(data);
            // Toast handled by parent or here? Let's assume parent redirects or toasts success
        } catch (error) {
            console.error('Submission error', error);
            toast.error('Failed to save property');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">

                {/* BASIC INFO */}
                <Card>
                    <CardHeader>
                        <CardTitle>Basic Information</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Property Title</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Spacious 2BHK in Kandivali West" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="building_id"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Building / Project</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a building" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {buildings.map((building) => (
                                                    <SelectItem key={building.id} value={building.id}>
                                                        {building.name} ({building.type.replace(/_/g, ' ')})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>Select existing building or leave empty</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="listing_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Listing Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="sale">For Sale</SelectItem>
                                                    <SelectItem value="rent">For Rent</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />

                                <FormField
                                    control={form.control}
                                    name="property_type"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Property Type</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select type" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="1rk">1 RK</SelectItem>
                                                    <SelectItem value="1bhk">1 BHK</SelectItem>
                                                    <SelectItem value="2bhk">2 BHK</SelectItem>
                                                    <SelectItem value="3bhk">3 BHK</SelectItem>
                                                    <SelectItem value="shop">Shop</SelectItem>
                                                    <SelectItem value="office">Office</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="price"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>{watchListingType === 'rent' ? 'Monthly Rent (₹)' : 'Price (₹)'}</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            {watchListingType === 'rent' && (
                                <>
                                    <FormField
                                        control={form.control}
                                        name="deposit"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Deposit (₹)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="maintenance"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Maintenance (₹/month)</FormLabel>
                                                <FormControl>
                                                    <Input type="number" {...field} value={field.value ?? ''} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* DETAILS */}
                <Card>
                    <CardHeader>
                        <CardTitle>Property Details</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Detailed description of the property... (Markdown supported)"
                                            className="min-h-[150px]"
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormDescription>
                                        Min 100 characters. Mention key features, nearby landmarks, etc.
                                    </FormDescription>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormField
                                control={form.control}
                                name="carpet_area"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Carpet Area (sqft)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="floor_number"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Floor No.</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="total_floors"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Total Floors</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="furnishing"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Furnishing</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="unfurnished">Unfurnished</SelectItem>
                                                <SelectItem value="semi_furnished">Semi Furnished</SelectItem>
                                                <SelectItem value="fully_furnished">Fully Furnished</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <FormField
                                control={form.control}
                                name="bedrooms"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bedrooms</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="bathrooms"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Bathrooms</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="balconies"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Balconies</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="facing"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Facing</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Direction" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="East">East</SelectItem>
                                                <SelectItem value="West">West</SelectItem>
                                                <SelectItem value="North">North</SelectItem>
                                                <SelectItem value="South">South</SelectItem>
                                                <SelectItem value="North-East">North-East</SelectItem>
                                                <SelectItem value="North-West">North-West</SelectItem>
                                                <SelectItem value="South-East">South-East</SelectItem>
                                                <SelectItem value="South-West">South-West</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <FormField
                                control={form.control}
                                name="parking"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <FormLabel>
                                                Parking Available
                                            </FormLabel>
                                        </div>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="availability_date"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Available From</FormLabel>
                                        <FormControl>
                                            <Input type="date" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                    </CardContent>
                </Card>

                {/* LOCATION */}
                <Card>
                    <CardHeader>
                        <CardTitle>Location</CardTitle>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="location_lat"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Latitude</FormLabel>
                                        <FormControl>
                                            <Input type="number" step="any" {...field} value={field.value ?? ''} />
                                        </FormControl>
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
                                            <Input type="number" step="any" {...field} value={field.value ?? ''} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="text-[0.8rem] text-muted-foreground mt-2">
                            <MapPin className="inline h-4 w-4 mr-1" />
                            Coordinates will be auto-filled if building is selected. You can manually check them on Google Maps.
                        </div>
                    </CardContent>
                </Card>

                {/* AMENITIES */}
                <Card>
                    <CardHeader>
                        <CardTitle>Amenities</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="amenities"
                            render={() => (
                                <FormItem>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {COMMON_AMENITIES.map((item) => (
                                            <FormField
                                                key={item}
                                                control={form.control}
                                                name="amenities"
                                                render={({ field }) => {
                                                    return (
                                                        <FormItem
                                                            key={item}
                                                            className="flex flex-row items-start space-x-3 space-y-0"
                                                        >
                                                            <FormControl>
                                                                <Checkbox
                                                                    checked={field.value?.includes(item)}
                                                                    onCheckedChange={(checked) => {
                                                                        return checked
                                                                            ? field.onChange([...field.value, item])
                                                                            : field.onChange(
                                                                                field.value?.filter(
                                                                                    (value) => value !== item
                                                                                )
                                                                            )
                                                                    }}
                                                                />
                                                            </FormControl>
                                                            <FormLabel className="font-normal">
                                                                {item}
                                                            </FormLabel>
                                                        </FormItem>
                                                    )
                                                }}
                                            />
                                        ))}
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* IMAGES */}
                <Card>
                    <CardHeader>
                        <CardTitle>Property Images</CardTitle>
                        <CardDescription>
                            Upload at least 3 images. Drag to reorder (coming soon), verify primary image.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <FormField
                            control={form.control}
                            name="images"
                            render={({ field }) => (
                                <FormItem>
                                    <FormControl>
                                        <ImageUploader
                                            value={field.value}
                                            onChange={field.onChange}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                {/* SETTINGS */}
                <Card>
                    <CardHeader>
                        <CardTitle>Display Settings</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FormField
                            control={form.control}
                            name="is_featured"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Featured Property
                                        </FormLabel>
                                        <FormDescription>
                                            Show on home page and top of lists
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="is_active"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Active Listing
                                        </FormLabel>
                                        <FormDescription>
                                            Visible to public. Max 50 active listings allowed.
                                        </FormDescription>
                                    </div>
                                </FormItem>
                            )}
                        />
                    </CardContent>
                </Card>

                <div className="flex justify-end gap-4 sticky bottom-4 bg-background/80 backdrop-blur p-4 border rounded-lg shadow-sm">
                    <Button type="button" variant="outline" onClick={() => router.back()}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {isEdit ? 'Update Property' : 'Create Property'}
                    </Button>
                </div>
            </form>
        </Form>
    );
}
