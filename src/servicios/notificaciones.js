// ============================================================
// RECORDATORIOS con notificaciones del navegador.
//
// Cómo funciona: cada vez que abres TRAZZO (y cada 5 minutos mientras
// está abierta) se revisan las tareas con recordatorio. Si ya es el día
// del aviso, se muestra una notificación UNA sola vez.
//
// Límite: con la app totalmente cerrada no llegan notificaciones (eso
// requiere un servidor de pago). Para avisos garantizados usa el botón
// "Agregar al calendario" de cada tarea.
// ============================================================
import { diferenciaDias, formatoFecha, sumarDias } from '../utils/fechas';
import { estaPendiente } from '../utils/tareas';

const CLAVE_ACTIVAS = 'trazzo:notificaciones';
const CLAVE_ENVIADAS = 'trazzo:avisos-enviados';

export const soportaNotificaciones = () => typeof window !== 'undefined' && 'Notification' in window;

export function estadoNotificaciones() {
  if (!soportaNotificaciones()) return 'no-soportado';
  if (Notification.permission === 'denied') return 'bloqueadas';
  if (Notification.permission === 'granted' && localStorage.getItem(CLAVE_ACTIVAS) === 'si') return 'activas';
  return 'inactivas';
}

/** Pide permiso y activa los recordatorios. Devuelve el nuevo estado. */
export async function activarNotificaciones() {
  if (!soportaNotificaciones()) return 'no-soportado';
  const permiso = await Notification.requestPermission();
  if (permiso === 'granted') {
    localStorage.setItem(CLAVE_ACTIVAS, 'si');
    await mostrar('TRAZZO', 'Listo. Te avisaremos de tus tareas con recordatorio.', 'prueba');
  }
  return estadoNotificaciones();
}

export function desactivarNotificaciones() {
  localStorage.removeItem(CLAVE_ACTIVAS);
}

/** Tareas pendientes cuyo día de aviso ya llegó. */
export function recordatoriosDeHoy(tareas, hoy) {
  return tareas.filter(
    (t) => estaPendiente(t) && t.fecha && t.recordatorio != null && sumarDias(t.fecha, -t.recordatorio) <= hoy
  );
}

export async function revisarRecordatorios(tareas, hoy) {
  if (estadoNotificaciones() !== 'activas') return;

  let enviadas = {};
  try {
    enviadas = JSON.parse(localStorage.getItem(CLAVE_ENVIADAS)) || {};
  } catch {
    /* sin historial */
  }

  for (const t of recordatoriosDeHoy(tareas, hoy)) {
    const clave = `${t.id}:${t.fecha}:${t.recordatorio}`;
    if (enviadas[clave]) continue;
    const dif = diferenciaDias(hoy, t.fecha);
    const cuerpo =
      dif < 0
        ? `Atrasada desde el ${formatoFecha(t.fecha)}`
        : dif === 0
          ? 'Vence hoy'
          : dif === 1
            ? 'Vence mañana'
            : `Vence el ${formatoFecha(t.fecha)}`;
    await mostrar(t.titulo, cuerpo, t.id);
    enviadas[clave] = Date.now();
  }

  localStorage.setItem(CLAVE_ENVIADAS, JSON.stringify(enviadas));
}

async function mostrar(titulo, cuerpo, etiqueta) {
  const opciones = {
    body: cuerpo,
    icon: '/icono-192.png',
    badge: '/icono-192.png',
    tag: etiqueta,
    data: { url: '/app/tareas' },
  };
  try {
    // En celulares las notificaciones deben salir desde el service worker
    const registro = await navigator.serviceWorker?.getRegistration();
    if (registro) return await registro.showNotification(titulo, opciones);
    new Notification(titulo, opciones);
  } catch (e) {
    console.warn('No se pudo mostrar la notificación', e);
  }
}
