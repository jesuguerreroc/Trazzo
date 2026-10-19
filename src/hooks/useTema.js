import { useCallback, useState } from 'react';

const CLAVE = 'trazzo:tema';
// Color de la barra del navegador en el celular para cada tema
const COLOR_BARRA = { oscuro: '#0C0C0E', claro: '#F6F5F2' };

/** Tema de la app: 'oscuro' (por defecto) o 'claro'. Se recuerda en este dispositivo. */
export function useTema() {
  const [tema, setTemaEstado] = useState(() => document.documentElement.dataset.theme || 'oscuro');

  const setTema = useCallback((nuevo) => {
    document.documentElement.dataset.theme = nuevo;
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', COLOR_BARRA[nuevo]);
    try {
      localStorage.setItem(CLAVE, nuevo);
    } catch {
      /* sin almacenamiento: el tema solo dura esta visita */
    }
    setTemaEstado(nuevo);
  }, []);

  const alternar = useCallback(() => setTema(tema === 'oscuro' ? 'claro' : 'oscuro'), [tema, setTema]);

  return { tema, setTema, alternar };
}
