// ============================================================
// INICIO DE SESIÓN
// - Con Firebase configurado: Google o correo + contraseña.
// - Sin Firebase: "modo local" (un usuario guardado en este navegador).
// ============================================================
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signOut,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, firebaseActivo } from '../firebase';

const CLAVE_LOCAL = 'trazzo:sesion-local';
const oyentesLocales = new Set();

function leerSesionLocal() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_LOCAL));
  } catch {
    return null;
  }
}

function avisarCambioLocal() {
  const sesion = leerSesionLocal();
  oyentesLocales.forEach((cb) => cb(sesion));
}

// Convierte el usuario de Firebase a un objeto simple
function aUsuario(u) {
  if (!u) return null;
  return {
    uid: u.uid,
    nombre: u.displayName || (u.email ? u.email.split('@')[0] : ''),
    correo: u.email || '',
    modo: 'nube',
  };
}

/** Avisa cada vez que alguien entra o sale. Devuelve una función para dejar de escuchar. */
export function escucharSesion(cb) {
  if (firebaseActivo) return onAuthStateChanged(auth, (u) => cb(aUsuario(u)));
  oyentesLocales.add(cb);
  cb(leerSesionLocal());
  return () => oyentesLocales.delete(cb);
}

export function usuarioActual() {
  return firebaseActivo ? aUsuario(auth.currentUser) : leerSesionLocal();
}

export async function entrarConGoogle() {
  const proveedor = new GoogleAuthProvider();
  proveedor.setCustomParameters({ prompt: 'select_account' });
  try {
    await signInWithPopup(auth, proveedor);
  } catch (error) {
    // Si el navegador bloquea la ventana emergente, se usa redirección.
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/operation-not-supported-in-this-environment') {
      await signInWithRedirect(auth, proveedor);
    } else {
      throw error;
    }
  }
}

export async function entrarConCorreo(correo, clave) {
  await signInWithEmailAndPassword(auth, correo.trim(), clave);
}

export async function crearCuenta(nombre, correo, clave) {
  const cred = await createUserWithEmailAndPassword(auth, correo.trim(), clave);
  if (nombre.trim()) await updateProfile(cred.user, { displayName: nombre.trim() });
}

export async function recuperarClave(correo) {
  await sendPasswordResetEmail(auth, correo.trim());
}

export function entrarModoLocal(nombre) {
  localStorage.setItem(
    CLAVE_LOCAL,
    JSON.stringify({ uid: 'local', nombre: nombre.trim(), correo: '', modo: 'local' })
  );
  avisarCambioLocal();
}

export async function cerrarSesion() {
  if (firebaseActivo) {
    await signOut(auth);
  } else {
    localStorage.removeItem(CLAVE_LOCAL);
    avisarCambioLocal();
  }
}

// Traduce los errores de Firebase a mensajes claros en español.
// null = no mostrar nada (por ejemplo, si el usuario cerró la ventana de Google).
const MENSAJES = {
  'auth/invalid-email': 'El correo no es válido.',
  'auth/missing-email': 'Escribe tu correo.',
  'auth/missing-password': 'Escribe tu contraseña.',
  'auth/invalid-credential': 'Correo o contraseña incorrectos.',
  'auth/wrong-password': 'Correo o contraseña incorrectos.',
  'auth/user-not-found': 'No existe una cuenta con ese correo.',
  'auth/email-already-in-use': 'Ya existe una cuenta con ese correo. Entra en vez de registrarte.',
  'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.',
  'auth/too-many-requests': 'Demasiados intentos. Espera un momento y vuelve a intentar.',
  'auth/network-request-failed': 'Sin conexión. Revisa tu internet.',
  'auth/unauthorized-domain':
    'Este dominio no está autorizado en Firebase (Authentication → Configuración → Dominios autorizados).',
  'auth/operation-not-allowed': 'Este método de inicio de sesión no está activado en Firebase.',
  'auth/configuration-not-found': 'Falta activar Authentication en Firebase (ver LEEME.md).',
  'auth/popup-closed-by-user': null,
  'auth/cancelled-popup-request': null,
};

export function mensajeError(error) {
  if (error && error.code in MENSAJES) return MENSAJES[error.code];
  console.error(error);
  return 'Algo salió mal. Intenta de nuevo.';
}
