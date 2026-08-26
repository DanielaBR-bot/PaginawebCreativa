# Creativa Academia — Landing Page

Contexto de proyecto para Claude Code. Este archivo se carga automáticamente al abrir esta carpeta en VS Code con el plugin de Claude Code — no hace falta explicar el proyecto de nuevo en cada sesión.

## Qué es esto

Landing page de una sola página para **Creativa Academia**, institución de arte y música para niños, jóvenes y adultos (dibujo, pintura, canto, música, etc.), ubicada en Ecuador. Actualmente la academia gestiona todo por WhatsApp e Instagram; el objetivo del sitio es dar presencia digital profesional y convertir visitantes usando como gancho la **clase de prueba gratuita**.

Este proyecto es parte del trabajo académico de Daniela Paola Barreno Rosas (Instituto Superior España, "Proyectos Web"). Los documentos originales de requisitos, alcance y manual de marca están en el proyecto de Claude **"ACADEMIA CREATIVA WEB"** (no en este repo): `S1-RequisitosProyecto.docx`, `Barreno.Daniela.PW.S2.docx`, `Manual de Marca Basico.pdf`. Si necesitas ese contexto ampliado y no lo tienes a mano, pregúntale a Daniela/Paola en vez de asumir.

## Stack técnico (decisión deliberada)

- **HTML5 + CSS puro + JavaScript vanilla.** Sin frameworks, sin backend, sin build step.
- Se descartó Tailwind (mencionado en los docs de requisitos) porque, sin purgar, su CDN pesa cientos de KB vs. los ~21 KB del CSS propio — prioriza el requisito de velocidad de carga en un sitio 100% estático.
- `package.json` existe **solo** para tener un comando estándar que sirva los archivos estáticos (`serve -s . -l $PORT`), tanto en local (`npm run dev`) como en Railway (`npm start`). No hay dependencias de runtime más allá de `serve`.
- Peso total de la página (html+css+js+assets críticos): ~168 KB. Única dependencia externa: Google Fonts.

## Estructura de archivos

```
index.html          # Toda la estructura de la página (hero, beneficios, disciplinas, testimonios, pasos, FAQ, CTA final, footer)
css/styles.css       # Estilos mobile-first, tokens de marca en :root
js/main.js           # Menú móvil, CTA de WhatsApp, acordeón FAQ (usa <details> nativo), scroll-reveal, carrusel de testimonios
assets/              # Logos optimizados (PNG + WebP) y favicons, generados a partir del logo oficial
manifest.json        # Manifest PWA
package.json         # Solo para servir el sitio (ver arriba)
README.md            # Guía de setup local + despliegue en Railway
MarcaAcademiaCreativa/  # Assets de marca originales (PDF del manual, logos editables .ai/.pdf, PNG)
Academia-Creativa.png, Inspo.png  # Referencias que Daniela subió a la carpeta (flyer y screenshot de inspiración)
```

## Identidad de marca

**Colores** (tomados del Manual de Marca Básico, definidos como variables CSS en `:root` de `styles.css`):

| Token | Hex | Uso |
|---|---|---|
| `--purple` | `#9286e8` | Color primario de marca (logo, acentos) |
| `--purple-darker` | `#4b3fae` | Headings, fondos oscuros (CTA final) |
| `--mint` | `#96d6be` | Secundario, doodles |
| `--pink` | `#f080b2` | Rosa de marca **pastel — solo decorativo** (blobs, doodles) |
| `--pink-a11y` | `#d5196d` | Variante del rosa **para texto y botones interactivos** — el pastel original no pasaba contraste WCAG AA con texto blanco |
| `--pink-a11y-dark` | `#b5155c` | Hover de botones primarios |
| `--skyblue` | `#b5f2fd` | Acento decorativo |
| `--tan` | `#d5c298` | Acento decorativo, badges |
| `--ink` / `--ink-soft` | `#2c2540` / `#5a5470` | Texto |

**Importante:** si vas a tocar colores, no reemplaces `--pink-a11y` por `--pink` en botones o texto — se rompería el contraste AA verificado (ver sección de accesibilidad abajo).

**Tipografía:** el manual pide *Gill Sans MT Ext Condensed Bold* (no disponible como fuente web libre) + *Barlow Bold*. Se sustituyó por **Barlow Condensed** (headings) + **Barlow** (body) — misma familia tipográfica, ambas cargadas desde Google Fonts.

