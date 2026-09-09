import { NextRequest, NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

import type { RolUsuario, PerfilUsuario } from "../../../hooks/useAuth";
import type {
  EdicionUsuarioInput,
  NuevoUsuarioInput,
} from "../../../types/usuarios";

// ============================================================
// CLIENTE ADMINISTRATIVO (SOLO SERVIDOR)
// ============================================================
// Usa la Service Role Key. Este archivo corre únicamente en el
// servidor (Route Handler de Next.js) y NUNCA debe exportar este
// cliente hacia el navegador.

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

function crearClienteAdmin(): SupabaseClient {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    throw new Error(
      "Faltan las variables de entorno de Supabase para el servidor."
    );
  }

  return createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

const ROLES_VALIDOS: RolUsuario[] = ["administrador", "vendedor"];

// ============================================================
// VERIFICAR QUE QUIEN LLAMA ES UN ADMINISTRADOR ACTIVO
// ============================================================

type ResultadoVerificacion =
  | {
      autorizado: true;
      perfilAdmin: PerfilUsuario;
      adminClient: SupabaseClient;
    }
  | {
      autorizado: false;
      status: number;
      mensaje: string;
    };

async function verificarAdministrador(
  request: NextRequest
): Promise<ResultadoVerificacion> {
  const encabezadoAuth = request.headers.get("authorization");

  const token = encabezadoAuth?.startsWith("Bearer ")
    ? encabezadoAuth.slice("Bearer ".length)
    : null;

  if (!token) {
    return {
      autorizado: false,
      status: 401,
      mensaje: "No se encontró una sesión válida.",
    };
  }

  let adminClient: SupabaseClient;

  try {
    adminClient = crearClienteAdmin();
  } catch (excepcion) {
    console.error("Error creando cliente administrativo:", excepcion);

    return {
      autorizado: false,
      status: 500,
      mensaje: "Error de configuración del servidor.",
    };
  }

  const { data: datosUsuario, error: errorUsuario } =
    await adminClient.auth.getUser(token);

  if (errorUsuario || !datosUsuario.user) {
    return {
      autorizado: false,
      status: 401,
      mensaje: "No se encontró una sesión válida.",
    };
  }

  const { data: perfil, error: errorPerfil } = await adminClient
    .from("profiles")
    .select("*")
    .eq("id", datosUsuario.user.id)
    .single();

  if (errorPerfil || !perfil) {
    return {
      autorizado: false,
      status: 403,
      mensaje: "No tienes permisos para realizar esta acción.",
    };
  }

  const perfilAdmin = perfil as PerfilUsuario;

  if (!perfilAdmin.activo || perfilAdmin.rol !== "administrador") {
    return {
      autorizado: false,
      status: 403,
      mensaje: "No tienes permisos para realizar esta acción.",
    };
  }

  return {
    autorizado: true,
    perfilAdmin,
    adminClient,
  };
}

// ============================================================
// POST — CREAR USUARIO
// ============================================================

export async function POST(request: NextRequest) {
  const verificacion = await verificarAdministrador(request);

  if (!verificacion.autorizado) {
    return NextResponse.json(
      { ok: false, mensaje: verificacion.mensaje },
      { status: verificacion.status }
    );
  }

  const { adminClient } = verificacion;

  let body: Partial<NuevoUsuarioInput>;

  try {
    body = (await request.json()) as Partial<NuevoUsuarioInput>;
  } catch {
    return NextResponse.json(
      { ok: false, mensaje: "Datos inválidos." },
      { status: 400 }
    );
  }

  const nombre = (body.nombre ?? "").trim();
  const email = (body.email ?? "").trim().toLowerCase();
  const password = body.password ?? "";
  const rol = body.rol;
  const activo = body.activo ?? true;

  // --------------------------------------------------------
  // VALIDACIONES DE BACKEND
  // --------------------------------------------------------

  if (nombre.length < 2) {
    return NextResponse.json(
      { ok: false, mensaje: "El nombre debe tener al menos 2 caracteres." },
      { status: 400 }
    );
  }

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  if (!emailValido) {
    return NextResponse.json(
      { ok: false, mensaje: "El correo electrónico no es válido." },
      { status: 400 }
    );
  }

  if (password.length < 6) {
    return NextResponse.json(
      {
        ok: false,
        mensaje: "La contraseña debe tener al menos 6 caracteres.",
      },
      { status: 400 }
    );
  }

  if (!rol || !ROLES_VALIDOS.includes(rol)) {
    return NextResponse.json(
      { ok: false, mensaje: "El rol seleccionado no es válido." },
      { status: 400 }
    );
  }

  // --------------------------------------------------------
  // 1. CREAR EN SUPABASE AUTH
  // --------------------------------------------------------

  const { data: nuevoUsuarioAuth, error: errorCreacion } =
    await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (errorCreacion || !nuevoUsuarioAuth.user) {
    console.error(
      "Error creando usuario en Auth:",
      errorCreacion?.message
    );

    const yaExiste =
      errorCreacion?.message
        ?.toLowerCase()
        .includes("already registered") ||
      errorCreacion?.status === 422;

    return NextResponse.json(
      {
        ok: false,
        mensaje: yaExiste
          ? "Ya existe un usuario con este correo."
          : "No fue posible crear el usuario.",
      },
      { status: yaExiste ? 409 : 500 }
    );
  }

  const nuevoId = nuevoUsuarioAuth.user.id;

  // --------------------------------------------------------
  // 2. CREAR PERFIL EN profiles
  // --------------------------------------------------------

  const { data: nuevoPerfil, error: errorPerfil } = await adminClient
    .from("profiles")
    .insert({
      id: nuevoId,
      nombre,
      email,
      rol,
      activo,
    })
    .select("*")
    .single();

  if (errorPerfil || !nuevoPerfil) {
    console.error("Error creando perfil:", errorPerfil?.message);

    // Revertir el usuario de Auth para no dejar cuentas huérfanas
    await adminClient.auth.admin.deleteUser(nuevoId);

    return NextResponse.json(
      { ok: false, mensaje: "No fue posible crear el usuario." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    usuario: nuevoPerfil as PerfilUsuario,
  });
}

// ============================================================
// PATCH — EDITAR USUARIO / ACTIVAR / DESACTIVAR
// ============================================================

export async function PATCH(request: NextRequest) {
  const verificacion = await verificarAdministrador(request);

  if (!verificacion.autorizado) {
    return NextResponse.json(
      { ok: false, mensaje: verificacion.mensaje },
      { status: verificacion.status }
    );
  }

  const { adminClient, perfilAdmin } = verificacion;

  let body: Partial<EdicionUsuarioInput>;

  try {
    body = (await request.json()) as Partial<EdicionUsuarioInput>;
  } catch {
    return NextResponse.json(
      { ok: false, mensaje: "Datos inválidos." },
      { status: 400 }
    );
  }

  const id = body.id;

  if (!id) {
    return NextResponse.json(
      { ok: false, mensaje: "Falta el identificador del usuario." },
      { status: 400 }
    );
  }

  const cambios: {
    nombre?: string;
    rol?: RolUsuario;
    activo?: boolean;
  } = {};

  if (typeof body.nombre === "string") {
    const nombreLimpio = body.nombre.trim();

    if (nombreLimpio.length < 2) {
      return NextResponse.json(
        {
          ok: false,
          mensaje: "El nombre debe tener al menos 2 caracteres.",
        },
        { status: 400 }
      );
    }

    cambios.nombre = nombreLimpio;
  }

  if (typeof body.rol === "string") {
    if (!ROLES_VALIDOS.includes(body.rol)) {
      return NextResponse.json(
        { ok: false, mensaje: "El rol seleccionado no es válido." },
        { status: 400 }
      );
    }

    // Un administrador no puede quitarse su propio rol de administrador
    if (id === perfilAdmin.id && body.rol !== "administrador") {
      return NextResponse.json(
        {
          ok: false,
          mensaje: "No puedes cambiar tu propio rol de administrador.",
        },
        { status: 400 }
      );
    }

    cambios.rol = body.rol;
  }

  if (typeof body.activo === "boolean") {
    // Un administrador no puede desactivarse a sí mismo
    if (id === perfilAdmin.id && body.activo === false) {
      return NextResponse.json(
        {
          ok: false,
          mensaje: "No puedes desactivar tu propio usuario.",
        },
        { status: 400 }
      );
    }

    cambios.activo = body.activo;
  }

  if (Object.keys(cambios).length === 0) {
    return NextResponse.json(
      { ok: false, mensaje: "No hay cambios para aplicar." },
      { status: 400 }
    );
  }

  const { data: usuarioActualizado, error: errorActualizacion } =
    await adminClient
      .from("profiles")
      .update(cambios)
      .eq("id", id)
      .select("*")
      .single();

  if (errorActualizacion || !usuarioActualizado) {
    console.error(
      "Error actualizando usuario:",
      errorActualizacion?.message
    );

    return NextResponse.json(
      { ok: false, mensaje: "No fue posible actualizar el usuario." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    ok: true,
    usuario: usuarioActualizado as PerfilUsuario,
  });
}
