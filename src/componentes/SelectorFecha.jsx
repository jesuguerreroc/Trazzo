// Elegir fecha límite con un toque: Sin fecha / Hoy / Mañana / Elegir…
import { CalendarDays } from 'lucide-react';
import { fechaRelativa, sumarDias } from '../utils/fechas';
import { cx } from '../utils/cx';

export function SelectorFecha({ valor, alCambiar, hoy }) {
  const manana = sumarDias(hoy, 1);
  const rapidas = [
    { valor: null, texto: 'Sin fecha' },
    { valor: hoy, texto: 'Hoy' },
    { valor: manana, texto: 'Mañana' },
  ];
  const otra = valor && valor !== hoy && valor !== manana;

  return (
    <div className="chips" role="radiogroup" aria-label="Fecha límite">
      {rapidas.map((o) => (
        <button
          key={String(o.valor)}
          type="button"
          role="radio"
          aria-checked={valor === o.valor}
          className={cx('chip-opcion', valor === o.valor && 'activo')}
          onClick={() => alCambiar(o.valor)}
        >
          {o.texto}
        </button>
      ))}

      {/* El calendario del celular se abre al tocar este botón */}
      <span className={cx('chip-opcion chip-fecha', otra && 'activo')}>
        <CalendarDays size={15} strokeWidth={2.2} aria-hidden />
        {otra ? fechaRelativa(valor, hoy) : 'Elegir'}
        <input
          type="date"
          aria-label="Elegir otra fecha"
          value={valor || ''}
          onChange={(e) => alCambiar(e.target.value || null)}
          onClick={(e) => {
            try {
              e.currentTarget.showPicker?.();
            } catch {
              /* algunos navegadores abren el calendario solos */
            }
          }}
        />
      </span>
    </div>
  );
}
