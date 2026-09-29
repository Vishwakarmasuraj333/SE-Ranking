export function formatDate(dateStringOrDate?: string | Date | null): string {
  if (!dateStringOrDate) return '—';
  try {
    const d = new Date(dateStringOrDate);
    if (isNaN(d.getTime())) return String(dateStringOrDate);
    return d.toISOString().replace('T', ' ').substring(0, 19);
  } catch {
    return String(dateStringOrDate);
  }
}

export function formatNumber(num: number | null | undefined): string {
  if (num === null || num === undefined) return '0';
  return num.toLocaleString();
}
