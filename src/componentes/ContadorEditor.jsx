// Crear o editar una fila de un tablero contador (ej: una marca, un cliente, un proyecto).
import { useEffect, useState } from 'react';
import { Minus, Plus, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { useDatos, useBorrarConDeshacer } from '../contexto/DatosContext';
import { capitalizar, nuevo } from '../utils/palabras';

export function ContadorEditor({ abierto, item, tablero, alCerrar }) {
  const { acciones } = useDatos();
  const borrarConDeshacer = useBorrarConDeshacer();
  const editando = Boolean(item?.id);
  const fila = tablero.fila || 'elemento';
  const unidad = tablero.unidad || 'pendientes';

  const [nombre, setNombre] = useState('');
  const [pendientes, setPendientes] = useState(0);
  const [notas, setNotas] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!abierto) return;
    setNombre(item?.nombre || '');
    setPendientes(Number(item?.pendientes) || 0);
    setNotas(item?.notas || '');
    setError('');
  }, [abierto, item]);

  function guardar(e) {
    e.preventDefault();
    if (!nombre.trim()) {
      setError(`Escribe el nombre.`);
      return;
    }
    const datos = { nombre: nombre.trim(), pendientes: Math.max(0, Number(pendientes) || 0), notas: notas.trim() };
    if (editando) acciones.actualizar('contadores', item.id, datos);
    else acciones.crear('contadores', { ...datos, tablero: tablero.id });
    alCerrar();
  }

  function borrar() {
    borrarConDeshacer('contadores', item, `${item.nombre} eliminado`);
    alCerrar();
  }

  return (
    <Modal abierto={abierto} alCerrar={alCerrar} titulo={editando ? `Editar ${fila}` : `${nuevo(fila)} ${fila}`}>
      <form className="formulario" onSubmit={guardar}>
        <label className="campo">
          <span className="campo__etiqueta">{capitalizar(fila)}</span>
          <input
            className="campo__input"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="Nombre"
            autoFocus={!editando}
            autoComplete="off"
          />
        </label>

        <div className="campo">
          <span className="campo__etiqueta">{capitalizar(unidad)} pendientes</span>
          <div className="stepper">
            <button
              type="button"
              className="paso paso--grande"
              onClick={() => setPendientes((p) => Math.max(0, (Number(p) || 0) - 1))}
              aria-label="Restar uno"
            >
              <Minus size={20} />
            </button>
            <input
              className="campo__input stepper__input"
              type="number"
              inputMode="numeric"
              min="0"
              value={pendientes}
              onChange={(e) => setPendientes(e.target.value)}
              onFocus={(e) => e.target.select()}
              aria-label={`${unidad} pendientes`}
            />
            <button
              type="button"
              className="paso paso--grande"
              onClick={() => setPendientes((p) => (Number(p) || 0) + 1)}
              aria-label="Sumar uno"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>

        <label className="campo">
          <span className="campo__etiqueta">Notas (opcional)</span>
          <textarea
            className="campo__input campo__texto"
            value={notas}
            onChange={(e) => setNotas(e.target.value)}
            placeholder="Detalles para recordar"
            rows={3}
          />
        </label>

        {error && (
          <p className="formulario__error" role="alert">
            {error}
          </p>
        )}

        <div className="modal__acciones">
          {editando && (
            <button
              type="button"
              className="boton boton--peligro-suave boton--icono-solo"
              onClick={borrar}
              aria-label={`Eliminar ${fila}`}
            >
              <Trash2 size={18} />
            </button>
          )}
          <button type="button" className="boton boton--secundario" onClick={alCerrar}>
            Cancelar
          </button>
          <button className="boton boton--primario">{editando ? 'Guardar' : 'Agregar'}</button>
        </div>
      </form>
    </Modal>
  );
}
