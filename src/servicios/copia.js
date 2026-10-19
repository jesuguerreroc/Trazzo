// ============================================================
// COPIA DE SEGURIDAD — exportar e importar todos tus datos (.json).
// ============================================================
import { COLECCIONES } from './almacen';
import { hoyISO } from '../utils/fechas';
import { descargarArchivo } from '../utils/descargar';

export function exportarCopia(datos) {
  const contenido = {
    app: 'TRAZZO',
    version: 1,
    exportado: new Date().toISOString(),
    datos,
  };
  descargarArchivo(`trazzo-copia-${hoyISO()}.json`, JSON.stringify(contenido, null, 2), 'application/json');
}

/** Lee el archivo elegido y devuelve los datos. Lanza un error si no es una copia de TRAZZO. */
export async function leerCopia(archivo) {
  let json;
  try {
    json = JSON.parse(await archivo.text());
  } catch {
    throw new Error('El archivo no se pudo leer. ¿Es una copia de TRAZZO (.json)?');
  }
  if (json?.app !== 'TRAZZO' || typeof json.datos !== 'object' || json.datos === null) {
    throw new Error('Este archivo no es una copia de seguridad de TRAZZO.');
  }
  // Solo tomamos las colecciones conocidas y que sean listas
  return Object.fromEntries(
    COLECCIONES.map((col) => [col, Array.isArray(json.datos[col]) ? json.datos[col] : []])
  );
}
