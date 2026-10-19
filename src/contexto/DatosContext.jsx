// ============================================================
// DATOS DEL USUARIO
// Escucha todas las colecciones y las comparte con todas las pantallas.
// Uso en cualquier pantalla: const { tareas, tableros, acciones } = useDatos();
// ============================================================
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { COLECCIONES, crearAlmacen } from '../servicios/almacen';
import { construirEjemplo } from '../datos/construirEjemplo';
import { hoyISO } from '../utils/fechas';
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

      // Contadores: nunca baja de 0
      cambiarPendientes: (id, n) =>
        almacen.actualizar('contadores', id, { pendientes: Math.max(0, Math.round(Number(n) || 0)) }),

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

/** Botón HECHO de un contador: resta 1 (mínimo 0). */
export function useHechoContador() {
  const { acciones } = useDatos();
  const avisar = useAviso();

  return useCallback(
    (item) => {
      const actual = Number(item.pendientes) || 0;
      if (actual <= 0) return;
      const quedan = actual - 1;
      acciones.cambiarPendientes(item.id, quedan);
      avisar({
        texto: quedan === 0 ? `${item.nombre}: ¡al día!` : `${item.nombre}: quedan ${quedan}`,
        tipo: 'exito',
        accion: { etiqueta: 'Deshacer', alHacer: () => acciones.cambiarPendientes(item.id, actual) },
      });
    },
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
