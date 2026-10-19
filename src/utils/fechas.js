// ============================================================
// FECHAS — siempre en hora de Colombia y formato día/mes/año.
// Las fechas se guardan como texto 'AAAA-MM-DD' (ej: '2026-10-18').
// ============================================================
import { APP } from '../config/app';

const DIAS_CORTOS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const DIAS_LARGOS = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const formateador = new Intl.DateTimeFormat('en-US', {
  timeZone: APP.zonaHoraria,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Fecha de hoy en Colombia, ej: '2026-10-18' */
export function hoyISO() {
  const partes = Object.fromEntries(formateador.formatToParts(new Date()).map((p) => [p.type, p.value]));
  return `${partes.year}-${partes.month}-${partes.day}`;
}

function aFecha(iso) {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d));
}

export function sumarDias(iso, n) {
  const f = aFecha(iso);
  f.setUTCDate(f.getUTCDate() + n);
  return f.toISOString().slice(0, 10);
}

/** Días que hay entre dos fechas (positivo si "hasta" es después). */
export function diferenciaDias(desde, hasta) {
  return Math.round((aFecha(hasta) - aFecha(desde)) / 86400000);
}

/** 0 = lunes ... 6 = domingo */
export function indiceDia(iso) {
  return (aFecha(iso).getUTCDay() + 6) % 7;
}

export const diaCorto = (iso) => DIAS_CORTOS[indiceDia(iso)];
export const diaLargo = (iso) => DIAS_LARGOS[indiceDia(iso)];
export const numeroDia = (iso) => Number(iso.slice(8, 10));

/** '2026-10-18' -> '18/10/2026' */
export function formatoFecha(iso) {
  if (!iso) return '';
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

/** '2026-10-18' -> '18/10' */
export function formatoCorto(iso) {
  if (!iso) return '';
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

/** '2026-10-18' -> 'Domingo 18 de octubre' */
export function fechaLarga(iso) {
  const [, m] = iso.split('-').map(Number);
  return `${diaLargo(iso)} ${numeroDia(iso)} de ${MESES[m - 1].toLowerCase()}`;
}

/** Texto amigable: Hoy, Mañana, Ayer, Hace 3 días, Vie 23/10, 18/11/2026 */
export function fechaRelativa(iso, hoy) {
  if (!iso) return '';
  const dif = diferenciaDias(hoy, iso);
  if (dif === 0) return 'Hoy';
  if (dif === 1) return 'Mañana';
  if (dif === -1) return 'Ayer';
  if (dif < 0) return `Hace ${-dif} días`;
  if (dif < 7) return `${diaCorto(iso)} ${formatoCorto(iso)}`;
  return formatoFecha(iso);
}

/** Fecha (Colombia) de un momento guardado como número: 1729300000000 -> '2026-10-18' */
export function isoDeMomento(ms) {
  const partes = Object.fromEntries(formateador.formatToParts(new Date(ms)).map((p) => [p.type, p.value]));
  return `${partes.year}-${partes.month}-${partes.day}`;
}
