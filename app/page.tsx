"use client";

import { useEffect, useMemo, useState } from 'react';

type LogEntry = {
  id: string;
  timestamp: number;
  level: 'info' | 'error' | 'warn';
  message: string;
  meta?: Record<string, unknown>;
};

export default function HomePage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [phone, setPhone] = useState('15551234567');
  const [body, setBody] = useState('Hello!');
  const [loading, setLoading] = useState(false);

  async function refresh() {
    const res = await fetch('/api/logs', { cache: 'no-store' });
    const data = await res.json();
    setLogs(data.logs);
  }

  useEffect(() => {
    refresh();
    const id = setInterval(refresh, 4000);
    return () => clearInterval(id);
  }, []);

  const rows = useMemo(() => logs.slice().reverse(), [logs]);

  async function simulateInbound() {
    setLoading(true);
    try {
      const res = await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ from: phone, text: body }),
      });
      if (!res.ok) throw new Error('Failed');
      await refresh();
      setBody('');
    } catch (e) {
      console.error(e);
      alert('Simulation failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="row" style={{ gap: 24 }}>
      <div className="col" style={{ maxWidth: 520 }}>
        <h1>AI WhatsApp Agent</h1>
        <p className="muted">Webhook-driven agent that replies to WhatsApp messages.</p>

        <div className="card" style={{ marginTop: 16 }}>
          <h3>Simulate inbound message</h3>
          <div className="field" style={{ marginTop: 8 }}>
            <label style={{ width: 110 }}>From (E.164)</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="15551234567" />
          </div>
          <div className="field" style={{ marginTop: 8 }}>
            <label style={{ width: 110 }}>Message</label>
            <textarea rows={3} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type a message..." />
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
            <button className="btn" disabled={loading || !body.trim()} onClick={simulateInbound}>Send</button>
            <button className="btn secondary" onClick={refresh}>Refresh</button>
          </div>
          <p className="muted" style={{ marginTop: 8 }}>This calls the agent without sending a real WhatsApp message.</p>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h3>Webhook</h3>
          <p>Set your callback URL to <code>/api/webhooks/whatsapp</code> and use your verify token.</p>
          <p className="muted">Env vars: <code>META_VERIFY_TOKEN</code>, <code>META_WHATSAPP_TOKEN</code>, <code>META_PHONE_NUMBER_ID</code>, <code>OPENAI_API_KEY</code></p>
        </div>
      </div>

      <div className="col">
        <h2>Activity</h2>
        <div className="card" style={{ maxHeight: 560, overflow: 'auto' }}>
          <table>
            <thead>
              <tr>
                <th style={{ width: 160 }}>Time</th>
                <th>Message</th>
                <th style={{ width: 160 }}>Level</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((l) => (
                <tr key={l.id}>
                  <td>{new Date(l.timestamp).toLocaleString()}</td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{l.message}</div>
                    {l.meta ? (
                      <pre style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{JSON.stringify(l.meta, null, 2)}</pre>
                    ) : null}
                  </td>
                  <td><span className="badge">{l.level}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
