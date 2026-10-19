// Ventana emergente: hoja que sube desde abajo en el celular, caja centrada en computador.
import { useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';

export function Modal({ abierto, alCerrar, titulo, children }) {
  const idTitulo = useId();

  useEffect(() => {
    if (!abierto) return;
    const alTeclear = (e) => e.key === 'Escape' && alCerrar();
    const overflowAnterior = document.body.style.overflow;
    document.body.style.overflow = 'hidden'; // evita que la página de atrás se mueva
    window.addEventListener('keydown', alTeclear);
    return () => {
      window.removeEventListener('keydown', alTeclear);
      document.body.style.overflow = overflowAnterior;
    };
  }, [abierto, alCerrar]);

  return createPortal(
    <AnimatePresence>
      {abierto && (
        <div className="modal-capa" key="modal">
          <motion.div
            className="modal-fondo"
            onClick={alCerrar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby={idTitulo}
            className="modal"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30, transition: { duration: 0.15 } }}
            transition={{ type: 'spring', stiffness: 380, damping: 34 }}
          >
            <div className="modal__asa" aria-hidden="true" />
            {titulo && (
              <h2 id={idTitulo} className="modal__titulo">
                {titulo}
              </h2>
            )}
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
