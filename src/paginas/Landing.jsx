// ============================================================
// LANDING — la página de presentación para personas nuevas.
// ============================================================
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Check, LayoutGrid, ListChecks, Smartphone, Wallet } from 'lucide-react';
import { Logo } from '../componentes/Logo';

// Textos de las funciones (puedes cambiarlos libremente)
const FUNCIONES = [
  {
    icono: ListChecks,
    titulo: 'Todo lo pendiente, siempre a la vista',
    texto: 'Con fecha o sin fecha. Lo tachas y desaparece, dejando espacio para lo siguiente.',
  },
  {
    icono: LayoutGrid,
    titulo: 'Tableros a tu medida',
    texto: 'Crea listas, contadores (ej: videos por cliente) o cobros. Tú decides cuáles y cómo se llaman.',
  },
  {
    icono: Wallet,
    titulo: 'Lo que te deben',
    texto: 'Cobros en pesos agrupados por cliente, con subtotales y el total siempre claro.',
  },
  {
    icono: Smartphone,
    titulo: 'En el celular y el computador',
    texto: 'Instálala como app. Funciona sin internet y se sincroniza sola.',
  },
];

const aparecer = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.5, ease: [0.2, 0.7, 0.2, 1] },
};

export default function Landing() {
  return (
    <div className="landing">
      <header className="landing__cabecera">
        <Logo />
        <Link to="/entrar" className="boton boton--secundario boton--pequeno">
          Entrar
        </Link>
      </header>

      <main>
        {/* -------- Portada -------- */}
        <section className="hero">
          <motion.div className="hero__texto" {...aparecer}>
            <p className="hero__sello">
              <span className="hero__punto" aria-hidden /> Tu centro de organización
            </p>
            <h1 className="hero__titulo">
              Todo lo que tienes pendiente, <span className="hero__resalte">en un solo vistazo.</span>
            </h1>
            <p className="hero__bajada">
              Tus pendientes, entregas y cobros en un solo lugar, organizados a tu manera. Abres TRAZZO y en
              segundos sabes qué hacer hoy.
            </p>
            <div className="hero__acciones">
              <Link to="/entrar?modo=registro" className="boton boton--primario boton--grande">
                Crear mi cuenta gratis <ArrowRight size={18} aria-hidden />
              </Link>
              <Link to="/entrar" className="boton boton--fantasma boton--grande">
                Ya tengo cuenta
              </Link>
            </div>
          </motion.div>

          <motion.div className="hero__visual" {...aparecer} transition={{ ...aparecer.transition, delay: 0.12 }}>
            <Maqueta />
          </motion.div>
        </section>

        {/* -------- Funciones -------- */}
        <section className="funciones" aria-label="Funciones">
          {FUNCIONES.map(({ icono: Icono, titulo, texto }, i) => (
            <motion.article
              key={titulo}
              className="funcion"
              {...aparecer}
              transition={{ ...aparecer.transition, delay: i * 0.06 }}
            >
              <span className="funcion__icono">
                <Icono size={20} strokeWidth={2} aria-hidden />
              </span>
              <h2 className="funcion__titulo">{titulo}</h2>
              <p className="funcion__texto">{texto}</p>
            </motion.article>
          ))}
        </section>

        {/* -------- Cierre -------- */}
        <motion.section className="cierre" {...aparecer}>
          <h2 className="cierre__titulo">Empieza hoy. Es gratis.</h2>
          <p className="cierre__texto">Crea tu cuenta en menos de un minuto y úsala desde cualquier dispositivo.</p>
          <Link to="/entrar?modo=registro" className="boton boton--primario boton--grande">
            Crear mi cuenta <ArrowRight size={18} aria-hidden />
          </Link>
        </motion.section>
      </main>

      <footer className="landing__pie">
        <Logo />
        <span>Hecho en Colombia</span>
      </footer>
    </div>
  );
}

/** Dibujo de la app (solo decorativo) para mostrar cómo se ve. */
function Maqueta() {
  return (
    <div className="maqueta" aria-hidden="true">
      <div className="maqueta__tiles">
        <div className="mq-tile">
          <span className="mq-tile__etiqueta">Entregas</span>
          <strong>13</strong>
          <span className="mq-tile__detalle">videos · 3 clientes</span>
        </div>
        <div className="mq-tile">
          <span className="mq-tile__etiqueta">Me deben</span>
          <strong className="mq-tile__dinero">$675.000</strong>
          <span className="mq-tile__detalle">6 cobros</span>
        </div>
      </div>

      <p className="mq-titulo">
        Pendientes <span>5</span>
      </p>
      <ul className="mq-lista">
        <li className="mq-tarea mq-tarea--hecha">
          <span className="mq-check mq-check--hecho">
            <Check size={12} strokeWidth={3.5} />
          </span>
          <span className="mq-tarea__texto">Entregar video del cliente</span>
        </li>
        <li className="mq-tarea">
          <span className="mq-check mq-check--alta" />
          <span className="mq-tarea__texto">
            Parcial de estadística
            <small className="mq-fecha mq-fecha--hoy">Hoy</small>
          </span>
          <span className="etiqueta-alta">Alta</span>
        </li>
        <li className="mq-tarea">
          <span className="mq-check" />
          <span className="mq-tarea__texto">
            Revisar guiones
            <small className="mq-fecha">Sin fecha</small>
          </span>
        </li>
      </ul>

      <div className="mq-contador">
        <span className="mq-contador__nombre">Cliente A</span>
        <strong className="mq-contador__numero">9</strong>
        <span className="mq-contador__boton">
          <Check size={14} strokeWidth={3} /> Hecho
        </span>
      </div>
    </div>
  );
}
