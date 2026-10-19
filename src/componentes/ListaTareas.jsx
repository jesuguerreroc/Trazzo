// Lista de tareas en un solo bloque. Cuando una se completa, se tacha y se va suavemente.
import { AnimatePresence, motion } from 'motion/react';
import { TareaFila } from './TareaFila';

export function ListaTareas({ tareas, tableros, hoy, alAlternar, vacio, ocultarFecha, ocultarTablero }) {
  return (
    <>
      {tareas.length > 0 && (
        <ul className="grupo">
          <AnimatePresence initial={false}>
            {tareas.map((t) => (
              <motion.li
                key={t.id}
                className="grupo__fila"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.26 } }}
                transition={{ duration: 0.22 }}
              >
                <TareaFila
                  tarea={t}
                  tableros={tableros}
                  hoy={hoy}
                  alAlternar={alAlternar}
                  ocultarFecha={ocultarFecha}
                  ocultarTablero={ocultarTablero}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}
      {tareas.length === 0 && vacio && (
        <motion.p className="vacio" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {vacio}
        </motion.p>
      )}
    </>
  );
}
