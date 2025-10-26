import { NextRequest, NextResponse } from 'next/server';
import { addLog } from '@lib/logStore';
import { generateAgentReply } from '@lib/agent';
import { sendWhatsAppText } from '@lib/whatsapp';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  // Verification handshake
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode === 'subscribe' && token && challenge) {
    const expected = process.env.META_VERIFY_TOKEN;
    if (token === expected) {
      addLog('info', 'Webhook verified');
      return new NextResponse(challenge, { status: 200 });
    }
    addLog('warn', 'Webhook verification failed');
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    addLog('info', 'Inbound webhook received', { payload });

    const entries = payload?.entry ?? [];
    for (const entry of entries) {
      const changes = entry?.changes ?? [];
      for (const change of changes) {
        const value = change?.value;
        const messages = value?.messages ?? [];
        for (const message of messages) {
          const from = message?.from;
          const type = message?.type;
          const text = type === 'text' ? message?.text?.body : undefined;
          if (!from || !text) continue;

          const { reply } = await generateAgentReply({ from, text });
          await sendWhatsAppText({ to: from, body: reply });
          addLog('info', 'Auto-replied to inbound message', { from });
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    addLog('error', 'Webhook handler error', { error: String(err) });
    return NextResponse.json({ error: 'Bad Request' }, { status: 400 });
  }
}
