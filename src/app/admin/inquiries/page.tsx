import { createClient } from '@/lib/supabase/server';
import { InquiriesTable } from '@/components/admin/inquiries-table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, MessageSquare, MessageCircle, CheckCircle, Clock } from 'lucide-react';

export default async function AdminInquiriesPage() {
    const supabase = await createClient();

    // Fetch inquiries with property info
    const { data: inquiries, error } = await supabase
        .from('inquiries')
        .select(`
            *,
            property:properties (
                id,
                title,
                slug
            )
        `)
        .order('created_at', { ascending: false }) as { data: any[] | null; error: any };

    if (error) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Failed to load inquiries: {error.message}</AlertDescription>
                </Alert>
            </div>
        );
    }

    const allInquiries = inquiries || [];

    // Calculate stats
    const totalCount = allInquiries.length;
    const newCount = allInquiries.filter(i => i.status === 'new').length;
    const contactedCount = allInquiries.filter(i => i.status === 'contacted').length;

    // This month's inquiries
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    const thisMonthCount = allInquiries.filter(i =>
        new Date(i.created_at) >= startOfMonth
    ).length;

    return (
        <div className="p-8 space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Inquiries</h1>
                    <p className="text-muted-foreground">Manage customer inquiries and leads</p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Inquiries</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">New</CardTitle>
                        <Clock className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{newCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Contacted</CardTitle>
                        <MessageCircle className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-amber-600">{contactedCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">This Month</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{thisMonthCount}</div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Inquiries</CardTitle>
                </CardHeader>
                <CardContent>
                    <InquiriesTable initialInquiries={allInquiries} />
                </CardContent>
            </Card>
        </div>
    );
}
