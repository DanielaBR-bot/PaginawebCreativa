/* =========================================================
   CREATIVA ACADEMIA — Optimizador de imágenes
   Toma las fotos originales de originals/ (fuera de public/, no se
   sirve por HTTP) y genera, en public/assets/, versiones responsive
   en WebP (3 anchos) + un JPG de respaldo para navegadores sin
   soporte WebP.

   Uso:
     node scripts/optimize-images.js

   Para agregar una foto nueva: colócala en originals/ (JPG o PNG,
   en la raíz del proyecto, junto a public/) y vuelve a correr este
   script. No subas fotos sin procesar directamente a public/assets/.
   ========================================================= */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const SRC_DIR = path.join(__dirname, "..", "originals");
const OUT_DIR = path.join(__dirname, "..", "public", "assets");
const WIDTHS = [480, 800, 1200];
const FALLBACK_WIDTH = 1000;
const WEBP_QUALITY = 75;
const JPG_QUALITY = 75;

function formatKB(bytes) {
  return (bytes / 1024).toFixed(1) + " KB";
}

async function processImage(file) {
  const name = path.parse(file).name;
  const srcPath = path.join(SRC_DIR, file);
  const srcSize = fs.statSync(srcPath).size;
  const image = sharp(srcPath);
  const meta = await image.metadata();

  const outputs = [];

  for (const width of WIDTHS) {
    if (width > meta.width) continue; // no agrandar imágenes más chicas que el ancho pedido
    const outPath = path.join(OUT_DIR, `${name}-${width}.webp`);
    await sharp(srcPath).resize({ width }).webp({ quality: WEBP_QUALITY }).toFile(outPath);
    outputs.push(outPath);
  }

  // JPG de respaldo (navegadores sin soporte WebP) al ancho más grande disponible.
  const fallbackWidth = Math.min(FALLBACK_WIDTH, meta.width);
  const fallbackPath = path.join(OUT_DIR, `${name}.jpg`);
  const fallbackInfo = await sharp(srcPath)
    .resize({ width: fallbackWidth })
    .jpeg({ quality: JPG_QUALITY, mozjpeg: true })
    .toFile(fallbackPath);
  outputs.push(fallbackPath);

  const totalOut = outputs.reduce((sum, p) => sum + fs.statSync(p).size, 0);
  console.log(
    `${file}: ${formatKB(srcSize)} original -> ${outputs.length} archivos, ${formatKB(totalOut)} en total ` +
      `(fallback ${fallbackInfo.width}x${fallbackInfo.height})`
  );
}

async function main() {
  if (!fs.existsSync(SRC_DIR)) {
    console.error(`No existe ${SRC_DIR}. Crea la carpeta y coloca ahí las fotos originales.`);
    process.exit(1);
  }
  const files = fs
    .readdirSync(SRC_DIR)
    .filter((f) => /\.(jpe?g|png)$/i.test(f));

  if (!files.length) {
    console.log("No hay imágenes en assets/originals/.");
    return;
  }

  for (const file of files) {
    await processImage(file);
  }
  console.log(`\nListo: ${files.length} foto(s) procesada(s).`);
}

main();
