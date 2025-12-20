import { createClient } from '@/lib/supabase/server';
import { VisitsTable } from '@/components/admin/visits-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Calendar, Clock, CheckCircle, CalendarCheck } from 'lucide-react';

export default async function AdminVisitsPage() {
    const supabase = await createClient();

    // Fetch visits with property info
    const { data: visits, error } = await supabase
        .from('property_visits')
        .select(`
            *,
            property:properties (
                id,
                title,
                slug
            )
        `)
        .order('preferred_date', { ascending: true })
        .order('created_at', { ascending: false }) as { data: any[] | null; error: any };

    if (error) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Failed to load visits: {error.message}</AlertDescription>
                </Alert>
            </div>
        );
    }

    const allVisits = visits || [];

    // Calculate stats
    const totalCount = allVisits.length;
    const pendingCount = allVisits.filter(v => v.status === 'pending').length;
    const confirmedCount = allVisits.filter(v => v.status === 'confirmed').length;

    // Today's visits
    const today = new Date().toISOString().split('T')[0];
    const todayCount = allVisits.filter(v => v.preferred_date === today).length;

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Property Visits</h1>
                    <p className="text-muted-foreground">Manage scheduled property viewings</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{pendingCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                        <CheckCircle className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{confirmedCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Today</CardTitle>
                        <CalendarCheck className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{todayCount}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Visits</CardTitle>
                </CardHeader>
                <CardContent>
                    <VisitsTable initialVisits={allVisits} />
                </CardContent>
            </Card>
        </div>
    );
}
