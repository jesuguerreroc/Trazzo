// ============================================================
// REGLAS DE TAREAS: qué es pendiente, qué es urgente y cómo se ordena.
// Idea central de TRAZZO: lo pendiente SIEMPRE se ve (tenga fecha o no),
// y al marcarlo como hecho desaparece para dejar espacio a lo demás.
// ============================================================

const ORDEN_PRIORIDAD = { ALTA: 0, MEDIA: 1, BAJA: 2 };
const ORDEN_ESTADO = { EN_PROCESO: 0, POR_HACER: 1, HECHO: 2 };

export const estaPendiente = (t) => t.estado !== 'HECHO';
export const estaAtrasada = (t, hoy) => estaPendiente(t) && Boolean(t.fecha) && t.fecha < hoy;

/** Más urgente primero: prioridad, luego "en proceso", luego fecha, luego la más antigua. */
export function compararUrgencia(a, b) {
  return (
    (ORDEN_PRIORIDAD[a.prioridad] ?? 1) - (ORDEN_PRIORIDAD[b.prioridad] ?? 1) ||
    (ORDEN_ESTADO[a.estado] ?? 1) - (ORDEN_ESTADO[b.estado] ?? 1) ||
    (a.fecha || '9999').localeCompare(b.fecha || '9999') ||
    (a.creada || 0) - (b.creada || 0)
  );
}

/**
 * Orden de la lista de pendientes:
 * 1) atrasadas (la más vieja primero), 2) las de hoy, 3) el resto por prioridad.
 */
export function ordenarPendientes(tareas, hoy) {
  const grupo = (t) => (t.fecha && t.fecha < hoy ? 0 : t.fecha === hoy ? 1 : 2);
  return tareas
    .filter(estaPendiente)
    .sort(
      (a, b) =>
        grupo(a) - grupo(b) ||
        (grupo(a) === 0 ? a.fecha.localeCompare(b.fecha) : 0) ||
        compararUrgencia(a, b)
    );
}

export const tareasDeHoy = (tareas, hoy) =>
  tareas.filter((t) => estaPendiente(t) && t.fecha === hoy).sort(compararUrgencia);

export const tareasAtrasadas = (tareas, hoy) =>
  tareas
    .filter((t) => estaAtrasada(t, hoy))
    .sort((a, b) => a.fecha.localeCompare(b.fecha) || compararUrgencia(a, b));

export const tareasPrioridadAlta = (tareas, hoy) =>
  ordenarPendientes(tareas.filter((t) => t.prioridad === 'ALTA'), hoy);

/** Todas las tareas de un día: pendientes primero, hechas al final */
export function tareasDelDia(tareas, iso) {
  return tareas
    .filter((t) => t.fecha === iso)
    .sort((a, b) => Number(!estaPendiente(a)) - Number(!estaPendiente(b)) || compararUrgencia(a, b));
}

/** Agrupa pendientes por fecha para la pantalla Tareas. */
export function agruparPendientes(tareas, hoy) {
  const ordenadas = ordenarPendientes(tareas, hoy);
  const grupos = [
    { id: 'atrasadas', titulo: 'Atrasadas', tono: 'peligro', tareas: [] },
    { id: 'hoy', titulo: 'Hoy', tareas: [] },
    { id: 'proximas', titulo: 'Próximas', tareas: [] },
    { id: 'sin-fecha', titulo: 'Sin fecha', tareas: [] },
  ];
  for (const t of ordenadas) {
    if (!t.fecha) grupos[3].tareas.push(t);
    else if (t.fecha < hoy) grupos[0].tareas.push(t);
    else if (t.fecha === hoy) grupos[1].tareas.push(t);
    else grupos[2].tareas.push(t);
  }
  grupos[2].tareas.sort((a, b) => a.fecha.localeCompare(b.fecha) || compararUrgencia(a, b));
  return grupos.filter((g) => g.tareas.length > 0);
}
