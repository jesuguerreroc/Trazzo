// ============================================================
// AJUSTES — cuenta, instalar, recordatorios, tableros,
// apariencia, copia de seguridad y datos.
// ============================================================
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bell,
  BellOff,
  ChevronRight,
  Cloud,
  Download,
  HardDrive,
  LayoutGrid,
  LogOut,
  Moon,
  RotateCcw,
  Share,
  Smartphone,
  Sun,
  Trash2,
  Upload,
} from 'lucide-react';
import { CabeceraPagina } from '../componentes/CabeceraPagina';
import { Seccion } from '../componentes/Seccion';
import { Opciones } from '../componentes/Opciones';
import { useSesion } from '../contexto/SesionContext';
import { useDatos } from '../contexto/DatosContext';
import { useConfirmar } from '../contexto/ConfirmarContext';
import { useAviso } from '../contexto/AvisosContext';
import { useTema } from '../hooks/useTema';
import { cerrarSesion } from '../servicios/auth';
import { exportarCopia, leerCopia } from '../servicios/copia';
import { escucharInstalacion, esIOS, instalar, puedeInstalar, yaInstalada } from '../servicios/instalar';
import {
  activarNotificaciones,
  desactivarNotificaciones,
  estadoNotificaciones,
} from '../servicios/notificaciones';

export default function Ajustes() {
  const { usuario } = useSesion();
  const nube = usuario.modo === 'nube';
  const confirmar = useConfirmar();

  async function salir() {
    const ok = await confirmar({
      titulo: 'Cerrar sesión',
      texto: nube
        ? 'Tus datos quedan guardados en la nube. Puedes volver a entrar cuando quieras.'
        : 'En modo local tus datos se quedan en este navegador y los verás al volver a entrar.',
      boton: 'Cerrar sesión',
    });
    if (ok) cerrarSesion();
  }

  return (
    <div className="pagina pagina--angosta">
      <CabeceraPagina titulo="Ajustes" />

      <Seccion titulo="Cuenta">
        <div className="grupo">
          <div className="ajuste">
            <span className="avatar avatar--grande" aria-hidden>
              {(usuario.nombre || 'T').charAt(0).toUpperCase()}
            </span>
            <div className="ajuste__texto">
              <strong>{usuario.nombre || 'Sin nombre'}</strong>
              <span>{nube ? usuario.correo : 'Sin cuenta'}</span>
            </div>
          </div>
          <div className="ajuste">
            <span className="ajuste__icono">{nube ? <Cloud size={19} /> : <HardDrive size={19} />}</span>
            <div className="ajuste__texto">
              <strong>{nube ? 'Guardado en la nube' : 'Modo local'}</strong>
              <span>
                {nube
                  ? 'Tus datos se sincronizan entre todos tus dispositivos.'
                  : 'Tus datos están solo en este navegador. Conecta Firebase para usar la nube (LEEME.md).'}
              </span>
            </div>
          </div>
          <button className="ajuste ajuste--boton" onClick={salir}>
            <span className="ajuste__icono">
              <LogOut size={19} />
            </span>
            <div className="ajuste__texto">
              <strong>Cerrar sesión</strong>
            </div>
          </button>
        </div>
      </Seccion>

      <Instalar />
      <Recordatorios />
      <Seccion titulo="Tableros">
        <Link to="/app/tableros" className="grupo ajuste ajuste--boton">
          <span className="ajuste__icono">
            <LayoutGrid size={19} />
          </span>
          <div className="ajuste__texto">
            <strong>Tus tableros</strong>
            <span>Crea, edita y ordena tus listas, contadores y cobros.</span>
          </div>
          <ChevronRight size={18} className="texto-3" aria-hidden />
        </Link>
      </Seccion>
      <Apariencia />
      <CopiaYDatos />

      <p className="nota nota--centro">TRAZZO · versión 1.0</p>
    </div>
  );
}

// ---------------- Instalar como app ----------------
function Instalar() {
  const [, refrescar] = useState(0);
  useEffect(() => escucharInstalacion(() => refrescar((n) => n + 1)), []);

  if (yaInstalada()) return null;

  return (
    <Seccion titulo="Instalar en el celular">
      <div className="grupo">
        <div className="ajuste">
          <span className="ajuste__icono">
            <Smartphone size={19} />
          </span>
          <div className="ajuste__texto">
            <strong>TRAZZO como app</strong>
            {puedeInstalar() ? (
              <span>Se abre en pantalla completa desde tu pantalla de inicio, como cualquier app.</span>
            ) : esIOS() ? (
              <span>
                En Safari toca <Share size={13} className="icono-en-linea" aria-label="Compartir" /> Compartir y luego
                “Agregar a inicio”.
              </span>
            ) : (
              <span>
                En Chrome (Android) abre el menú ⋮ y toca “Instalar app” o “Agregar a la pantalla principal”.
              </span>
            )}
          </div>
          {puedeInstalar() && (
            <button className="boton boton--primario boton--pequeno" onClick={instalar}>
              Instalar
            </button>
          )}
        </div>
      </div>
    </Seccion>
  );
}

