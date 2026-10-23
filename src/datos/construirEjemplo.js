// Convierte los datos de ejemplo (ejemplo.js) al formato que guarda la app.
import * as ejemplo from './ejemplo';
import { sumarDias } from '../utils/fechas';
import { nuevoIdSubitem } from '../utils/subitems';

export function construirEjemplo(hoy) {
  const ahora = Date.now();

  return {
    tableros: ejemplo.tableros.map((t, i) => ({
      id: t.id,
      nombre: t.nombre,
      tipo: t.tipo,
      icono: t.icono || null,
      fila: t.fila || '',
      unidad: t.unidad || '',
      orden: i + 1,
      creada: ahora + i,
    })),

    tareas: ejemplo.tareas.map((t, i) => ({
      titulo: t.titulo,
      tablero: t.tablero || null,
      prioridad: t.prioridad || 'MEDIA',
      fecha: t.dias == null ? null : sumarDias(hoy, t.dias),
      recordatorio: t.recordatorio ?? null,
      estado: t.estado || 'POR_HACER',
      creada: ahora + i,
      completada: t.estado === 'HECHO' ? ahora : null,
    })),

    contadores: ejemplo.contadores.map((c, i) => ({
      tablero: c.tablero,
      nombre: c.nombre,
      pendientes: c.pendientes || 0,
      notas: c.notas || '',
      items: (c.items || []).map((texto) => ({ id: nuevoIdSubitem(), texto })),
      creada: ahora + i,
    })),

    cobros: ejemplo.cobros.map((c, i) => ({
      tablero: c.tablero,
      concepto: c.concepto,
      cliente: c.cliente,
      monto: c.monto,
      mes: c.mes || '',
      estado: c.estado || 'POR_COBRAR',
      creada: ahora + i,
      pagado: null,
    })),
  };
}
