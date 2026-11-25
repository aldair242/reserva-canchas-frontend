# Guión de Sustentación Académica - CanchaYa

**Proyecto**: Plataforma Profesional de Reserva de Canchas Deportivas con IoT y Visión Computacional  
**Frontend**: React 18, TypeScript, Vite, Tailwind CSS, TanStack Query, React Hook Form, Zod, Orval.  
**Backend**: Spring Boot 3, Java 21, PostgreSQL, JPA/Hibernate, Seguridad JWT, OpenAPI 3.0.  

---

## 1. Introducción y Propuesta de Valor (2 minutos)
- **Problema**: La gestión tradicional de alquiler de canchas deportivas padece de colisiones de horarios por llamadas telefónicas, falta de inmediatez en el pago, ausencia de trazabilidad de goles y desvinculación entre el partido físico y las estadísticas digitales de los jugadores.
- **Solución CanchaYa**: Una plataforma omnicanal que integra la reserva instantánea en 4 pasos mediante **bloqueo pesimista**, sincronización con **sensores piezoeléctricos de arco** y cámaras con **visión artificial (YOLO)** para registrar goles, generar clips automáticos y alimentar clasificaciones en tiempo real.

---

## 2. Demostración de Flujos Clave en Vivo (6 minutos)

### A. Experiencia del Jugador (Público a Privado)
1. **Búsqueda y Exploración**:
   - Mostrar la portada `HomePage` con el buscador interactivo por deporte y sede.
   - Navegar al catálogo `/canchas` aplicando filtros reactivos (techada, iluminación nocturna, superficie).
2. **Reserva en 4 Pasos**:
   - Abrir una cancha, elegir fecha y seleccionar un slot horario disponible.
   - Demostrar el wizard:
     1. Verificación de horario y bloqueo.
     2. Resumen con regla de cancelación (2 horas).
     3. Procesamiento de pago simulado (Yape/Plin o tarjeta) con confirmación inmediata conectada al backend.
     4. Confirmación con código único de reserva y botón directo para **Crear Partido**.
3. **Partido, Convocatoria y Marcador en Vivo**:
   - Acceder al detalle del partido `/partidos/:id`.
   - Mostrar el marcador digital y la generación del **Código QR SVG** y enlace de invitación para compartir con amigos.
   - Abrir una ventana de incógnito con la ruta de invitación `/invitaciones/:token` y demostrar cómo un jugador nuevo se une a uno de los equipos (con o sin cuenta) y cómo puede reclamar su perfil más adelante.

### B. Módulo Administrativo y Tecnología de Cancha
1. **Panel de Gestión de Sede y Dispositivos IoT**:
   - Iniciar sesión como `ADMIN` o `ADMIN_SEDE`.
   - Ir a `/admin/dispositivos`: mostrar la lista de sensores y cámaras vinculadas a cada cancha con su telemetría online (indicador verde de latido cada 10s).
   - Simular el registro de un nuevo sensor de arco piezoeléctrico destacando el modal de seguridad que entrega la **clave API única en texto claro**.
2. **Simulador de Ingesta YOLO (Visión Artificial)**:
   - Ir a `/admin/yolo` mostrando la insignia reglamentaria de **MÓDULO SIMULADO**.
   - Explicar la arquitectura de seguridad: la petición viaja autenticada con el **JWT del Administrador** sin exponer ni almacenar claves API en el navegador.
   - Disparar una detección de gol con un 94% de confianza:
     - Observar cómo el marcador se incrementa automáticamente.
     - Verificar en la línea de tiempo la aparición del evento de gol pendiente de atribución.
     - Mostrar la generación y listado del clip de video correspondiente.

### C. Rankings y Perfil del Jugador
1. Ir a `/rankings`: mostrar el **podio deportivo Top 3 sin emojis** (Oro, Plata, Bronce) y alternar entre máximos goleadores, asistidores y partidos ganados.
2. Ir a `/perfil`: mostrar la ficha del jugador con métricas consolidadas (goles por partido, porcentaje de victorias, etc.).

---

## 3. Puntos Destacados de Arquitectura e Ingeniería de Software (2 minutos)
1. **Contrato de API Tipado**:
   - Uso de **Orval** para sincronizar automáticamente el archivo `docs/openapi.json` con los modelos TypeScript y hooks reactivos de TanStack Query, eliminando discrepancias de tipos.
2. **Resiliencia y Manejo de Errores**:
   - Mapeo centralizado de excepciones HTTP (400, 401, 403, 404, 409) con mensajes contextuales al usuario y prevención de envíos dobles en formularios con React Hook Form y Zod.
3. **Diseño y Accesibilidad**:
   - Interfaz deportiva sobria con paleta de colores institucional (`turf`, `navy`, `limeAccent`), fuentes `Inter` y `Plus Jakarta Sans`, contraste verificado y adaptación responsive desde 360 px.
4. **Calidad Probada**:
   - Suite de 27 pruebas unitarias con Vitest y compilación de producción completamente limpia.
