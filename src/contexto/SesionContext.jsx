// Guarda quién tiene la sesión abierta en toda la app.
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { escucharSesion, usuarioActual } from '../servicios/auth';

const SesionContext = createContext(null);

export function SesionProvider({ children }) {
  // undefined = todavía revisando; null = nadie; objeto = usuario
  const [usuario, setUsuario] = useState(undefined);

  useEffect(() => escucharSesion(setUsuario), []);

  // Vuelve a leer el usuario (por ejemplo, después de ponerle nombre al crear la cuenta)
  const refrescar = useCallback(() => setUsuario(usuarioActual()), []);

  return (
    <SesionContext.Provider value={{ usuario, cargando: usuario === undefined, refrescar }}>
      {children}
    </SesionContext.Provider>
  );
}

export const useSesion = () => useContext(SesionContext);
