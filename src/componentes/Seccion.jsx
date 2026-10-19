// Bloque con título, contador opcional, enlace "Ver todo" y botones a la derecha.
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { cx } from '../utils/cx';

export function Seccion({ titulo, cuenta, tono, extra, enlace, children, className, id }) {
  return (
    <section className={cx('seccion', tono && `seccion--${tono}`, className)} id={id}>
      <header className="seccion__cabecera">
        <h2 className="seccion__titulo">
          {titulo}
          {cuenta != null && <span className="seccion__cuenta">{cuenta}</span>}
        </h2>
        {extra && <div className="seccion__extra">{extra}</div>}
        {enlace && (
          <Link to={enlace.a} className="seccion__enlace">
            {enlace.texto || 'Ver todo'} <ChevronRight size={16} aria-hidden />
          </Link>
        )}
      </header>
      {children}
    </section>
  );
}
