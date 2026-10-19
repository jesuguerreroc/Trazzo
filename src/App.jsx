// ============================================================
// RUTAS — qué pantalla se ve en cada dirección.
// ============================================================
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './componentes/AppLayout';
import { Protegida, SoloInvitados } from './componentes/Rutas';
import Landing from './paginas/Landing';
import Entrar from './paginas/Entrar';
import Inicio from './paginas/Inicio';
import Tareas from './paginas/Tareas';
import Tableros from './paginas/Tableros';
import TableroPagina from './paginas/TableroPagina';
import Ajustes from './paginas/Ajustes';

export default function App() {
  return (
    <Routes>
      {/* Para visitantes */}
      <Route path="/" element={<SoloInvitados><Landing /></SoloInvitados>} />
      <Route path="/entrar" element={<SoloInvitados><Entrar /></SoloInvitados>} />

      {/* La app (necesita sesión) */}
      <Route path="/app" element={<Protegida><AppLayout /></Protegida>}>
        <Route index element={<Inicio />} />
        <Route path="tareas" element={<Tareas />} />
        <Route path="tableros" element={<Tableros />} />
        <Route path="t/:id" element={<TableroPagina />} />
        <Route path="ajustes" element={<Ajustes />} />
      </Route>

      {/* Cualquier otra dirección vuelve al inicio */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
