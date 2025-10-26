export type LogLevel = 'info' | 'error' | 'warn';
export type LogEntry = {
  id: string;
  timestamp: number;
  level: LogLevel;
  message: string;
  meta?: Record<string, unknown>;
};

const memory: LogEntry[] = [];

export function addLog(level: LogLevel, message: string, meta?: Record<string, unknown>) {
  memory.push({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    level,
    message,
    meta,
  });
  if (memory.length > 500) memory.shift();
}

export function getLogs(): LogEntry[] {
  return memory;
}
