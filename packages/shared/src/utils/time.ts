export function nowISO(): string {
  return new Date().toISOString();
}

export function elapsedMs(start: string, end?: string): number {
  const startTime = new Date(start).getTime();
  const endTime = end ? new Date(end).getTime() : Date.now();
  return Math.max(0, endTime - startTime);
}

export function generateId(prefix: string): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 8);
  return `${prefix}_${timestamp}${random}`;
}
