# Evidencia de pruebas — Creativa Academia

Todas las pruebas de este documento se corrieron **localmente** (`npm run build && npm start`, `http://localhost:3000`) el **28 de septiembre de 2026**, antes del primer despliegue a Railway. Las URLs de estos reportes usan `localhost` porque el sitio todavía no tiene dominio público — una vez desplegado, repite al menos las pruebas marcadas como **[REPETIR EN PRODUCCIÓN]** contra la URL real.

Metodología para el "antes": se levantó el commit `6f843dc` (el estado del sitio justo antes de esta fase de producción) en un *worktree* de git aparte, sirviéndolo con el `serve` original en el puerto 4000, y se corrió Lighthouse contra ambas versiones con los mismos parámetros.

---

## 1. Lighthouse — antes / después

| | Performance | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|
| **Móvil — antes** | 78 | 97 | 100 | 92 |
| **Móvil — después** | **90** | **100** | **100** | **100** |
| **Escritorio — antes** | 89 | 93 | 100 | 92 |
| **Escritorio — después** | 88 | 96 | **100** | **100** |

Meta del proyecto: ≥90 en las 4 categorías. **Se cumple en 7 de 8** (móvil completo; en escritorio, Performance quedó en 88 y Accesibilidad en 96 — detalle abajo).

### Métricas de carga (móvil)

| Métrica | Antes | Después |
|---|---|---|
| First Contentful Paint | 3.1 s | 2.7 s |
| Largest Contentful Paint | 4.1 s | 2.9 s |
| Total Blocking Time | 0 ms | 0 ms |
| Cumulative Layout Shift | 0 | 0 |
| Speed Index | 4.8 s | 2.7 s |
| Peso total transferido | 697 KB | 529 KB |

### Métricas de carga (escritorio)

| Métrica | Antes | Después |
|---|---|---|
| First Contentful Paint | 0.6 s | 0.9 s |
| Largest Contentful Paint | 0.9 s | 0.9 s |
| Cumulative Layout Shift | 0.207 | 0.209 |
| Peso total transferido | 1162 KB | 320 KB |

**Por qué Performance en escritorio quedó en 88 y no ≥90:** el CLS de escritorio (~0.21, categoría "necesita mejora") ya estaba presente **antes** de esta fase (0.207) y no lo generó nada de lo que se tocó — es un efecto del cambio de fuente del sistema a Barlow/Barlow Condensed al terminar de cargar (`font-display: swap`, que el propio checklist de este proyecto pidió explícitamente para no bloquear el render con texto invisible). Con `swap`, el navegador **siempre** puede reacomodar el texto una vez llega la fuente real si sus métricas no calzan exactas con la fuente de respaldo — en escritorio, donde los títulos ocupan menos líneas, ese reacomodo mueve más contenido debajo. Dos caminos si quieres perseguir el ≥90 en escritorio más adelante: (a) usar `font-display: optional` (elimina el salto, pero en la rarísima conexión lenta la primera visita puede quedarse con la fuente de respaldo) o (b) generar overrides de métricas de fuente (`size-adjust`/`ascent-override`) para que el respaldo calce casi exacto con Barlow — más preciso, más trabajo. No lo apliqué porque cambia una decisión (`swap`) que pediste explícitamente en este mismo pedido; te lo dejo para decidir.

**Por qué Accesibilidad en escritorio quedó en 96 (no 100):** el audit automático `target-size` de Lighthouse marca los puntos de paginación del carrusel de fotos del hero (`#hero-orb-dots`), que miden 6-16px visibles. Se evaluó agrandarlos a 44px reales (como se hizo con los puntos de testimonios, que sí llegan a 100) pero el hero tiene tarjetas decorativas con posición absoluta superpuestas en esa zona — agrandar el punto real desplaza el punto visible hacia abajo, hacia una tarjeta ("A tu propio ritmo"), tapándolo. Se dejó con un área táctil ampliada vía `::before` (funciona en un dispositivo real: el usuario sí puede tocar una zona de 44x44 centrada en el punto), pero Lighthouse no evalúa pseudo-elementos superpuestos para este chequeo puntual, así que sigue marcándolo. Es la única excepción a "áreas táctiles ≥44px" en todo el sitio; el resto (botón de menú, redes, disciplinas, puntos de testimonios) mide 44px reales.

