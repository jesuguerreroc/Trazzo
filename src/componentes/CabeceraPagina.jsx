// Título de cada pantalla + botón principal.
// En el celular el botón principal se convierte en un botón flotante "+" abajo a la derecha.
import { Plus } from 'lucide-react';

export function CabeceraPagina({ titulo, subtitulo, accion, icono, extra }) {
  return (
    <header className="cabecera-pagina">
      <div className="cabecera-pagina__texto">
        <h1 className="pagina__titulo">
          {icono && <span className="pagina__icono">{icono}</span>}
          {titulo}
        </h1>
        {subtitulo && <p className="pagina__subtitulo">{subtitulo}</p>}
      </div>
      {extra && <div className="cabecera-pagina__extra">{extra}</div>}
      {accion && (
        <>
          <button type="button" className="boton boton--primario cabecera-pagina__boton" onClick={accion.alHacer}>
            <Plus size={18} strokeWidth={2.4} aria-hidden /> {accion.texto}
          </button>
          <button type="button" className="fab" onClick={accion.alHacer} aria-label={accion.texto}>
            <Plus size={26} strokeWidth={2.2} />
          </button>
        </>
      )}
    </header>
  );
}
