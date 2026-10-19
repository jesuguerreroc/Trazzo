// ============================================================
// AGREGAR RÁPIDO — escribes el pendiente y presionas Enter.
// Si quieres, eliges fecha y prioridad (opcional).
// ============================================================
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowUp, Plus } from 'lucide-react';
import { Opciones } from './Opciones';
import { SelectorFecha } from './SelectorFecha';
import { useDatos } from '../contexto/DatosContext';
import { useHoy } from '../hooks/useHoy';
import { PRIORIDADES } from '../config/app';
import { cx } from '../utils/cx';

const OPCIONES_PRIORIDAD = Object.entries(PRIORIDADES).map(([valor, texto]) => ({
  valor,
  texto,
  tono: valor === 'ALTA' ? 'peligro' : undefined,
}));

export function AgregarRapido({ tablero = null, placeholder = 'Agregar un pendiente…' }) {
  const { acciones } = useDatos();
  const hoy = useHoy();
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState(null);
  const [prioridad, setPrioridad] = useState('MEDIA');

  const escribiendo = titulo.trim().length > 0;

  function enviar(e) {
    e.preventDefault();
    const texto = titulo.trim();
    if (!texto) return;
    acciones.crear('tareas', {
      titulo: texto,
      tablero,
      prioridad,
      fecha,
      recordatorio: null,
      estado: 'POR_HACER',
      completada: null,
    });
    setTitulo('');
    setFecha(null);
    setPrioridad('MEDIA');
  }

  return (
    <form className={cx('rapido', escribiendo && 'rapido--abierto')} onSubmit={enviar}>
      <div className="rapido__fila">
        <Plus size={20} className="rapido__icono" aria-hidden />
        <input
          className="rapido__input"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          placeholder={placeholder}
          aria-label="Nuevo pendiente"
          enterKeyHint="done"
          autoComplete="off"
        />
        <AnimatePresence>
          {escribiendo && (
            <motion.button
              className="rapido__enviar"
              aria-label="Agregar pendiente"
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.6, opacity: 0 }}
            >
              <ArrowUp size={18} strokeWidth={2.4} />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence initial={false}>
        {escribiendo && (
          <motion.div
            className="rapido__opciones"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="rapido__grupo">
              <span className="rapido__etiqueta">Fecha</span>
              <SelectorFecha valor={fecha} alCambiar={setFecha} hoy={hoy} />
            </div>
            <div className="rapido__grupo">
              <span className="rapido__etiqueta">Prioridad</span>
              <Opciones
                variante="chips"
                etiqueta="Prioridad"
                opciones={OPCIONES_PRIORIDAD}
                valor={prioridad}
                alCambiar={setPrioridad}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
