# CanchaYa - Frontend Oficial (Versión Final de Entrega Académica)

Plataforma profesional de reserva de canchas deportivas conectada con backend Spring Boot (`http://localhost:8080`), gestión de partidos en tiempo real, integración con sensores de arco IoT y simulación de visión artificial (YOLO).

Desarrollado con **React 18**, **TypeScript**, **Vite**, **Tailwind CSS**, **TanStack Query v5**, **React Hook Form**, **Zod**, **Orval** y **Vitest**.

---

## ⚽ Identidad y Sistema de Diseño CanchaYa

- **Estilo**: Deportivo, moderno, sobrio y de alto contraste visual.
- **Paleta de Colores**:
  - `turf` (Verde césped principal): `#16a34a` / `#15803d`
  - `navy` (Azul noche profundo): `#020617` / `#0b1120` / `#0f172a`
  - `limeAccent` (Lima enérgico): `#84cc16` / `#a3e635` — exclusivo para CTAs estelares y el distintivo **SIMULADO** de YOLO.
  - Colores semánticos de estado: Verde (confirmado/éxito), Ámbar (pendiente/advertencia) y Rojo (cancelado/error), acompañados siempre de texto descriptivo.
- **Tipografías**: Google Fonts **Plus Jakarta Sans** (títulos y display deportivo) e **Inter** (cuerpo de texto e interfaz).
- **Iconografía**: **100% libre de emojis** en toda la interfaz de usuario; uso exclusivo de iconos sobrios de `lucide-react`.

---

## 🚀 Arquitectura y Módulos Implementados

### 1. Páginas Públicas
- **Portada (`HomePage.tsx`)**: Hero deportivo con buscador integrado por deporte y sede, flujo en 3 pasos, catálogo de canchas destacadas, sección de tecnología IoT/visión artificial y pie de página en 4 columnas.
- **Catálogo de Canchas (`CanchasPage.tsx` y `CanchaCard.tsx`)**: Filtros reactivos por deporte, sede, techado e iluminación nocturna, tarjetas técnicas con tarifas en Soles (`S/.`).
- **Detalle de Cancha (`CanchaDetallePage.tsx`)**: Información completa, horarios diurnos/nocturnos, selector de turnos y modal de reserva por pasos.
- **Login y Registro en 2 Columnas (`LoginPage.tsx`, `RegistroPage.tsx`)**: Validación con Zod, alternancia de visibilidad de contraseña (mostrar/ocultar) y panel lateral informativo.
- **Invitación a Partido (`InvitacionDetallePage.tsx`)**: Convocatoria oficial, alineaciones, unión para jugadores autenticados o invitados con nombre/apellido (`POST /api/invitaciones/{token}/unirse`) y reclamo de perfil (`POST /api/invitaciones/{token}/reclamar`).

### 2. Experiencia del Jugador (`JUGADOR`)
- **Dashboard del Jugador (`DashboardJugadorPage.tsx`)**: Próxima reserva destacada, panel de pagos pendientes con modal de pago simulado instantáneo, historial de partidos recientes y estadísticas clave.
- **Reserva en 4 Pasos (`ReservaPasosModal.tsx`)**:
  1. Horario seleccionado y comprobación de sesión.
  2. Resumen y condiciones de cancelación (regla de las 2 horas).
  3. Pago simulado (Yape/Plin, Tarjetas, Transferencia o Efectivo) con generación de reserva en estado pagado.
  4. Confirmación con código de reserva y creación directa de partido.
- **Mis Reservas (`MisReservasPage.tsx`)**: Pestañas de filtrado (Todas, Pendientes, Confirmadas, Historial), modal de pago simulado (`ModalPago.tsx`), reprogramación (`ReprogramarModal.tsx`) y cancelación (`CancelarModal.tsx`).
- **Detalle de Partido (`PartidoDetallePage.tsx`)**: Marcador digital, alineaciones A y B, cronología de eventos con atribución y confirmación de goles, reproductor y reintento de clips de video, código QR SVG y revocación de token.
- **Perfil del Jugador (`PerfilPage.tsx`)**: Ficha deportiva oficial, filtros por sede y rango de fechas, métricas de partidos, goles, asistencias, promedio de gol por partido, victorias y porcentaje de efectividad.
- **Rankings Deportivos (`RankingsPage.tsx`)**: Podio olímpico Top 3 sin emojis (Oro con Corona, Plata y Bronce), tabla general de posiciones por Goles, Asistencias o Victorias con filtros por sede y fechas.

### 3. Módulo de Administración (`ADMIN` y `ADMIN_SEDE`)
- **Gestión de Sedes y Canchas (`AdminSedesPage.tsx`, `AdminCanchasPage.tsx`, `AdminReservasPage.tsx`)**: Administración de complejos, tarifas y bloqueos por mantenimiento.
- **Administradores de Sede (`AdminUsuariosPage.tsx`)**: CRUD completo conectado a los endpoints generados por Orval (`useListarAdministradoresSede`, `useCrearAdministradorSede`, etc.).
- **Dispositivos IoT y Cámaras (`AdminDispositivosPage.tsx`)**: Registro de sensores de arco (`useRegistrarSensor`) y cámaras RTSP (`useRegistrarCamara`), modal de seguridad para copia única de `claveApi`, telemetría de latidos online e inhabilitación (`useDesactivar`).
- **Simulador YOLO de Visión Artificial (`DemoYoloPage.tsx`)**: Protegido por rol, utiliza el JWT de administrador (sin pedir claveApi en navegador), dispara detecciones (`POST /api/sensores/yolo/partidos/{id}/deteccion`), actualiza el marcador en vivo cada 4s y exhibe la insignia obligatoria de **MÓDULO SIMULADO**.

---

## 🛠️ Comandos de Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor de desarrollo (puerto 5173)
npm run dev

# 3. Ejecutar pruebas unitarias (Vitest)
npm test

# 4. Compilar para producción (TypeScript + Vite)
npm run build

# 5. Regenerar cliente API desde OpenAPI oficial
npm run api:generar
```

---

## 🧪 Pruebas y Aseguramiento de Calidad

- **Vitest**: 27/27 pruebas unitarias aprobadas al 100%.
- **TypeScript**: 0 errores de compilación (`tsc -b` limpio).
- **Zona Horaria y Moneda**: Horarios interpretados en hora peruana (`America/Lima`) y precios en Soles peruanos (`S/.`).
- **Manejo de Errores**: Códigos HTTP 400, 401, 403, 404 y 409 con mensajes amigables y prevención de envíos dobles.

---

## 📄 Documentación Adicional
- [docs/GUION_SUSTENTACION.md](file:///c:/Users/jerem/OneDrive/Desktop/Desarrollo%20Web/reserva-canchas-frontend-main/docs/GUION_SUSTENTACION.md): Guión paso a paso para la defensa y sustentación académica del proyecto.
- [AVANCE.md](file:///c:/Users/jerem/OneDrive/Desktop/Desarrollo%20Web/reserva-canchas-frontend-main/AVANCE.md): Registro histórico de fases y decisiones técnicas.
- [PENDIENTES_BACKEND.md](file:///c:/Users/jerem/OneDrive/Desktop/Desarrollo%20Web/reserva-canchas-frontend-main/PENDIENTES_BACKEND.md): Detalle de campos y comportamientos del backend documentados según contrato.
