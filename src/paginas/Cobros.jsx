// ============================================================
// TABLERO DE COBROS (ej: "Me deben")
// Agrupado por cliente: cada grupo se abre/cierra, muestra su subtotal
// y tiene su botón "Agregar". Abajo, el total general.
// Vistas: Por cobrar · Pagados · Todos.
// ============================================================
import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChevronDown, Pencil, Plus } from 'lucide-react';
import { CabeceraPagina } from '../componentes/CabeceraPagina';
import { CobroFila } from '../componentes/CobroFila';
import { CobroEditor } from '../componentes/CobroEditor';
import { Opciones } from '../componentes/Opciones';
import { Numero } from '../componentes/Numero';
import { IconoTablero } from '../componentes/Iconos';
import { useDatos } from '../contexto/DatosContext';
import { useEditorTablero } from '../contexto/EditorTableroContext';
import { claveCliente, formatoCOP } from '../utils/dinero';
import { cx } from '../utils/cx';

const suma = (lista) => lista.reduce((s, c) => s + (Number(c.monto) || 0), 0);
const esPagado = (c) => c.estado === 'PAGADO';

export default function Cobros({ tablero }) {
  const { cobros: todos } = useDatos();
  const abrirTablero = useEditorTablero();
  const [vista, setVista] = useState('por-cobrar');
  const [cerrados, setCerrados] = useState(() => new Set());
  const [editor, setEditor] = useState({ abierto: false, cobro: null, iniciales: null });

  const cobros = todos.filter((c) => c.tablero === tablero.id);
  const porCobrar = cobros.filter((c) => !esPagado(c));
  const pagados = cobros.filter(esPagado);
  const visibles = { 'por-cobrar': porCobrar, pagados, todos: cobros }[vista];

  // Agrupar por cliente (sin importar mayúsculas ni tildes)
  const grupos = useMemo(() => {
    const mapa = new Map();
    for (const c of visibles) {
      const clave = claveCliente(c.cliente);
      if (!mapa.has(clave)) mapa.set(clave, { clave, nombre: c.cliente, cobros: [] });
      mapa.get(clave).cobros.push(c);
    }
    return [...mapa.values()]
      .map((g) => ({
        ...g,
        subtotal: suma(g.cobros.filter((c) => vista === 'pagados' || !esPagado(c))),
        cobros: g.cobros.sort(
          (a, b) => Number(esPagado(a)) - Number(esPagado(b)) || (a.creada || 0) - (b.creada || 0)
        ),
      }))
      .sort((a, b) => b.subtotal - a.subtotal || a.nombre.localeCompare(b.nombre));
  }, [visibles, vista]);

  const totalVista = vista === 'pagados' ? suma(pagados) : suma(porCobrar);
  const abrir = (cobro = null, iniciales = null) => setEditor({ abierto: true, cobro, iniciales });
  const alternarGrupo = (clave) =>
    setCerrados((s) => {
      const nuevo = new Set(s);
      if (nuevo.has(clave)) nuevo.delete(clave);
      else nuevo.add(clave);
      return nuevo;
    });

  return (
    <div className="pagina pagina--media">
      <CabeceraPagina
        titulo={tablero.nombre}
        icono={<IconoTablero nombre={tablero.icono} size={26} strokeWidth={2} />}
        subtitulo="Cobros agrupados por cliente"
        accion={{ texto: 'Nuevo cobro', alHacer: () => abrir() }}
        extra={
          <button className="boton-icono" onClick={() => abrirTablero(tablero)} aria-label="Editar tablero">
            <Pencil size={18} />
          </button>
        }
      />

      <div className="resumen-grande">
        <span className="resumen-grande__valor">
          <Numero valor={totalVista} formato={formatoCOP} />
        </span>
        <span className="resumen-grande__texto">
          {vista === 'pagados' ? 'cobrado' : 'por cobrar'}
          <small>
            {vista === 'pagados'
              ? `${pagados.length} cobros pagados`
              : `${porCobrar.length} cobros · ${new Set(porCobrar.map((c) => claveCliente(c.cliente))).size} clientes`}
          </small>
        </span>
      </div>

      <div className="filtros">
        <Opciones
          etiqueta="Ver"
          opciones={[
            { valor: 'por-cobrar', texto: 'Por cobrar', cuenta: porCobrar.length },
            { valor: 'pagados', texto: 'Pagados', cuenta: pagados.length },
            { valor: 'todos', texto: 'Todos', cuenta: cobros.length },
          ]}
          valor={vista}
          alCambiar={setVista}
        />
      </div>

      {grupos.length === 0 && (
        <div className="vacio vacio--grande">
          {vista === 'pagados' ? (
            <p>Todavía no has marcado cobros como pagados.</p>
          ) : (
            <>
              <p className={cobros.length ? 'texto-exito' : undefined}>
                {cobros.length ? 'Nadie te debe nada.' : 'Aún no tienes cobros en este tablero.'}
              </p>
              <button className="boton boton--primario" onClick={() => abrir()}>
                Agregar un cobro
              </button>
            </>
          )}
        </div>
      )}

      <AnimatePresence initial={false}>
        {grupos.map((g) => {
          const abierto = !cerrados.has(g.clave);
          return (
            <motion.section
              key={g.clave}
              className="cliente-grupo"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              <button
                type="button"
                className="cliente-grupo__cabecera"
                onClick={() => alternarGrupo(g.clave)}
                aria-expanded={abierto}
              >
                <ChevronDown size={18} className={cx('cliente-grupo__flecha', !abierto && 'cerrado')} aria-hidden />
                <span className="cliente-grupo__nombre">{g.nombre}</span>
                <span className="cliente-grupo__cuenta">{g.cobros.length}</span>
                <span className="cliente-grupo__subtotal">
                  <Numero valor={g.subtotal} formato={formatoCOP} />
                </span>
              </button>

              <AnimatePresence initial={false}>
                {abierto && (
                  <motion.div
                    className="cliente-grupo__cuerpo"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.22 }}
                  >
                    <ul className="grupo">
                      <AnimatePresence initial={false}>
                        {g.cobros.map((c) => (
                          <motion.li
                            key={c.id}
                            className="grupo__fila"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0, transition: { duration: 0.26 } }}
                          >
                            <CobroFila cobro={c} alEditar={abrir} />
                          </motion.li>
                        ))}
                      </AnimatePresence>
                      {vista !== 'pagados' && (
                        <li className="grupo__fila">
                          <button type="button" className="agregar-fila" onClick={() => abrir(null, { cliente: g.nombre })}>
                            <Plus size={17} aria-hidden /> Agregar a {g.nombre}
                          </button>
                        </li>
                      )}
                    </ul>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.section>
          );
        })}
      </AnimatePresence>

      {grupos.length > 0 && vista !== 'pagados' && (
        <div className="total-general">
          <span>Total por cobrar</span>
          <strong>
            <Numero valor={suma(porCobrar)} formato={formatoCOP} />
          </strong>
        </div>
      )}

      <CobroEditor
        abierto={editor.abierto}
        cobro={editor.cobro}
        iniciales={editor.iniciales}
        tablero={tablero}
        alCerrar={() => setEditor((e) => ({ ...e, abierto: false }))}
      />
    </div>
  );
}
