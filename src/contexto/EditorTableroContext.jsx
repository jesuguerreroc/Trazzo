// Permite abrir el editor de tableros desde cualquier pantalla.
// Uso: const abrirTablero = useEditorTablero(); abrirTablero() (nuevo) o abrirTablero(tablero) (editar)
import { createContext, useCallback, useContext, useState } from 'react';
import { TableroEditor } from '../componentes/TableroEditor';

const EditorTableroContext = createContext(() => {});

export function EditorTableroProvider({ children }) {
  const [estado, setEstado] = useState({ abierto: false, tablero: null });

  const abrir = useCallback((tablero = null) => setEstado({ abierto: true, tablero }), []);
  const cerrar = useCallback(() => setEstado((e) => ({ ...e, abierto: false })), []);

  return (
    <EditorTableroContext.Provider value={abrir}>
      {children}
      <TableroEditor abierto={estado.abierto} tablero={estado.tablero} alCerrar={cerrar} />
    </EditorTableroContext.Provider>
  );
}

export const useEditorTablero = () => useContext(EditorTableroContext);
