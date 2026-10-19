// ============================================================
// EDITOR DE TAREA — crear o editar con todos los campos.
// ============================================================
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarPlus, Download, Trash2 } from 'lucide-react';
import { Modal } from './Modal';
import { Opciones } from './Opciones';
import { SelectorFecha } from './SelectorFecha';
import { useDatos, useBorrarConDeshacer } from '../contexto/DatosContext';
import { useHoy } from '../hooks/useHoy';
import { ESTADOS, PRIORIDADES, RECORDATORIOS } from '../config/app';
import { descargarIcs, enlaceGoogleCalendar } from '../utils/calendario';

const OPCIONES_PRIORIDAD = Object.entries(PRIORIDADES).map(([valor, texto]) => ({
  valor,
  texto,
  tono: valor === 'ALTA' ? 'peligro' : undefined,
}));
const OPCIONES_ESTADO = Object.entries(ESTADOS).map(([valor, texto]) => ({
  valor,
  texto,
  tono: valor === 'HECHO' ? 'exito' : undefined,
}));

const VACIA = {
  titulo: '',
  tablero: null,
  prioridad: 'MEDIA',
  fecha: null,
  recordatorio: null,
  estado: 'POR_HACER',
};

export function TareaEditor({ abierto, tarea, iniciales, alCerrar }) {
  const { listas, acciones } = useDatos();
  const borrarConDeshacer = useBorrarConDeshacer();
  const hoy = useHoy();
  const [form, setForm] = useState(VACIA);
  const [error, setError] = useState('');
  const editando = Boolean(tarea?.id);

  // Cada vez que se abre, se cargan los datos de la tarea (o vacío si es nueva)
  useEffect(() => {
    if (!abierto) return;
    setForm(tarea ? { ...VACIA, ...tarea } : { ...VACIA, ...iniciales });
    setError('');
  }, [abierto, tarea, iniciales]);

  const cambiar = (campo) => (valor) => setForm((f) => ({ ...f, [campo]: valor }));

  function guardar(e) {
    e.preventDefault();
    const titulo = form.titulo.trim();
    if (!titulo) {
      setError('Escribe el nombre de la tarea.');
      return;
    }
    const datos = {
      titulo,
      tablero: form.tablero || null,
      prioridad: form.prioridad,
      fecha: form.fecha || null,
      recordatorio: form.fecha ? form.recordatorio : null,
      estado: form.estado,
      completada: form.estado === 'HECHO' ? tarea?.completada || Date.now() : null,
    };
    if (editando) acciones.actualizar('tareas', tarea.id, datos);
    else acciones.crear('tareas', datos);
    alCerrar();
  }

  function borrar() {
    borrarConDeshacer('tareas', tarea, 'Tarea borrada');
    alCerrar();
  }

  const opcionesTablero = [
    { valor: null, texto: 'Ninguno' },
    ...listas.map((t) => ({ valor: t.id, texto: t.nombre })),
  ];

  return (
    <Modal abierto={abierto} alCerrar={alCerrar} titulo={editando ? 'Editar tarea' : 'Nueva tarea'}>
      <form className="formulario" onSubmit={guardar}>
        <label className="campo">
          <span className="campo__etiqueta">Tarea</span>
          <input
            className="campo__input"
            value={form.titulo}
            onChange={(e) => setForm((f) => ({ ...f, titulo: e.target.value }))}
            placeholder="¿Qué tienes que hacer?"
            autoFocus={!editando}
            autoComplete="off"
          />
        </label>

        <div className="campo">
          <span className="campo__etiqueta">Prioridad</span>
          <Opciones
            etiqueta="Prioridad"
            opciones={OPCIONES_PRIORIDAD}
            valor={form.prioridad}
            alCambiar={cambiar('prioridad')}
          />
        </div>

        <div className="campo">
          <span className="campo__etiqueta">Fecha límite (opcional)</span>
          <SelectorFecha valor={form.fecha} alCambiar={cambiar('fecha')} hoy={hoy} />
        </div>

        {form.fecha && (
          <div className="campo">
            <span className="campo__etiqueta">Recordatorio</span>
            <Opciones
              variante="chips"
              etiqueta="Recordatorio"
              opciones={RECORDATORIOS}
              valor={form.recordatorio}
              alCambiar={cambiar('recordatorio')}
            />
          </div>
        )}

        <div className="campo">
          <span className="campo__etiqueta campo__etiqueta--fila">
            Lista
            <Link to="/app/tableros" className="campo__enlace" onClick={alCerrar}>
              Crear lista
            </Link>
          </span>
          <Opciones
            variante="chips"
            etiqueta="Lista"
            opciones={opcionesTablero}
            valor={form.tablero}
            alCambiar={cambiar('tablero')}
          />
        </div>

        <div className="campo">
          <span className="campo__etiqueta">Estado</span>
          <Opciones etiqueta="Estado" opciones={OPCIONES_ESTADO} valor={form.estado} alCambiar={cambiar('estado')} />
        </div>

        {/* Enviar al calendario del celular: avisa aunque TRAZZO esté cerrada */}
        {form.fecha && form.titulo.trim() && (
          <div className="calendario-acciones">
            <a
              className="boton boton--suave boton--pequeno"
              href={enlaceGoogleCalendar({ ...form, titulo: form.titulo.trim() })}
              target="_blank"
              rel="noreferrer"
            >
              <CalendarPlus size={16} aria-hidden /> Google Calendar
            </a>
            <button
              type="button"
              className="boton boton--suave boton--pequeno"
              onClick={() => descargarIcs({ ...form, id: tarea?.id || 'nueva', titulo: form.titulo.trim() })}
            >
              <Download size={16} aria-hidden /> Calendario (.ics)
            </button>
          </div>
        )}

        {error && (
          <p className="formulario__error" role="alert">
            {error}
          </p>
        )}

        <div className="modal__acciones">
          {editando && (
            <button type="button" className="boton boton--peligro-suave boton--icono-solo" onClick={borrar} aria-label="Borrar tarea">
              <Trash2 size={18} />
            </button>
          )}
          <button type="button" className="boton boton--secundario" onClick={alCerrar}>
            Cancelar
          </button>
          <button className="boton boton--primario">{editando ? 'Guardar' : 'Crear tarea'}</button>
        </div>
      </form>
    </Modal>
  );
}
