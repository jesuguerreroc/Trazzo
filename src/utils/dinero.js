// ============================================================
// DINERO en pesos colombianos (COP)
// ============================================================

/** 105000 -> '$105.000' */
export function formatoCOP(valor) {
  const n = Math.round(Number(valor) || 0);
  const conPuntos = String(Math.abs(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${n < 0 ? '-' : ''}$${conPuntos}`;
}

/**
 * Entiende lo que escribes en el campo de monto:
 *   '105'      -> 105000   (menos de 1.000 se entiende como MILES)
 *   '1,5'      -> 1500
 *   '105000'   -> 105000
 *   '105.000'  -> 105000
 *   '$1.250.000' -> 1250000
 * Devuelve null si no es un monto válido.
 */
export function interpretarMonto(texto) {
  if (texto == null) return null;
  const limpio = String(texto).replace(/[$\s]/g, '');
  if (!limpio) return null;

  let n;
  if (/^\d{1,3}(\.\d{3})+$/.test(limpio)) n = Number(limpio.replace(/\./g, '')); // puntos de miles
  else n = Number(limpio.replace(',', '.'));

  if (!Number.isFinite(n) || n <= 0) return null;
  if (n < 1000) n *= 1000;
  return Math.round(n);
}

/** Clave para agrupar clientes sin importar mayúsculas ni tildes: 'Andrés' = 'ANDRES' */
export function claveCliente(nombre) {
  return (nombre || 'Sin cliente')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}
