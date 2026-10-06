// Copia local de las últimas listas cargadas, para poder verlas sin internet.
const PREFIX = 'gestix_cache_';

export function cacheSet(key, data) {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(data));
  } catch (err) {
    // almacenamiento lleno o bloqueado: la app sigue funcionando sin copia
  }
}

export function cacheGet(key) {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function cacheClear() {
  Object.keys(localStorage)
    .filter((k) => k.startsWith(PREFIX))
    .forEach((k) => localStorage.removeItem(k));
}
