import { addLog } from './logStore';

type SendTextParams = {
  to: string; // phone number in E.164
  body: string;
};

const BASE_URL = 'https://graph.facebook.com/v19.0';

export async function sendWhatsAppText({ to, body }: SendTextParams) {
  const token = process.env.META_WHATSAPP_TOKEN;
  const phoneNumberId = process.env.META_PHONE_NUMBER_ID;
  if (!token || !phoneNumberId) {
    addLog('warn', 'META_WHATSAPP_TOKEN or META_PHONE_NUMBER_ID missing; skipping real send', { to, body });
    return { ok: true, skipped: true } as const;
  }

  const url = `${BASE_URL}/${phoneNumberId}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body }
    })
  });

  const json = await res.json().catch(() => undefined);
  if (!res.ok) {
    addLog('error', 'WhatsApp send failed', { status: res.status, json });
    throw new Error(`WhatsApp send failed: ${res.status}`);
  }
  addLog('info', 'WhatsApp message sent', { to });
  return { ok: true, response: json } as const;
}
