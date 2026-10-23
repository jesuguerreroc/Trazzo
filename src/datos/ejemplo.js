// ============================================================
// DATOS DE EJEMPLO (inventados, solo para mostrar cómo funciona TRAZZO)
// Se cargan con el botón "Cargar datos de ejemplo" (Inicio o Ajustes).
// No son parte fija de la app: cada persona crea sus propios tableros.
// Cámbialos a tu gusto: agrega, quita o edita filas.
// ============================================================

// TABLEROS. "id" es interno (sin espacios ni tildes) y se usa abajo para conectar los datos.
// tipo: 'lista' (pendientes), 'contador' (un número por fila) o 'cobros' (lo que te deben).
// icono: uno de los nombres de src/componentes/Iconos.jsx
// fila / unidad (solo contador): cómo se llama cada fila y qué se cuenta.
export const tableros = [
  { id: 'clientes', nombre: 'Clientes', tipo: 'contador', icono: 'claqueta', fila: 'cliente', unidad: 'videos' },
  { id: 'me-deben', nombre: 'Me deben', tipo: 'cobros', icono: 'billetera' },
  { id: 'universidad', nombre: 'Universidad', tipo: 'lista', icono: 'estudio' },
  { id: 'trabajo', nombre: 'Trabajo', tipo: 'lista', icono: 'maletin' },
  { id: 'personal', nombre: 'Personal', tipo: 'lista', icono: 'corazon' },
];

// TAREAS (van en tableros de tipo lista). "dias" es la fecha límite contada desde HOY:
//   0 = hoy, 1 = mañana, -2 = hace dos días (atrasada), null = sin fecha.
// "recordatorio": null (sin aviso), 0 (el mismo día), 1 o 2 (días antes).
// "estado": 'POR_HACER', 'EN_PROCESO' o 'HECHO'.
export const tareas = [
  { titulo: 'Entregar reels de Café Aroma', tablero: 'trabajo', prioridad: 'ALTA', dias: 0, estado: 'EN_PROCESO' },
  { titulo: 'Taller de estadística', tablero: 'universidad', prioridad: 'MEDIA', dias: 0, recordatorio: 0 },
  { titulo: 'Responder correos de clientes', tablero: 'trabajo', prioridad: 'BAJA', dias: 0 },
  { titulo: 'Exposición del proyecto final', tablero: 'universidad', prioridad: 'ALTA', dias: -1 },
  { titulo: 'Cobrar el video de Estudio Norte', tablero: 'personal', prioridad: 'MEDIA', dias: -2 },
  { titulo: 'Revisar guion de Tienda Luna', tablero: 'trabajo', prioridad: 'MEDIA', dias: 1 },
  { titulo: 'Parcial de cálculo', tablero: 'universidad', prioridad: 'ALTA', dias: 2, recordatorio: 1 },
  { titulo: 'Pagar el internet', tablero: 'personal', prioridad: 'MEDIA', dias: 3, recordatorio: 0 },
  { titulo: 'Comprar disco duro externo', tablero: 'personal', prioridad: 'BAJA', dias: 5 },
  { titulo: 'Exportar videos de Gimnasio Fit', tablero: 'trabajo', prioridad: 'MEDIA', dias: -1, estado: 'HECHO' },
  { titulo: 'Organizar carpetas de proyectos', tablero: 'trabajo', prioridad: 'BAJA', dias: null },
];

// CONTADORES: una fila por cliente con su número de pendientes.
// "tablero" = id del tablero de tipo contador al que pertenece.
// "items" (opcional) = cuáles faltan, para tacharlos uno por uno.
export const contadores = [
  { tablero: 'clientes', nombre: 'CAFÉ AROMA', pendientes: 6, notas: 'Reels de la nueva carta', items: ['Reel 1', 'Reel 2', 'Reel 3'] },
  { tablero: 'clientes', nombre: 'ESTUDIO NORTE', pendientes: 3, items: ['3', '8', '9'] },
  { tablero: 'clientes', nombre: 'TIENDA LUNA', pendientes: 2, notas: 'Unboxing y testimonio' },
  { tablero: 'clientes', nombre: 'GIMNASIO FIT', pendientes: 0 },
  { tablero: 'clientes', nombre: 'ÓPTICA VISIÓN', pendientes: 0 },
  { tablero: 'clientes', nombre: 'PANADERÍA EL TRIGO', pendientes: 0 },
];

// COBROS: uno por fila. "monto" en pesos completos (105000 = $105.000). "mes" puede quedar ''.
export const cobros = [
  { tablero: 'me-deben', concepto: 'Reels de octubre', cliente: 'CAFÉ AROMA', monto: 180000, mes: 'Octubre' },
  { tablero: 'me-deben', concepto: 'Fotos del menú', cliente: 'CAFÉ AROMA', monto: 90000, mes: '' },
  { tablero: 'me-deben', concepto: 'Video corporativo', cliente: 'ESTUDIO NORTE', monto: 250000, mes: 'Octubre' },
  { tablero: 'me-deben', concepto: 'Unboxing', cliente: 'TIENDA LUNA', monto: 60000, mes: 'Septiembre' },
];
