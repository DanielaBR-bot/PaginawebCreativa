# Creativa Academia — Landing Page

Landing page de una sola página para Creativa Academia (arte y música para niños, jóvenes y adultos). Sitio 100% estático: **HTML5 + CSS + JavaScript vanilla**, sin frameworks ni backend.

## Estructura del proyecto

```
├── index.html          # Toda la estructura de la página
├── css/styles.css      # Estilos (mobile-first, paleta de marca)
├── js/main.js          # Menú móvil, CTA de WhatsApp, FAQ, animaciones al hacer scroll
├── assets/             # Logos, favicons e íconos (optimizados)
├── manifest.json       # Manifest PWA (ícono al agregar a inicio en móvil)
├── package.json        # Solo se usa para servir el sitio en local/Railway (ver abajo)
└── .gitignore
```

No hay build step: `index.html` funciona abriéndolo directamente en el navegador. `package.json` existe únicamente para tener un comando estándar que sirva los archivos estáticos en local y en Railway.

## Ejecutar en local (VS Code)

**Opción A — sin Node, más simple:**
Instala la extensión **Live Server** en VS Code, clic derecho sobre `index.html` → "Open with Live Server".

**Opción B — con Node (recomendada, es la misma forma en que corre en Railway):**

```bash
npm install
npm run dev
```

Abre `http://localhost:3000`.

## Control de versiones con Git y GitHub

```bash
git init
git add .
git commit -m "feat: landing page inicial de Creativa Academia"
git branch -M main
git remote add origin https://github.com/<tu-usuario>/creativa-academia-landing.git
git push -u origin main
```

Sugerencia para la bitácora del proyecto (Fase 2/3 de tu planificación): usa mensajes de commit descriptivos por tipo de cambio, por ejemplo:

- `feat:` una sección o funcionalidad nueva
- `fix:` una corrección (bug, contraste, responsive)
- `style:` cambios visuales sin afectar funcionalidad
- `docs:` cambios en este README o documentación

Ese historial de commits sirve como evidencia del proceso de desarrollo asistido por IA descrito en tu documentación (Fase 2: "Generación, optimización y refactorización de código asistida por Claude Code").

## Despliegue en Railway

1. Sube el proyecto a GitHub (pasos de arriba).
2. En [railway.app](https://railway.app), inicia sesión con tu cuenta de GitHub.
3. **New Project → Deploy from GitHub repo** → selecciona `creativa-academia-landing`.
4. Railway detecta automáticamente que es un proyecto Node (por `package.json`), instala dependencias (`npm install`) y ejecuta `npm start`, que sirve el sitio en el puerto que Railway asigna (`$PORT`).
5. Railway genera automáticamente un dominio `https://tuproyecto.up.railway.app` con **certificado SSL/HTTPS incluido**, sin configuración adicional.
6. (Opcional) En **Settings → Networking → Custom Domain** puedes conectar un dominio propio si lo compras más adelante.
7. A partir de aquí, cada `git push` a `main` dispara automáticamente un nuevo despliegue (CI/CD).

## Antes de publicar

- Reemplaza los testimonios de ejemplo (`index.html`, sección `#testimonios`) por testimonios reales y quita la etiqueta "Testimonio de ejemplo".
- Verifica el número de WhatsApp Business en `js/main.js` (constante `WHATSAPP_NUMBER`).
- Si agregas Facebook, añade el enlace en el footer de `index.html`.
