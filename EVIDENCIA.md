# Evidencia del proceso — Puesta en producción de Creativa Academia

Documento de respaldo para el informe académico de Daniela Paola Barreno Rosas (Instituto Superior España, "Proyectos Web"). Cubre la fase de preparación para producción del sitio de Creativa Academia, desarrollada con asistencia de Claude Code entre el **28 de septiembre de 2026, 11:51** y el **28 de septiembre de 2026, 13:27** (hora del commit inicial al commit final de esta fase), más el despliegue a Railway el mismo día.

---

## 1. Auditoría inicial y plan propuesto

Antes de modificar cualquier archivo, se auditó el repositorio (estructura, stack, cómo Railway serviría el sitio, uso de Tailwind) y se entregó un informe de hallazgos, sin aplicar cambios, para su aprobación.

### Hallazgos principales de la auditoría

- **Tailwind no se usaba** (contrario a lo que sugería el pedido original) — el proyecto ya era CSS propio, decisión documentada previamente en `CLAUDE.md`. No había nada que purgar.
- **Hallazgo crítico de arquitectura:** Railway servía el sitio con `serve -s . -l $PORT`. El flag `-s` (modo *single-page app*) reescribía cualquier ruta desconocida hacia `index.html` con código 200, lo que hacía **imposible** un 404 real. Además, el paquete `serve` no soporta compresión gzip/brotli.
- No existían páginas legales, página 404, `robots.txt` ni `sitemap.xml`.
- Las 5 fotografías reales del sitio (~90–145 KB cada una) se servían como un solo JPG sin `WebP`, sin `srcset` y sin `width`/`height` explícitos.
- No había cabeceras de seguridad (CSP, HSTS, X-Frame-Options, etc.) ni redirección forzada a HTTPS.
- Faltaban: enlace "saltar al contenido", `lang="es-EC"` (estaba en `es`), canonical, Open Graph completo, datos estructurados `FAQPage`/`BreadcrumbList`.
- No se encontraron imágenes de picsum.photos (ese punto del pedido ya estaba resuelto).

### Plan propuesto (aprobado antes de tocar código)

Se propuso trabajar en 7 bloques, en el orden: **(1)** servidor de producción + páginas legales y 404, **(2)** seguridad, **(3)** imágenes y rendimiento, **(4)** SEO, **(5)** accesibilidad, **(6)** pruebas con evidencia, **(7)** documentación — con un commit descriptivo en español por cada cambio significativo, y usando el marcador `[PENDIENTE: ...]` en vez de inventar cualquier dato real del negocio que faltara.

Dos decisiones de arquitectura se dejaron explícitamente a elección de Daniela antes de continuar (detalle en la sección 5):

1. Cómo resolver 404 real + cabeceras de seguridad + compresión (reemplazar `serve` por un servidor Express mínimo, vs. mantener `serve` con un `serve.json`).
2. Cómo minificar CSS/JS sin romper la filosofía "sin build step" del proyecto (agregar un build ligero con esbuild, vs. no minificar y confiar solo en gzip).

---

## 2. Historial de commits de esta fase

Formato: `hash | fecha y hora | mensaje`. Los 12 commits corresponden exactamente a los bloques 1–7 más los ajustes hechos durante el despliegue.

```
0fda030 | 2026-09-28 11:51 | chore: reemplazar serve por servidor Express con seguridad, cache y compresion
cbb7d6e | 2026-09-28 11:51 | feat: agregar paginas legales, 404 real y accesibilidad basica
12b14ea | 2026-09-28 11:53 | feat: personalizar mensajes de WhatsApp por disciplina
641f58d | 2026-09-28 12:02 | perf: optimizar imagenes a WebP responsive y mover el sitio a public/
8389010 | 2026-09-28 12:05 | perf: agregar build de produccion que minifica CSS y JS
780d2d6 | 2026-09-28 12:09 | feat: mejorar SEO (meta tags, datos estructurados, sitemap)
0d397fb | 2026-09-28 12:11 | fix: ampliar areas tactiles a 44px minimo (WCAG 2.5.5)
38e6883 | 2026-09-28 12:26 | fix: corregir hallazgos de axe-core (landmarks y orden de encabezados)
9b6dc8e | 2026-09-28 12:31 | fix: agregar role=img a los divs de estrellas (W3C) y documentar pruebas
d7a2829 | 2026-09-28 12:32 | docs: actualizar README y agregar CHANGELOG de la fase de produccion
6dd4f16 | 2026-09-28 13:26 | fix: quitar dependencia de NODE_ENV en la redireccion a HTTPS
9a87509 | 2026-09-28 13:27 | chore: reemplazar marcador de dominio pendiente por el dominio real de Railway
```

