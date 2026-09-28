/* =========================================================
   CREATIVA ACADEMIA — JavaScript vanilla
   Sin dependencias externas. Progressive enhancement:
   el sitio funciona (contenido, navegación por anclas,
   acordeón FAQ) incluso si JS no llega a cargar.
   ========================================================= */
(function () {
  "use strict";

  /* ---------- Configuración del negocio ---------- */
  // Número de WhatsApp Business en formato internacional (Ecuador +593),
  // tomado del flyer oficial de Creativa Academia.
  var WHATSAPP_NUMBER = "593999922186";
  var DEFAULT_MESSAGE =
    "¡Hola Creativa Academia! 🎨🎵 Quiero agendar mi clase de prueba GRATIS. ¿Podrían contarme los horarios disponibles?";

  /**
   * Construye una URL válida de wa.me con el mensaje codificado.
   * Validación básica: número solo con dígitos y mensaje no vacío.
   */
  function buildWhatsAppUrl(message) {
    var digitsOnly = WHATSAPP_NUMBER.replace(/\D/g, "");
    var safeMessage = (message && message.trim().length > 0)
      ? message.trim()
      : DEFAULT_MESSAGE;

    if (digitsOnly.length < 10) {
      // Salvaguarda: si el número no es válido, no rompemos el enlace,
      // simplemente devolvemos el mensaje sin destinatario.
      console.warn("Número de WhatsApp inválido, revisa WHATSAPP_NUMBER.");
      return "https://wa.me/?text=" + encodeURIComponent(safeMessage);
    }
    return "https://wa.me/" + digitsOnly + "?text=" + encodeURIComponent(safeMessage);
  }

  function initWhatsAppButtons() {
    var buttons = document.querySelectorAll(".js-whatsapp-cta");

    buttons.forEach(function (btn) {
      var discipline = btn.getAttribute("data-discipline");
      var message = discipline
        ? "¡Hola Creativa Academia! 🎨🎵 Quiero información sobre las clases de " + discipline + ". ¿Podrían contarme los horarios disponibles?"
        : DEFAULT_MESSAGE;

      btn.setAttribute("href", buildWhatsAppUrl(message));
      btn.setAttribute("target", "_blank");
      btn.setAttribute("rel", "noopener noreferrer");
      btn.addEventListener("click", function () {
        // Placeholder de analítica: aquí se podría conectar Google Analytics /
        // Meta Pixel para medir conversión por sección (data-source).
        var source = btn.getAttribute("data-source") || "desconocido";
        console.log("[CTA WhatsApp] click desde sección:", source);
      });
    });
  }

  /* ---------- Menú móvil ---------- */
  function initMobileNav() {
    var toggle = document.getElementById("nav-toggle");
    var nav = document.getElementById("main-nav");
    if (!toggle || !nav) return;

    function closeNav() {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
    function toggleNav() {
      var isOpen = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(isOpen));
    }

    toggle.addEventListener("click", toggleNav);

    nav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* ---------- Animaciones al hacer scroll ----------
     Usa IntersectionObserver como método principal, con un
     respaldo manual (scroll/resize) por si un salto de ancla
     instantáneo (p. ej. con "prefers-reduced-motion") deja
     algún elemento sin activarse: el contenido nunca debe
     quedar invisible de forma permanente. */
  function initScrollReveal() {
    var items = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
    if (!items.length) return;

    if (!("IntersectionObserver" in window)) {
      items.forEach(function (el) { el.classList.add("is-visible"); });
      return;
    }

    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px 0px 0px" }
    );
    items.forEach(function (el) { observer.observe(el); });

    // Respaldo manual, throttled con requestAnimationFrame.
    var ticking = false;
    function manualCheck() {
      var vh = window.innerHeight;
      items.forEach(function (el) {
        if (el.classList.contains("is-visible")) return;
        var rect = el.getBoundingClientRect();
        if (rect.top < vh && rect.bottom > 0) {
          el.classList.add("is-visible");
          observer.unobserve(el);
        }
      });
      ticking = false;
    }
    function requestCheck() {
      if (!ticking) { ticking = true; requestAnimationFrame(manualCheck); }
    }
    window.addEventListener("scroll", requestCheck, { passive: true });
    window.addEventListener("resize", requestCheck);
    window.addEventListener("load", manualCheck);
    // Chequeo inicial por si la página ya carga con contenido a la vista.
    manualCheck();
    // Último respaldo: garantiza visibilidad aunque falle todo lo anterior.
    setTimeout(function () {
      items.forEach(function (el) { el.classList.add("is-visible"); });
    }, 4000);
  }

  /* ---------- Carrusel simple de testimonios (solo móvil) ---------- */
  function initTestimonialDots() {
    var track = document.getElementById("testimonials-track");
    var dotsWrap = document.getElementById("testimonial-dots");
    if (!track || !dotsWrap) return;

    var cards = track.querySelectorAll(".testimonial-card");
    if (!cards.length) return;

    cards.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Ver testimonio " + (i + 1));
      if (i === 0) dot.classList.add("is-active");
      dot.addEventListener("click", function () {
        cards[i].scrollIntoView({ behavior: "smooth", inline: "start", block: "nearest" });
      });
      dotsWrap.appendChild(dot);
    });

    var dots = dotsWrap.querySelectorAll("button");

    if ("IntersectionObserver" in window) {
      var trackObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var idx = Array.prototype.indexOf.call(cards, entry.target);
              dots.forEach(function (d, i) { d.classList.toggle("is-active", i === idx); });
            }
          });
        },
        { root: track, threshold: 0.6 }
      );
      cards.forEach(function (c) { trackObserver.observe(c); });
    }
  }

  /* ---------- Galería de fotos en la bola del hero ---------- */
  function initHeroOrbGallery() {
    var wrap = document.querySelector(".hero-orb-wrap");
    var gallery = document.getElementById("hero-orb-gallery");
    var dotsWrap = document.getElementById("hero-orb-dots");
    if (!wrap || !gallery || !dotsWrap) return;

    var slides = gallery.querySelectorAll(".hero-orb-slide");
    if (slides.length < 2) return;

    var current = 0;
    var timer = null;

    slides.forEach(function (_, i) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("role", "tab");
      dot.setAttribute("aria-label", "Ver foto " + (i + 1) + " de la academia");
      if (i === 0) dot.classList.add("is-active");
      dot.addEventListener("click", function () {
        goTo(i);
        restart();
      });
      dotsWrap.appendChild(dot);
    });
    var dots = dotsWrap.querySelectorAll("button");

    function goTo(index) {
      slides[current].classList.remove("is-active");
      dots[current].classList.remove("is-active");
      current = index;
      slides[current].classList.add("is-active");
      dots[current].classList.add("is-active");
    }
    function start() {
      timer = setInterval(function () { goTo((current + 1) % slides.length); }, 4000);
    }
    function stop() { clearInterval(timer); }
    function restart() { stop(); start(); }

    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      start();
      wrap.addEventListener("mouseenter", stop);
      wrap.addEventListener("mouseleave", start);
    }
  }

  /* ---------- Header: sombra al hacer scroll ---------- */
  function initHeaderScrollState() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    function onScroll() {
      header.style.boxShadow = window.scrollY > 8
        ? "0 6px 20px rgba(75,63,174,0.12)"
        : "none";
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Offset dinámico del menú móvil ----------
     Calcula la altura real de la barra de anuncio + header
     (puede variar si el texto se envuelve en pantallas muy
     angostas) y la expone como variable CSS --nav-top. */
  function initHeaderOffsets() {
    var wrap = document.getElementById("header-wrap");
    if (!wrap) return;
    function updateOffset() {
      document.documentElement.style.setProperty("--nav-top", wrap.offsetHeight + "px");
    }
    updateOffset();
    window.addEventListener("resize", updateOffset);
    window.addEventListener("orientationchange", updateOffset);
  }

  /* ---------- Año dinámico en el footer ---------- */
  function initFooterYear() {
    var yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();
  }

  /* ---------- Mapa de Google en fachada (carga solo al hacer clic) ----------
     Evita pedir los recursos de Google Maps mientras el usuario no lo pide
     explícitamente: reduce peso inicial de página y llamadas a terceros. */
  function initMapFacade() {
    var facade = document.getElementById("map-facade");
    var btn = document.getElementById("map-facade-btn");
    if (!facade || !btn) return;

    btn.addEventListener("click", function () {
      var iframe = document.createElement("iframe");
      iframe.src = facade.getAttribute("data-map-src");
      iframe.title = "Ubicación de Creativa Academia en el mapa";
      iframe.loading = "eager";
      iframe.referrerPolicy = "no-referrer-when-downgrade";
      iframe.allowFullscreen = true;
      facade.innerHTML = "";
      facade.appendChild(iframe);
    });
  }

  /* ---------- Init ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    initWhatsAppButtons();
    initMobileNav();
    initScrollReveal();
    initTestimonialDots();
    initHeroOrbGallery();
    initHeaderScrollState();
    initHeaderOffsets();
    initFooterYear();
    initMapFacade();
  });
})();
