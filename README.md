# Reserva de Canchas - Frontend

Frontend moderno y reactivo para la plataforma **Reserva de Canchas Deportivas**, construido con React 18, Vite, TypeScript y Tailwind CSS, consumiendo la API REST de Spring Boot (`http://localhost:8080`).

---

## 🛠️ Stack Tecnológico

- **React 18** + **Vite** + **TypeScript**
- **Tailwind CSS** para estilos responsive y mobile-first
- **React Router v6** para enrutamiento y protección por roles
- **TanStack Query (React Query v5)** para gestión del estado del servidor y caché
- **react-hook-form** + **zod** para formularios tipados y validados
- **Orval** para generación automática del cliente de API y hooks desde OpenAPI
- **Vitest** + **Testing Library** (`@testing-library/react`, `jest-dom`, `user-event`) para pruebas unitarias y de integración

---

## 📂 Estructura del Proyecto

```
ReservaCanchas-Frontend/
├── docs/
│   ├── FRONTEND.md             # Especificación y reglas del frontend
│   ├── openapi.json            # Contrato OpenAPI real sincronizado
│   └── prompts_frontend.md     # Guía de fases y prompts de desarrollo
├── src/
│   ├── api/                    # Cliente generado por Orval (NO editar a mano)
│   │   ├── endpoints.ts        # Funciones y hooks React Query
│   │   └── model/              # DTOs y tipos generados
│   ├── components/             # Componentes compartidos
│   │   ├── common/             # LoadingSpinner, ErrorMessage, EmptyState
│   │   └── layout/             # Navbar responsive y AppLayout
│   ├── features/               # Módulos por dominio
│   │   ├── auth/               # Contexto, LoginPage, RegistroPage
│   │   ├── sedes/              # (Fase F1 / F4)
│   │   ├── canchas/            # (Fase F1 / F4)
│   │   ├── reservas/           # (Fase F1 / F4)
│   │   ├── partidos/           # (Fase F2)
│   │   ├── clips/              # (Fase F3)
│   │   ├── estadisticas/       # (Fase F3)
│   │   └── admin/              # (Fase F4)
│   ├── lib/                    # Utilidades y configuración
│   │   ├── api-client.ts       # Instancia Axios con interceptores JWT y 401
│   │   └── error-utils.ts      # Extractor de errores HTTP y mensajes de API
│   ├── pages/                  # Vistas principales (Home, 404, 403)
│   ├── routes/                 # ProtectedRoute y AppRoutes
│   ├── types/                  # Tipos globales de la app (roles, auth)
│   ├── App.tsx                 # Proveedores globales
│   ├── main.tsx                # Entrada React 18
│   └── index.css               # Directivas de Tailwind CSS
├── orval.config.ts             # Configuración del generador Orval
├── vite.config.ts              # Configuración de Vite y Vitest
└── package.json
```

---

## ⚙️ Variables de Entorno

Copia el archivo `.env.example` a `.env`:

```bash
cp .env.example .env
```

| Variable | Valor por defecto | Descripción |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080` | URL base del servidor backend Spring Boot |

---

## 🚀 Comandos de Ejecución

### 1. Instalar dependencias
```bash
npm install
```

### 2. Iniciar servidor de desarrollo (puerto 5173)
```bash
npm run dev
```

### 3. Ejecutar pruebas unitarias
```bash
npm test
```

### 4. Compilar para producción
```bash
npm run build
```

### 5. Regenerar cliente de la API desde OpenAPI
```bash
npm run api:generar
```
*Nota: Este comando lee `docs/openapi.json` o puede apuntar a `http://localhost:8080/v3/api-docs` y genera automáticamente los endpoints y modelos en `src/api/`.*

---

## 🔐 Seguridad y Autenticación

- **Autenticación JWT**: Al iniciar sesión (`POST /api/auth/login`) o registrarse (`POST /api/auth/registro`), el token y el perfil de usuario se guardan en `localStorage` y en el contexto `AuthContext`.
- **Interceptor Bearer**: Cada petición HTTP a través de `api-client.ts` adjunta la cabecera `Authorization: Bearer <token>`.
- **Manejo de 401**: Ante una respuesta 401 de la API, el interceptor limpia las credenciales y dispara un evento global `auth:unauthorized` que redirige al usuario a `/login`.
- **Control de Roles**: Los roles contemplados en el sistema son `JUGADOR`, `ADMIN_SEDE` y `ADMIN`. La barra de navegación y las rutas se adaptan visualmente según el rol, delegando la autorización estricta en el backend.
