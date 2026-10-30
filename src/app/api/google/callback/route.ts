import { google } from 'googleapis';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
    return NextResponse.json({ error: 'Google Calendar is not configured' }, { status: 503 });
  }
  const params = new URL(req.url).searchParams;
  const jar = await cookies();
  const state = jar.get('careeriq_calendar_state')?.value;
  jar.delete('careeriq_calendar_state');
  if (!state || state !== params.get('state') || !params.get('code')) {
    return NextResponse.json({ error: 'Invalid or expired calendar authorization' }, { status: 400 });
  }
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  try {
    const oauth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
    const { tokens } = await oauth.getToken(params.get('code')!);
    const { data: profile } = await supabase.from('users').select('google_refresh_token').eq('auth_uid', user.id).single();
    const refreshToken = tokens.refresh_token || profile?.google_refresh_token;
    if (!refreshToken) return NextResponse.json({ error: 'Offline calendar authorization was not granted. Please reconnect.' }, { status: 400 });
    const { error: saveError } = await supabase.from('users').update({ google_refresh_token: refreshToken, calendarconnected: true }).eq('auth_uid', user.id);
    if (saveError) return NextResponse.json({ error: 'Calendar connection could not be saved' }, { status: 500 });
    return NextResponse.redirect(new URL('/home/calendar', req.url));
  } catch {
    return NextResponse.json({ error: 'Calendar authorization failed. Please reconnect.' }, { status: 502 });
  }
}
