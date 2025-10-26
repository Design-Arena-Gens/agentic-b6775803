import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
  title: 'AI WhatsApp Agent Dashboard',
  description: 'Manage and simulate WhatsApp AI agent',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div style={{ maxWidth: 980, margin: '0 auto', padding: '24px' }}>{children}</div>
      </body>
    </html>
  );
}
