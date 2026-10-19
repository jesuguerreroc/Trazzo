// Ventana para confirmar acciones importantes ("¿Seguro que quieres borrar...?").
// Uso: const confirmar = useConfirmar(); if (await confirmar({ titulo, texto, boton, peligro })) {...}
import { createContext, useCallback, useContext, useState } from 'react';
import { Modal } from '../componentes/Modal';
import { cx } from '../utils/cx';

const ConfirmarContext = createContext(async () => false);

export function ConfirmarProvider({ children }) {
  const [pedido, setPedido] = useState(null);

  const confirmar = useCallback(
    (opciones) => new Promise((resolve) => setPedido({ ...opciones, resolve, abierto: true })),
    []
  );

  const responder = (valor) => {
    pedido?.resolve(valor);
    setPedido((p) => (p ? { ...p, abierto: false } : p));
  };

  return (
    <ConfirmarContext.Provider value={confirmar}>
      {children}
      <Modal abierto={Boolean(pedido?.abierto)} alCerrar={() => responder(false)} titulo={pedido?.titulo}>
        {pedido?.texto && <p className="modal__texto">{pedido.texto}</p>}
        <div className="modal__acciones">
          <button className="boton boton--secundario" onClick={() => responder(false)}>
            Cancelar
          </button>
          <button
            className={cx('boton', pedido?.peligro ? 'boton--peligro' : 'boton--primario')}
            onClick={() => responder(true)}
            autoFocus
          >
            {pedido?.boton || 'Confirmar'}
          </button>
        </div>
      </Modal>
    </ConfirmarContext.Provider>
  );
}

export const useConfirmar = () => useContext(ConfirmarContext);
