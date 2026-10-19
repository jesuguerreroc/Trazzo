// ============================================================
// TAREAS
// - Sin "tablero": todas las tareas de todas tus listas.
// - Con "tablero": solo las tareas de esa lista (ej: Universidad).
// ============================================================
import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { CabeceraPagina } from '../componentes/CabeceraPagina';
import { Seccion } from '../componentes/Seccion';
import { ListaTareas } from '../componentes/ListaTareas';
import { AgregarRapido } from '../componentes/AgregarRapido';
import { Opciones } from '../componentes/Opciones';
import { IconoTablero } from '../componentes/Iconos';
import { useDatos, useAlternarTarea } from '../contexto/DatosContext';
import { useConfirmar } from '../contexto/ConfirmarContext';
import { useEditorTarea } from '../contexto/EditorTareaContext';
import { useEditorTablero } from '../contexto/EditorTableroContext';
import { useAviso } from '../contexto/AvisosContext';
import { useHoy } from '../hooks/useHoy';
import { PRIORIDADES } from '../config/app';
import { agruparPendientes, estaPendiente } from '../utils/tareas';

export default function Tareas({ tablero = null }) {
  const { tareas, tableros, listas, acciones } = useDatos();
  const alAlternar = useAlternarTarea();
  const abrirEditor = useEditorTarea();
  const abrirTablero = useEditorTablero();
  const confirmar = useConfirmar();
  const avisar = useAviso();
  const hoy = useHoy();

  const [vista, setVista] = useState('pendientes');
  const [lista, setLista] = useState('todas');
  const [prioridad, setPrioridad] = useState('todas');

  // Si estamos dentro de un tablero, la lista está fija
  const listaFija = tablero?.id;
  const propias = listaFija ? tareas.filter((t) => t.tablero === listaFija) : tareas;

  const filtradas = propias.filter(
    (t) =>
      (listaFija || lista === 'todas' || (lista === 'ninguna' ? !t.tablero : t.tablero === lista)) &&
      (prioridad === 'todas' || t.prioridad === prioridad)
  );
  const pendientes = filtradas.filter(estaPendiente);
  const hechas = filtradas
    .filter((t) => !estaPendiente(t))
    .sort((a, b) => (b.completada || 0) - (a.completada || 0));
  const grupos = agruparPendientes(filtradas, hoy);

  const listaElegida = listaFija || (listas.some((l) => l.id === lista) ? lista : null);
  const hayFiltros = lista !== 'todas' || prioridad !== 'todas';
  const totalPendientes = propias.filter(estaPendiente).length;

  const opcionesLista = [
    { valor: 'todas', texto: 'Todas' },
    ...listas.map((l) => ({ valor: l.id, texto: l.nombre })),
    ...(tareas.some((t) => !t.tablero) ? [{ valor: 'ninguna', texto: 'Sin lista' }] : []),
  ];
  const opcionesPrioridad = [
    { valor: 'todas', texto: 'Todas' },
    ...Object.entries(PRIORIDADES).map(([valor, texto]) => ({
      valor,
      texto,
      tono: valor === 'ALTA' ? 'peligro' : undefined,
    })),
  ];

  async function borrarHechas() {
    const ok = await confirmar({
      titulo: 'Borrar tareas hechas',
      texto: `Se borrarán ${hechas.length} tareas hechas. Esta acción no se puede deshacer.`,
      boton: 'Borrar',
      peligro: true,
    });
    if (!ok) return;
    hechas.forEach((t) => acciones.borrar('tareas', t.id));
    avisar({ texto: 'Tareas hechas borradas', tipo: 'exito' });
  }

  return (
    <div className="pagina pagina--media">
      <CabeceraPagina
        titulo={tablero ? tablero.nombre : 'Tareas'}
        icono={tablero && <IconoTablero nombre={tablero.icono} size={26} strokeWidth={2} />}
        subtitulo={totalPendientes ? `${totalPendientes} pendientes` : 'Todo al día'}
        accion={{ texto: 'Nueva tarea', alHacer: () => abrirEditor(null, { tablero: listaElegida }) }}
        extra={
          tablero && (
            <button className="boton-icono" onClick={() => abrirTablero(tablero)} aria-label="Editar tablero">
              <Pencil size={18} />
            </button>
          )
        }
      />

      <div className="filtros">
        <Opciones
          etiqueta="Ver"
          opciones={[
            { valor: 'pendientes', texto: 'Pendientes', cuenta: pendientes.length },
            { valor: 'hechas', texto: 'Hechas', cuenta: hechas.length },
          ]}
          valor={vista}
          alCambiar={setVista}
        />
        {!listaFija && listas.length > 0 && (
          <div className="filtros__fila">
            <span className="filtros__etiqueta">Lista</span>
            <Opciones variante="chips" etiqueta="Lista" opciones={opcionesLista} valor={lista} alCambiar={setLista} className="chips--deslizar" />
          </div>
        )}
        <div className="filtros__fila">
          <span className="filtros__etiqueta">Prioridad</span>
          <Opciones variante="chips" etiqueta="Prioridad" opciones={opcionesPrioridad} valor={prioridad} alCambiar={setPrioridad} className="chips--deslizar" />
        </div>
      </div>

      {vista === 'pendientes' ? (
        <>
          <AgregarRapido tablero={listaElegida} />
          {grupos.length === 0 && (
            <p className="vacio vacio--grande">
              {hayFiltros ? 'No hay pendientes con estos filtros.' : 'Nada pendiente. ¡Bien hecho!'}
            </p>
          )}
          {grupos.map((g) => (
            <Seccion key={g.id} titulo={g.titulo} cuenta={g.tareas.length} tono={g.tono}>
              <ListaTareas
                tareas={g.tareas}
                tableros={tableros}
                hoy={hoy}
                alAlternar={alAlternar}
                ocultarFecha={g.id === 'hoy'}
                ocultarTablero={Boolean(listaFija)}
              />
            </Seccion>
          ))}
        </>
      ) : (
        <Seccion
          titulo="Hechas"
          cuenta={hechas.length}
          extra={
            hechas.length > 0 && (
              <button className="boton boton--fantasma boton--pequeno" onClick={borrarHechas}>
                <Trash2 size={16} aria-hidden /> Borrar hechas
              </button>
            )
          }
        >
          <ListaTareas
            tareas={hechas}
            tableros={tableros}
            hoy={hoy}
            alAlternar={alAlternar}
            ocultarTablero={Boolean(listaFija)}
            vacio="Aún no has completado tareas. Cuando marques una, aparecerá aquí."
          />
        </Seccion>
      )}
    </div>
  );
}
