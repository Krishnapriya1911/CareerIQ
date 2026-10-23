import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_REDIRECT_URI) {
    return NextResponse.json({ error: 'Google Calendar is not configured' }, { status: 503 });
  }
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return NextResponse.json({ error: 'Sign in required' }, { status: 401 });
  let input;
  try { input = await req.json(); } catch { return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 }); }
  const { type, event } = input;
  if (!['create','update','delete'].includes(type) || !event || (type !== 'create' && typeof event.google_event_id !== 'string')) {
    return NextResponse.json({ error: 'Invalid calendar operation' }, { status: 400 });
  }
  if (type !== 'delete' && (typeof event.title !== 'string' || !event.title.trim() || event.title.length > 500 || !Number.isFinite(Date.parse(event.start)) || !Number.isFinite(Date.parse(event.end)) || Date.parse(event.end) <= Date.parse(event.start))) {
    return NextResponse.json({ error: 'A title and valid start/end times are required' }, { status: 400 });
  }
  const { data: profile } = await supabase.from('users').select('google_refresh_token').eq('auth_uid', user.id).single();
  if (!profile?.google_refresh_token) return NextResponse.json({ error: 'Connect Google Calendar first' }, { status: 409 });
  try {
    const auth = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, process.env.GOOGLE_REDIRECT_URI);
    auth.setCredentials({ refresh_token: profile.google_refresh_token });
    const calendar = google.calendar({ version: 'v3', auth });
    const requestBody = { summary: event.title, start: { dateTime: event.start }, end: { dateTime: event.end } };
    if (type === 'create') {
      const response = await calendar.events.insert({ calendarId: 'primary', requestBody });
      return NextResponse.json({ google_event_id: response.data.id });
    }
    if (type === 'update') await calendar.events.update({ calendarId: 'primary', eventId: event.google_event_id, requestBody });
    else await calendar.events.delete({ calendarId: 'primary', eventId: event.google_event_id });
    return NextResponse.json({ success: true });
  } catch { return NextResponse.json({ error: 'Calendar sync failed. Please reconnect or retry.' }, { status: 502 }); }
}
