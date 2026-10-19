// ============================================================
// PALABRAS — singular y plural en español para los textos de
// cada tablero ("1 video", "3 videos", "Nueva marca", "17 marcas").
// ============================================================

const enMayusculas = (p) => p === p.toUpperCase() && p !== p.toLowerCase();
const ajustar = (p, sufijo) => (enMayusculas(p) ? sufijo.toUpperCase() : sufijo);

/** marca -> marcas · cliente -> clientes · doctor -> doctores · canción -> canciones */
export function plural(palabra = '') {
  const p = palabra.trim();
  if (!p) return p;
  if (/[aeiouáéíóú]$/i.test(p)) return p + ajustar(p, 's');
  if (/s$/i.test(p)) return p;
  if (/ón$/i.test(p)) return p.slice(0, -2) + ajustar(p, 'ones');
  if (/z$/i.test(p)) return p.slice(0, -1) + ajustar(p, 'ces');
  return p + ajustar(p, 'es');
}

/** videos -> video · canciones -> canción · doctores -> doctor · lápices -> lápiz */
export function singular(palabra = '') {
  const p = palabra.trim();
  if (!p) return p;
  if (/ones$/i.test(p)) return p.slice(0, -4) + ajustar(p, 'ón');
  if (/ces$/i.test(p)) return p.slice(0, -3) + ajustar(p, 'z');
  if (/(r|l|n|d)es$/i.test(p)) return p.slice(0, -2);
  if (/s$/i.test(p)) return p.slice(0, -1);
  return p;
}

/** cantidad(1, 'videos') -> '1 video' · cantidad(3, 'videos') -> '3 videos' */
export const cantidad = (n, unidadPlural) => `${n} ${n === 1 ? singular(unidadPlural) : unidadPlural}`;

/** 'marca' -> 'Marca' */
export const capitalizar = (p = '') => p.charAt(0).toUpperCase() + p.slice(1);

/** Artículo para "Nueva marca" / "Nuevo cliente" (aproximado: termina en "a" = femenino) */
export const nuevo = (palabra = '') => (/a$/i.test(palabra.trim()) ? 'Nueva' : 'Nuevo');