Reportes completos (JSON) generados durante esta fase — no se suben al repo por peso, pero se pueden regenerar con `npx lighthouse http://localhost:3000/ --view`.

---

## 2. Validación HTML (W3C Nu Html Checker, validator.w3.org)

Se validó el HTML real servido por `npm start` (no el código fuente) contra el validador oficial vía su API pública.

| Página | Errores | Avisos |
|---|---|---|
| `/` | **0** | 4 (info: "el `<article>` de cada testimonio no tiene encabezado propio" — es una sugerencia, no un error; se dejó `<strong>` para el nombre en vez de un `h4` a propósito, para no sumar otro nivel a la jerarquía de encabezados) |
| `/politica-de-privacidad` | **0** | 0 |
| `/terminos-y-condiciones` | **0** | 0 |
| `/404` (ruta inexistente) | **0** | 0 |

Se encontró y corrigió 1 error real durante esta pasada: los `<div class="stars" aria-label="...">` de las estrellas de los testimonios no tenían `role`, y un `aria-label` en un `<div>` sin rol explícito es inválido en HTML — se agregó `role="img"`.

## 3. Validación CSS (W3C CSS Validator, jigsaw.w3.org)

`public/css/styles.css` — **válido, 0 errores, 0 avisos** (perfil CSS3+SVG).

---

## 4. Auditoría de accesibilidad automatizada (axe-core 4.13)

Corrido con axe-core inyectado vía Playwright contra las 4 páginas.

| Página | Violaciones antes | Violaciones después |
|---|---|---|
| `/` | 1 (moderada) | **0** |
| `/politica-de-privacidad` | 1 (moderada) | **0** |
| `/terminos-y-condiciones` | 1 (moderada) | **0** |
| `/404` | 2 (moderadas) | **0** |

Hallazgos corregidos: la barra de anuncio y el botón flotante de WhatsApp quedaban fuera de cualquier landmark (`region` rule) — la barra pasó a vivir dentro de `<header>` y el botón flotante se envolvió en `<div role="complementary">`; y en la página 404, los encabezados de columna del footer (`<h3>`) rompían el orden porque no había un `<h2>` antes en esa página — pasaron a `<h2>` en las 4 páginas por consistencia.

---

## 5. Enlaces rotos y respuesta 404

- **404 real verificado:** `curl -I http://localhost:3000/ruta-que-no-existe` → `HTTP/1.1 404 Not Found`, sirviendo `404.html` con la identidad del sitio.
- **7 anclas internas** (`#beneficios`, `#disciplinas`, `#testimonios`, `#faq`, `#contacto`, `#top`, `#main-content`): las 7 apuntan a un elemento que existe.
- **2 páginas legales** (`/politica-de-privacidad`, `/terminos-y-condiciones`): responden 200 en su URL limpia; la versión `.html` redirige 301 a la URL limpia.
- **Enlaces externos** (Facebook, Instagram, Google Maps): los 3 responden 200.
- **Enlaces `tel:`**: 2, bien formados (`+593999922186`, `+593963522100`).

## 6. Datos estructurados (JSON-LD)

Los 4 bloques (`EducationalOrganization`, `FAQPage`, y `BreadcrumbList` x2 en las páginas legales) son JSON válido y parsean sin error en las 4 páginas (verificado programáticamente). **[REPETIR EN PRODUCCIÓN]**: la prueba real de Google (search.google.com/test/rich-results) necesita una URL pública — no se pudo correr porque el sitio usa el marcador `[PENDIENTE: dominio final]` en las URLs del `schema.org` hasta que exista un dominio real. Corre esa prueba apenas despliegues.

## 7. Pruebas funcionales

