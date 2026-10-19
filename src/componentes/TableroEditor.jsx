// ============================================================
// EDITOR DE TABLERO — crear o editar un tablero:
// lista (pendientes), contador (un número por fila) o cobros.
// ============================================================
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { ICONOS, IconoTablero } from './Iconos';
import { useDatos } from '../contexto/DatosContext';
import { useConfirmar } from '../contexto/ConfirmarContext';
import { PLANTILLAS, TIPOS_TABLERO } from '../config/app';
import { cantidad, plural } from '../utils/palabras';
import { cx } from '../utils/cx';

const ICONO_POR_TIPO = { lista: 'carpeta', contador: 'claqueta', cobros: 'billetera' };
const VACIO = { nombre: '', tipo: 'lista', icono: 'carpeta', fila: '', unidad: '' };

export function TableroEditor({ abierto, tablero, alCerrar }) {
  const { acciones, tareas, contadores, cobros } = useDatos();
  const confirmar = useConfirmar();
  const navegar = useNavigate();
  const editando = Boolean(tablero?.id);
  const [form, setForm] = useState(VACIO);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!abierto) return;
    setForm(tablero ? { ...VACIO, ...tablero } : VACIO);
    setError('');
  }, [abierto, tablero]);

  const cambiar = (campo) => (valor) => setForm((f) => ({ ...f, [campo]: valor }));

  function elegirTipo(tipo) {
    setForm((f) => ({
      ...f,
      tipo,
      // Si no habías elegido ícono a mano, se pone uno acorde al tipo
      icono: Object.values(ICONO_POR_TIPO).includes(f.icono) ? ICONO_POR_TIPO[tipo] : f.icono,
    }));
  }

  function usarPlantilla(p) {
    setForm({ ...VACIO, ...p });
  }

  function guardar(e) {
    e.preventDefault();
    if (!form.nombre.trim()) return setError('Ponle un nombre al tablero.');
    if (form.tipo === 'contador' && (!form.fila.trim() || !form.unidad.trim())) {
      return setError('Escribe cómo se llama cada fila y qué vas a contar.');
    }
    const datos = {
      nombre: form.nombre.trim(),
      tipo: form.tipo,
      icono: form.icono,
      fila: form.tipo === 'contador' ? form.fila.trim().toLowerCase() : '',
      unidad: form.tipo === 'contador' ? form.unidad.trim().toLowerCase() : '',
    };
    if (editando) {
      acciones.actualizar('tableros', tablero.id, datos);
      alCerrar();
    } else {
      const id = acciones.crearTablero(datos);
      alCerrar();
      navegar(`/app/t/${id}`);
    }
  }

  async function borrar() {
    const n = {
      lista: tareas.filter((t) => t.tablero === tablero.id).length,
      contador: contadores.filter((c) => c.tablero === tablero.id).length,
      cobros: cobros.filter((c) => c.tablero === tablero.id).length,
    }[tablero.tipo];
    const detalle = {
      lista: n ? `Sus ${n} tareas no se borran: quedan sin lista.` : '',
      contador: n ? `También se borrarán sus ${n} filas.` : '',
      cobros: n ? `También se borrarán sus ${n} cobros.` : '',
    }[tablero.tipo];
    const ok = await confirmar({
      titulo: `Borrar “${tablero.nombre}”`,
      texto: `${detalle} Esta acción no se puede deshacer.`.trim(),
      boton: 'Borrar tablero',
      peligro: true,
    });
    if (!ok) return;
    acciones.borrarTablero(tablero);
    alCerrar();
    navegar('/app/tableros');
  }

  const ejemplo = form.tipo === 'contador' && form.fila.trim() && form.unidad.trim();

  return (
    <Modal abierto={abierto} alCerrar={alCerrar} titulo={editando ? 'Editar tablero' : 'Nuevo tablero'}>
      <form className="formulario" onSubmit={guardar}>
        {!editando && (
          <div className="campo">
            <span className="campo__etiqueta">Empieza rápido con una idea</span>
            <div className="chips">
              {PLANTILLAS.map((p) => (
                <button
                  type="button"
                  key={p.nombre}
                  className={cx('chip-opcion', form.nombre === p.nombre && form.tipo === p.tipo && 'activo')}
                  onClick={() => usarPlantilla(p)}
                >
                  <IconoTablero nombre={p.icono} size={15} strokeWidth={2.2} />
                  {p.nombre}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="campo">
          <span className="campo__etiqueta">Tipo de tablero</span>
          {editando ? (
            <p className="campo__ayuda">
              {TIPOS_TABLERO[form.tipo].nombre} · el tipo no se puede cambiar después de crearlo.
            </p>
          ) : (
            <div className="tipos">
              {Object.entries(TIPOS_TABLERO).map(([valor, t]) => (
                <button
                  type="button"
                  key={valor}
                  role="radio"
                  aria-checked={form.tipo === valor}
                  className={cx('tipo', form.tipo === valor && 'activo')}
                  onClick={() => elegirTipo(valor)}
                >
                  <IconoTablero nombre={ICONO_POR_TIPO[valor]} size={20} />
                  <strong>{t.nombre}</strong>
                  <span>{t.descripcion}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <label className="campo">
          <span className="campo__etiqueta">Nombre</span>
          <input
            className="campo__input"
            value={form.nombre}
            onChange={(e) => setForm((f) => ({ ...f, nombre: e.target.value }))}
            placeholder={{ lista: 'Ej: Universidad', contador: 'Ej: Agencia', cobros: 'Ej: Me deben' }[form.tipo]}
            autoComplete="off"
          />
        </label>

        {form.tipo === 'contador' && (
          <div className="campo-doble">
            <label className="campo">
              <span className="campo__etiqueta">¿Cómo llamas a cada fila?</span>
              <input
                className="campo__input"
                value={form.fila}
                onChange={(e) => setForm((f) => ({ ...f, fila: e.target.value }))}
                placeholder="Ej: marca, cliente"
                autoComplete="off"
              />
            </label>
            <label className="campo">
              <span className="campo__etiqueta">¿Qué cuentas?</span>
              <input
                className="campo__input"
                value={form.unidad}
                onChange={(e) => setForm((f) => ({ ...f, unidad: e.target.value }))}
                placeholder="Ej: videos, pedidos"
                autoComplete="off"
              />
            </label>
            {ejemplo && (
              <p className="campo__ayuda campo-doble__ejemplo">
                Se verá así: “{cantidad(9, form.unidad.trim().toLowerCase())} pendientes en 3{' '}
                {plural(form.fila.trim().toLowerCase())}”
              </p>
            )}
          </div>
        )}

        <div className="campo">
          <span className="campo__etiqueta">Ícono</span>
          <div className="iconos" role="radiogroup" aria-label="Ícono">
            {Object.keys(ICONOS).map((nombre) => (
              <button
                type="button"
                key={nombre}
                role="radio"
                aria-checked={form.icono === nombre}
                aria-label={nombre}
                className={cx('icono-opcion', form.icono === nombre && 'activo')}
                onClick={() => cambiar('icono')(nombre)}
              >
                <IconoTablero nombre={nombre} size={20} strokeWidth={1.9} />
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p className="formulario__error" role="alert">
            {error}
          </p>
        )}

        <div className="modal__acciones">
          {editando && (
            <button type="button" className="boton boton--peligro-suave boton--icono-solo" onClick={borrar} aria-label="Borrar tablero">
              <Trash2 size={18} />
            </button>
          )}
          <button type="button" className="boton boton--secundario" onClick={alCerrar}>
            Cancelar
          </button>
          <button className="boton boton--primario">{editando ? 'Guardar' : 'Crear tablero'}</button>
        </div>
      </form>
    </Modal>
  );
}
