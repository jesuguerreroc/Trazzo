// Avisos cortos que aparecen abajo ("Tarea hecha · Deshacer").
import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, CircleAlert } from 'lucide-react';
import { cx } from '../utils/cx';

const AvisosContext = createContext(() => {});

export function AvisosProvider({ children }) {
  const [aviso, setAviso] = useState(null);
  const temporizador = useRef();

  const cerrar = useCallback(() => {
    clearTimeout(temporizador.current);
    setAviso(null);
  }, []);

  /** avisar({ texto, tipo: 'exito' | 'error', accion: { etiqueta, alHacer } }) */
  const avisar = useCallback((nuevo) => {
    clearTimeout(temporizador.current);
    setAviso({ ...nuevo, id: Date.now() });
    temporizador.current = setTimeout(() => setAviso(null), nuevo.duracion || 4500);
  }, []);

  return (
    <AvisosContext.Provider value={avisar}>
      {children}
      <div className="avisos" role="status" aria-live="polite">
        <AnimatePresence>
          {aviso && (
            <motion.div
              key={aviso.id}
              className={cx('aviso', aviso.tipo && `aviso--${aviso.tipo}`)}
              initial={{ opacity: 0, y: 16, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
              transition={{ type: 'spring', stiffness: 420, damping: 32 }}
            >
              {aviso.tipo === 'error' ? <CircleAlert size={18} aria-hidden /> : <Check size={18} aria-hidden />}
              <span className="aviso__texto">{aviso.texto}</span>
              {aviso.accion && (
                <button
                  className="aviso__accion"
                  onClick={() => {
                    aviso.accion.alHacer();
                    cerrar();
                  }}
                >
                  {aviso.accion.etiqueta}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AvisosContext.Provider>
  );
}

export const useAviso = () => useContext(AvisosContext);
