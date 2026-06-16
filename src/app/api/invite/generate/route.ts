import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { randomBytes } from 'crypto';

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
    
    if (!supabaseUrl || !supabaseKey) {
      // Mock mode Fallback
      return NextResponse.json({ token: 'ag-mock-invite-' + Date.now() });
    }

    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {}
      }
    });

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await supabase.from('profiles').select('agency_id, role').eq('id', user.id).single();
    if (!profile?.agency_id) return NextResponse.json({ error: 'No agency' }, { status: 403 });
    if (profile.role !== 'owner' && profile.role !== 'manager') {
      return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const role = body.role || 'agent';
    const email = body.email || 'agent@orcal-erp.com';
    const token = 'ag-' + randomBytes(8).toString('hex');

    const { data, error } = await supabase.from('invites').insert({
      agency_id: profile.agency_id,
      email: email,
      role: role,
      token: token,
      created_by: user.id
    }).select('token').single();

    if (error) {
       console.error("Invite generation error:", error);
       return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ token: data.token });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
