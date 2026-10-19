// ============================================================
// INSTALAR TRAZZO como app (PWA).
// Android / computador (Chrome, Edge): el navegador ofrece un botón.
// iPhone: se hace a mano con Compartir → "Agregar a inicio".
// ============================================================

let eventoInstalar = null;
const oyentes = new Set();
const avisar = () => oyentes.forEach((f) => f());

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // guardamos el evento para mostrar nuestro propio botón
    eventoInstalar = e;
    avisar();
  });
  window.addEventListener('appinstalled', () => {
    eventoInstalar = null;
    avisar();
  });
}

export const puedeInstalar = () => Boolean(eventoInstalar);

export const yaInstalada = () =>
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;

export const esIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

export async function instalar() {
  if (!eventoInstalar) return false;
  eventoInstalar.prompt();
  const { outcome } = await eventoInstalar.userChoice;
  eventoInstalar = null;
  avisar();
  return outcome === 'accepted';
}

export function escucharInstalacion(f) {
  oyentes.add(f);
  return () => oyentes.delete(f);
}
