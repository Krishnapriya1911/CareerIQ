import { NextResponse } from 'next/server';

export interface ProctorEvent {
  type: 'screenshot' | 'tab_switch' | 'copy' | 'paste' | 'devtools' | 'right_click' | 'keyboard_shortcut' | 'mouse_inactive' | 'mouse_edge' | 'clipboard_clear' | 'multiple_tab' | 'seb_violation';
  timestamp: number;
  sessionId: string;
  userEmail?: string;
  metadata?: Record<string, any>;
}

// A process-global array leaked events across accounts and was lost on serverless restart.
// Persistent, owner-scoped event storage must exist before this feature is enabled.
export async function POST() {
  return NextResponse.json({ error: 'Persistent exam event recording is not configured' }, { status: 503 });
}
export async function GET() {
  return NextResponse.json({ error: 'Persistent exam event recording is not configured' }, { status: 503 });
}