**Logo:** el ícono (clave de sol + pincel) se recortó del logotipo principal para animarlo en el header. Variantes disponibles en `assets/`: `logo-icon.png` (ícono solo, header), `logo-principal.png` (color, para fondos claros), `logo-blanco.png` (blanco, para fondos oscuros/footer), `logo-secundaria.png` (variante alterna).

## Información del negocio (usada tal cual en el sitio)

- **WhatsApp principal (CTA):** +593 99 992 2186 → configurado en `js/main.js`, constante `WHATSAPP_NUMBER`. Mensaje predefinido en `DEFAULT_MESSAGE`.
- **Teléfono alterno** (solo mencionado en footer, no es CTA): 096 352 2100.
- **Dirección:** José Veloz y Juan Velasco (Esquina).
- **Horarios:** Lunes a viernes 8:00–12:00 y 15:00–19:00; sábados 8:00–12:00.
- **Instagram:** @academia_creativa_ec (footer, enlazado). No hay Facebook enlazado todavía — falta el handle oficial.
- **Disciplinas:** Artes Sonoras (Guitarra, Canto, Violín, Batería, Piano) · Artes Visuales (Pintura, Dibujo, Escultura, Manualidades).
- **Promoción:** descuento especial por inscripción de 2 estudiantes.
- **Eslogan:** "Haz arte. Haz música. Hazlo tuyo." — tomado del flyer oficial, es el H1 del hero.

## Decisiones de diseño ya tomadas (no las repitas ni las cuestiones sin razón nueva)

1. **Testimonios son placeholders**, explícitamente etiquetados "Testimonio de ejemplo" en la UI — decisión de Daniela porque aún no tiene testimonios reales. Reemplazar cuando existan, quitando la etiqueta.
2. **Hero sin foto real**: la única fotografía disponible era una foto de un flyer impreso (mala calidad para web), así que el hero usa ilustración con CSS/blobs/tarjetas flotantes en vez de una imagen de baja calidad. Reemplazar por fotos/video reales de clases cuando existan (con autorización de los padres).
3. **Contraste WCAG AA verificado matemáticamente** en botones, badges y textos sobre color — de ahí la variante `--pink-a11y`. No revertir a `--pink` puro en elementos interactivos.
4. **El "formulario" de clase de prueba es solo un botón** que abre WhatsApp con mensaje prellenado (`buildWhatsAppUrl()` en `main.js`) — no hay campos ni backend, por requisito explícito del proyecto.
5. Se corrigió un bug de "grid blowout" en móvil (los botones con texto largo hacían que el layout se desbordara horizontalmente) — la solución (`min-width: 0` en hijos de grid/flex) está documentada como comentario en `styles.css`, no lo remuevas sin entender por qué está.
6. Referencia de estilo (sin copiar contenido ni diseño literal): [Brooklyn Robot Foundry](https://brooklynrobotfoundry.com/), principalmente por la animación del logo superior izquierdo y el nivel de pulido general.

## Estado actual

- ✅ Sitio completo construido y verificado (responsive 320–1440px, accesibilidad, performance, links de WhatsApp).
- ✅ Repositorio Git inicializado y publicado en GitHub: **`PaginawebCreativa`** (privado), rama `main`, 1 commit inicial.
- ✅ Carpeta local: `OneDrive\Documents\ISTE CIBERSEGURIDAD\PROYECTOS WEB\PaginawebCreativa`.
- ⏳ **Railway: todavía no desplegado** — Daniela pidió explícitamente esperar antes de tocar esto. La guía completa de despliegue ya está en `README.md` (sección "Despliegue en Railway"): crear proyecto en railway.app → Deploy from GitHub repo → Railway detecta `package.json` y corre `npm start` → dominio HTTPS automático.
- ⏳ Pendiente: testimonios reales, enlace de Facebook (falta handle), fotos/video reales para el hero, conectar analítica (hay un punto de enganche marcado como placeholder en `main.js`, función `initWhatsAppButtons`).

## Convenciones de trabajo

- **Commits:** prefijo por tipo — `feat:`, `fix:`, `style:`, `docs:` — sirve como bitácora del proceso iterativo para la documentación académica del proyecto.
- **Ramas:** por ahora se trabaja directo en `main` (proyecto unipersonal). Si se prueba algo grande/riesgoso, crear una rama tipo `feature/nombre-corto` y fusionar a `main` solo cuando esté listo (Railway redespliega automáticamente en cada push a `main` una vez conectado).
- Antes de cambiar la paleta, tipografía o estructura de secciones, revisa si el cambio choca con alguna decisión de la sección anterior — si no estás seguro, pregunta en vez de asumir.
