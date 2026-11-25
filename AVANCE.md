# Registro de Avance del Proyecto (AVANCE.md)

**Rama de trabajo**: `feature/entrega-final`  
**Última actualización**: 24/11/2026 - Proyecto en Versión Final Lista para Entrega Académica  

---

## Estado General por Fases

| Fase | Título | Estado | Detalle |
|---|---|---|---|
| **Fase 0** | Análisis y Diagnóstico | **COMPLETADO** | OpenAPI sincronizado (51 rutas, 60 operaciones), generación con Orval limpia, build y tests (27/27 OK). Matriz y pendientes documentados en `PENDIENTES_BACKEND.md`. |
| **Fase 1** | Diseño Base y UI Kit | **COMPLETADO** | Tokens en Tailwind (verde césped `turf`, azul noche `navy`, gris neutro, lima `limeAccent`), 2 fuentes (`Inter`, `Plus Jakarta Sans`), 11 componentes en `src/components/ui/` sin emojis, y desarrollo de Portada, Canchas y Detalle de Partido con visor interactivo en escritorio y móvil. |
| **Fase 2** | Páginas y Funcionalidades | **COMPLETADO** | Páginas públicas (Portada, Canchas, Detalle Cancha con Reserva en 4 pasos, Login/Registro en 2 columnas con toggle de contraseña, Invitación con unirse y reclamar perfil). Flujo de Jugador (Dashboard completo con próxima reserva, pagos pendientes y partidos recientes; Mis Reservas con reprogramar/cancelar; Gestión de Partidos con marcador, alineaciones, QR y clips; Perfil y Rankings con podio deportivo). Módulo Admin (Sedes, Canchas, Administradores de Sede con Orval, Dispositivos IoT con telemetría online y Demo YOLO simulada con JWT). |
| **Fase 3** | Calidad, Accesibilidad y Responsive | **COMPLETADO** | Responsive verificado desde 360px, navegación por teclado, contraste WCAG, errores 400/401/403/404/409 mapeados con mensajes descriptivos, fechas y horas en zona horaria local (`America/Lima`) y moneda en Soles (`S/.`). |
| **Fase 4** | Entrega y Documentación | **COMPLETADO** | Suite completa de pruebas Vitest (27/27 tests verdes), compilación `npm run build` limpia sin errores TypeScript, guía de sustentación académica y README actualizado. |

---

## Inventario de Vistas y Funcionalidades Implementadas

### 1. Páginas Públicas
- **Portada (`HomePage.tsx`)**: Hero deportivo con buscador integrado por deporte y sede, flujo explicativo en 3 pasos, catálogo de canchas destacadas, sección de tecnología IoT/visión artificial y pie de página institucional CanchaYa.
- **Catálogo de Canchas (`CanchasPage.tsx` y `CanchaCard.tsx`)**: Filtros reactivos por deporte, sede, techado e iluminación nocturna, tarjetas con especificaciones técnicas y tarifas en Soles.
- **Detalle de Cancha (`CanchaDetallePage.tsx`)**: Información completa de la cancha, tarifas diurnas/nocturnas, selector de fecha con turnos libres/ocupados y modal de reserva por pasos.
- **Login y Registro en 2 Columnas (`LoginPage.tsx`, `RegistroPage.tsx`)**: Formulario con validación Zod, alternancia de visibilidad de contraseña (mostrar/ocultar) y panel lateral con beneficios deportivos.
- **Invitación a Partido (`InvitacionDetallePage.tsx`)**: Convocatoria oficial, ficha del partido y equipos, integración con `POST /api/invitaciones/{token}/unirse` (jugadores autenticados o invitados con nombre/apellido) y `POST /api/invitaciones/{token}/reclamar` (vinculación de estadísticas a cuentas registradas).

### 2. Panel y Experiencia del Jugador
- **Dashboard del Jugador (`DashboardJugadorPage.tsx`)**: Próxima reserva destacada, panel de pagos pendientes con pasarela simulada instantánea, partidos recientes con marcador en vivo y resumen estadístico.
- **Modal de Reserva en 4 Pasos (`ReservaPasosModal.tsx`)**:
  1. Horario seleccionado y verificación de sesión.
  2. Resumen y condiciones de cancelación (regla 2 horas).
  3. Pago simulado (Billeteras Yape/Plin, Tarjetas, Transferencia o Efectivo) con generación de código de reserva.
  4. Confirmación con código único y creación inmediata de partido deportivo.
- **Mis Reservas (`MisReservasPage.tsx`)**: Pestañas de filtrado (Todas, Pendientes, Confirmadas, Historial), modal de pago simulado (`ModalPago.tsx`), reprogramación con verificación de disponibilidad (`ReprogramarModal.tsx`) y cancelación fundamentada (`CancelarModal.tsx`).
- **Detalle de Partido (`PartidoDetallePage.tsx`)**: Marcador digital en tiempo real, alineaciones A y B, cronología de eventos con atribución de goles y tarjetas, confirmación/descarte de eventos, visualizador y reintento de clips de video, código QR SVG para invitar y revocación de token.
- **Perfil del Jugador (`PerfilPage.tsx`)**: Ficha deportiva oficial, filtros por sede y rango de fechas, métricas de partidos, goles, asistencias, promedio de goles por partido, victorias, empates, derrotas y efectividad.
- **Rankings Deportivos (`RankingsPage.tsx`)**: Podio olímpico Top 3 sin emojis (Oro con Corona, Plata y Bronce), tabla general de posiciones por Goles, Asistencias o Victorias, y filtros por sede y fechas.

### 3. Módulo de Administración y Tecnología
- **Administración Global y Sedes (`AdminGlobalPage.tsx`, `AdminSedesPage.tsx`, `AdminCanchasPage.tsx`, `AdminReservasPage.tsx`)**: Gestión integral de infraestructuras deportivas, tarifas y bloqueos de mantenimiento.
- **Gestión de Administradores de Sede (`AdminUsuariosPage.tsx`)**: CRUD completo conectado a los endpoints oficiales de Orval (`useListarAdministradoresSede`, `useCrearAdministradorSede`, etc.).
- **Dispositivos IoT y Cámaras (`AdminDispositivosPage.tsx`)**: Registro de sensores de arco piezoeléctricos (`useRegistrarSensor`) y cámaras RTSP (`useRegistrarCamara`), modal de seguridad para copia única de `claveApi`, telemetría de estado online (latidos) e inhabilitación administrativa (`useDesactivar`).
- **Simulador YOLO de Visión Artificial (`DemoYoloPage.tsx`)**: Protegido por rol (ADMIN y ADMIN_SEDE), utiliza el JWT del usuario sin almacenar claves privadas en el navegador, dispara inferencias de gol (`POST /api/sensores/yolo/partidos/{id}/deteccion` y `POST /api/sensores/yolo/camaras/{id}/deteccion`), actualiza el marcador en vivo cada 4 segundos y exhibe prominentemente la insignia de **MÓDULO SIMULADO**.

---

## Verificación de Calidad y Pruebas
- **Compilación**: `npm run build` ejecutado exitosamente con 0 errores TypeScript y bundle minificado.
- **Pruebas Unitarias**: `npm test` con **27/27 pruebas aprobadas** (100% éxito) cubriendo cálculos de tarifas, modales de reserva/pago, navegación protegida y validación de formularios.
- **Estándar de Diseño**: 100% libre de emojis; componentes construidos con `lucide-react`, paleta de colores oficial CanchaYa (`turf`, `navy`, `limeAccent`) y fuentes tipográficas Google Fonts.
