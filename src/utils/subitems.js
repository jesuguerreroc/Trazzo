// ============================================================
// SUBITEMS — la lista de "cuáles me faltan" dentro de un contador.
// Ej: DRA. MAFE tiene 6 videos pendientes: 3, 8, 9, 10, 11 y 12.
// ============================================================

/**
 * Convierte lo que escribes en varios elementos:
 *   '3 8 9 10'            -> ['3', '8', '9', '10']   (solo números: separa por espacios)
 *   'Reel 1, Reel 2'      -> ['Reel 1', 'Reel 2']    (comas, punto y coma o saltos de línea)
 *   'El de la novia'      -> ['El de la novia']      (un solo nombre)
 */
export function separarSubitems(texto = '') {
  const limpio = texto.trim();
  if (!limpio) return [];
  if (/[,;\n]/.test(limpio)) {
    return limpio
      .split(/[,;\n]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  const partes = limpio.split(/\s+/);
  if (partes.length > 1 && partes.every((p) => /^#?\d+[a-z]?$/i.test(p))) return partes;
  return [limpio];
}

export const nuevoIdSubitem = () => Math.random().toString(36).slice(2, 10);
