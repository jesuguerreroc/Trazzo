// Crear o editar un cobro de un tablero de cobros.
import { useEffect, useMemo, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { Opciones } from './Opciones';
import { CampoMonto, montoATexto } from './CampoMonto';
import { useDatos, useBorrarConDeshacer } from '../contexto/DatosContext';
import { interpretarMonto } from '../utils/dinero';
import { MESES } from '../utils/fechas';

const OPCIONES_ESTADO = [
  { valor: 'POR_COBRAR', texto: 'Por cobrar' },
  { valor: 'PAGADO', texto: 'Pagado', tono: 'exito' },
];

export function CobroEditor({ abierto, cobro, tablero, iniciales, alCerrar }) {
  const { cobros, contadores, acciones } = useDatos();
  const borrarConDeshacer = useBorrarConDeshacer();
  const editando = Boolean(cobro?.id);

  const [concepto, setConcepto] = useState('');
  const [cliente, setCliente] = useState('');
  const [monto, setMonto] = useState('');
  const [mes, setMes] = useState('');
  const [estado, setEstado] = useState('POR_COBRAR');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!abierto) return;
    setConcepto(cobro?.concepto || '');
    setCliente(cobro?.cliente || iniciales?.cliente || '');
    setMonto(montoATexto(cobro?.monto));
    setMes(cobro?.mes || '');
    setEstado(cobro?.estado || 'POR_COBRAR');
    setError('');
  }, [abierto, cobro, iniciales]);

  // Sugerencias: clientes que ya tienen cobros y nombres de tus contadores
  const sugerencias = useMemo(
    () => [...new Set([...cobros.map((c) => c.cliente), ...contadores.map((a) => a.nombre)].filter(Boolean))].sort(),
    [cobros, contadores]
  );

  function guardar(e) {
    e.preventDefault();
    const valor = interpretarMonto(monto);
    if (!concepto.trim()) return setError('Escribe el concepto (¿qué video o trabajo?).');
    if (!cliente.trim()) return setError('Escribe el nombre del cliente.');
    if (!valor) return setError('Escribe un monto válido.');

    const datos = {
      concepto: concepto.trim(),
      cliente: cliente.trim(),
      monto: valor,
      mes,
      estado,
      pagado: estado === 'PAGADO' ? cobro?.pagado || Date.now() : null,
    };
    if (editando) acciones.actualizar('cobros', cobro.id, datos);
    else acciones.crear('cobros', { ...datos, tablero: tablero.id });
    alCerrar();
  }

  function borrar() {
    borrarConDeshacer('cobros', cobro, 'Cobro eliminado');
    alCerrar();
  }

  return (
    <Modal abierto={abierto} alCerrar={alCerrar} titulo={editando ? 'Editar cobro' : 'Nuevo cobro'}>
      <form className="formulario" onSubmit={guardar}>
        <label className="campo">
          <span className="campo__etiqueta">Concepto</span>
          <input
            className="campo__input"
            value={concepto}
            onChange={(e) => setConcepto(e.target.value)}
            placeholder="Ej: Video para redes"
            autoFocus={!editando}
            autoComplete="off"
          />
        </label>

        <label className="campo">
          <span className="campo__etiqueta">Cliente o persona</span>
          <input
            className="campo__input"
            value={cliente}
            onChange={(e) => setCliente(e.target.value)}
            placeholder="Ej: Ana Gómez"
            list="clientes-sugeridos"
            autoComplete="off"
          />
          <datalist id="clientes-sugeridos">
            {sugerencias.map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>

        <CampoMonto texto={monto} alCambiar={setMonto} />

        <label className="campo">
          <span className="campo__etiqueta">Mes (opcional)</span>
          <select className="campo__input campo__select" value={mes} onChange={(e) => setMes(e.target.value)}>
            <option value="">Sin mes</option>
            {MESES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </label>

        <div className="campo">
          <span className="campo__etiqueta">Estado</span>
          <Opciones etiqueta="Estado del cobro" opciones={OPCIONES_ESTADO} valor={estado} alCambiar={setEstado} />
        </div>

        {error && (
          <p className="formulario__error" role="alert">
            {error}
          </p>
        )}

        <div className="modal__acciones">
          {editando && (
            <button type="button" className="boton boton--peligro-suave boton--icono-solo" onClick={borrar} aria-label="Eliminar cobro">
              <Trash2 size={18} />
            </button>
          )}
          <button type="button" className="boton boton--secundario" onClick={alCerrar}>
            Cancelar
          </button>
          <button className="boton boton--primario">{editando ? 'Guardar' : 'Agregar cobro'}</button>
        </div>
      </form>
    </Modal>
  );
}
