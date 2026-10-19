// ============================================================
// ÍCONOS para los tableros. Para agregar uno nuevo:
// 1) búscalo en https://lucide.dev/icons  2) impórtalo aquí  3) agrégalo a ICONOS.
// ============================================================
import {
  BookOpen,
  Briefcase,
  Calculator,
  Camera,
  Clapperboard,
  Dumbbell,
  FileText,
  Folder,
  GraduationCap,
  HandCoins,
  Heart,
  Image,
  LayoutGrid,
  Mic,
  Package,
  Palette,
  PiggyBank,
  Receipt,
  Scissors,
  Shirt,
  ShoppingBag,
  Star,
  Truck,
  Users,
  Utensils,
  Video,
  Wallet,
} from 'lucide-react';

export const ICONOS = {
  claqueta: Clapperboard,
  video: Video,
  camara: Camera,
  imagen: Image,
  microfono: Mic,
  paleta: Palette,
  tijeras: Scissors,
  personas: Users,
  maletin: Briefcase,
  carpeta: Folder,
  documento: FileText,
  estudio: GraduationCap,
  libro: BookOpen,
  corazon: Heart,
  estrella: Star,
  pesas: Dumbbell,
  comida: Utensils,
  ropa: Shirt,
  paquete: Package,
  bolsa: ShoppingBag,
  camion: Truck,
  billetera: Wallet,
  monedas: HandCoins,
  alcancia: PiggyBank,
  recibo: Receipt,
  calculadora: Calculator,
};

/** Dibuja el ícono de un tablero (o uno genérico si no existe). */
export function IconoTablero({ nombre, ...props }) {
  const Icono = ICONOS[nombre] || LayoutGrid;
  return <Icono aria-hidden {...props} />;
}
