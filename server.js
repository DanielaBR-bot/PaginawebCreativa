/* =========================================================
   CREATIVA ACADEMIA — Servidor estático de producción
   Reemplaza a "serve" para poder controlar: 404 real, cabeceras
   de seguridad, caché y compresión. El sitio en sí sigue siendo
   HTML/CSS/JS estático — esto solo decide cómo Node lo entrega.
   ========================================================= */
const path = require("path");
const express = require("express");
const helmet = require("helmet");
const compression = require("compression");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

// Railway (y la mayoría de plataformas) terminan TLS en su proxy y
// reenvían la petición por HTTP interno, indicando el protocolo
// original en X-Forwarded-Proto. Sin esto, req.secure siempre sería
// false y la redirección a HTTPS de abajo entraría en bucle.
app.set("trust proxy", 1);

// ---------- Redirección forzada a HTTPS ----------
// Solo en producción: en local (npm run dev) no hay proxy ni HTTPS.
app.use((req, res, next) => {
  if (process.env.NODE_ENV === "production" && req.headers["x-forwarded-proto"] === "http") {
    return res.redirect(301, "https://" + req.headers.host + req.originalUrl);
  }
  next();
});

// ---------- Cabeceras de seguridad ----------
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
        // El mapa de Google Maps va incrustado en un <iframe>.
        frameSrc: ["https://www.google.com"],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        // Los botones de WhatsApp son <a href="https://wa.me/..."> normales
        // (navegación del navegador), no fetch/XHR, así que no necesitan
        // entrar en ninguna directiva de CSP.
        upgradeInsecureRequests: [],
      },
    },
    hsts: {
      maxAge: 63072000, // 2 años
      includeSubDomains: true,
      preload: true,
    },
    referrerPolicy: { policy: "strict-origin-when-cross-origin" },
    // X-Frame-Options y X-Content-Type-Options quedan con el default de helmet
    // (SAMEORIGIN y nosniff respectivamente).
  })
);
app.use((req, res, next) => {
  res.setHeader(
    "Permissions-Policy",
    "geolocation=(), camera=(), microphone=(), payment=(), usb=(), interest-cohort=()"
  );
  next();
});

app.use(compression());

// ---------- URLs limpias para páginas legales ----------
// Evita contenido duplicado: la versión .html redirige a la URL canónica.
const CLEAN_ROUTES = {
  "/politica-de-privacidad": "politica-de-privacidad.html",
  "/terminos-y-condiciones": "terminos-y-condiciones.html",
};
Object.entries(CLEAN_ROUTES).forEach(([route, file]) => {
  app.get(route, (req, res) => res.sendFile(path.join(ROOT, file)));
  app.get(route + ".html", (req, res) => res.redirect(301, route));
});

// ---------- Archivos estáticos ----------
app.use(
  express.static(ROOT, {
    extensions: ["html"],
    setHeaders(res, filePath) {
      if (filePath.endsWith(".html")) {
        // El contenido puede cambiar en cualquier deploy: revalidar siempre.
        res.setHeader("Cache-Control", "no-cache");
      } else if (filePath.includes(`${path.sep}assets${path.sep}`)) {
        res.setHeader("Cache-Control", "public, max-age=604800"); // 7 días
      } else {
        res.setHeader("Cache-Control", "public, max-age=86400"); // 1 día
      }
    },
  })
);

// ---------- 404 real ----------
app.use((req, res) => {
  res.status(404).sendFile(path.join(ROOT, "404.html"));
});

app.listen(PORT, () => {
  console.log(`Creativa Academia sirviendo en el puerto ${PORT}`);
});
