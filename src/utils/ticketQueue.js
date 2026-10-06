// Cola de tickets creados sin conexión. Se guarda en localStorage y se envía al volver internet.
import { ticketService } from '../services';

const KEY = 'gestix_tickets_pendientes';
const EVENT = 'gestix:pendientes';
let enviando = false;

export function getPendientes() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || [];
  } catch (err) {
    return [];
  }
}

function guardar(lista) {
  localStorage.setItem(KEY, JSON.stringify(lista));
  window.dispatchEvent(new Event(EVENT));
}

export function onPendientesChange(callback) {
  window.addEventListener(EVENT, callback);
  return () => window.removeEventListener(EVENT, callback);
}

export function agregarPendiente(ticket) {
  const item = {
    ...ticket,
    localId: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    creadoEn: new Date().toISOString(),
  };
  guardar([...getPendientes(), item]);
  return item;
}

export function quitarPendiente(localId) {
  guardar(getPendientes().filter((p) => p.localId !== localId));
}

function aFormData(p) {
  const data = new FormData();
  data.append('titulo', p.titulo);
  data.append('descripcion', p.descripcion);
  data.append('prioridad', p.prioridad);
  data.append('categoria_id', p.categoria_id);
  if (p.usuario_autor_id) data.append('usuario_autor_id', p.usuario_autor_id);
  if (p.departamento_id) data.append('departamento_id', p.departamento_id);
  return data;
}

// Envía los pendientes uno por uno. Se detiene si vuelve a fallar la conexión.
export async function enviarPendientes(autorId) {
  if (enviando) return { enviados: 0, restantes: getPendientes().length };
  enviando = true;
  let enviados = 0;
  try {
    const propios = getPendientes().filter((p) => String(p.usuario_autor_id) === String(autorId));
    for (const p of propios) {
      try {
        await ticketService.create(aFormData(p));
        quitarPendiente(p.localId);
        enviados += 1;
      } catch (err) {
        if (!err.response) break; // sigue sin internet
        // el servidor lo rechazó: se deja en la lista con su mensaje para que el usuario lo revise
        guardar(getPendientes().map((x) => (
          x.localId === p.localId ? { ...x, error: err.response?.data?.error || 'El servidor rechazó el ticket' } : x
        )));
      }
    }
  } finally {
    enviando = false;
  }
  return { enviados, restantes: getPendientes().length };
}
