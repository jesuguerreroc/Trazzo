// ============================================================
// ESTRUCTURA DE LA APP
// Celular: cabecera arriba + barra de navegación flotante abajo.
// Computador: barra lateral a la izquierda.
// ============================================================
import { useEffect } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { House, LayoutGrid, ListChecks, Moon, Plus, Settings, Sun } from 'lucide-react';
import { Logo } from './Logo';
import { IconoTablero } from './Iconos';
import { useEditorTablero } from '../contexto/EditorTableroContext';
import { rutaTablero } from '../utils/tableros';
import { useDatos } from '../contexto/DatosContext';
import { useSesion } from '../contexto/SesionContext';
import { useHoy } from '../hooks/useHoy';
import { useTema } from '../hooks/useTema';
import { revisarRecordatorios } from '../servicios/notificaciones';
import { tareasAtrasadas } from '../utils/tareas';
import { diaCorto, formatoCorto } from '../utils/fechas';
import { cx } from '../utils/cx';

// Partes fijas del menú. Los tableros se agregan solos según los que crees.
const FIJOS = [
  { a: '/app', texto: 'Inicio', icono: <House size={21} strokeWidth={1.9} aria-hidden />, exacto: true },
  { a: '/app/tareas', texto: 'Tareas', icono: <ListChecks size={21} strokeWidth={1.9} aria-hidden /> },
];
const HUB = { a: '/app/tableros', texto: 'Tableros', icono: <LayoutGrid size={21} strokeWidth={1.9} aria-hidden /> };
// Cuántos tableros caben en la barra de abajo del celular (los primeros según su orden)
const TABLEROS_EN_BARRA = 2;

export function AppLayout() {
  const { tareas, tableros } = useDatos();
  const abrirTablero = useEditorTablero();
  const { usuario } = useSesion();
  const { tema, alternar } = useTema();
  const hoy = useHoy();
  const { pathname, hash } = useLocation();

  const hayAtrasadas = tareasAtrasadas(tareas, hoy).length > 0;

  // Al cambiar de pantalla, volver arriba (o ir a la sección indicada con #)
  useEffect(() => {
    if (hash) {
      setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 250);
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  // Recordatorios: revisar al abrir, al volver a la app y cada 5 minutos
  useEffect(() => {
    const revisar = () => revisarRecordatorios(tareas, hoy);
    revisar();
    const intervalo = setInterval(revisar, 5 * 60 * 1000);
    const alVolver = () => document.visibilityState === 'visible' && revisar();
    document.addEventListener('visibilitychange', alVolver);
    return () => {
      clearInterval(intervalo);
      document.removeEventListener('visibilitychange', alVolver);
    };
  }, [tareas, hoy]);

  const deTablero = (t) => ({
    a: rutaTablero(t),
    texto: t.nombre,
    icono: <IconoTablero nombre={t.icono} size={21} strokeWidth={1.9} />,
  });
  const menuCelular = [...FIJOS, ...tableros.slice(0, TABLEROS_EN_BARRA).map(deTablero), HUB];

  const enlace = ({ a, texto, icono, exacto }, clase) => (
    <NavLink key={a} to={a} end={exacto} className={({ isActive }) => cx(clase, isActive && 'activo')}>
      <span className="nav__icono">
        {icono}
        {a === '/app/tareas' && hayAtrasadas && <span className="nav__alerta" aria-label="Hay tareas atrasadas" />}
      </span>
      <span className="nav__texto">{texto}</span>
    </NavLink>
  );

  const inicial = (usuario.nombre || 'T').charAt(0).toUpperCase();

  return (
    <div className="app">
      {/* -------- Computador: barra lateral -------- */}
      <aside className="lateral">
        <div className="lateral__logo">
          <Logo />
        </div>
        <nav className="lateral__nav" aria-label="Principal">
          {FIJOS.map((item) => enlace(item, 'lateral__enlace'))}
          <div className="lateral__seccion">
            <NavLink to="/app/tableros" className="lateral__titulo">
              Tableros
            </NavLink>
            <button className="lateral__nuevo" onClick={() => abrirTablero()} aria-label="Nuevo tablero">
              <Plus size={16} />
            </button>
          </div>
          {tableros.map((t) => enlace(deTablero(t), 'lateral__enlace'))}
          {tableros.length === 0 && (
            <button className="lateral__enlace lateral__enlace--tenue" onClick={() => abrirTablero()}>
              <span className="nav__icono">
                <Plus size={21} strokeWidth={1.9} />
              </span>
              <span className="nav__texto">Crear un tablero</span>
            </button>
          )}
        </nav>
        <div className="lateral__pie">
          <button className="lateral__enlace" onClick={alternar}>
            <span className="nav__icono">
              {tema === 'oscuro' ? <Sun size={21} strokeWidth={1.9} /> : <Moon size={21} strokeWidth={1.9} />}
            </span>
            <span className="nav__texto">{tema === 'oscuro' ? 'Modo claro' : 'Modo oscuro'}</span>
          </button>
          {enlace({ a: '/app/ajustes', texto: 'Ajustes', icono: <Settings size={21} strokeWidth={1.9} aria-hidden /> }, 'lateral__enlace')}
          <div className="lateral__usuario">
            <span className="avatar" aria-hidden>
              {inicial}
            </span>
            <span className="lateral__usuario-texto">
              <strong>{usuario.nombre || 'Mi cuenta'}</strong>
              <small>{usuario.modo === 'nube' ? usuario.correo : 'Modo local'}</small>
            </span>
          </div>
        </div>
      </aside>

      {/* -------- Celular: cabecera -------- */}
      <header className="cabecera">
        <Logo />
        <div className="cabecera__derecha">
          <span className="cabecera__fecha">
            {diaCorto(hoy)} {formatoCorto(hoy)}
          </span>
          <NavLink to="/app/ajustes" className="cabecera__avatar" aria-label="Ajustes">
            <span className="avatar" aria-hidden>
              {inicial}
            </span>
          </NavLink>
        </div>
      </header>

      {/* -------- Contenido de cada pantalla -------- */}
      <main className="contenido">
        <motion.div
          key={pathname}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.2, 0.7, 0.2, 1] }}
        >
          <Outlet />
        </motion.div>
      </main>

      {/* -------- Celular: barra inferior flotante -------- */}
      <nav className="nav-inferior" aria-label="Principal" style={{ '--columnas': menuCelular.length }}>
        {menuCelular.map((item) => enlace(item, 'nav-inferior__enlace'))}
      </nav>
    </div>
  );
}
