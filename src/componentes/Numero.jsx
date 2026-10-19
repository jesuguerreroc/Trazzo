// Número que se desliza suavemente cuando cambia (ej: 9 -> 8 al marcar un video como hecho).
import { useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'motion/react';

// "bajo" = true si el número bajó: el nuevo entra desde arriba y el viejo sale por abajo
const variantes = {
  entra: (bajo) => ({ y: bajo ? '-60%' : '60%', opacity: 0 }),
  quieto: { y: 0, opacity: 1 },
  sale: (bajo) => ({ y: bajo ? '60%' : '-60%', opacity: 0 }),
};

export function Numero({ valor, formato = (n) => n }) {
  const anterior = useRef(valor);
  const bajo = valor < anterior.current;

  useEffect(() => {
    anterior.current = valor;
  }, [valor]);

  return (
    <span className="numero">
      <AnimatePresence mode="popLayout" initial={false} custom={bajo}>
        <motion.span
          key={valor}
          className="numero__valor"
          custom={bajo}
          variants={variantes}
          initial="entra"
          animate="quieto"
          exit="sale"
          transition={{ type: 'spring', stiffness: 400, damping: 32 }}
        >
          {formato(valor)}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
