import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(req: Request) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
    return NextResponse.json({ error: 'Google Calendar is not configured' }, { status: 503 });
  }
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  const state = randomUUID();
  const params = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID,
    redirect_uri: process.env.GOOGLE_REDIRECT_URI, response_type: 'code', access_type: 'offline',
    prompt: 'consent select_account', scope: 'https://www.googleapis.com/auth/calendar', state });
  const response = NextResponse.redirect('https://accounts.google.com/o/oauth2/v2/auth?' + params);
  response.cookies.set('careeriq_calendar_state', state, { httpOnly: true, secure: new URL(req.url).protocol === 'https:', sameSite: 'lax', maxAge: 600, path: '/api/google' });
  return response;
}
