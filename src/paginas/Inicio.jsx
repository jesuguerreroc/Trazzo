// ============================================================
// INICIO — tu tablero de pendientes.
// Todo lo pendiente se ve aquí SIEMPRE (con o sin fecha) y al
// marcarlo como hecho desaparece para dejar espacio a lo demás.
// Las tarjetas y bloques se arman solos según TUS tableros.
// ============================================================
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import { ListChecks, Plus } from 'lucide-react';
import { Seccion } from '../componentes/Seccion';
import { ListaTareas } from '../componentes/ListaTareas';
import { AgregarRapido } from '../componentes/AgregarRapido';
import { Opciones } from '../componentes/Opciones';
import { Semana } from '../componentes/Semana';
import { Numero } from '../componentes/Numero';
import { ContadorMini } from '../componentes/ContadorFila';
import { IconoTablero } from '../componentes/Iconos';
import { SugerenciasTableros } from '../componentes/SugerenciasTableros';
import { useDatos, useAlternarTarea } from '../contexto/DatosContext';
import { useSesion } from '../contexto/SesionContext';
import { useEditorTarea } from '../contexto/EditorTareaContext';
import { useHoy } from '../hooks/useHoy';
import { fechaLarga } from '../utils/fechas';
import { claveCliente, formatoCOP } from '../utils/dinero';
import { resumenTablero, rutaTablero } from '../utils/tableros';
import { ordenarPendientes, tareasAtrasadas, tareasDeHoy, tareasPrioridadAlta } from '../utils/tareas';
import { cx } from '../utils/cx';

const plural = (n, uno, varios) => `${n} ${n === 1 ? uno : varios}`;

export default function Inicio() {
  const datos = useDatos();
  const { tareas, tableros } = datos;
  const { usuario } = useSesion();
  const alAlternar = useAlternarTarea();
  const abrirEditor = useEditorTarea();
  const hoy = useHoy();
  const [filtro, setFiltro] = useState('todo');

  // Las ideas para crear tableros se muestran hasta que tengas 3 o toques "Listo"
  const [sugerenciasListas, setSugerenciasListas] = useState(() => {
    try {
      return localStorage.getItem('trazzo:sugerencias-listas') === 'si';
    } catch {
      return false;
    }
  });
  const terminarSugerencias = () => {
    setSugerenciasListas(true);
    try {
      localStorage.setItem('trazzo:sugerencias-listas', 'si');
    } catch {
      /* sin almacenamiento: solo se ocultan en esta visita */
    }
  };
  const verSugerencias = tableros.length === 0 || (!sugerenciasListas && tableros.length < 3);

  // ---- Tareas ----
  const pendientes = ordenarPendientes(tareas, hoy);
  const listas = {
    todo: pendientes,
    hoy: tareasDeHoy(tareas, hoy),
    atrasadas: tareasAtrasadas(tareas, hoy),
    alta: tareasPrioridadAlta(tareas, hoy),
  };
  const opcionesFiltro = [
    { valor: 'todo', texto: 'Todo', cuenta: listas.todo.length },
    { valor: 'hoy', texto: 'Hoy', cuenta: listas.hoy.length },
    {
      valor: 'atrasadas',
      texto: 'Atrasadas',
      cuenta: listas.atrasadas.length,
      tono: listas.atrasadas.length ? 'peligro' : undefined,
    },
    { valor: 'alta', texto: 'Prioridad alta', cuenta: listas.alta.length },
  ];
  const vacios = {
    todo: 'No tienes nada pendiente. Escribe arriba para agregar algo.',
    hoy: 'Nada vence hoy.',
    atrasadas: 'Estás al día. Nada atrasado.',
    alta: 'Sin pendientes de prioridad alta.',
  };

  // ---- Tableros que se muestran a la derecha (contadores y cobros) ----
  const laterales = tableros.filter((t) => t.tipo !== 'lista');
  const primerNombre = usuario.nombre ? usuario.nombre.split(' ')[0] : '';

  // Frase corta bajo el saludo
  const estado = [
    listas.hoy.length ? `${listas.hoy.length} para hoy` : null,
    listas.atrasadas.length ? plural(listas.atrasadas.length, 'atrasada', 'atrasadas') : null,
    plural(pendientes.length, 'pendiente en total', 'pendientes en total'),
  ].filter(Boolean);

  return (
    <div className="pagina inicio">
      <header className="saludo">
        <p className="saludo__fecha">{fechaLarga(hoy)}</p>
        <h1 className="saludo__titulo">Hola{primerNombre ? `, ${primerNombre}` : ''}</h1>
        <p className="saludo__estado">
          {estado.map((t, i) => (
            <span key={i} className={t.includes('atrasada') ? 'texto-peligro' : undefined}>
              {t}
            </span>
          ))}
        </p>
      </header>

      {/* ---------- Números grandes: tareas + cada tablero contador/cobros ---------- */}
      {laterales.length > 0 && (
      <div className="tiles">
        <Tile
          a="/app/tareas"
          icono={<ListChecks size={17} strokeWidth={2} aria-hidden />}
          etiqueta="Tareas"
          valor={pendientes.length}
          detalle={listas.atrasadas.length ? plural(listas.atrasadas.length, 'atrasada', 'atrasadas') : 'pendientes'}
          peligro={listas.atrasadas.length > 0}
        />
        {laterales.map((t) => {
          const r = resumenTablero(t, datos);
          return (
            <Tile
              key={t.id}
              a={rutaTablero(t)}
              icono={<IconoTablero nombre={t.icono} size={17} strokeWidth={2} />}
              etiqueta={t.nombre}
              valor={r.valor}
              formato={r.formato}
              detalle={r.detalle}
            />
          );
        })}
      </div>
      )}

      {verSugerencias && <SugerenciasTableros alTerminar={terminarSugerencias} />}

      <div className={cx('inicio__grid', laterales.length === 0 && 'inicio__grid--sin-lateral')}>
        {/* ---------- Pendientes (todas las tareas) ---------- */}
        <div className="inicio__principal">
          <Seccion titulo="Pendientes" cuenta={pendientes.length} enlace={{ a: '/app/tareas', texto: 'Tareas' }}>
            <AgregarRapido />
            <Opciones
              variante="chips"
              etiqueta="Filtrar pendientes"
              opciones={opcionesFiltro}
              valor={filtro}
              alCambiar={setFiltro}
              className="chips--deslizar"
            />
            <ListaTareas tareas={listas[filtro]} tableros={tableros} hoy={hoy} alAlternar={alAlternar} vacio={vacios[filtro]} />
          </Seccion>
        </div>

        {/* ---------- Contadores y cobros ---------- */}
        {laterales.length > 0 && (
          <div className="inicio__lateral">
            {laterales.map((t) =>
              t.tipo === 'contador' ? <BloqueContador key={t.id} tablero={t} /> : <BloqueCobros key={t.id} tablero={t} />
            )}
          </div>
        )}

        {/* ---------- Semana ---------- */}
        <div className="inicio__semana">
          <Semana tareas={tareas} tableros={tableros} hoy={hoy} alAlternar={alAlternar} />
        </div>
      </div>

      <button type="button" className="fab" onClick={() => abrirEditor(null)} aria-label="Nueva tarea">
        <Plus size={26} strokeWidth={2.2} />
      </button>
    </div>
  );
}

