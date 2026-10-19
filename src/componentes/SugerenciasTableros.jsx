// Ideas para crear tableros con UN toque (se muestran cuando aún no tienes tableros).
import { Plus, Sparkles } from 'lucide-react';
import { IconoTablero } from './Iconos';
import { useDatos } from '../contexto/DatosContext';
import { useConfirmar } from '../contexto/ConfirmarContext';
import { useEditorTablero } from '../contexto/EditorTableroContext';
import { useAviso } from '../contexto/AvisosContext';
import { PLANTILLAS, TIPOS_TABLERO } from '../config/app';

export function SugerenciasTableros({ conEjemplo = true, alTerminar }) {
  const { tableros, acciones } = useDatos();
  const abrirTablero = useEditorTablero();
  const confirmar = useConfirmar();
  const avisar = useAviso();

  // No sugerir plantillas que ya creaste (mismo nombre)
  const disponibles = PLANTILLAS.filter(
    (p) => !tableros.some((t) => t.nombre.trim().toLowerCase() === p.nombre.toLowerCase())
  );

  function crear(p) {
    acciones.crearTablero({ nombre: p.nombre, tipo: p.tipo, icono: p.icono, fila: p.fila || '', unidad: p.unidad || '' });
    avisar({ texto: `Tablero “${p.nombre}” creado`, tipo: 'exito' });
  }

  async function cargarEjemplo() {
    const ok = await confirmar({
      titulo: 'Cargar datos de ejemplo',
      texto: 'Se cargarán tableros, tareas, contadores y cobros de muestra. Reemplaza lo que tengas ahora.',
      boton: 'Cargar ejemplo',
    });
    if (ok) acciones.cargarEjemplo();
  }

  return (
    <div className="sugerencias">
      <div className="sugerencias__texto">
        <span className="bienvenida__icono">
          <Sparkles size={22} aria-hidden />
        </span>
        <h2>Arma tu TRAZZO</h2>
        <p>
          Crea tableros para lo que necesitas seguir: listas de pendientes, contadores (ej: videos por cliente) o
          cobros. Toca una idea para crearla, o haz uno a tu medida.
        </p>
      </div>
      <div className="sugerencias__lista">
        {disponibles.map((p) => (
          <button key={p.nombre} type="button" className="sugerencia" onClick={() => crear(p)}>
            <span className="sugerencia__icono">
              <IconoTablero nombre={p.icono} size={18} strokeWidth={2} />
            </span>
            <span className="sugerencia__texto">
              <strong>{p.nombre}</strong>
              <small>{TIPOS_TABLERO[p.tipo].nombre}</small>
            </span>
            <Plus size={18} className="sugerencia__mas" aria-hidden />
          </button>
        ))}
        <button type="button" className="sugerencia sugerencia--propia" onClick={() => abrirTablero()}>
          <span className="sugerencia__icono">
            <Plus size={18} strokeWidth={2.2} />
          </span>
          <span className="sugerencia__texto">
            <strong>A mi medida</strong>
            <small>Elige nombre, tipo e ícono</small>
          </span>
        </button>
      </div>
      <div className="sugerencias__pie">
        {conEjemplo && (
          <button type="button" className="enlace-texto" onClick={cargarEjemplo}>
            O carga datos de ejemplo para ver cómo funciona
          </button>
        )}
        {alTerminar && tableros.length > 0 && (
          <button type="button" className="boton boton--secundario boton--pequeno" onClick={alTerminar}>
            Listo
          </button>
        )}
      </div>
    </div>
  );
}