- **16 botones de WhatsApp** (header, hero, 10 disciplinas, pasos, CTA final, footer, flotante): los 16 arman una URL `https://wa.me/593999922186?text=...` válida y correctamente codificada (`encodeURIComponent`); los 10 de disciplinas llevan un mensaje personalizado por instrumento/técnica; el resto usa el mensaje genérico. Los 16 tienen `rel="noopener noreferrer"`.
- **Menú móvil:** abre y cierra con clic y con teclado (Enter en el botón, Escape para cerrar); el foco es visible en cada paso.
- **FAQ (acordeón):** abre/cierra con clic y con teclado (Enter/Espacio sobre el `<summary>`).
- **Mapa:** no carga el iframe de Google hasta hacer clic en "Ver mapa interactivo" (verificado: 0 requests a Google antes del clic, iframe con el `src` correcto después).
- **Redes sociales:** los 3 iconos (Facebook, Instagram x2) abren en pestaña nueva con `noopener noreferrer`.

## 8. Responsive

Probado en los 4 anchos pedidos (360, 768, 1024, 1440px): **0px de overflow horizontal** y 0 errores de consola en los 4. Verificado visualmente con capturas de pantalla completas en cada ancho (con scroll simulado para activar las animaciones de aparición antes de capturar).

## 9. Cabeceras de seguridad

Verificado contra `http://localhost:3000/` (local; repetir contra la URL de Railway una vez desplegado — ver más abajo):

```
Content-Security-Policy: default-src 'self'; base-uri 'self'; font-src 'self' https://fonts.gstatic.com;
  form-action 'self'; frame-ancestors 'self'; img-src 'self' data:; object-src 'none'; script-src 'self';
  script-src-attr 'none'; style-src 'self' https://fonts.googleapis.com; upgrade-insecure-requests;
  frame-src https://www.google.com; connect-src 'self'
Referrer-Policy: strict-origin-when-cross-origin
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()
Cache-Control: no-cache (HTML) / public, max-age=604800 (assets/) / public, max-age=86400 (resto)
Content-Encoding: gzip (en respuestas ≥1KB con Accept-Encoding: gzip)
```

**[REPETIR EN PRODUCCIÓN]** — HTTPS y la redirección forzada solo se pueden probar de verdad contra el dominio real de Railway (localhost no tiene TLS). Cuando esté desplegado, corre:

```bash
curl -I http://tu-dominio.up.railway.app/     # debe responder 301/302 hacia https://
curl -I https://tu-dominio.up.railway.app/    # debe traer los headers de arriba + certificado válido
```

---

## Pruebas que debes correr tú manualmente (en navegador/celular real)

Todo lo de arriba se probó con Chromium headless — esto es lo que solo se puede verificar con ojos y dedos reales:

1. **WhatsApp de verdad**: toca 2-3 botones distintos desde tu celular y confirma que WhatsApp abre con el mensaje correcto y que el número recibe el mensaje.
2. **iOS Safari**: el sitio se probó en Chromium (motor Blink); Safari/WebKit puede renderizar fuentes, `backdrop-filter` o animaciones ligeramente distinto. Revisa el header (el blur), el menú móvil y el carrusel del hero en un iPhone real.
3. **Lector de pantalla real** (VoiceOver en iPhone o TalkBack en Android): axe-core y Lighthouse detectan errores de código, no cómo *suena* la experiencia. Navega la home con VoiceOver/TalkBack activado.
4. **Zoom del navegador al 200%**: confirma que nada se corta ni se superpone.
5. **Cobertura real de datos móviles** (no wifi): las métricas de Lighthouse son con la red simulada de Chrome; pruébalo con datos móviles reales para una sensación real de velocidad.
6. **Rich Results Test de Google** (search.google.com/test/rich-results) contra la URL real, una vez desplegado.
7. **Cabeceras HTTPS en producción** (comandos de la sección 9), una vez desplegado.
8. **Los 3 enlaces de redes sociales** llevan a las cuentas correctas y activas (se verificó que responden 200, no que el contenido/cuenta sea el correcto).
