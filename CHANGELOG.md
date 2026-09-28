# Changelog

## Fase: preparación para producción (2026-09-28)

Auditoría integral del sitio para cumplimiento legal (Ecuador), SEO, rendimiento, seguridad y accesibilidad, antes del primer despliegue a Railway. Evidencia de pruebas en `TESTING.md`.

### Cumplimiento legal (LOPDP)
- Página de política de privacidad: responsable del tratamiento, datos recogidos vía WhatsApp/redes/Google Maps, finalidad, base legal, conservación, terceros (Meta, Google), datos de menores con consentimiento del representante, derechos del titular y cómo ejercerlos. Declara explícitamente que el sitio no usa cookies ni analítica.
- Página de términos y condiciones: naturaleza informativa del sitio, condiciones de la clase de prueba gratuita, propiedad intelectual, uso de imagen de alumnos.
- Página 404 personalizada, servida con código HTTP 404 real (antes, el servidor devolvía 200 para cualquier ruta).
- Footer con enlaces a ambas páginas legales y responsable identificado en todas las páginas.

### Seguridad
- Servidor Express reemplaza a `serve`: cabeceras `Content-Security-Policy`, `Strict-Transport-Security`, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`; redirección forzada a HTTPS en producción; compresión gzip; `Cache-Control` por tipo de archivo.
- Solo `public/` se sirve por HTTP — antes, todo el repositorio era accesible por URL (`server.js`, `package.json`, código fuente, fotos originales sin comprimir).
- `rel="noopener noreferrer"` en todos los enlaces externos.
- Mensajes de WhatsApp codificados (`encodeURIComponent`) y personalizados por disciplina (10 disciplinas, mensaje específico por cada una).

### SEO
- `lang="es-EC"`, un solo `<h1>` por página, jerarquía de encabezados corregida.
- Title y meta description dentro de los límites recomendados (55/152 caracteres), con "Riobamba" aplicado de forma natural (sin relleno de palabras clave).
- Open Graph completo + Twitter Card + imagen 1200x630 generada a partir del logo de marca.
- JSON-LD `EducationalOrganization` ampliado (geo, localidad, región, logo) + `FAQPage` nuevo + `BreadcrumbList` en páginas legales.
- `robots.txt` y `sitemap.xml`.

### Rendimiento
- Las 5 fotos reales pasan de un solo JPG (~90-145 KB c/u) a `<picture>` con WebP responsive (480/800/1200w) + JPG de respaldo. Imagen del hero con `fetchpriority="high"`.
- Script reutilizable (`scripts/optimize-images.js`, sharp) para procesar fotos nuevas.
- Build de producción con esbuild (`scripts/build.js`): CSS 29.6 KB → 22.3 KB, JS 11 KB → 5.2 KB minificados.
- Mapa de Google Maps convertido a fachada: no carga el iframe hasta que el usuario hace clic.
- Lighthouse móvil: Performance 78 → 90, Accesibilidad 97 → 100, SEO 92 → 100.

### Accesibilidad
- Enlace "Saltar al contenido".
- Áreas táctiles ampliadas a 44px mínimo (botón de menú, puntos de paginación de testimonios).
- 0 violaciones de axe-core (antes: 1-2 por página) — landmarks corregidos, orden de encabezados corregido.
- 0 errores de validación W3C HTML/CSS.

### Documentación
- `README.md` actualizado (estructura nueva, cómo agregar/optimizar imágenes, cómo editar contenido).
- `TESTING.md` con evidencia completa de pruebas.
- Este `CHANGELOG.md`.
