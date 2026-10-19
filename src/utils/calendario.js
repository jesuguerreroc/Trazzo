// ============================================================
// CALENDARIO — enviar una tarea a Google Calendar o al calendario
// del celular (.ics). Así el celular te avisa aunque TRAZZO esté cerrada.
// ============================================================
import { sumarDias } from './fechas';
import { descargarArchivo } from './descargar';

const sinGuiones = (iso) => iso.replace(/-/g, '');

/** Enlace que abre Google Calendar con el evento listo para guardar (todo el día). */
export function enlaceGoogleCalendar(tarea) {
  const parametros = new URLSearchParams({
    action: 'TEMPLATE',
    text: tarea.titulo,
    dates: `${sinGuiones(tarea.fecha)}/${sinGuiones(sumarDias(tarea.fecha, 1))}`,
    details: 'Pendiente creado en TRAZZO',
    ctz: 'America/Bogota',
  });
  return `https://calendar.google.com/calendar/render?${parametros}`;
}

const escapar = (texto) => texto.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');

/** Descarga un archivo .ics (iPhone, Android, Outlook) con alarma según el recordatorio. */
export function descargarIcs(tarea) {
  const ahora = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  // Alarma a las 8:00 a. m. del día que corresponda (el evento empieza a las 00:00)
  const disparo = { 0: 'PT8H', 1: '-PT16H', 2: '-P1DT16H' }[tarea.recordatorio ?? 0];

  const lineas = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//TRAZZO//ES',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${tarea.id}@trazzo`,
    `DTSTAMP:${ahora}`,
    `DTSTART;VALUE=DATE:${sinGuiones(tarea.fecha)}`,
    `DTEND;VALUE=DATE:${sinGuiones(sumarDias(tarea.fecha, 1))}`,
    `SUMMARY:${escapar(tarea.titulo)}`,
    'DESCRIPTION:Pendiente creado en TRAZZO',
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escapar(tarea.titulo)}`,
    `TRIGGER:${disparo}`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  const nombre = tarea.titulo.replace(/[^\w\sáéíóúñ-]/gi, '').trim().slice(0, 40) || 'tarea';
  descargarArchivo(`${nombre}.ics`, lineas.join('\r\n'), 'text/calendar;charset=utf-8');
}
