// ============================================================
// FILA DE CONTADOR (una marca, un cliente, un proyecto…)
// - Toca el nombre para desplegar "¿Cuáles te faltan?" (la lista)
// - "Hecho" resta 1 (nunca baja de 0)
// - − y + para ajustar · toca el número para escribirlo
// ============================================================
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown, Minus, Pencil, Plus, X } from 'lucide-react';
import { Numero } from './Numero';
import { useDatos, useHechoContador, useSubitems } from '../contexto/DatosContext';
import { separarSubitems } from '../utils/subitems';
import { plural, singular } from '../utils/palabras';
import { cx } from '../utils/cx';

export function ContadorFila({ item, tablero, alEditar }) {
  const { acciones } = useDatos();
  const hecho = useHechoContador();
  const [abierto, setAbierto] = useState(false);
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState('');

  const n = Number(item.pendientes) || 0;
  const subitems = item.items || [];
  const cambiar = (valor) => acciones.cambiarPendientes(item.id, valor);

  function guardarNumero() {
    const valor = parseInt(texto, 10);
    if (!Number.isNaN(valor)) cambiar(valor);
    setEditando(false);
  }

  function pulsarHecho() {
    // Si todos los pendientes tienen nombre, se abre la lista para elegir cuál
    if (hecho(item) === 'elegir') setAbierto(true);
  }

  // Debajo del nombre: los de la lista (3 · 8 · 9…) o las notas
  const resumen = subitems.length ? subitems.map((s) => s.texto).join(' · ') : item.notas;

  return (
    <div className={cx('contador', n === 0 && 'contador--cero', abierto && 'contador--abierto')}>
      <button
        type="button"
        className="contador__info"
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
      >
        <span className="contador__nombre">
          {item.nombre}
          <ChevronDown size={16} strokeWidth={2.4} className="contador__flecha" aria-hidden />
        </span>
        {resumen && <span className="contador__notas">{resumen}</span>}
      </button>

      <div className="contador__numero">
        {editando ? (
          <input
            className="contador__input"
            type="number"
            inputMode="numeric"
            min="0"
            value={texto}
            autoFocus
            onFocus={(e) => e.target.select()}
            onChange={(e) => setTexto(e.target.value)}
            onBlur={guardarNumero}
            onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
            aria-label={`Pendientes de ${item.nombre}`}
          />
        ) : (
          <button
            type="button"
            className="contador__valor"
            onClick={() => {
              setTexto(String(n));
              setEditando(true);
            }}
            aria-label={`${n} pendientes de ${item.nombre}. Toca para escribir el número`}
          >
            <Numero valor={n} />
          </button>
        )}
      </div>

      <div className="contador__acciones">
        <div className="pasos">
          <button
            type="button"
            className="paso"
            onClick={() => cambiar(n - 1)}
            disabled={n === 0 || n <= subitems.length}
            aria-label="Restar uno"
          >
            <Minus size={18} strokeWidth={2.2} />
          </button>
          <button type="button" className="paso" onClick={() => cambiar(n + 1)} aria-label="Sumar uno">
            <Plus size={18} strokeWidth={2.2} />
          </button>
        </div>
        <button type="button" className="boton-hecho" onClick={pulsarHecho} disabled={n === 0}>
          <Check size={17} strokeWidth={2.6} aria-hidden /> Hecho
        </button>
      </div>

      <AnimatePresence initial={false}>
        {abierto && (
          <motion.div
            className="contador__panel"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.2, 0.7, 0.2, 1] }}
          >
            <PanelSubitems item={item} tablero={tablero} alEditar={alEditar} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** "¿Cuáles te faltan?": la lista desplegable de un contador. */
function PanelSubitems({ item, tablero, alEditar }) {
  const sub = useSubitems();
  const [texto, setTexto] = useState('');

  const unidad = tablero?.unidad || 'pendientes';
  const fila = tablero?.fila || 'elemento';
  const n = Number(item.pendientes) || 0;
  const subitems = item.items || [];
  const sinNombre = Math.max(0, n - subitems.length);
  const desdeNotas = !subitems.length && item.notas?.trim() ? separarSubitems(item.notas) : [];

  function agregar(e) {
    e.preventDefault();
    if (sub.agregar(item, texto)) setTexto('');
  }

  return (
    <div className="subitems">
      <p className="subitems__titulo">¿Cuáles te faltan?</p>

      {subitems.length > 0 && (
        <ul className="subitems__lista">
          <AnimatePresence initial={false}>
            {subitems.map((s) => (
              <motion.li
                key={s.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0, transition: { duration: 0.22 } }}
              >
                <SubitemFila
                  sub={s}
                  alCompletar={() => sub.completar(item, s)}
                  alQuitar={() => sub.quitar(item, s)}
                />
              </motion.li>
            ))}
          </AnimatePresence>
        </ul>
      )}

      {sinNombre > 0 && (
        <p className="subitems__nota">
          {subitems.length
            ? `+ ${sinNombre} sin nombre`
            : `Escribe cuáles son tus ${n} ${unidad} pendientes para tacharlos uno por uno.`}
        </p>
      )}

      {desdeNotas.length > 0 && (
        <button type="button" className="boton boton--suave boton--pequeno subitems__notas" onClick={() => sub.desdeNotas(item)}>
          Pasar las notas a la lista ({desdeNotas.length})
        </button>
      )}

      <form className="subitems__agregar" onSubmit={agregar}>
        <input
          className="subitems__input"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          placeholder={`Agregar ${singular(unidad)}… (ej: 3 8 9)`}
          aria-label={`Agregar ${plural(singular(unidad))} a la lista`}
          enterKeyHint="done"
          autoComplete="off"
        />
        <button className="subitems__boton" disabled={!texto.trim()} aria-label="Agregar a la lista">
          <Plus size={18} strokeWidth={2.4} />
        </button>
      </form>

      <button type="button" className="subitems__editar" onClick={() => alEditar(item)}>
        <Pencil size={14} aria-hidden /> Editar {fila} y notas
      </button>
    </div>
  );
}

