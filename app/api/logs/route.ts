import { NextRequest, NextResponse } from 'next/server';
import { addLog, getLogs } from '@lib/logStore';
import { generateAgentReply } from '@lib/agent';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ logs: getLogs() });
}

export async function POST(req: NextRequest) {
  try {
    const { from, text } = await req.json();
    if (!from || !text) return NextResponse.json({ error: 'Invalid' }, { status: 400 });
    addLog('info', 'Simulated inbound', { from, text });
    const { reply } = await generateAgentReply({ from, text });
    addLog('info', 'Simulated reply', { to: from, reply });
    return NextResponse.json({ ok: true, reply });
  } catch (e: any) {
    addLog('error', 'Logs POST failed', { error: String(e) });
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
}
