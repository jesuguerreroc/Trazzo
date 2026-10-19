// ============================================================
// TABLEROS — cálculos que se muestran en Inicio, menú y tarjetas.
// ============================================================
import { formatoCOP } from './dinero';
import { cantidad, plural } from './palabras';
import { estaPendiente } from './tareas';
import { hoyISO } from './fechas';

export const rutaTablero = (tablero) => `/app/t/${tablero.id}`;

const suma = (lista, campo) => lista.reduce((t, x) => t + (Number(x[campo]) || 0), 0);

/**
 * Número principal de un tablero:
 *  lista    -> tareas pendientes
 *  contador -> total pendiente (ej: 13 videos)
 *  cobros   -> dinero por cobrar
 */
export function resumenTablero(tablero, { tareas, contadores, cobros }) {
  if (tablero.tipo === 'lista') {
    const pendientes = tareas.filter((t) => t.tablero === tablero.id && estaPendiente(t));
    const hoy = hoyISO();
    const atrasadas = pendientes.filter((t) => t.fecha && t.fecha < hoy).length;
    return { valor: pendientes.length, detalle: pendientes.length === 1 ? 'pendiente' : 'pendientes', atrasadas };
  }
  if (tablero.tipo === 'contador') {
    const filas = contadores.filter((c) => c.tablero === tablero.id);
    const conPendientes = filas.filter((c) => Number(c.pendientes) > 0).length;
    const total = suma(filas, 'pendientes');
    const unidad = tablero.unidad || 'pendientes';
    return {
      valor: total,
      detalle: conPendientes
        ? `${cantidad(total, unidad).replace(/^\d+ /, '')} · ${conPendientes} ${conPendientes === 1 ? tablero.fila : plural(tablero.fila)}`
        : cantidad(total, unidad).replace(/^\d+ /, ''),
    };
  }
  const porCobrar = cobros.filter((c) => c.tablero === tablero.id && c.estado !== 'PAGADO');
  return {
    valor: suma(porCobrar, 'monto'),
    formato: formatoCOP,
    detalle: `${porCobrar.length} ${porCobrar.length === 1 ? 'cobro' : 'cobros'}`,
  };
}