Reproducible con `git log --reverse --format="%h|%ad|%s" --date=format:"%Y-%m-%d %H:%M" 6f843dc..HEAD` desde la raíz del repositorio.

---

## 3. Cambios realizados por bloque

### Bloque 1 — Servidor, páginas legales y 404 (`0fda030`, `cbb7d6e`)
- `server.js` nuevo (Express + helmet + compression) reemplaza a `serve`.
- `politica-de-privacidad.html` (LOPDP: responsable, datos recogidos vía WhatsApp/redes/Maps, finalidad, base legal, conservación, terceros, menores de edad, derechos y cómo ejercerlos) y `terminos-y-condiciones.html`.
- `404.html` con identidad de marca, servida con status HTTP 404 real.
- Enlace "Saltar al contenido", footer con enlaces legales, `rel="noreferrer"` en enlaces externos.

### Bloque 2 (parte de seguridad) — WhatsApp por disciplina (`12b14ea`)
- Los 10 instrumentos/técnicas de la sección "Disciplinas" pasan de texto plano a enlaces de WhatsApp con mensaje prellenado específico por disciplina.
- Corrección de `rel` a `noopener noreferrer` en los botones de WhatsApp.

### Bloque 3 — Imágenes y rendimiento (`641f58d`, `8389010`)
- 5 fotos reales convertidas a `<picture>` con WebP responsive (480/800/1200w) + JPG de respaldo; imagen del hero con `fetchpriority="high"`.
- Script reutilizable `scripts/optimize-images.js` (sharp).
- Mapa de Google Maps convertido a fachada (no carga el iframe hasta que el usuario hace clic).
- Reestructuración a `public/` — solo esa carpeta se sirve por HTTP (ver sección 6, error encontrado y corregido).
- Build de producción con esbuild (`scripts/build.js`): CSS 29.6 KB → 22.3 KB, JS 11 KB → 5.2 KB.

### Bloque 4 — SEO (`780d2d6`)
- `lang="es-EC"`, title (55 car.) y meta description (152 car.) dentro de límite, con "Riobamba" aplicado de forma natural en 2 párrafos del cuerpo (sin relleno de palabras clave).
- Open Graph completo + Twitter Card + imagen 1200×630 generada a partir del logo de marca.
- JSON-LD `EducationalOrganization` ampliado (geo, localidad, región, logo) + `FAQPage` nuevo + `BreadcrumbList` en páginas legales.
- `robots.txt` y `sitemap.xml`.

### Bloque 5 — Accesibilidad (`0d397fb`, `38e6883`, `9b6dc8e`)
- Áreas táctiles ampliadas a 44px mínimo (botón de menú móvil, puntos de paginación de testimonios).
- Corrección de hallazgos de axe-core: landmarks (barra de anuncio y botón flotante de WhatsApp quedaban fuera de cualquier región), orden de encabezados.
- Corrección de un error real de validación W3C (`aria-label` en `<div>` sin `role`).

### Bloque 6 — Pruebas (documentadas en `TESTING.md`, commit `9b6dc8e`)
Ver sección 4 de este documento.

### Bloque 7 — Documentación (`d7a2829`)
- `README.md` reescrito (estructura nueva, cómo agregar/optimizar imágenes, cómo editar contenido, pasos post-deploy).
- `CHANGELOG.md` nuevo.

### Ajustes durante el despliegue (`6dd4f16`, `9a87509`)
- Corrección de un bug real antes de desplegar (NODE_ENV, ver sección 6).
- Reemplazo del marcador `[PENDIENTE: dominio final]` por la URL real una vez confirmado el dominio de Railway.

---

## 4. Resultados de pruebas (detalle completo en `TESTING.md`)

