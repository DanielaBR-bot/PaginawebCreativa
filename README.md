# Creativa Academia — Landing Page

Landing page de una sola página para Creativa Academia (arte y música en Riobamba, Ecuador, para niños, jóvenes y adultos). Frontend 100% estático: **HTML5 + CSS + JavaScript vanilla**, sin frameworks. Un servidor Node/Express mínimo lo sirve con seguridad, caché y compresión de producción.

## Estructura del proyecto

```
├── public/                       # Todo lo que se sirve por HTTP — nada fuera de esta carpeta es público
│   ├── index.html                 # Página principal
│   ├── politica-de-privacidad.html
│   ├── terminos-y-condiciones.html
│   ├── 404.html                   # Página de error (el servidor la sirve con status 404 real)
│   ├── css/styles.css             # Estilos (mobile-first, paleta de marca, sin frameworks)
│   ├── js/main.js                 # Menú móvil, CTAs de WhatsApp, FAQ, carruseles, mapa en fachada
│   ├── assets/                    # Logos, favicons, fotos optimizadas (WebP + JPG de respaldo)
│   ├── manifest.json              # Manifest PWA
│   ├── robots.txt
│   └── sitemap.xml
├── originals/                    # Fotos SIN procesar (fuera de public/, no se sirven por HTTP)
├── scripts/
│   ├── optimize-images.js         # originals/*.jpg|png → public/assets/*.webp (+ JPG de respaldo)
│   └── build.js                   # public/ → dist/, minifica CSS/JS con esbuild
├── server.js                      # Servidor de producción (Express + helmet + compression)
├── dist/                          # Generado por "npm run build" — no se sube a git (.gitignore)
├── TESTING.md                     # Evidencia de pruebas (Lighthouse, W3C, axe, etc.)
├── CHANGELOG.md
└── package.json
```

**No hay build step para editar el sitio**: `public/index.html` se puede abrir directo en el navegador, y `npm run dev` sirve `public/` tal cual, sin minificar. El build (`npm run build`) solo existe para producción — genera `dist/` con CSS/JS minificados; Railway lo corre automáticamente antes de `npm start`.

## Ejecutar en local

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`. Cualquier cambio en `public/` se refleja al recargar, sin reiniciar el servidor.

Para probar exactamente lo que corre en producción (con CSS/JS minificados):

```bash
npm run build
npm start
```

## Cómo agregar o reemplazar fotos

1. Coloca la foto original (JPG o PNG, buena calidad) en `originals/`. No la subas directamente a `public/assets/`.
2. Corre:
   ```bash
   npm run optimize-images
   ```
3. Esto genera en `public/assets/` versiones WebP en 2-3 anchos (480/800/1200px) más un JPG de respaldo, listas para usar en `<picture>` con `srcset`. Sigue el patrón que ya usan las fotos existentes en `public/index.html` (busca `<picture>` en el archivo) para referenciarlas con `sizes` correcto según dónde va la foto.
4. Si es la foto principal del hero (lo primero que carga), agrégale `fetchpriority="high"` en el `<img>`; el resto debe llevar `loading="lazy"`.

## Cómo editar contenido

Todo el texto visible vive directamente en los archivos `.html` dentro de `public/` (no hay CMS ni base de datos):

- **Textos, precios, horarios, disciplinas:** edita `public/index.html` directamente — busca la sección por su comentario (`<!-- HERO -->`, `<!-- DISCIPLINAS -->`, etc.) o por su `id` (`#beneficios`, `#disciplinas`, `#testimonios`, `#faq`, `#contacto`).
- **Número de WhatsApp o mensaje predefinido:** `public/js/main.js`, constantes `WHATSAPP_NUMBER` y `DEFAULT_MESSAGE` al inicio del archivo. Los botones de cada disciplina arman su propio mensaje automáticamente (usan el nombre de la disciplina).
- **Testimonios:** son placeholders marcados "Testimonio de ejemplo" (`public/index.html`, sección `#testimonios`). Reemplázalos por testimonios reales y quita esa etiqueta (`<span class="testimonial-badge">`) de cada uno.
- **Políticas legales:** `public/politica-de-privacidad.html` y `public/terminos-y-condiciones.html`. Actualiza la fecha en `<p class="updated-note">` cada vez que cambies el contenido.
- **Colores y tipografía:** variables en `:root` al inicio de `public/css/styles.css`. No cambies `--pink-a11y` por `--pink` en botones o texto — rompe el contraste verificado (ver `CLAUDE.md`).

Después de editar, corre `npm run dev` y revisa el cambio antes de hacer commit y push.

## Control de versiones con Git y GitHub

Mensajes de commit descriptivos por tipo de cambio:

- `feat:` una sección o funcionalidad nueva
- `fix:` una corrección (bug, contraste, responsive)
- `perf:` cambios de rendimiento
- `style:` cambios visuales sin afectar funcionalidad
- `docs:` cambios en documentación
- `chore:` mantenimiento (dependencias, configuración)

## Despliegue en Railway

1. Sube el proyecto a GitHub.
2. En [railway.app](https://railway.app), inicia sesión con tu cuenta de GitHub.
3. **New Project → Deploy from GitHub repo** → selecciona el repositorio.
4. Railway detecta automáticamente que es un proyecto Node (por `package.json`):
   - Corre `npm install`.
   - Corre `npm run build` (genera `dist/` con CSS/JS minificados).
   - Corre `npm start` (`node server.js`), que sirve el sitio en el puerto que Railway asigna (`$PORT`).
5. Railway genera un dominio `https://tuproyecto.up.railway.app` con **HTTPS automático**.
6. (Opcional) **Settings → Networking → Custom Domain** para conectar un dominio propio.
7. Cada `git push` a `main` dispara un nuevo despliegue automáticamente (CI/CD).

### Después del primer despliegue

Hay varios lugares en el código con el marcador `[PENDIENTE: dominio final]` (canonical, Open Graph, JSON-LD, `robots.txt`, `sitemap.xml`) — reemplázalos por el dominio real (`https://tuproyecto.up.railway.app` o tu dominio propio) en:

- `public/index.html`, `public/politica-de-privacidad.html`, `public/terminos-y-condiciones.html`
- `public/robots.txt`, `public/sitemap.xml`

Y repite las pruebas marcadas `[REPETIR EN PRODUCCIÓN]` en `TESTING.md` (cabeceras HTTPS, Rich Results Test de Google).

## Antes de publicar

Ver la lista completa de pendientes (datos reales que faltan, sin inventar) al final de `TESTING.md` y en el resumen de la auditoría de producción en el historial de commits. En resumen:

- Reemplazar testimonios de ejemplo por reales.
- Reemplazar el marcador `[PENDIENTE: dominio final]` una vez exista la URL de Railway.
- Decidir si se agrega analítica (hoy el sitio no usa cookies ni analítica — está declarado así en la política de privacidad).
