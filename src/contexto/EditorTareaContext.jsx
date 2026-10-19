// Permite abrir el editor de tareas desde cualquier pantalla.
// Uso: const abrirEditor = useEditorTarea(); abrirEditor(tarea) o abrirEditor(null, { tablero })
import { createContext, useCallback, useContext, useState } from 'react';
import { TareaEditor } from '../componentes/TareaEditor';

const EditorTareaContext = createContext(() => {});

export function EditorTareaProvider({ children }) {
  const [estado, setEstado] = useState({ abierto: false, tarea: null, iniciales: null });

  const abrir = useCallback((tarea = null, iniciales = null) => {
    setEstado({ abierto: true, tarea, iniciales });
  }, []);

  const cerrar = useCallback(() => setEstado((e) => ({ ...e, abierto: false })), []);

  return (
    <EditorTareaContext.Provider value={abrir}>
      {children}
      <TareaEditor abierto={estado.abierto} tarea={estado.tarea} iniciales={estado.iniciales} alCerrar={cerrar} />
    </EditorTareaContext.Provider>
  );
}

export const useEditorTarea = () => useContext(EditorTareaContext);
