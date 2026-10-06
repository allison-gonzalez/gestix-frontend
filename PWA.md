# Gestix como PWA

## Cómo ejecutarla (localhost)

El service worker solo se registra en la versión compilada, para que en desarrollo no guarde copias viejas del código.

```bash
npm install
npm run build
npm run preview      # abre http://localhost:4173
```

Para desarrollar normalmente se sigue usando `npm run dev` (http://localhost:5173), sin modo sin conexión.

## Qué incluye

| Característica | Dónde está |
| --- | --- |
| Manifiesto (nombre, nombre corto, íconos, colores, modo `standalone`) | `public/manifest.webmanifest` |
| Íconos 192, 512 y maskable | `public/icons/` |
| Service worker (guarda la interfaz y la abre sin internet) | `public/sw.js`, registrado en `src/main.jsx` |
| Aviso "Sin conexión" / "Conexión restablecida" | `src/components/common/OfflineBanner.jsx` |
| Botón para instalar la app | `src/components/common/InstallPrompt.jsx` |
| Función principal sin conexión: crear tickets y enviarlos al volver internet (localStorage) | `src/utils/ticketQueue.js` y panel en `src/pages/Tickets.jsx` |
| Copia local de listas para verlas sin internet | `src/utils/localCache.js` |
| Menú de navegación (7 secciones + Perfil), adaptado a computadora y celular | `src/components/layout/Navbar.jsx`, `src/styles/index.css` |

## Cómo probarla a mano

1. **Navegación**: iniciar sesión y recorrer el menú lateral y el ícono de Perfil.
2. **Función principal**: en Tickets, abrir DevTools > Network > marcar "Offline", pulsar "Crear Ticket" y guardarlo. Aparece el panel "ticket pendiente de enviar". Desmarcar "Offline": se envía solo.
3. **Tamaños de pantalla**: DevTools > modo dispositivo (375, 768 y 1366 px).
4. **Sin conexión**: visitar con internet, detener `npm run preview` y recargar: la interfaz carga y aparece el aviso.
5. **Instalación**: en Chrome o Edge aparece el ícono de instalar en la barra de direcciones y el aviso "Instala Gestix".

## Límites conocidos

- Sin conexión solo se ven las listas ya cargadas antes (copia local) y no se pueden consultar datos nuevos.
- Un archivo adjunto no se puede guardar sin conexión: el ticket se guarda sin él y se avisa.
- Al cerrar sesión se borra la copia local de listas. Los tickets pendientes de enviar se conservan.