### Lighthouse — antes / después

| | Performance | Accesibilidad | Buenas prácticas | SEO |
|---|---|---|---|---|
| Móvil — antes | 78 | 97 | 100 | 92 |
| **Móvil — después** | **90** | **100** | **100** | **100** |
| Escritorio — antes | 89 | 93 | 100 | 92 |
| Escritorio — después | 88 | 96 | 100 | 100 |

Metodología: se comparó el commit `6f843dc` (estado justo antes de esta fase, levantado en un *worktree* de git aparte con el `serve` original) contra el estado final, con Lighthouse corrido localmente con los mismos parámetros contra ambas versiones.

Métricas de carga (móvil): FCP 3.1 s → 2.7 s, LCP 4.1 s → 2.9 s, Speed Index 4.8 s → 2.7 s, peso total 697 KB → 529 KB.

Las dos métricas de escritorio que no llegaron a 90/100 (Performance 88, Accesibilidad 96) tienen causa identificada y documentada en `TESTING.md` §1 — no son regresiones introducidas sin explicación, sino consecuencias directas de decisiones tomadas a propósito (ver sección 5 de este documento).

### Validación W3C
- **HTML:** 0 errores en las 4 páginas (validator.w3.org, API oficial).
- **CSS:** válido, 0 errores (jigsaw.w3.org, perfil CSS3+SVG).

### axe-core 4.13
0 violaciones en las 4 páginas (antes de corregir: 1–2 violaciones moderadas por página).

### Otras pruebas
Enlaces internos/externos verificados (incluye 404 real), 16 botones de WhatsApp verificados (URL válida, mensaje codificado, `rel` correcto), responsive sin overflow horizontal en 360/768/1024/1440px, cabeceras de seguridad verificadas tanto en local como en el sitio ya desplegado.

---

## 5. Decisiones donde Daniela definió o acotó el trabajo

En general, la mayoría de las propuestas técnicas se presentaron como opciones explícitas para elegir (no como recomendaciones unilaterales ya aplicadas), así que no hubo "rechazos" en el sentido estricto — sí hubo decisiones puntuales que cambiaron el alcance:

| Punto | Propuesta presentada | Decisión de Daniela | Por qué importa |
|---|---|---|---|
| Servidor de producción | Opción A: Express + helmet + compression (control total). Opción B: mantener `serve` + `serve.json` (menos cambio de stack, sin compresión). | **Opción A.** | Habilitó 404 real, cabeceras de seguridad y compresión — sin esto, varios ítems del bloque de seguridad no se podían cumplir. |
| Minificación de CSS/JS | Opción A: build ligero con esbuild (recomendado). Opción B: no minificar, confiar solo en gzip. | **Opción A.** | El proyecto documentaba "sin build step" como decisión deliberada; agregar esbuild fue una excepción consciente, limitada a producción (`npm run dev` sigue sin build). |
| Datos para la política de privacidad | Se pidió RUC, razón social y un correo de contacto para ejercer derechos LOPDP. | Sin RUC ("no necesitamos los datos de RUC"), razón social = "Creativa Academia", y confirmó declarar explícitamente que el sitio no usa cookies ni analítica (en vez de definir un correo, se usó WhatsApp como canal único, ya consistente con el resto del sitio). | Redujo el alcance legal a lo mínimo verificable con datos reales, evitando inventar un RUC o correo que no existía. |
| Testimonios de ejemplo | Quedaron señalados como pendientes de reemplazar por reales. | "los testimonios dejemoslo como estan, en un futuro lo vamos a cambiar pero ahora para presentar el trabajo ya esta bien". | Confirma que la etiqueta "Testimonio de ejemplo" es intencional para esta entrega, no un descuido. |
| Conexión a GitHub en Railway | El intento por CLI falló (el GitHub App de Railway no tenía autorización sobre el repo privado); se pidió que Daniela lo autorizara manualmente desde el dashboard. | Daniela conectó el repo y disparó el primer deploy desde ahí ella misma. | El auto-deploy en cada `git push` (documentado en el README) quedó funcionando de verdad, no solo documentado. |

---

## 6. Limitaciones y errores durante el desarrollo

Registro honesto de los tropiezos propios del proceso (no del código original), cada uno detectado y corregido antes de continuar:

