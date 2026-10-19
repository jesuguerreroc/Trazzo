// Abre un tablero según su tipo: lista, contador o cobros.
import { Navigate, useParams } from 'react-router-dom';
import { useDatos } from '../contexto/DatosContext';
import Tareas from './Tareas';
import Contadores from './Contadores';
import Cobros from './Cobros';

export default function TableroPagina() {
  const { id } = useParams();
  const { tableros } = useDatos();
  const tablero = tableros.find((t) => t.id === id);

  // Si el tablero no existe (por ejemplo, lo borraste), vuelve a la lista de tableros
  if (!tablero) return <Navigate to="/app/tableros" replace />;

  if (tablero.tipo === 'lista') return <Tareas key={tablero.id} tablero={tablero} />;
  if (tablero.tipo === 'contador') return <Contadores key={tablero.id} tablero={tablero} />;
  return <Cobros key={tablero.id} tablero={tablero} />;
}
