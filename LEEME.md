# TRAZZO — guía

## 1. Abrir la app en tu computador

1. En VS Code abre una terminal: menú **Terminal → New Terminal**.
2. Escribe y presiona Enter:
   ```
   npm run dev
   ```
3. Abre en el navegador: **http://localhost:5173**
4. Para apagarla: en la terminal presiona `Ctrl + C`.

> Si descargas el proyecto en otro computador, primero ejecuta `npm install`.

**Probarla en tu celular (misma red Wi‑Fi):** ejecuta `npm run celular` y abre en el celular la dirección
que aparece como `Network` (ej: `http://192.168.1.20:5173`). Solo funciona en modo local; con
Firebase usa la versión publicada en Netlify (paso 3).

---

## 2. Conectar Firebase (cuenta y datos en la nube)

Mientras no hagas esto, TRAZZO funciona en **modo local**: los datos quedan solo en ese navegador.

> **¿Ya metiste datos en modo local?** Antes de conectar Firebase ve a **Ajustes → Exportar copia**.
> Después de crear tu cuenta, ve a **Ajustes → Importar copia** y elige ese archivo.

### 2.1 Crear el proyecto
1. Entra a **https://console.firebase.google.com** con tu cuenta de Google.
2. Toca **Crear un proyecto** (o "Comenzar con un proyecto de Firebase").
3. Nombre: `trazzo` → **Continuar**.
4. Gemini / Google Analytics: **desactívalos** → **Crear proyecto** → espera → **Continuar**.

### 2.2 Registrar la app web y copiar los datos
1. En la página principal del proyecto toca el ícono **`</>`** (Web).
   (Si no lo ves: engranaje ⚙ → **Configuración del proyecto** → abajo, "Tus apps" → `</>`).
2. Apodo: `TRAZZO web`. **No** marques "Firebase Hosting" (usamos Netlify). → **Registrar app**.
3. Firebase te muestra un bloque como este:
   ```js
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "trazzo-xxxx.firebaseapp.com",
     projectId: "trazzo-xxxx",
     storageBucket: "trazzo-xxxx.firebasestorage.app",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abc123"
   };
   ```
4. En VS Code abre **`src/firebase/config.js`** y copia cada valor dentro de sus comillas. Ejemplo:
   ```js
   apiKey: 'AIza...',
   authDomain: 'trazzo-xxxx.firebaseapp.com',
   ```
   Guarda con `Ctrl + S`. → En Firebase toca **Ir a la consola**.

> Estos datos **no son secretos**: Firebase está hecho para que vayan dentro de la app.
> Lo que protege tu información son las reglas del paso 2.4.

### 2.3 Activar el inicio de sesión
1. Menú izquierdo: **Compilación (Build) → Authentication → Comenzar**.
2. Pestaña **Método de acceso (Sign-in method)**:
   - **Correo electrónico/contraseña** → activa **solo el primer** interruptor → **Guardar**.
   - **Agregar proveedor nuevo → Google** → actívalo → elige tu correo en "Correo electrónico de asistencia" → **Guardar**.

### 2.4 Crear la base de datos
1. Menú izquierdo: **Compilación (Build) → Firestore Database → Crear base de datos**.
2. Si pregunta la edición, elige **Standard**.
3. Ubicación: **southamerica-east1 (São Paulo)**, la más cercana a Colombia. *No se puede cambiar después.*
4. Elige **Comenzar en modo de producción** → **Crear**.
5. Abre la pestaña **Reglas**, borra todo lo que hay y pega el contenido del archivo
   **`firestore.rules`** de este proyecto → **Publicar**.
   (Estas reglas hacen que cada persona solo pueda ver y cambiar sus propios datos.)

### 2.5 Probar
1. Si la app estaba abierta, detenla (`Ctrl + C`) y vuelve a ejecutar `npm run dev`.
2. Entra a http://localhost:5173 → **Crear mi cuenta** (o "Continuar con Google").
3. En Firebase → Authentication → **Usuarios** debe aparecer tu cuenta.
4. Agrega una tarea. En Firebase → Firestore Database → **Datos** verás `usuarios → (tu id) → tareas`.

---

## 3. Publicar en Netlify (para usarla en el celular)

### Con GitHub (recomendado: cada cambio se publica solo)
1. Sube el proyecto a un repositorio de GitHub. El archivo `.gitignore` ya evita subir `node_modules`,
   `dist` y tus archivos de datos (`mis-datos-trazzo.json` y las copias exportadas).
2. Entra a **https://app.netlify.com** → **Add new site → Import an existing project → GitHub** →
   autoriza a Netlify y elige el repositorio de TRAZZO.
3. Netlify lee el archivo `netlify.toml` y llena todo solo (comando `npm run build`, carpeta `dist`,
   Node 22). Toca **Deploy**. En 1-2 minutos te da una dirección como `https://nombre-raro-123.netlify.app`.
4. (Opcional) En Netlify: **Site configuration → Change site name** → por ejemplo `trazzo-tunombre`
   → tu dirección queda `https://trazzo-tunombre.netlify.app`.
5. **Muy importante:** en Firebase → **Authentication → Configuración (Settings) → Dominios autorizados →
   Agregar dominio** → escribe `trazzo-tunombre.netlify.app` (sin `https://`). Sin esto, el inicio de sesión
   falla en Netlify.

