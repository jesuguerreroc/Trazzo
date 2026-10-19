// Pantalla de espera mientras se revisa la sesión o se cargan los datos.
import { MarcaLogo } from './Logo';

export function Cargando() {
  return (
    <div className="cargando" role="status" aria-label="Cargando">
      <MarcaLogo tamano={36} />
    </div>
  );
}
