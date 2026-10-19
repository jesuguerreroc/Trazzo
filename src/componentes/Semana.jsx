// ============================================================
// SEMANA — los próximos 7 días empezando hoy.
// Celular: una tira de días; tocas un día y ves sus tareas debajo.
// Computador: 7 columnas tipo calendario.
// ============================================================
import { useMemo, useState } from 'react';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { Seccion } from './Seccion';
import { ListaTareas } from './ListaTareas';
import { diaCorto, diaLargo, formatoCorto, formatoFecha, numeroDia, sumarDias } from '../utils/fechas';
import { estaPendiente, tareasDelDia } from '../utils/tareas';
import { useEditorTarea } from '../contexto/EditorTareaContext';
import { cx } from '../utils/cx';

export function Semana({ tareas, tableros, hoy, alAlternar }) {
  const [semanas, setSemanas] = useState(0); // 0 = esta semana, 1 = la siguiente, -1 = la anterior
  const [seleccionado, setSeleccionado] = useState(hoy);
  const abrirEditor = useEditorTarea();

  const inicio = sumarDias(hoy, semanas * 7);
  const dias = useMemo(() => Array.from({ length: 7 }, (_, i) => sumarDias(inicio, i)), [inicio]);
  const porDia = useMemo(
    () => Object.fromEntries(dias.map((d) => [d, tareasDelDia(tareas, d)])),
    [dias, tareas]
  );
  const diaActivo = dias.includes(seleccionado) ? seleccionado : dias[0];

  const cambiarSemana = (n) => {
    setSemanas(n);
    setSeleccionado(sumarDias(hoy, n * 7));
  };

  return (
    <Seccion
      titulo="Semana"
      className="semana"
      extra={
        <>
          <span className="semana__rango" aria-live="polite">
            {formatoCorto(dias[0])} – {formatoCorto(dias[6])}
          </span>
          {semanas !== 0 && (
            <button className="boton boton--fantasma boton--pequeno" onClick={() => cambiarSemana(0)}>
              Hoy
            </button>
          )}
          <button className="boton-icono" aria-label="Semana anterior" onClick={() => cambiarSemana(semanas - 1)}>
            <ChevronLeft size={18} />
          </button>
          <button className="boton-icono" aria-label="Semana siguiente" onClick={() => cambiarSemana(semanas + 1)}>
            <ChevronRight size={18} />
          </button>
        </>
      }
    >
      {/* ---------- Celular: tira de días ---------- */}
      <div className="semana__tira" role="tablist" aria-label="Días">
        {dias.map((d) => {
          const pendientes = porDia[d].filter(estaPendiente);
          return (
            <button
              key={d}
              role="tab"
              aria-selected={d === diaActivo}
              className={cx('dia', d === diaActivo && 'dia--activo', d === hoy && 'dia--hoy')}
              onClick={() => setSeleccionado(d)}
            >
              <span className="dia__nombre">{diaCorto(d)}</span>
              <span className="dia__numero">{numeroDia(d)}</span>
              <span className="dia__puntos" aria-label={`${pendientes.length} pendientes`}>
                {pendientes.slice(0, 3).map((t) => (
                  <span key={t.id} className={cx('punto', t.prioridad === 'ALTA' && 'punto--alta')} />
                ))}
              </span>
            </button>
          );
        })}
      </div>

      <div className="semana__detalle">
        <p className="semana__dia-titulo">
          {diaActivo === hoy ? 'Hoy' : diaLargo(diaActivo)} · {formatoFecha(diaActivo)}
        </p>
        <ListaTareas
          tareas={porDia[diaActivo]}
          tableros={tableros}
          hoy={hoy}
          alAlternar={alAlternar}
          ocultarFecha
          vacio="Nada para este día."
        />
      </div>

      {/* ---------- Computador: 7 columnas ---------- */}
      <div className="semana__grid">
        {dias.map((d) => (
          <div key={d} className={cx('columna', d === hoy && 'columna--hoy')}>
            <div className="columna__cabecera">
              <span>{diaCorto(d)}</span>
              <strong>{numeroDia(d)}</strong>
            </div>
            <ul className="columna__lista">
              {porDia[d].map((t) => {
                const hecha = t.estado === 'HECHO';
                return (
                  <li
                    key={t.id}
                    className={cx('mini', hecha && 'mini--hecha', t.prioridad === 'ALTA' && !hecha && 'mini--alta')}
                  >
                    <button
                      className="mini__check"
                      onClick={() => alAlternar(t)}
                      aria-pressed={hecha}
                      aria-label={hecha ? `Marcar "${t.titulo}" como pendiente` : `Marcar "${t.titulo}" como hecha`}
                    >
                      {hecha && <Check size={10} strokeWidth={3.5} />}
                    </button>
                    <button type="button" className="mini__titulo" onClick={() => abrirEditor(t)}>
                      {t.titulo}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </Seccion>
  );
}
