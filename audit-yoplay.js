/**
 * audit-yoplay.js
 * ------------------------------------------------------------
 * Auditoría de SOLO LECTURA para el proyecto YOPLAY BEER.
 * No modifica, renombra ni elimina ningún archivo.
 *
 * Revisa:
 *   1) Que cada hooks/useX.ts exporte una función "useX" cuyo
 *      nombre coincida con el nombre del archivo (detecta el
 *      caso exacto de useReportes.ts exportando useUsuarios).
 *   2) Archivos .ts/.tsx con contenido EXACTAMENTE idéntico en
 *      rutas distintas (detecta archivos sobrescritos por
 *      accidente con el contenido de otro).
 *   3) Compila el proyecto con `tsc --noEmit` y muestra el
 *      resultado tal cual.
 *
 * Uso (desde la raíz del proyecto, junto a package.json):
 *   node audit-yoplay.js
 * ------------------------------------------------------------
 */

const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { execSync } = require("child_process");

const ROOT = process.cwd();
const HOOKS_DIR = path.join(ROOT, "hooks");
const IGNORE_DIRS = new Set(["node_modules", ".next", ".git", "dist", "build"]);

function listFilesRecursive(dir, exts) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;

    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results = results.concat(listFilesRecursive(full, exts));
    } else if (exts.some((ext) => entry.name.endsWith(ext))) {
      results.push(full);
    }
  }

  return results;
}

function seccion(titulo) {
  console.log(`\n=== ${titulo} ===`);
}

// ------------------------------------------------------------
// 1) EXPORTS DE hooks/useX.ts
// ------------------------------------------------------------

seccion("1) Verificando exports de hooks/useX.ts");

const hookFiles = fs.existsSync(HOOKS_DIR)
  ? fs.readdirSync(HOOKS_DIR).filter((f) => /^use.*\.(ts|tsx)$/.test(f))
  : [];

if (hookFiles.length === 0) {
  console.log("  (No se encontró la carpeta hooks/ o no tiene archivos useX.ts)");
}

let hookProblemas = 0;

for (const file of hookFiles) {
  const filePath = path.join(HOOKS_DIR, file);
  const nombreEsperado = file.replace(/\.(ts|tsx)$/, "");
  const contenido = fs.readFileSync(filePath, "utf8");

  const exportRegex = /export\s+function\s+(use[A-Za-z0-9_]*)/g;
  const encontrados = [...contenido.matchAll(exportRegex)].map((m) => m[1]);

  if (encontrados.length === 0) {
    console.log(`  ⚠️  ${file}: no se encontró ningún "export function useX(...)"`);
    hookProblemas++;
  } else if (!encontrados.includes(nombreEsperado)) {
    console.log(
      `  ❌ ${file}: se esperaba exportar "${nombreEsperado}" pero se encontró: ${encontrados.join(", ")}`
    );
    hookProblemas++;
  } else {
    console.log(`  ✅ ${file}: exporta "${nombreEsperado}" correctamente`);
  }
}

if (hookProblemas === 0 && hookFiles.length > 0) {
  console.log("  Sin problemas detectados en hooks/.");
}

// ------------------------------------------------------------
// 2) ARCHIVOS CON CONTENIDO DUPLICADO
// ------------------------------------------------------------

seccion("2) Buscando archivos .ts/.tsx con contenido idéntico");

const todosLosArchivos = listFilesRecursive(ROOT, [".ts", ".tsx"]);
const porHash = new Map();

for (const file of todosLosArchivos) {
  const contenido = fs.readFileSync(file, "utf8");
  const hash = crypto.createHash("sha256").update(contenido).digest("hex");

  if (!porHash.has(hash)) porHash.set(hash, []);
  porHash.get(hash).push(path.relative(ROOT, file));
}

let duplicadosEncontrados = 0;

for (const [, archivos] of porHash) {
  if (archivos.length > 1) {
    duplicadosEncontrados++;
    console.log(`  ❌ Contenido idéntico en ${archivos.length} archivos:`);
    archivos.forEach((f) => console.log(`       - ${f}`));
  }
}

if (duplicadosEncontrados === 0) {
  console.log("  No se encontraron archivos con contenido duplicado.");
}

// ------------------------------------------------------------
// 3) COMPILACIÓN
// ------------------------------------------------------------

seccion("3) Compilando con tsc --noEmit");

try {
  execSync("npx tsc --noEmit", { stdio: "inherit" });
  console.log("  ✅ Compilación sin errores.");
} catch (e) {
  console.log("  ❌ La compilación reportó errores (ver arriba).");
}

seccion("Auditoría completa — no se modificó ningún archivo");