import { useEffect, useState } from 'react';
import { hoyISO } from '../utils/fechas';

/** Devuelve la fecha de hoy (Colombia) y se actualiza sola al pasar la medianoche. */
export function useHoy() {
  const [hoy, setHoy] = useState(hoyISO);

  useEffect(() => {
    const revisar = () => setHoy(hoyISO());
    const intervalo = setInterval(revisar, 60 * 1000);
    window.addEventListener('focus', revisar);
    return () => {
      clearInterval(intervalo);
      window.removeEventListener('focus', revisar);
    };
  }, []);

  return hoy;
}
