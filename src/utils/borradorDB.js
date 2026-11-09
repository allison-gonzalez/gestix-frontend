// Borrador del formulario de ticket, guardado en IndexedDB.
// Si se cierra la pestaña o se pierde la conexión mientras se escribe, el texto se recupera al volver.

const DB_NAME = 'gestix_local';
const DB_VERSION = 1;
const STORE = 'borradores';

function abrirDB() {
  return new Promise((resolve, reject) => {
    if (!('indexedDB' in window)) {
      reject(new Error('IndexedDB no está disponible'));
      return;
    }
    const peticion = indexedDB.open(DB_NAME, DB_VERSION);
    // Se ejecuta la primera vez (o al subir la versión): crea el almacén de objetos
    peticion.onupgradeneeded = () => {
      const db = peticion.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: 'clave' });
      }
    };
    peticion.onsuccess = () => resolve(peticion.result);
    peticion.onerror = () => reject(peticion.error);
  });
}

// Ejecuta una operación dentro de una transacción y devuelve su resultado
async function conStore(modo, operacion) {
  const db = await abrirDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE, modo);
    const resultado = operacion(tx.objectStore(STORE));
    tx.oncomplete = () => {
      db.close();
      resolve(resultado.result);
    };
    tx.onerror = () => reject(tx.error);
  });
}

export function guardarBorrador(clave, datos) {
  return conStore('readwrite', (store) => store.put({ clave, datos, guardadoEn: new Date().toISOString() }))
    .catch(() => null);
}

export function leerBorrador(clave) {
  return conStore('readonly', (store) => store.get(clave)).catch(() => null);
}

export function borrarBorrador(clave) {
  return conStore('readwrite', (store) => store.delete(clave)).catch(() => null);
}
