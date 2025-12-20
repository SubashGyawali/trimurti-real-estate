import { createClient } from '@/lib/supabase/server';
import { PropertiesTable } from '@/components/admin/properties-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export default async function AdminPropertiesPage() {
    const supabase = await createClient();

    const { data: properties, error } = await supabase
        .from('properties')
        .select(`
      *,
      property_images (
        id,
        image_url,
        is_primary,
        display_order
      )
    `)
        .order('created_at', { ascending: false }) as { data: any[] | null; error: any };

    if (error) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Failed to load properties: {error.message}</AlertDescription>
                </Alert>
            </div>
        );
    }

    const activeCount = properties?.filter(p => p.is_active).length || 0;

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Properties</h1>
                    <p className="text-muted-foreground">Manage your property listings</p>
                </div>
            </div>

            {activeCount >= 45 && (
                <Alert variant={activeCount >= 50 ? "destructive" : "warning"}>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Property Limit Warning</AlertTitle>
                    <AlertDescription>
                        You have {activeCount} active properties. The limit is 50.
                        {activeCount >= 50 && " You cannot activate more properties."}
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle>All Listings</CardTitle>
                </CardHeader>
                <CardContent>
                    <PropertiesTable initialProperties={properties || []} />
                </CardContent>
            </Card>
        </div>
    );
}
