// ============================================================
// TABLERO CONTADOR — una fila por marca/cliente/proyecto con un NÚMERO.
// Los textos ("marca", "videos") salen de la configuración del tablero.
// ============================================================
import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Pencil, Search } from 'lucide-react';
import { CabeceraPagina } from '../componentes/CabeceraPagina';
import { ContadorFila } from '../componentes/ContadorFila';
import { ContadorEditor } from '../componentes/ContadorEditor';
import { Opciones } from '../componentes/Opciones';
import { Numero } from '../componentes/Numero';
import { IconoTablero } from '../componentes/Iconos';
import { useDatos } from '../contexto/DatosContext';
import { useEditorTablero } from '../contexto/EditorTableroContext';
import { claveCliente } from '../utils/dinero';
import { capitalizar, nuevo, plural, singular } from '../utils/palabras';

export default function Contadores({ tablero }) {
  const { contadores } = useDatos();
  const abrirTablero = useEditorTablero();
  const items = contadores.filter((c) => c.tablero === tablero.id);

  const fila = tablero.fila || 'elemento';
  const filas = plural(fila);
  const unidad = tablero.unidad || 'pendientes';

  const [vista, setVista] = useState('pendientes');
  const [busqueda, setBusqueda] = useState('');
  const [editor, setEditor] = useState({ abierto: false, item: null });

  const total = items.reduce((s, x) => s + (Number(x.pendientes) || 0), 0);
  const conPendientes = items
    .filter((x) => Number(x.pendientes) > 0)
    .sort((a, b) => b.pendientes - a.pendientes || a.nombre.localeCompare(b.nombre));
  const todas = [...items].sort((a, b) => a.nombre.localeCompare(b.nombre));

  const texto = claveCliente(busqueda).trim();
  const lista = (vista === 'pendientes' ? conPendientes : todas).filter(
    (x) => !busqueda.trim() || claveCliente(x.nombre).includes(texto)
  );

  const abrir = (item = null) => setEditor({ abierto: true, item });
  const textoNuevo = `${nuevo(fila)} ${fila}`;

  return (
    <div className="pagina pagina--media">
      <CabeceraPagina
        titulo={tablero.nombre}
        icono={<IconoTablero nombre={tablero.icono} size={26} strokeWidth={2} />}
        subtitulo={`${capitalizar(unidad)} pendientes por ${fila}`}
        accion={{ texto: textoNuevo, alHacer: () => abrir() }}
        extra={
          <button className="boton-icono" onClick={() => abrirTablero(tablero)} aria-label="Editar tablero">
            <Pencil size={18} />
          </button>
        }
      />

      <div className="resumen-grande">
        <span className="resumen-grande__valor">
          <Numero valor={total} />
        </span>
        <span className="resumen-grande__texto">
          {total === 1 ? singular(unidad) : unidad} pendientes
          <small>
            {conPendientes.length} de {items.length} {filas} con pendientes
          </small>
        </span>
      </div>

      <div className="filtros">
        <Opciones
          etiqueta="Ver"
          opciones={[
            { valor: 'pendientes', texto: 'Solo pendientes', cuenta: conPendientes.length },
            { valor: 'todas', texto: 'Todas', cuenta: items.length },
          ]}
          valor={vista}
          alCambiar={setVista}
        />
        {items.length > 6 && (
          <label className="buscador">
            <Search size={18} aria-hidden />
            <input
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder={`Buscar ${fila}…`}
              aria-label={`Buscar ${fila}`}
              type="search"
            />
          </label>
        )}
      </div>

      {lista.length > 0 && (
        <ul className="grupo">
          <AnimatePresence initial={false}>
            {lista.map((item) => (
              <motion.li
                key={item.id}
                className="grupo__fila"
                layout="position"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.28, delay: 0.3 } }}
              >
                <ContadorFila item={item} tablero={tablero} alEditar={abrir} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {lista.length === 0 && (
        <div className="vacio vacio--grande">
          {items.length === 0 ? (
            <>
              <p>Aún no tienes {filas} en este tablero.</p>
              <button className="boton boton--primario" onClick={() => abrir()}>
                {textoNuevo}
              </button>
            </>
          ) : busqueda ? (
            <p>No hay resultados para “{busqueda}”.</p>
          ) : (
            <p className="texto-exito">Todo al día. No tienes {unidad} pendientes aquí.</p>
          )}
        </div>
      )}

      <ContadorEditor
        abierto={editor.abierto}
        item={editor.item}
        tablero={tablero}
        alCerrar={() => setEditor((e) => ({ ...e, abierto: false }))}
      />
    </div>
  );
}