// ---------------- Recordatorios ----------------
function Recordatorios() {
  const [estado, setEstado] = useState(estadoNotificaciones);
  const avisar = useAviso();

  async function activar() {
    const nuevo = await activarNotificaciones();
    setEstado(nuevo);
    if (nuevo === 'bloqueadas') avisar({ texto: 'El navegador bloqueó las notificaciones.', tipo: 'error' });
  }

  const textos = {
    activas: 'Activadas. Te avisaremos de las tareas con recordatorio cuando abras TRAZZO.',
    inactivas: 'Recibe un aviso de las tareas con recordatorio (el mismo día, 1 o 2 días antes).',
    bloqueadas: 'Están bloqueadas. Actívalas en la configuración del navegador para este sitio.',
    'no-soportado': 'Este navegador no permite notificaciones. En iPhone, primero instala TRAZZO en tu inicio.',
  };

  return (
    <Seccion titulo="Recordatorios">
      <div className="grupo">
        <div className="ajuste">
          <span className="ajuste__icono">{estado === 'activas' ? <Bell size={19} /> : <BellOff size={19} />}</span>
          <div className="ajuste__texto">
            <strong>Notificaciones</strong>
            <span>{textos[estado]}</span>
          </div>
          {estado === 'inactivas' && (
            <button className="boton boton--primario boton--pequeno" onClick={activar}>
              Activar
            </button>
          )}
          {estado === 'activas' && (
            <button
              className="boton boton--secundario boton--pequeno"
              onClick={() => {
                desactivarNotificaciones();
                setEstado(estadoNotificaciones());
              }}
            >
              Desactivar
            </button>
          )}
        </div>
      </div>
      <p className="nota">
        Con TRAZZO cerrada, el navegador no puede avisarte. Para avisos seguros, abre una tarea con fecha y toca
        “Google Calendar” o “Calendario (.ics)”: tu celular te recordará aunque la app esté cerrada.
      </p>
    </Seccion>
  );
}

// ---------------- Apariencia ----------------
function Apariencia() {
  const { tema, setTema } = useTema();
  return (
    <Seccion titulo="Apariencia">
      <Opciones
        etiqueta="Tema"
        opciones={[
          { valor: 'oscuro', texto: 'Oscuro', icono: Moon },
          { valor: 'claro', texto: 'Claro', icono: Sun },
        ]}
        valor={tema}
        alCambiar={setTema}
      />
    </Seccion>
  );
}

// ---------------- Copia de seguridad y datos ----------------
function CopiaYDatos() {
  const { acciones } = useDatos();
  const confirmar = useConfirmar();
  const avisar = useAviso();
  const archivo = useRef(null);

  async function importar(e) {
    const elegido = e.target.files?.[0];
    e.target.value = '';
    if (!elegido) return;
    try {
      const datos = await leerCopia(elegido);
      const ok = await confirmar({
        titulo: 'Importar copia',
        texto: `Esto REEMPLAZA todos tus datos actuales por los de “${elegido.name}”.`,
        boton: 'Importar',
        peligro: true,
      });
      if (!ok) return;
      await acciones.importar(datos);
      avisar({ texto: 'Copia importada', tipo: 'exito' });
    } catch (error) {
      avisar({ texto: error.message, tipo: 'error' });
    }
  }

  async function cargarEjemplo() {
    const ok = await confirmar({
      titulo: 'Cargar datos de ejemplo',
      texto: 'Esto REEMPLAZA todos tus datos actuales por los de ejemplo. Exporta una copia antes si la necesitas.',
      boton: 'Reemplazar',
      peligro: true,
    });
    if (!ok) return;
    await acciones.cargarEjemplo();
    avisar({ texto: 'Datos de ejemplo cargados', tipo: 'exito' });
  }

  async function borrarTodo() {
    const ok = await confirmar({
      titulo: 'Borrar todos mis datos',
      texto: 'Se borrarán todos tus tableros, tareas, contadores y cobros. Esta acción no se puede deshacer.',
      boton: 'Borrar todo',
      peligro: true,
    });
    if (!ok) return;
    await acciones.borrarTodo();
    avisar({ texto: 'Datos borrados', tipo: 'exito' });
  }

  return (
    <Seccion titulo="Copia de seguridad y datos">
      <div className="grupo">
        <button
          className="ajuste ajuste--boton"
          onClick={() => {
            exportarCopia(acciones.exportar());
            avisar({ texto: 'Copia descargada', tipo: 'exito' });
          }}
        >
          <span className="ajuste__icono">
            <Download size={19} />
          </span>
          <div className="ajuste__texto">
            <strong>Exportar copia</strong>
            <span>Descarga un archivo con todos tus datos. Guárdalo en Drive o en tu correo.</span>
          </div>
        </button>
        <button className="ajuste ajuste--boton" onClick={() => archivo.current?.click()}>
          <span className="ajuste__icono">
            <Upload size={19} />
          </span>
          <div className="ajuste__texto">
            <strong>Importar copia</strong>
            <span>Recupera tus datos desde un archivo exportado antes.</span>
          </div>
        </button>
        <input ref={archivo} type="file" accept=".json,application/json" hidden onChange={importar} />
        <button className="ajuste ajuste--boton" onClick={cargarEjemplo}>
          <span className="ajuste__icono">
            <RotateCcw size={19} />
          </span>
          <div className="ajuste__texto">
            <strong>Cargar datos de ejemplo</strong>
            <span>Reemplaza todo por datos de muestra.</span>
          </div>
        </button>
        <button className="ajuste ajuste--boton ajuste--peligro" onClick={borrarTodo}>
          <span className="ajuste__icono">
            <Trash2 size={19} />
          </span>
          <div className="ajuste__texto">
            <strong>Borrar todos mis datos</strong>
            <span>Deja tu TRAZZO vacío.</span>
          </div>
        </button>
      </div>
    </Seccion>
  );
}
