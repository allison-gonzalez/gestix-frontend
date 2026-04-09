# Gestix Frontend

Frontend del sistema de gestión de tickets Gestix, desarrollado con **React** y **Vite**.

## Inicio Rápido

### Requisitos
- Node.js v20.14+ 
- npm o yarn

### Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar servidor de desarrollo
npm run dev

# Build para producción
npm run build

# Vista previa de producción
npm run preview
```

## Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Navbar.jsx      # Barra de navegación
│   └── TicketList.jsx  # Lista de tickets
├── pages/              # Páginas principales
│   ├── Home.jsx       # Página de inicio
│   └── Tickets.jsx    # Página de tickets
├── services/           # Servicios API
│   ├── api.js         # Cliente HTTP (axios)
│   └── index.js       # Exportar todos los servicios
├── styles/             # Estilos CSS
│   ├── index.css      # Estilos globales
│   ├── Navbar.css     # Estilos del navbar
│   ├── Home.css       # Estilos home
│   └── TicketList.css # Estilos lista tickets
├── utils/              # Utilidades
│   ├── constants.js   # Constantes globales
│   ├── formatters.js  # Funciones de formato
│   ├── helpers.js     # Funciones auxiliares
│   ├── validators.js  # Validaciones
│   └── index.js       # Exportar todas las utilidades
├── App.jsx            # Componente principal
└── main.jsx           # Entry point
```

## Configuración de API

### Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
VITE_API_URL=http://localhost:8000/api
```

### Interceptores

El cliente HTTP incluye:
- **Autenticación**: Agrega token Bearer automáticamente
- **Manejo de errores**: Redirige a login si el token expira (401)

## Dependencias Principales

- **React** 19.2.4 - Librería UI
- **React Router** 7.1.8 - Enrutamiento
- **Axios** - Cliente HTTP
- **Vite** 5.4.0 - Bundler

## Personalizacion de Estilos

Los estilos globales están en `src/styles/index.css`. Puedes:

1. Modificar variables CSS
2. Agregar nuevos estilos
3. Usar Tailwind CSS (opcional)

## Componentes Principales

### Navbar
Menú principal con navegación

```jsx
<Navbar />
```

### TicketList
Tabla de tickets con carga dinámica

```jsx
<TicketList />
```

## Deploy

```bash
# Build optimizado
npm run build

# Los archivos estáticos estarán en `dist/`
# Servir con cualquier servidor estático:
# - Vercel, Netlify, etc.
# - Servidor Node.js
# - Nginx, Apache
```

## Recursos

- [React Docs](https://react.dev)
- [Vite Docs](https://vitejs.dev)
- [Axios Docs](https://axios-http.com)
- [React Router](https://reactrouter.com)

## Desarrollo

```bash
# Ejecutar en modo desarrollo
npm run dev

# El servidor está en: http://localhost:5173
# Con proxy a: http://localhost:8000/api
```

---

**Gestix** © 2026

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
