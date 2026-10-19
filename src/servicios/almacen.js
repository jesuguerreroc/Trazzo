// ============================================================
// ALMACÉN DE DATOS
// Todas las pantallas guardan y leen datos por aquí, sin importar
// si se guardan en el navegador (modo local) o en Firebase (modo nube).
//
// Colecciones (grupos de datos):
//   tableros   -> los tableros que crea cada persona (listas, contadores, cobros)
//   tareas     -> pendientes de los tableros tipo lista
//   contadores -> filas de los tableros tipo contador
//   cobros     -> filas de los tableros tipo cobros
//   ajustes    -> preferencias guardadas en la cuenta
// En Firebase quedan en: usuarios/{tu-id}/{coleccion}/{documento}
// ============================================================
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDocFromServer,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../firebase';

export const COLECCIONES = ['tableros', 'tareas', 'contadores', 'cobros', 'ajustes'];

function nuevoId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

/** Crea el almacén correcto según el usuario (local o nube). */
export function crearAlmacen(usuario, { alError } = {}) {
  return usuario.modo === 'nube' ? crearAlmacenNube(usuario.uid, alError) : crearAlmacenLocal();
}

// ---------------- MODO LOCAL (navegador) ----------------
function crearAlmacenLocal() {
  const PREFIJO = 'trazzo:datos:';
  const oyentes = new Map(); // coleccion -> funciones que esperan cambios

  const leer = (col) => {
    try {
      return JSON.parse(localStorage.getItem(PREFIJO + col)) || {};
    } catch {
      return {};
    }
  };
  const aLista = (mapa) => Object.entries(mapa).map(([id, d]) => ({ ...d, id }));
  const avisar = (col) => {
    const lista = aLista(leer(col));
    oyentes.get(col)?.forEach((cb) => cb(lista));
  };
  const escribir = (col, mapa) => {
    localStorage.setItem(PREFIJO + col, JSON.stringify(mapa));
    avisar(col);
  };

  // Si la app está abierta en otra pestaña y cambia algo, nos enteramos.
  const alCambiarOtraPestana = (e) => {
    if (e.key && e.key.startsWith(PREFIJO)) avisar(e.key.slice(PREFIJO.length));
  };
  let escuchandoPestanas = false;

  return {
    modo: 'local',

    escuchar(col, cb) {
      if (!oyentes.has(col)) oyentes.set(col, new Set());
      oyentes.get(col).add(cb);
      if (!escuchandoPestanas) {
        window.addEventListener('storage', alCambiarOtraPestana);
        escuchandoPestanas = true;
      }
      cb(aLista(leer(col)));
      return () => {
        oyentes.get(col).delete(cb);
        const quedan = [...oyentes.values()].some((s) => s.size > 0);
        if (!quedan && escuchandoPestanas) {
          window.removeEventListener('storage', alCambiarOtraPestana);
          escuchandoPestanas = false;
        }
      };
    },

    crear(col, datos) {
      const id = nuevoId();
      const mapa = leer(col);
      mapa[id] = datos;
      escribir(col, mapa);
      return id;
    },

    guardar(col, id, datos) {
      const mapa = leer(col);
      mapa[id] = { ...(mapa[id] || {}), ...datos };
      escribir(col, mapa);
    },

    actualizar(col, id, cambios) {
      const mapa = leer(col);
      if (!mapa[id]) return;
      mapa[id] = { ...mapa[id], ...cambios };
      escribir(col, mapa);
    },

    borrar(col, id) {
      const mapa = leer(col);
      delete mapa[id];
      escribir(col, mapa);
    },

    async existe(col, id) {
      return Boolean(leer(col)[id]);
    },

    /** Borra todo y guarda los datos nuevos (para datos de ejemplo o importar copia). */
    async reemplazarTodo(datos) {
      for (const col of COLECCIONES) {
        const mapa = {};
        (datos[col] || []).forEach(({ id, ...resto }) => {
          mapa[id || nuevoId()] = resto;
        });
        escribir(col, mapa);
      }
    },
  };
}

// ---------------- MODO NUBE (Firebase Firestore) ----------------
function crearAlmacenNube(uid, alError = () => {}) {
  const ref = (col) => collection(db, 'usuarios', uid, col);

  // Los cambios se ven al instante en pantalla; Firebase los sube en segundo plano.
  // Por eso no esperamos (await) a que termine de guardar.
  const enSegundoPlano = (promesa) =>
    promesa.catch((e) => {
      console.error(e);
      alError(e);
    });

  return {
    modo: 'nube',

    escuchar(col, cb) {
      return onSnapshot(
        ref(col),
        (snap) => cb(snap.docs.map((d) => ({ ...d.data(), id: d.id }))),
        (e) => {
          console.error(e);
          alError(e);
          cb([]);
        }
      );
    },

    crear(col, datos) {
      const nuevo = doc(ref(col));
      enSegundoPlano(setDoc(nuevo, datos));
      return nuevo.id;
    },

    guardar(col, id, datos) {
      enSegundoPlano(setDoc(doc(ref(col), id), datos, { merge: true }));
    },

    actualizar(col, id, cambios) {
      enSegundoPlano(updateDoc(doc(ref(col), id), cambios));
    },

    borrar(col, id) {
      enSegundoPlano(deleteDoc(doc(ref(col), id)));
    },

    /** true / false, o null si no se pudo verificar (sin internet). */
    async existe(col, id) {
      try {
        const snap = await getDocFromServer(doc(ref(col), id));
        return snap.exists();
      } catch {
        return null;
      }
    },

    async reemplazarTodo(datos) {
      // Firebase permite máximo 500 operaciones por lote; usamos 400 por seguridad.
      const operaciones = [];
      for (const col of COLECCIONES) {
        const actuales = await getDocs(ref(col));
        actuales.forEach((d) => operaciones.push((lote) => lote.delete(d.ref)));
        (datos[col] || []).forEach(({ id, ...resto }) => {
          const destino = id ? doc(ref(col), id) : doc(ref(col));
          operaciones.push((lote) => lote.set(destino, resto));
        });
      }
      for (let i = 0; i < operaciones.length; i += 400) {
        const lote = writeBatch(db);
        operaciones.slice(i, i + 400).forEach((op) => op(lote));
        enSegundoPlano(lote.commit());
      }
    },
  };
}
