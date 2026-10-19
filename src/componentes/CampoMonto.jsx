// Campo de dinero: escribes "105" y se guarda $105.000.
import { formatoCOP, interpretarMonto } from '../utils/dinero';

export function CampoMonto({ texto, alCambiar }) {
  const valor = interpretarMonto(texto);

  return (
    <label className="campo">
      <span className="campo__etiqueta">Monto</span>
      <div className="campo-monto">
        <span className="campo-monto__signo" aria-hidden>
          $
        </span>
        <input
          className="campo__input campo-monto__input"
          value={texto}
          onChange={(e) => alCambiar(e.target.value)}
          inputMode="decimal"
          placeholder="105"
          autoComplete="off"
        />
      </div>
      <span className="campo__ayuda">
        {texto.trim() === '' ? (
          'Escribe 105 para $105.000 (en miles) o el valor completo.'
        ) : valor ? (
          <>
            Se guardará como <strong className="texto-fuerte">{formatoCOP(valor)}</strong>
          </>
        ) : (
          <span className="texto-peligro">Escribe un monto válido.</span>
        )}
      </span>
    </label>
  );
}

/** 105000 -> '105.000' (para mostrar en el campo al editar) */
export const montoATexto = (n) => (n ? String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : '');
