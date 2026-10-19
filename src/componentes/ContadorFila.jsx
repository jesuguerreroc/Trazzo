// ============================================================
// FILA DE CONTADOR (una marca o un cliente)
// - "Hecho" resta 1 (nunca baja de 0)
// - − y + para ajustar
// - Toca el número para escribirlo directamente
// - Toca el nombre para editar nombre y notas
// ============================================================
import { useState } from 'react';
import { Check, Minus, Plus } from 'lucide-react';
import { Numero } from './Numero';
import { useDatos, useHechoContador } from '../contexto/DatosContext';
import { cx } from '../utils/cx';

export function ContadorFila({ item, alEditar }) {
  const { acciones } = useDatos();
  const hecho = useHechoContador();
  const [editando, setEditando] = useState(false);
  const [texto, setTexto] = useState('');

  const n = Number(item.pendientes) || 0;
  const cambiar = (valor) => acciones.cambiarPendientes(item.id, valor);

  function guardarNumero() {
    const valor = parseInt(texto, 10);
    if (!Number.isNaN(valor)) cambiar(valor);
    setEditando(false);
  }

  return (
    <div className={cx('contador', n === 0 && 'contador--cero')}>
      <button type="button" className="contador__info" onClick={() => alEditar(item)}>
        <span className="contador__nombre">{item.nombre}</span>
        {item.notas && <span className="contador__notas">{item.notas}</span>}
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
            aria-label={`Videos pendientes de ${item.nombre}`}
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
          <button type="button" className="paso" onClick={() => cambiar(n - 1)} disabled={n === 0} aria-label="Restar uno">
            <Minus size={18} strokeWidth={2.2} />
          </button>
          <button type="button" className="paso" onClick={() => cambiar(n + 1)} aria-label="Sumar uno">
            <Plus size={18} strokeWidth={2.2} />
          </button>
        </div>
        <button type="button" className="boton-hecho" onClick={() => hecho(item)} disabled={n === 0}>
          <Check size={17} strokeWidth={2.6} aria-hidden /> Hecho
        </button>
      </div>
    </div>
  );
}

/** Versión compacta para el Inicio: nombre, número y botón Hecho. */
export function ContadorMini({ item }) {
  const hecho = useHechoContador();
  const n = Number(item.pendientes) || 0;

  return (
    <div className="contador-mini">
      <div className="contador-mini__info">
        <span className="contador-mini__nombre">{item.nombre}</span>
        {item.notas && <span className="contador-mini__notas">{item.notas}</span>}
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
  );
}
