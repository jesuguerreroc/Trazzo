// Protecciones de pantallas según si hay sesión o no.
import { Navigate } from 'react-router-dom';
import { useSesion } from '../contexto/SesionContext';
import { DatosProvider, useDatos } from '../contexto/DatosContext';
import { EditorTareaProvider } from '../contexto/EditorTareaContext';
import { EditorTableroProvider } from '../contexto/EditorTableroContext';
import { Cargando } from './Cargando';

/** Solo para quien ya inició sesión (la app). Si no, lo manda a /entrar. */
export function Protegida({ children }) {
  const { usuario, cargando } = useSesion();
  if (cargando) return <Cargando />;
  if (!usuario) return <Navigate to="/entrar" replace />;
  return (
    <DatosProvider key={usuario.uid} usuario={usuario}>
      <EsperarDatos>
        <EditorTableroProvider>
          <EditorTareaProvider>{children}</EditorTareaProvider>
        </EditorTableroProvider>
      </EsperarDatos>
    </DatosProvider>
  );
}

function EsperarDatos({ children }) {
  const { listo } = useDatos();
  return listo ? children : <Cargando />;
}

/** Solo para visitantes (landing y entrar). Si ya hay sesión, lo manda a la app. */
export function SoloInvitados({ children }) {
  const { usuario, cargando } = useSesion();
  if (cargando) return <Cargando />;
  if (usuario) return <Navigate to="/app" replace />;
  return children;
}
