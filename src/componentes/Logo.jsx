// Logo de TRAZZO: un trazo diagonal + un punto, y el nombre.
import { APP } from '../config/app';
import { cx } from '../utils/cx';

export function MarcaLogo({ tamano = 22 }) {
  return (
    <svg width={tamano} height={tamano} viewBox="0 0 24 24" aria-hidden="true" className="logo__marca">
      <path d="M5 18 L17 6" stroke="var(--acento)" strokeWidth="4" strokeLinecap="round" />
      <circle cx="17.5" cy="17.5" r="2.2" fill="currentColor" />
    </svg>
  );
}

export function Logo({ grande = false }) {
  return (
    <span className={cx('logo', grande && 'logo--grande')}>
      <MarcaLogo tamano={grande ? 28 : 22} />
      <span className="logo__texto">{APP.nombre}</span>
    </span>
  );
}
