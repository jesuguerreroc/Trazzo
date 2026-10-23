// ============================================================
// DATOS DEL USUARIO
// Escucha todas las colecciones y las comparte con todas las pantallas.
// Uso en cualquier pantalla: const { tareas, tableros, acciones } = useDatos();
// ============================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { COLECCIONES, crearAlmacen } from '../servicios/almacen';
import { construirEjemplo } from '../datos/construirEjemplo';
import { hoyISO } from '../utils/fechas';
import { nuevoIdSubitem, separarSubitems } from '../utils/subitems';
import { useAviso } from './AvisosContext';

const DatosContext = createContext(null);

const porOrden = (a, b) => (a.orden ?? 0) - (b.orden ?? 0) || (a.creada ?? 0) - (b.creada ?? 0);

export function DatosProvider({ usuario, children }) {
  const avisar = useAviso();

  const almacen = useMemo(
    () =>
      crearAlmacen(usuario, {
        alError: () => avisar({ texto: 'No se pudo guardar. Revisa tu conexión.', tipo: 'error' }),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [usuario.uid, usuario.modo]
  );

  // null = todavía cargando esa colección
  const [crudos, setCrudos] = useState(() => Object.fromEntries(COLECCIONES.map((c) => [c, null])));
  const ultimos = useRef(crudos); // copia siempre actualizada (para exportar y ordenar)
  ultimos.current = crudos;

  useEffect(() => {
    const cancelar = COLECCIONES.map((col) =>
      almacen.escuchar(col, (lista) => setCrudos((prev) => ({ ...prev, [col]: lista })))
    );
    return () => cancelar.forEach((f) => f());
  }, [almacen]);

  const listo = COLECCIONES.every((c) => crudos[c] !== null);

  // Acciones que pueden usar todas las pantallas
  const acciones = useMemo(() => {
    const tablerosOrdenados = () => [...(ultimos.current.tableros || [])].sort(porOrden);
    // Siempre la versión más reciente de un contador (por si tocas varios botones seguidos)
    const contador = (id) => (ultimos.current.contadores || []).find((c) => c.id === id);

    return {
      // Genéricas
      crear: (col, datos) => almacen.crear(col, { ...datos, creada: Date.now() }),
      actualizar: (col, id, cambios) => almacen.actualizar(col, id, cambios),
      borrar: (col, id) => almacen.borrar(col, id),
      // Vuelve a guardar algo borrado, con el mismo id (para "Deshacer")
      restaurar: (col, { id, ...datos }) => almacen.guardar(col, id, datos),

      // Tableros
      crearTablero: (datos) => {
        const orden = Math.max(0, ...tablerosOrdenados().map((t) => t.orden || 0)) + 1;
        return almacen.crear('tableros', { ...datos, orden, creada: Date.now() });
      },
      /** Borra el tablero. Las tareas quedan sin tablero; contadores y cobros se borran. */
      borrarTablero: (tablero) => {
        const { tareas = [], contadores = [], cobros = [] } = ultimos.current;
        tareas.filter((t) => t.tablero === tablero.id).forEach((t) => almacen.actualizar('tareas', t.id, { tablero: null }));
        contadores.filter((c) => c.tablero === tablero.id).forEach((c) => almacen.borrar('contadores', c.id));
        cobros.filter((c) => c.tablero === tablero.id).forEach((c) => almacen.borrar('cobros', c.id));
        almacen.borrar('tableros', tablero.id);
      },
      /** Sube (-1) o baja (+1) un tablero en el orden del menú. */
      moverTablero: (id, direccion) => {
        const lista = tablerosOrdenados();
        const i = lista.findIndex((t) => t.id === id);
        const j = i + direccion;
        if (i < 0 || j < 0 || j >= lista.length) return;
        [lista[i], lista[j]] = [lista[j], lista[i]];
        lista.forEach((t, k) => t.orden !== k + 1 && almacen.actualizar('tableros', t.id, { orden: k + 1 }));
      },

      // Tareas
      cambiarEstadoTarea: (id, estado) =>
        almacen.actualizar('tareas', id, {
          estado,
          completada: estado === 'HECHO' ? Date.now() : null,
        }),

      // Contadores: nunca baja de 0, ni de la cantidad de pendientes que tienen nombre en la lista
      cambiarPendientes: (id, n) => {
        const minimo = contador(id)?.items?.length || 0;
        almacen.actualizar('contadores', id, { pendientes: Math.max(minimo, Math.round(Number(n) || 0)) });
      },

      // Lista de "cuáles me faltan" dentro de un contador (ej: videos 3, 8, 9…)
      agregarSubitems: (id, textos, extra = {}) => {
        const c = contador(id);
        if (!c || !textos.length) return;
        const items = [...(c.items || []), ...textos.map((texto) => ({ id: nuevoIdSubitem(), texto }))];
        // Si agregas más nombres que el número actual, el número sube; si no, se queda igual
        almacen.actualizar('contadores', id, {
          ...extra,
          items,
          pendientes: Math.max(Number(c.pendientes) || 0, items.length),
        });
      },
      /** Marca uno de la lista como hecho: sale de la lista y el número baja 1. Devuelve el estado anterior. */
      completarSubitem: (id, subId) => {
        const c = contador(id);
        if (!c) return null;
        const antes = { items: c.items || [], pendientes: Number(c.pendientes) || 0 };
        const items = antes.items.filter((s) => s.id !== subId);
        almacen.actualizar('contadores', id, { items, pendientes: Math.max(items.length, antes.pendientes - 1) });
        return antes;
      },
      /** Quita uno de la lista sin contarlo como hecho (por ejemplo, si lo escribiste mal). */
      quitarSubitem: (id, subId) => {
        const c = contador(id);
        if (!c) return null;
        const antes = { items: c.items || [], pendientes: Number(c.pendientes) || 0 };
        const items = antes.items.filter((s) => s.id !== subId);
        // Si todos los pendientes tenían nombre, el número baja con la lista
        const pendientes = antes.pendientes === antes.items.length ? items.length : antes.pendientes;
        almacen.actualizar('contadores', id, { items, pendientes });
        return antes;
      },

      // Cobros
      marcarPagado: (id, pagado) =>
        almacen.actualizar('cobros', id, {
          estado: pagado ? 'PAGADO' : 'POR_COBRAR',
          pagado: pagado ? Date.now() : null,
        }),

      // Datos completos
      cargarEjemplo: () => almacen.reemplazarTodo(construirEjemplo(hoyISO())),
      borrarTodo: () => almacen.reemplazarTodo({}),
      exportar: () => ultimos.current,
      importar: (datos) => almacen.reemplazarTodo(datos),
    };
  }, [almacen]);

  const valor = useMemo(() => {
    const lista = (col) => crudos[col] || [];
    const tableros = [...lista('tableros')].sort(porOrden);
    return {
      listo,
      modo: almacen.modo,
      tableros,
      listas: tableros.filter((t) => t.tipo === 'lista'),
      tareas: lista('tareas'),
      contadores: lista('contadores'),
      cobros: lista('cobros'),
      acciones,
    };
  }, [crudos, listo, almacen.modo, acciones]);

  return <DatosContext.Provider value={valor}>{children}</DatosContext.Provider>;
}

export const useDatos = () => useContext(DatosContext);

// ------------------------------------------------------------
// Acciones de UN CLIC con aviso "Deshacer"
// ------------------------------------------------------------

/** Marca o desmarca una tarea como HECHA. */
export function useAlternarTarea() {
  const { acciones } = useDatos();
  const avisar = useAviso();

  return useCallback(
    (tarea) => {
      if (tarea.estado === 'HECHO') {
        acciones.cambiarEstadoTarea(tarea.id, 'POR_HACER');
        return;
      }
      const anterior = tarea.estado;
      acciones.cambiarEstadoTarea(tarea.id, 'HECHO');
      avisar({
        texto: 'Tarea hecha',
        tipo: 'exito',
        accion: { etiqueta: 'Deshacer', alHacer: () => acciones.cambiarEstadoTarea(tarea.id, anterior) },
      });
    },
    [acciones, avisar]
  );
}

/**
 * Botón HECHO de un contador: resta 1 (mínimo 0).
 * Si todos los pendientes tienen nombre en la lista, no sabe cuál terminaste:
 * devuelve 'elegir' para que la pantalla abra la lista.
 */
export function useHechoContador() {
  const { acciones } = useDatos();
  const avisar = useAviso();

  return useCallback(
    (item) => {
      const actual = Number(item.pendientes) || 0;
      if (actual <= 0) return 'nada';
      if ((item.items?.length || 0) >= actual) {
        avisar({ texto: 'Toca en la lista cuál terminaste' });
        return 'elegir';
      }
      const quedan = actual - 1;
      acciones.cambiarPendientes(item.id, quedan);
      avisar({
        texto: quedan === 0 ? `${item.nombre}: ¡al día!` : `${item.nombre}: quedan ${quedan}`,
        tipo: 'exito',
        accion: { etiqueta: 'Deshacer', alHacer: () => acciones.cambiarPendientes(item.id, actual) },
      });
      return 'hecho';
    },
    [acciones, avisar]
  );
}

/** Lista de "cuáles me faltan" de un contador, con "Deshacer". */
export function useSubitems() {
  const { acciones } = useDatos();
  const avisar = useAviso();

  return useMemo(
    () => ({
      /** Agrega lo que escribiste (ej: '3 8 9'). Devuelve cuántos agregó. */
      agregar: (item, texto) => {
        const textos = separarSubitems(texto);
        acciones.agregarSubitems(item.id, textos);
        return textos.length;
      },
      completar: (item, sub) => {
        const antes = acciones.completarSubitem(item.id, sub.id);
        if (!antes) return;
        avisar({
          texto: `${item.nombre}: “${sub.texto}” listo`,
          tipo: 'exito',
          accion: { etiqueta: 'Deshacer', alHacer: () => acciones.actualizar('contadores', item.id, antes) },
        });
      },
      quitar: (item, sub) => {
        const antes = acciones.quitarSubitem(item.id, sub.id);
        if (!antes) return;
        avisar({
          texto: `“${sub.texto}” quitado de la lista`,
          tipo: 'exito',
          accion: { etiqueta: 'Deshacer', alHacer: () => acciones.actualizar('contadores', item.id, antes) },
        });
      },
      /** Convierte las notas (ej: '3 8 9 10 11 12') en la lista y las deja vacías. */
      desdeNotas: (item) => {
        const textos = separarSubitems(item.notas);
        acciones.agregarSubitems(item.id, textos, { notas: '' });
        avisar({ texto: `${textos.length} agregados a la lista`, tipo: 'exito' });
      },
    }),
    [acciones, avisar]
  );
}

/** Botón PAGADO de un cobro. */
export function useMarcarPagado() {
  const { acciones } = useDatos();
  const avisar = useAviso();

  return useCallback(
    (cobro, pagado = true) => {
      acciones.marcarPagado(cobro.id, pagado);
      avisar({
        texto: pagado ? `${cobro.concepto}: pagado` : `${cobro.concepto}: por cobrar`,
        tipo: 'exito',
        accion: { etiqueta: 'Deshacer', alHacer: () => acciones.marcarPagado(cobro.id, !pagado) },
      });
    },
    [acciones, avisar]
  );
}

/** Borra cualquier cosa y ofrece "Deshacer" durante unos segundos. */
export function useBorrarConDeshacer() {
  const { acciones } = useDatos();
  const avisar = useAviso();

  return useCallback(
    (coleccion, item, texto = 'Borrado') => {
      acciones.borrar(coleccion, item.id);
      avisar({
        texto,
        tipo: 'exito',
        duracion: 6000,
        accion: { etiqueta: 'Deshacer', alHacer: () => acciones.restaurar(coleccion, item) },
      });
    },
    [acciones, avisar]
  );
}
