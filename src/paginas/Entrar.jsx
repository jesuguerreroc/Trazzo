// ============================================================
// ENTRAR / CREAR CUENTA
// Con Firebase: Google o correo + contraseña.
// Sin Firebase: entra en "modo local".
// ============================================================
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { ArrowLeft, HardDrive } from 'lucide-react';
import { Logo } from '../componentes/Logo';
import { firebaseActivo } from '../firebase';
import {
  crearCuenta,
  entrarConCorreo,
  entrarConGoogle,
  entrarModoLocal,
  mensajeError,
  recuperarClave,
} from '../servicios/auth';
import { useSesion } from '../contexto/SesionContext';
import { cx } from '../utils/cx';

export default function Entrar() {
  return (
    <div className="auth">
      <Link to="/" className="auth__volver">
        <ArrowLeft size={18} aria-hidden /> Volver
      </Link>
      <div className="auth__caja">
        <div className="auth__logo">
          <Logo grande />
        </div>
        {firebaseActivo ? <FormularioNube /> : <FormularioLocal />}
      </div>
    </div>
  );
}

function FormularioNube() {
  const [params] = useSearchParams();
  const [modo, setModo] = useState(params.get('modo') === 'registro' ? 'registro' : 'entrar');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [clave, setClave] = useState('');
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [enviando, setEnviando] = useState(false);
  const { refrescar } = useSesion();

  const registro = modo === 'registro';

  async function ejecutar(accion) {
    setError('');
    setMensaje('');
    setEnviando(true);
    try {
      await accion();
    } catch (e) {
      const texto = mensajeError(e);
      if (texto) setError(texto);
    } finally {
      setEnviando(false);
    }
  }

  function enviar(e) {
    e.preventDefault();
    ejecutar(async () => {
      if (registro) {
        await crearCuenta(nombre, correo, clave);
        refrescar(); // para que aparezca el nombre recién guardado
      } else {
        await entrarConCorreo(correo, clave);
      }
    });
  }

  function olvide() {
    if (!correo.trim()) {
      setError('Escribe tu correo arriba y vuelve a tocar "¿Olvidaste tu contraseña?".');
      return;
    }
    ejecutar(async () => {
      await recuperarClave(correo);
      setMensaje('Te enviamos un correo para cambiar tu contraseña. Revisa también la carpeta de spam.');
    });
  }

  return (
    <>
      <div className="segmentado" role="tablist">
        {[
          ['entrar', 'Entrar'],
          ['registro', 'Crear cuenta'],
        ].map(([valor, texto]) => (
          <button
            key={valor}
            role="tab"
            aria-selected={modo === valor}
            className={cx('segmentado__opcion', modo === valor && 'activo')}
            onClick={() => {
              setModo(valor);
              setError('');
              setMensaje('');
            }}
          >
            {texto}
          </button>
        ))}
      </div>

      <button className="boton boton--secundario boton--ancho" onClick={() => ejecutar(entrarConGoogle)} disabled={enviando}>
        <IconoGoogle /> Continuar con Google
      </button>

      <div className="separador">
        <span>o con tu correo</span>
      </div>

      <form className="formulario" onSubmit={enviar}>
        {registro && (
          <label className="campo">
            <span className="campo__etiqueta">Nombre</span>
            <input
              className="campo__input"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              autoComplete="name"
              placeholder="¿Cómo te llamas?"
            />
          </label>
        )}
        <label className="campo">
          <span className="campo__etiqueta">Correo</span>
          <input
            className="campo__input"
            type="email"
            value={correo}
            onChange={(e) => setCorreo(e.target.value)}
            autoComplete="email"
            inputMode="email"
            required
          />
        </label>
        <label className="campo">
          <span className="campo__etiqueta">Contraseña</span>
          <input
            className="campo__input"
            type="password"
            value={clave}
            onChange={(e) => setClave(e.target.value)}
            autoComplete={registro ? 'new-password' : 'current-password'}
            minLength={6}
            required
          />
          {registro && <span className="campo__ayuda">Mínimo 6 caracteres.</span>}
        </label>

        {error && (
          <p className="formulario__error" role="alert">
            {error}
          </p>
        )}
        {mensaje && <p className="formulario__mensaje">{mensaje}</p>}

        <button className="boton boton--primario boton--ancho" disabled={enviando}>
          {enviando ? 'Un momento…' : registro ? 'Crear mi cuenta' : 'Entrar'}
        </button>

        {!registro && (
          <button type="button" className="enlace-texto" onClick={olvide}>
            ¿Olvidaste tu contraseña?
          </button>
        )}
      </form>
    </>
  );
}

function FormularioLocal() {
  const [nombre, setNombre] = useState('');

  return (
    <>
      <div className="aviso-caja">
        <HardDrive size={20} aria-hidden />
        <div>
          <strong>Modo local</strong>
          <p>
            Firebase todavía no está configurado. Tus datos se guardarán solo en este navegador. Cuando pegues tus
            datos de Firebase (LEEME.md, paso 2) aparecerá el inicio de sesión con cuenta.
          </p>
        </div>
      </div>
      <form
        className="formulario"
        onSubmit={(e) => {
          e.preventDefault();
          entrarModoLocal(nombre);
        }}
      >
        <label className="campo">
          <span className="campo__etiqueta">Tu nombre</span>
          <input
            className="campo__input"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            placeholder="¿Cómo te llamas?"
            autoComplete="name"
          />
        </label>
        <button className="boton boton--primario boton--ancho">Entrar</button>
      </form>
    </>
  );
}

function IconoGoogle() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z" />
      <path fill="#FF3D00" d="m6.3 14.7 6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" />
      <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.4-.4-3.5z" />
    </svg>
  );
}