Desde ese momento, **cada vez que subas cambios a GitHub, Netlify publica la nueva versión sola**.
La app instalada en el celular se actualiza la próxima vez que la abras.

### Opción alterna: arrastrar y soltar
`npm run build` y arrastra la carpeta **`dist`** a **https://app.netlify.com/drop**.

### Instalar en el celular
- **Android (Chrome):** abre tu dirección de Netlify → menú ⋮ → **Instalar app**
  (o Ajustes de TRAZZO → **Instalar**).
- **iPhone (Safari):** abre la dirección → botón **Compartir** → **Agregar a inicio**.

---

## 4. Tableros: tú decides qué secciones tiene tu TRAZZO

TRAZZO no trae secciones fijas. Cada persona crea sus **tableros**, de 3 tipos:

| Tipo         | Para qué                                          | Ejemplos                                   |
|--------------|---------------------------------------------------|--------------------------------------------|
| **Lista**    | Pendientes que tachas al terminarlos              | Universidad, Personal, Trabajo             |
| **Contador** | Un número por fila que baja con el botón "Hecho"  | Agencia (videos por marca), Pedidos por cliente |
| **Cobros**   | Lo que te deben, agrupado por persona, en pesos   | Me deben                                   |

**Crear un tablero:** menú **Tableros → Nuevo tablero** (o el **+** junto a "Tableros" en el computador).
Eliges el tipo, el nombre y el ícono. En un contador también escribes cómo se llama cada fila
(ej: "marca") y qué cuentas (ej: "videos").

| Quiero…                                  | Cómo                                                        |
|------------------------------------------|-------------------------------------------------------------|
| Cambiar nombre o ícono de un tablero     | Abre el tablero → lápiz ✏ arriba a la derecha               |
| Borrar un tablero                        | Lápiz ✏ → botón rojo de la papelera                         |
| Elegir qué tableros salen en la barra    | **Tableros → Ordenar**: los 2 primeros salen abajo en el celular |
| Agregar una marca / cliente              | Abre el tablero contador → **+ Nueva marca** (o el **+**)    |
| Ver cuáles te faltan de una marca        | Toca el **nombre** → se despliega la lista. Escribe `3 8 9` y Enter para agregar varios |
| Tachar uno de la lista                   | Toca su círculo (o el botoncito en el Inicio): sale de la lista y el número baja |
| Escribir el número de pendientes         | Toca el **número** grande y escríbelo                       |
| Agregar un cobro a un cliente            | En el tablero de cobros, **+ Agregar a (cliente)**          |
| Agregar un pendiente rápido              | Escribe en "Agregar un pendiente…" y presiona Enter         |

**Datos de ejemplo:** **Ajustes → Cargar datos de ejemplo** crea tableros y datos inventados para ver
cómo funciona (están en `src/datos/ejemplo.js`).

**Tus datos reales:** guárdalos como copia de seguridad (`.json`) en tu computador y cárgalos con
**Ajustes → Importar copia**. Esos archivos nunca se suben a GitHub (están en `.gitignore`).

---

## 5. Recordatorios

- **Notificaciones:** Ajustes → Recordatorios → **Activar**. Te avisa de las tareas con recordatorio
  cuando abres TRAZZO o mientras está abierta.
- **Avisos aunque la app esté cerrada:** abre una tarea con fecha y toca **Google Calendar** o
  **Calendario (.ics)**. Tu calendario te avisa (a las 8:00 a. m. del día que elegiste en el recordatorio).
- En iPhone las notificaciones solo funcionan con TRAZZO **instalada** en el inicio (iOS 16.4 o más).

---

## 6. ¿Dónde cambio cada cosa en el código?

| Quiero cambiar…                    | Archivo                                       |
|------------------------------------|-----------------------------------------------|
| El color de la app                 | `src/estilos/tokens.css` → `--acento`         |
| Nombre, zona horaria               | `src/config/app.js`                           |
| Ideas de tableros (plantillas)     | `src/config/app.js` → `PLANTILLAS`            |
| Íconos disponibles para tableros   | `src/componentes/Iconos.jsx`                  |
| Datos de ejemplo                   | `src/datos/ejemplo.js`                        |
| Textos de la landing               | `src/paginas/Landing.jsx`                     |
| Menú fijo / tableros en la barra   | `src/componentes/AppLayout.jsx`               |
| Ícono y nombre al instalar         | `vite.config.js` (manifest) y `public/`       |

## 7. Estructura del proyecto

```
src/
  config/       configuración general
  datos/        datos de ejemplo
  firebase/     conexión con Firebase (aquí pegas tus datos)
  servicios/    sesión, guardado, recordatorios, copia de seguridad, instalar
  contexto/     datos compartidos entre pantallas
  componentes/  piezas reutilizables (tarea, contador, cobro, semana, menú…)
  paginas/      cada pantalla (Landing, Entrar, Inicio, Tareas, Tableros, Contadores, Cobros, Ajustes)
  estilos/      todo el diseño (CSS)
  utils/        fechas, pesos colombianos, palabras, calendario, reglas de tareas y tableros
public/         íconos de la app, reglas de Netlify
```
