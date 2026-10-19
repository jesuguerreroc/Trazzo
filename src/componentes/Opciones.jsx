// Selector de una opción entre varias.
// variante 'segmento' = barra con pestañas; 'chips' = botones redondeados.
import { cx } from '../utils/cx';

export function Opciones({ opciones, valor, alCambiar, etiqueta, variante = 'segmento', className }) {
  const chips = variante === 'chips';
  return (
    <div role="radiogroup" aria-label={etiqueta} className={cx(chips ? 'chips' : 'segmentado', className)}>
      {opciones.map(({ valor: v, texto, icono: Icono, cuenta, tono }) => {
        const activo = v === valor;
        return (
          <button
            type="button"
            key={String(v)}
            role="radio"
            aria-checked={activo}
            className={cx(chips ? 'chip-opcion' : 'segmentado__opcion', activo && 'activo', tono && `tono-${tono}`)}
            onClick={() => alCambiar(v)}
          >
            {Icono && <Icono size={15} strokeWidth={2.2} aria-hidden />}
            {texto}
            {cuenta != null && <span className="opcion__cuenta">{cuenta}</span>}
          </button>
        );
      })}
    </div>
  );
}