/** Un elemento de la lista: círculo para marcarlo hecho y X para quitarlo. */
function SubitemFila({ sub, alCompletar, alQuitar }) {
  const [hecho, setHecho] = useState(false);
  useEffect(() => setHecho(false), [sub.id]);

  function completar() {
    if (hecho) return;
    setHecho(true);
    setTimeout(alCompletar, 380); // se ve el tachado antes de que se vaya
  }

  return (
    <div className={cx('subitem', hecho && 'subitem--hecho')}>
      <button type="button" className="subitem__check" onClick={completar} aria-label={`Marcar “${sub.texto}” como hecho`}>
        <span className="subitem__circulo">{hecho && <Check size={12} strokeWidth={3.2} />}</span>
      </button>
      <span className="subitem__texto">{sub.texto}</span>
      <button type="button" className="subitem__quitar" onClick={alQuitar} aria-label={`Quitar “${sub.texto}” de la lista`}>
        <X size={15} />
      </button>
    </div>
  );
}

/** Versión compacta para el Inicio: nombre, número, botón Hecho y la lista como botoncitos. */
export function ContadorMini({ item }) {
  const hecho = useHechoContador();
  const sub = useSubitems();
  const n = Number(item.pendientes) || 0;
  const subitems = item.items || [];
  const sinNombre = Math.max(0, n - subitems.length);

  return (
    <div className="contador-mini">
      <div className="contador-mini__fila">
        <div className="contador-mini__info">
          <span className="contador-mini__nombre">{item.nombre}</span>
          {!subitems.length && item.notas && <span className="contador-mini__notas">{item.notas}</span>}
        </div>
        <span className="contador-mini__numero">
          <Numero valor={n} />
        </span>
        <button
          type="button"
          className="contador-mini__hecho"
          onClick={() => hecho(item)}
          aria-label={`Restar uno a ${item.nombre} (hecho)`}
        >
          <Check size={18} strokeWidth={2.6} />
        </button>
      </div>

      {subitems.length > 0 && (
        <div className="contador-mini__subs">
          <AnimatePresence initial={false}>
            {subitems.map((s) => (
              <motion.button
                key={s.id}
                type="button"
                layout
                className="sub-chip"
                onClick={() => sub.completar(item, s)}
                aria-label={`Marcar “${s.texto}” de ${item.nombre} como hecho`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6, transition: { duration: 0.18 } }}
              >
                <span className="sub-chip__circulo" aria-hidden />
                {s.texto}
              </motion.button>
            ))}
          </AnimatePresence>
          {sinNombre > 0 && <span className="sub-chip sub-chip--resto">+{sinNombre}</span>}
        </div>
      )}
    </div>
  );
}
