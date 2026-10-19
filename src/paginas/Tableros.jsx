// ============================================================
// TABLEROS — todos tus tableros en un solo lugar.
// Aquí los creas, los abres y cambias su orden.
// Los 2 primeros aparecen en la barra de abajo del celular.
// ============================================================
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowDown, ArrowUp, ChevronRight, ListChecks } from 'lucide-react';
import { CabeceraPagina } from '../componentes/CabeceraPagina';
import { IconoTablero } from '../componentes/Iconos';
import { Numero } from '../componentes/Numero';
import { SugerenciasTableros } from '../componentes/SugerenciasTableros';
import { useDatos } from '../contexto/DatosContext';
import { useEditorTablero } from '../contexto/EditorTableroContext';
import { TIPOS_TABLERO } from '../config/app';
import { resumenTablero, rutaTablero } from '../utils/tableros';
import { estaPendiente } from '../utils/tareas';
import { cx } from '../utils/cx';

export default function Tableros() {
  const datos = useDatos();
  const { tableros, tareas, acciones } = datos;
  const abrirTablero = useEditorTablero();
  const [ordenando, setOrdenando] = useState(false);

  return (
    <div className="pagina pagina--media">
      <CabeceraPagina
        titulo="Tableros"
        subtitulo="Tus listas, contadores y cobros"
        accion={{ texto: 'Nuevo tablero', alHacer: () => abrirTablero() }}
        extra={
          tableros.length > 1 && (
            <button className="boton boton--fantasma boton--pequeno" onClick={() => setOrdenando((o) => !o)}>
              {ordenando ? 'Listo' : 'Ordenar'}
            </button>
          )
        }
      />

      {ordenando && (
        <p className="nota">Usa las flechas para cambiar el orden. Los 2 primeros aparecen en la barra de abajo del celular.</p>
      )}

      {tableros.length > 0 && (
        <ul className="tableros-lista">
          {tableros.map((t, i) => {
            const r = resumenTablero(t, datos);
            return (
              <li key={t.id} className={cx('tablero-tarjeta', ordenando && 'tablero-tarjeta--ordenando')}>
                <Link to={rutaTablero(t)} className="tablero-tarjeta__enlace">
                  <span className="tablero-tarjeta__icono">
                    <IconoTablero nombre={t.icono} size={20} strokeWidth={2} />
                  </span>
                  <span className="tablero-tarjeta__texto">
                    <strong>{t.nombre}</strong>
                    <small>{TIPOS_TABLERO[t.tipo]?.nombre}</small>
                  </span>
                  <span className="tablero-tarjeta__valor">
                    <Numero valor={r.valor} formato={r.formato} />
                    <small>{r.detalle}</small>
                  </span>
                  {!ordenando && <ChevronRight size={18} className="tablero-tarjeta__flecha" aria-hidden />}
                </Link>
                {ordenando && (
                  <span className="tablero-tarjeta__orden">
                    <button
                      className="boton-icono"
                      onClick={() => acciones.moverTablero(t.id, -1)}
                      disabled={i === 0}
                      aria-label={`Subir ${t.nombre}`}
                    >
                      <ArrowUp size={18} />
                    </button>
                    <button
                      className="boton-icono"
                      onClick={() => acciones.moverTablero(t.id, 1)}
                      disabled={i === tableros.length - 1}
                      aria-label={`Bajar ${t.nombre}`}
                    >
                      <ArrowDown size={18} />
                    </button>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Link to="/app/tareas" className="tablero-tarjeta tablero-tarjeta--suave">
        <span className="tablero-tarjeta__enlace">
          <span className="tablero-tarjeta__icono">
            <ListChecks size={20} strokeWidth={2} />
          </span>
          <span className="tablero-tarjeta__texto">
            <strong>Todas las tareas</strong>
            <small>Las tareas de todas tus listas juntas</small>
          </span>
          <span className="tablero-tarjeta__valor">
            {tareas.filter(estaPendiente).length}
            <small>pendientes</small>
          </span>
          <ChevronRight size={18} className="tablero-tarjeta__flecha" aria-hidden />
        </span>
      </Link>

      {tableros.length === 0 ? (
        <SugerenciasTableros />
      ) : (
        <details className="mas-ideas">
          <summary>Ideas para nuevos tableros</summary>
          <SugerenciasTableros conEjemplo={false} />
        </details>
      )}
    </div>
  );
}
