// Arranca Firebase solo si ya pegaste tus datos en config.js.
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from 'firebase/firestore';
import { firebaseConfig } from './config';

// true = hay datos de Firebase -> modo nube. false = modo local.
export const firebaseActivo = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

let auth = null;
let db = null;

if (firebaseActivo) {
  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  auth.languageCode = 'es'; // correos de Firebase en español

  // Base de datos con copia local: la app funciona aunque no haya internet
  // y sincroniza los cambios cuando vuelve la conexión.
  db = initializeFirestore(app, {
    localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() }),
    ignoreUndefinedProperties: true,
  });
}

export { auth, db };
