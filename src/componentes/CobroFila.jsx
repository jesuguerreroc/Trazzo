// Un cobro: concepto, mes, monto y botón "Pagado" de un clic.
import { RotateCcw, Wallet } from 'lucide-react';
import { useMarcarPagado } from '../contexto/DatosContext';
import { formatoCOP } from '../utils/dinero';
import { formatoFecha, isoDeMomento } from '../utils/fechas';
import { cx } from '../utils/cx';

export function CobroFila({ cobro, alEditar, mostrarCliente = false }) {
  const marcar = useMarcarPagado();
  const pagado = cobro.estado === 'PAGADO';

  const detalles = [
    mostrarCliente && cobro.cliente,
    cobro.mes || (!pagado && 'Sin mes'),
    pagado && cobro.pagado && `Pagado el ${formatoFecha(isoDeMomento(cobro.pagado))}`,
  ].filter(Boolean);

  return (
    <div className={cx('cobro', pagado && 'cobro--pagado')}>
      <button type="button" className="cobro__info" onClick={() => alEditar(cobro)}>
        <span className="cobro__concepto">{cobro.concepto}</span>
        <span className="cobro__meta">
          {detalles.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </span>
      </button>
      <span className="cobro__monto">{formatoCOP(cobro.monto)}</span>
      {pagado ? (
        <button
          type="button"
          className="boton-icono"
          onClick={() => marcar(cobro, false)}
          aria-label={`Volver a poner "${cobro.concepto}" por cobrar`}
          title="Volver a por cobrar"
        >
          <RotateCcw size={18} />
        </button>
      ) : (
        <button type="button" className="boton-pagado" onClick={() => marcar(cobro, true)}>
          <Wallet size={16} strokeWidth={2.2} aria-hidden /> Pagado
        </button>
      )}
    </div>
  );
}
