import { createClient } from '@/lib/supabase/server';
import { BuildingsTable } from '@/components/admin/buildings-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Building2 } from 'lucide-react';

export default async function AdminBuildingsPage() {
    const supabase = await createClient();

    // Fetch buildings with property count
    const { data: buildings, error } = await supabase
        .from('buildings')
        .select(`
            *,
            properties:properties(count)
        `)
        .order('name');

    if (error) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Failed to load buildings: {error.message}</AlertDescription>
                </Alert>
            </div>
        );
    }

    // Transform the count from array to number
    const buildingsWithCount = (buildings || []).map((building: any) => ({
        ...building,
        property_count: building.properties?.[0]?.count ?? 0
    }));

    const mhadaCount = buildingsWithCount.filter(b => b.type === 'mhada_7_storey' || b.type === 'mhada_tower').length;
    const privateCount = buildingsWithCount.filter(b => b.type === 'private').length;

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Buildings</h1>
                    <p className="text-muted-foreground">Manage buildings and complexes</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Buildings</CardTitle>
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{buildingsWithCount.length}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">MHADA Buildings</CardTitle>
                        <Building2 className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{mhadaCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Private Buildings</CardTitle>
                        <Building2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{privateCount}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Buildings</CardTitle>
                </CardHeader>
                <CardContent>
                    <BuildingsTable initialBuildings={buildingsWithCount} />
                </CardContent>
            </Card>
        </div>
    );
}
