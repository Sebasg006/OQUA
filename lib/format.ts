export function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  return ((parts[0]?.[0] ?? '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

// 'AAAA-MM-DD' -> '3 mar 2026' (se arma a mano para no depender de zonas horarias)
export function formatDate(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}

// 'AAAA-MM-DD' -> 'DD/MM/AAAA' (como se escribe en Colombia).
export const toDisplay = (iso: string | null) => (iso ? iso.split('-').reverse().join('/') : '');

export function daysSince(iso: string) {
  const [y, m, d] = iso.split('-').map(Number);
  const then = Date.UTC(y, m - 1, d);
  const now = new Date();
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((today - then) / 86_400_000);
}

// Días entre dos fechas 'AAAA-MM-DD'.
export function daysBetween(from: string, to: string) {
  const day = (iso: string) => {
    const [y, m, d] = iso.split('-').map(Number);
    return Date.UTC(y, m - 1, d);
  };
  return Math.round((day(to) - day(from)) / 86_400_000);
}

// '5 días', '3 semanas', '4 meses': un lapso en palabras.
export function spanLabel(days: number) {
  if (days < 14) return `${days} ${days === 1 ? 'día' : 'días'}`;
  if (days < 63) return `${Math.round(days / 7)} semanas`;
  const months = Math.round(days / 30);
  return `${months} ${months === 1 ? 'mes' : 'meses'}`;
}

export function daysAgoLabel(iso: string) {
  const n = daysSince(iso);
  if (n <= 0) return 'hoy';
  if (n === 1) return 'ayer';
  return `hace ${n} días`;
}

export function signed(n: number, unit: string, decimals = 1) {
  const v = n.toFixed(decimals);
  return `${n > 0 ? '+' : ''}${v}${unit}`;
}

// Acepta coma o punto decimal; vacío = no ingresado; texto inválido = NaN.
export function parseNumber(text: string): number | undefined {
  const t = text.trim().replace(',', '.');
  if (!t) return undefined;
  return /^\d+(\.\d+)?$/.test(t) ? Number(t) : NaN;
}

// Fecha local 'AAAA-MM-DD' de un instante (las sesiones llegan en UTC; en Colombia una sesión de las 8 p. m. ya es "mañana" en UTC).
export function localDateOf(isoInstant: string) {
  const d = new Date(isoInstant);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

// Segundos -> '4:05' o '1:02:30' (cronómetro de la sesión).
export function formatClock(totalSeconds: number) {
  const s = Math.max(0, Math.round(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const pad = (n: number) => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s % 60)}` : `${m}:${pad(s % 60)}`;
}

// 1850 -> '1.850' (separador de miles como en Colombia, sin depender de Intl).
export const miles = (n: number) => String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');

const WEEKDAYS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

// 'martes 20 oct': la fecha de hoy en palabras.
export function todayLabel(now = new Date()) {
  return `${WEEKDAYS[now.getDay()]} ${now.getDate()} ${MONTHS[now.getMonth()]}`;
}
