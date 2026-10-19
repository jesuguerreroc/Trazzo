// ============================================================
// CONFIGURACIÓN GENERAL DE TRAZZO
// Aquí cambias cosas generales sin tocar el resto del código.
// ============================================================

export const APP = {
  nombre: 'TRAZZO',
  lema: 'Tu centro de organización',
  // Zona horaria usada para saber qué día es "hoy"
  zonaHoraria: 'America/Bogota',
};

// Prioridades de una tarea: clave guardada -> texto que se muestra
export const PRIORIDADES = {
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja',
};

// Estados de una tarea: clave guardada -> texto que se muestra
export const ESTADOS = {
  POR_HACER: 'Por hacer',
  EN_PROCESO: 'En proceso',
  HECHO: 'Hecho',
};

// Recordatorios: días antes de la fecha límite
export const RECORDATORIOS = [
  { valor: null, texto: 'No' },
  { valor: 0, texto: 'El mismo día' },
  { valor: 1, texto: '1 día antes' },
  { valor: 2, texto: '2 días antes' },
];

// ============================================================
// TABLEROS — cada persona crea los suyos.
// ============================================================

// Los 3 tipos de tablero que existen
export const TIPOS_TABLERO = {
  lista: {
    nombre: 'Lista',
    descripcion: 'Pendientes que tachas al terminarlos. Ej: Universidad, Personal.',
  },
  contador: {
    nombre: 'Contador',
    descripcion: 'Un número por fila que baja con “Hecho”. Ej: videos por marca.',
  },
  cobros: {
    nombre: 'Cobros',
    descripcion: 'Lo que te deben, agrupado por persona, con totales en pesos.',
  },
};

// Plantillas para crear tableros con un toque (puedes agregar más)
export const PLANTILLAS = [
  { nombre: 'Universidad', tipo: 'lista', icono: 'estudio' },
  { nombre: 'Personal', tipo: 'lista', icono: 'corazon' },
  { nombre: 'Trabajo', tipo: 'lista', icono: 'maletin' },
  { nombre: 'Entregas', tipo: 'contador', icono: 'paquete', fila: 'cliente', unidad: 'entregas' },
  { nombre: 'Videos', tipo: 'contador', icono: 'claqueta', fila: 'cliente', unidad: 'videos' },
  { nombre: 'Me deben', tipo: 'cobros', icono: 'billetera' },
];