1. **Exposición de archivos internos.** Al reemplazar `serve` por Express, el primer `server.js` servía **todo** el directorio del repositorio (`express.static(ROOT)`), no solo el sitio público — quedaban accesibles por URL `server.js`, `package.json`, `node_modules/`, `CLAUDE.md`, las fotos originales sin comprimir, etc. Se detectó antes de seguir avanzando (no llegó a desplegarse así) y se corrigió reestructurando todo lo servible dentro de `public/`.
2. **Violación de la propia política de seguridad (CSP).** Al agregar `Content-Security-Policy` sin `unsafe-inline` en `style-src`, se rompieron 4 estilos en línea existentes (`style="--avatar-bg:..."` en los avatares de testimonios) que ya estaban en el código. Se detectó al probar la página con la consola del navegador y se corrigió moviendo esos colores a clases CSS.
3. **Regresión visual en un primer intento de accesibilidad.** Al agrandar el área táctil de los puntos de paginación del carrusel del hero a 44×44px reales, el punto visible se desplazó hacia una tarjeta decorativa superpuesta (posicionada de forma absoluta), quedando tapado. Se detectó con una captura de pantalla de verificación y se revirtió a una técnica de superposición (`::before`) que no mueve el punto visible, documentando la excepción en `TESTING.md`.
4. **CSS olvidado.** Se agregó la clase `footer-legal-links` en el HTML del footer pero no se escribió su regla CSS correspondiente — los enlaces legales aparecieron sin espaciado. Detectado con una captura de pantalla de revisión visual antes de hacer commit.
5. **Intento de inventar un dominio.** En un primer borrador de las etiquetas `canonical`, se escribió un dominio de ejemplo (`creativaacademia.example.ec`) en vez de usar el marcador `[PENDIENTE]` pedido explícitamente. Se autodetectó releyendo el propio cambio antes de continuar, y se corrigió.
6. **Bug que hubiera afectado producción.** La redirección forzada a HTTPS en `server.js` dependía de `process.env.NODE_ENV === "production"`, una variable que Railway no define por defecto — la redirección nunca se habría activado en el sitio real. Se detectó revisando las variables de entorno reales del proyecto en Railway antes del primer despliegue, no después.
7. **Incompatibilidad del script de build con OneDrive.** `scripts/build.js` fallaba (`EPERM`) al copiar carpetas, porque `fs.readdirSync(..., {withFileTypes:true})` reporta mal el tipo de archivo/carpeta dentro de rutas sincronizadas con OneDrive (por los *reparse points* de "Files On-Demand"). Se corrigió usando `fs.statSync` en su lugar.
8. **Suposición desactualizada sobre el estado de Railway.** `CLAUDE.md` indicaba que Railway "todavía no estaba desplegado"; al momento de desplegar se encontró que ya existía un proyecto activo (con una versión vieja del sitio corriendo). Se le avisó a Daniela y se continuó con el proyecto existente en vez de crear uno nuevo. Lección: verificar el estado real de servicios externos antes de asumir lo que dice la documentación guardada.

## 7. Pendientes (`[PENDIENTE]`) que quedan abiertos

- **Testimonios reales** — siguen siendo de ejemplo, por decisión explícita de Daniela para esta entrega (sección 5).
- **Decidir si se agrega analítica** (hoy el sitio declara explícitamente en la política de privacidad que no usa cookies ni analítica).
- **Dominio propio** (opcional) — el sitio usa el dominio gratuito de Railway; conectar uno propio es un paso aparte documentado en el README.
- **Pruebas manuales** listadas al final de `TESTING.md`: WhatsApp desde un celular real, Safari/iOS, lector de pantalla real (VoiceOver/TalkBack), zoom al 200%, Rich Results Test de Google contra la URL ya real.
- **Mejora opcional de escritorio** (no bloqueante): Performance en 88 y Accesibilidad en 96 en escritorio, ambos con causa raíz identificada en `TESTING.md` §1 — se puede perseguir el 90/100 con trabajo adicional (overrides de métricas de fuente para el CLS; rediseño menor del carrusel del hero para el punto de paginación) si se decide que vale la pena para la siguiente entrega.