function Tile({ a, icono, etiqueta, valor, detalle, formato, peligro }) {
  return (
    <Link to={a} className={formato ? 'tile tile--dinero' : 'tile'}>
      <span className="tile__cabecera">
        <span className="tile__icono">{icono}</span>
        <span className="tile__etiqueta">{etiqueta}</span>
      </span>
      <span className="tile__valor">
        <Numero valor={valor} formato={formato} />
      </span>
      <span className={peligro ? 'tile__detalle texto-peligro' : 'tile__detalle'}>{detalle}</span>
    </Link>
  );
}

/** Filas con pendientes de un tablero contador, con su botón Hecho. */
function BloqueContador({ tablero }) {
  const { contadores } = useDatos();
  const items = contadores
    .filter((c) => c.tablero === tablero.id && Number(c.pendientes) > 0)
    .sort((a, b) => b.pendientes - a.pendientes || a.nombre.localeCompare(b.nombre));
  const total = items.reduce((s, c) => s + Number(c.pendientes), 0);

  return (
    <Seccion titulo={tablero.nombre} cuenta={total} enlace={{ a: rutaTablero(tablero) }}>
      {items.length ? (
        <ul className="grupo">
          <AnimatePresence initial={false}>
            {items.map((item) => (
              <motion.li
                key={item.id}
                className="grupo__fila"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.28, delay: 0.25 } }}
              >
                <ContadorMini item={item} />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      ) : (
        <p className="vacio vacio--exito">Todo al día.</p>
      )}
    </Seccion>
  );
}

/** Lo que te deben en un tablero de cobros, agrupado por cliente. */
function BloqueCobros({ tablero }) {
  const { cobros } = useDatos();
  const porCobrar = cobros.filter((c) => c.tablero === tablero.id && c.estado !== 'PAGADO');
  const total = porCobrar.reduce((s, c) => s + (Number(c.monto) || 0), 0);

  const mapa = new Map();
  for (const c of porCobrar) {
    const clave = claveCliente(c.cliente);
    const g = mapa.get(clave) || { clave, nombre: c.cliente, total: 0, cantidad: 0 };
    g.total += Number(c.monto) || 0;
    g.cantidad += 1;
    mapa.set(clave, g);
  }
  const deudores = [...mapa.values()].sort((a, b) => b.total - a.total);

  return (
    <Seccion titulo={tablero.nombre} enlace={{ a: rutaTablero(tablero) }}>
      {deudores.length ? (
        <ul className="grupo">
          {deudores.map((d) => (
            <li key={d.clave} className="grupo__fila">
              <Link to={rutaTablero(tablero)} className="deudor">
                <span className="deudor__nombre">{d.nombre}</span>
                <span className="deudor__cantidad">{plural(d.cantidad, 'cobro', 'cobros')}</span>
                <span className="deudor__total">{formatoCOP(d.total)}</span>
              </Link>
            </li>
          ))}
          <li className="grupo__fila">
            <div className="deudor deudor--total">
              <span className="deudor__nombre">Total</span>
              <span className="deudor__total">
                <Numero valor={total} formato={formatoCOP} />
              </span>
            </div>
          </li>
        </ul>
      ) : (
        <p className="vacio vacio--exito">Nada por cobrar.</p>
      )}
    </Seccion>
  );
}
