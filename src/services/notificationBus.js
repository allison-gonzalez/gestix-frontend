const listeners = new Set();

export function subscribeNotifications(listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function emitNotification(notification) {
  listeners.forEach((listener) => listener(notification));
}
