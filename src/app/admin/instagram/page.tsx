import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { env } from '@/lib/env';
import { InstagramDashboard } from '@/components/admin/instagram-dashboard';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import type { InstagramAgentComment, InstagramAgentTeaching } from '@/types/database';

function getSupabaseAdmin() {
  if (!env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not configured');
  }
  return createSupabaseClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } }
  );
}

export default async function AdminInstagramPage() {
    const supabase = getSupabaseAdmin();

    // Fetch all Instagram agent comments (service_role bypasses RLS)
    const { data: comments, error } = await supabase
        .from('instagram_agent_comments')
        .select('*')
        .is('hidden_at', null)
        .order('created_at', { ascending: false }) as { data: InstagramAgentComment[] | null; error: any };

    // Fetch teachings
    const { data: teachings } = await supabase
        .from('instagram_agent_teachings')
        .select('*')
        .order('created_at', { ascending: false }) as { data: InstagramAgentTeaching[] | null; error: any };

    if (error) {
        return (
            <div className="p-8">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>Failed to load Instagram comments: {error.message}</AlertDescription>
                </Alert>
            </div>
        );
    }

    const allComments = comments || [];
    const allTeachings = teachings || [];

    return (
        <InstagramDashboard
            initialComments={allComments}
            teachings={allTeachings}
        />
    );
}