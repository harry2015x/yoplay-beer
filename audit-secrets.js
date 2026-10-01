/**
 * audit-secrets.js
 * ------------------------------------------------------------
 * Auditoría de SOLO LECTURA para detectar posibles claves,
 * tokens o secretos hardcodeados en el código fuente.
 * No modifica, renombra ni elimina ningún archivo.
 *
 * Revisa:
 *   1) Patrones comunes de claves/tokens (API keys de AWS,
 *      Stripe, Google, JWT, claves privadas RSA, etc.)
 *   2) Variables sospechosas con valores hardcodeados
 *      (password =, secret =, apiKey =, etc. seguidos de
 *      un string literal, no de process.env.X)
 *   3) Si existe un archivo .env y si está (o no) en .gitignore
 *
 * Uso (desde la raíz del proyecto, junto a package.json):
 *   node audit-secrets.js
 * ------------------------------------------------------------
 */

const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const IGNORE_DIRS = new Set(["node_modules", ".next", ".git", "dist", "build", "coverage"]);
const EXTS = [".ts", ".tsx", ".js", ".jsx", ".json", ".env", ".yml", ".yaml"];

function listFilesRecursive(dir, exts) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (IGNORE_DIRS.has(entry.name)) continue;

    const full = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      results = results.concat(listFilesRecursive(full, exts));
    } else if (exts.some((ext) => entry.name.endsWith(ext)) || entry.name === ".env") {
      results.push(full);
    }
  }

  return results;
}

function seccion(titulo) {
  console.log(`\n=== ${titulo} ===`);
}

// ------------------------------------------------------------
// Patrones de claves/tokens conocidos
// ------------------------------------------------------------

const PATRONES = [
  { nombre: "AWS Access Key ID", regex: /AKIA[0-9A-Z]{16}/g },
  { nombre: "AWS Secret Key (heurística)", regex: /aws(.{0,20})?['"][0-9a-zA-Z\/+]{40}['"]/gi },
  { nombre: "Stripe Live Key", regex: /sk_live_[0-9a-zA-Z]{24,}/g },
  { nombre: "Stripe Test Key", regex: /sk_test_[0-9a-zA-Z]{24,}/g },
  { nombre: "Google API Key", regex: /AIza[0-9A-Za-z\-_]{35}/g },
  { nombre: "Slack Token", regex: /xox[baprs]-[0-9a-zA-Z-]{10,}/g },
  { nombre: "GitHub Token", regex: /gh[pousr]_[0-9A-Za-z]{36,}/g },
  { nombre: "Firebase / JWT-like", regex: /eyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}/g },
  { nombre: "Clave privada RSA/PEM", regex: /-----BEGIN (RSA |EC |)PRIVATE KEY-----/g },
  { nombre: "Supabase/Postgres URL con password", regex: /postgres(ql)?:\/\/[^:]+:[^@]+@/g },
  { nombre: "Mongo URI con password", regex: /mongodb(\+srv)?:\/\/[^:]+:[^@]+@/g },
];

// Variables sospechosas asignadas a un string literal directamente
const VAR_SOSPECHOSA = /(api[_-]?key|apikey|secret|token|password|passwd|client[_-]?secret)\s*[:=]\s*["'`][^"'`\s]{6,}["'`]/gi;

seccion("1) Buscando patrones de claves/tokens conocidos");

const archivos = listFilesRecursive(ROOT, EXTS);
let totalHallazgos = 0;

for (const file of archivos) {
  const rel = path.relative(ROOT, file);
  const contenido = fs.readFileSync(file, "utf8");

  for (const { nombre, regex } of PATRONES) {
    const matches = contenido.match(regex);
    if (matches) {
      totalHallazgos += matches.length;
      console.log(`  ❌ [${nombre}] en ${rel} (${matches.length} coincidencia/s)`);
    }
  }
}

if (totalHallazgos === 0) {
  console.log("  No se encontraron patrones conocidos de claves/tokens.");
}

// ------------------------------------------------------------
// Variables sospechosas hardcodeadas
// ------------------------------------------------------------

seccion("2) Buscando variables tipo secret/password/apiKey con valor hardcodeado");

let sospechosos = 0;

for (const file of archivos) {
  // Los archivos .env son EL lugar correcto para tener claves, se listan aparte
  if (path.basename(file) === ".env" || file.endsWith(".env")) continue;

  const rel = path.relative(ROOT, file);
  const contenido = fs.readFileSync(file, "utf8");
  const matches = [...contenido.matchAll(VAR_SOSPECHOSA)];

  for (const m of matches) {
    // Evita falsos positivos obvios: process.env.X, import.meta.env.X, placeholders
    const linea = m[0];
    if (/process\.env|import\.meta\.env|YOUR_|xxxx|<.*>|\$\{/.test(linea)) continue;

    sospechosos++;
    console.log(`  ⚠️  ${rel}: ${linea.trim()}`);
  }
}

if (sospechosos === 0) {
  console.log("  No se encontraron asignaciones sospechosas de claves hardcodeadas.");
}

// ------------------------------------------------------------
// Verificación de archivos .env y .gitignore
// ------------------------------------------------------------

seccion("3) Verificando archivos .env y .gitignore");

const envFiles = fs
  .readdirSync(ROOT)
  .filter((f) => f === ".env" || f.startsWith(".env."));

if (envFiles.length === 0) {
  console.log("  No se encontró ningún archivo .env en la raíz.");
} else {
  console.log(`  Archivos .env encontrados: ${envFiles.join(", ")}`);

  const gitignorePath = path.join(ROOT, ".gitignore");
  const gitignoreContenido = fs.existsSync(gitignorePath)
    ? fs.readFileSync(gitignorePath, "utf8")
    : "";

  for (const envFile of envFiles) {
    const cubierto =
      gitignoreContenido.includes(envFile) ||
      gitignoreContenido.split(/\r?\n/).some((line) => {
        const l = line.trim();
        return l === ".env" || l === ".env*" || l === "*.env";
      });

    if (cubierto) {
      console.log(`  ✅ ${envFile} está protegido por .gitignore`);
    } else {
      console.log(`  ❌ ${envFile} NO parece estar en .gitignore — riesgo de subirlo a git`);
    }
  }
}

seccion("Auditoría de secretos completa — no se modificó ningún archivo");
