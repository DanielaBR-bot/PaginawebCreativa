/* =========================================================
   CREATIVA ACADEMIA — Build de producción
   Copia public/ a dist/ y minifica CSS/JS con esbuild. No afecta
   el desarrollo local: "npm run dev" sigue sirviendo public/ tal
   cual, sin build. Railway (Nixpacks) corre "npm run build"
   automáticamente antes de "npm start".

   Uso:
     node scripts/build.js
   ========================================================= */
const fs = require("fs");
const path = require("path");
const esbuild = require("esbuild");

const SRC_DIR = path.join(__dirname, "..", "public");
const DIST_DIR = path.join(__dirname, "..", "dist");

function copyRecursive(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  // fs.statSync (no readdir withFileTypes) porque en carpetas
  // sincronizadas con OneDrive los Dirent.isDirectory() de
  // readdirSync a veces reportan mal por los reparse points de
  // "Files On-Demand".
  for (const name of fs.readdirSync(src)) {
    const srcPath = path.join(src, name);
    const destPath = path.join(dest, name);
    if (fs.statSync(srcPath).isDirectory()) {
      copyRecursive(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

async function main() {
  fs.rmSync(DIST_DIR, { recursive: true, force: true });
  copyRecursive(SRC_DIR, DIST_DIR);

  const cssPath = path.join(DIST_DIR, "css", "styles.css");
  const cssBefore = fs.statSync(cssPath).size;
  const cssResult = await esbuild.transform(fs.readFileSync(cssPath, "utf8"), {
    loader: "css",
    minify: true,
  });
  fs.writeFileSync(cssPath, cssResult.code);
  console.log(`css/styles.css: ${cssBefore} -> ${cssResult.code.length} bytes`);

  const jsPath = path.join(DIST_DIR, "js", "main.js");
  const jsBefore = fs.statSync(jsPath).size;
  const jsResult = await esbuild.transform(fs.readFileSync(jsPath, "utf8"), {
    loader: "js",
    minify: true,
  });
  fs.writeFileSync(jsPath, jsResult.code);
  console.log(`js/main.js: ${jsBefore} -> ${jsResult.code.length} bytes`);

  console.log(`\nListo: dist/ generado a partir de public/.`);
}

main();
