// Una tarea en una lista: círculo para marcar HECHO con un clic,
// y al tocar el texto se abre para editarla.
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, CalendarDays, Check } from 'lucide-react';
import { ESTADOS } from '../config/app';
import { fechaRelativa } from '../utils/fechas';
import { useEditorTarea } from '../contexto/EditorTareaContext';
import { cx } from '../utils/cx';

// Tiempo para ver el tachado antes de que la tarea se vaya de la lista
const ESPERA_ANIMACION = 480;

export function TareaFila({ tarea, tableros, hoy, alAlternar, ocultarFecha = false, ocultarTablero = false }) {
  const [completando, setCompletando] = useState(false);
  const abrirEditor = useEditorTarea();

  // Si la tarea cambia de estado (por ejemplo, con "Deshacer"), se reinicia la animación
  useEffect(() => setCompletando(false), [tarea.estado]);

  const hecha = tarea.estado === 'HECHO' || completando;
  const atrasada = !hecha && tarea.fecha && tarea.fecha < hoy;
  const esHoy = tarea.fecha === hoy;
  const tablero = ocultarTablero ? null : tableros.find((t) => t.id === tarea.tablero);

  function alPulsar() {
    if (tarea.estado === 'HECHO') return alAlternar(tarea); // desmarcar: inmediato
    if (completando) return;
    setCompletando(true);
    setTimeout(() => alAlternar(tarea), ESPERA_ANIMACION);
  }

  const mostrarFecha = tarea.fecha && !(ocultarFecha && !atrasada);
  const enProceso = tarea.estado === 'EN_PROCESO' && !hecha;
  const tieneMeta = tablero || mostrarFecha || enProceso || tarea.recordatorio != null;

  return (
    <div
      className={cx(
        'tarea',
        `tarea--${(tarea.prioridad || 'MEDIA').toLowerCase()}`,
        atrasada && 'tarea--atrasada',
        hecha && 'tarea--hecha'
      )}
    >
      <button
        type="button"
        className="check"
        onClick={alPulsar}
        aria-pressed={hecha}
        aria-label={hecha ? `Marcar "${tarea.titulo}" como pendiente` : `Marcar "${tarea.titulo}" como hecha`}
      >
        <span className="check__circulo">
          <AnimatePresence initial={false}>
            {hecha && (
              <motion.span
                className="check__icono"
                initial={{ scale: 0.3, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.3, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 520, damping: 24 }}
              >
                <Check size={14} strokeWidth={3.2} />
              </motion.span>
            )}
          </AnimatePresence>
        </span>
      </button>

      <button type="button" className="tarea__cuerpo" onClick={() => abrirEditor(tarea)}>
        <span className="tarea__titulo">{tarea.titulo}</span>
        {tieneMeta && (
          <span className="tarea__meta">
            {mostrarFecha && (
              <span className={cx('fecha', atrasada && 'fecha--atrasada', esHoy && 'fecha--hoy')}>
                <CalendarDays size={12} strokeWidth={2.2} aria-hidden />
                {fechaRelativa(tarea.fecha, hoy)}
              </span>
            )}
            {tablero && <span className="meta">{tablero.nombre}</span>}
            {enProceso && <span className="meta meta--proceso">{ESTADOS.EN_PROCESO}</span>}
            {tarea.recordatorio != null && !hecha && (
              <Bell size={12} strokeWidth={2.2} className="meta-icono" aria-label="Con recordatorio" />
            )}
          </span>
        )}
      </button>

      {tarea.prioridad === 'ALTA' && !hecha && <span className="etiqueta-alta">Alta</span>}
    </div>
  );
}
