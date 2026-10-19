// Punto de entrada: arranca la app y carga los estilos.
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { MotionConfig } from 'motion/react';
import '@fontsource-variable/outfit';
import '@fontsource-variable/plus-jakarta-sans';
import './servicios/instalar'; // escucha el aviso de "instalar app" desde el primer momento

import './estilos/tokens.css';
import './estilos/base.css';
import './estilos/layout.css';
import './estilos/componentes.css';
import './estilos/paginas.css';

import App from './App';
import { AvisosProvider } from './contexto/AvisosContext';
import { ConfirmarProvider } from './contexto/ConfirmarContext';
import { SesionProvider } from './contexto/SesionContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      {/* reducedMotion="user": si el celular pide menos animaciones, se respetan */}
      <MotionConfig reducedMotion="user">
        <AvisosProvider>
          <ConfirmarProvider>
            <SesionProvider>
              <App />
            </SesionProvider>
          </ConfirmarProvider>
        </AvisosProvider>
      </MotionConfig>
    </BrowserRouter>
  </StrictMode>
);
