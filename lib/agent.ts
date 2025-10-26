import OpenAI from 'openai';
import { addLog } from './logStore';

type AgentInput = {
  from: string;
  text: string;
};

type AgentOutput = {
  reply: string;
};

const systemPrompt = `You are a concise, professional WhatsApp agent for a business. 
- Keep responses under 5 short sentences.
- Ask one clarifying question if needed.
- If asked about pricing/hours/location, provide structured, clear answers.
- If you cannot answer, ask for human handoff.`;

function ruleBasedReply(text: string): string | null {
  const t = text.toLowerCase();
  if (/hours|opening|open/i.test(t)) {
    return 'Our hours are Mon–Fri 9am–6pm and Sat 10am–4pm.';
  }
  if (/price|pricing|cost|rate/i.test(t)) {
    return 'Pricing varies by service. Could you share which service you need?';
  }
  if (/location|address|where/i.test(t)) {
    return 'We are located at 123 Main St. Street parking available.';
  }
  if (/hi|hello|hey|good\s*(morning|afternoon|evening)/i.test(t)) {
    return 'Hi! How can I help you today?';
  }
  return null;
}

export async function generateAgentReply(input: AgentInput): Promise<AgentOutput> {
  const fallback = ruleBasedReply(input.text);
  if (fallback) {
    addLog('info', 'Rule-based reply selected', { from: input.from });
    return { reply: fallback };
  }

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    addLog('warn', 'OPENAI_API_KEY missing; using generic fallback');
    return { reply: 'Thanks for reaching out! Could you share more details so I can help?' };
  }

  try {
    const openai = new OpenAI({ apiKey });
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input.text },
      ],
      temperature: 0.4,
      max_tokens: 220,
    });
    const reply = res.choices[0]?.message?.content?.trim() || 'Thanks! How can I help further?';
    return { reply };
  } catch (err: any) {
    addLog('error', 'OpenAI call failed', { error: String(err) });
    return { reply: 'Thanks for reaching out! Could you share more details so I can assist?' };
  }
}
