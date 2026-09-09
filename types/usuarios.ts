import type { RolUsuario } from "../hooks/useAuth";

// ============================================================
// FILTROS DE LA INTERFAZ
// ============================================================

export type FiltroRolUsuario = "todos" | RolUsuario;

export type FiltroEstadoUsuario = "todos" | "activos" | "inactivos";

// ============================================================
// ENTRADAS PARA CREAR / EDITAR USUARIOS
// ============================================================

export type NuevoUsuarioInput = {
  nombre: string;
  email: string;
  password: string;
  rol: RolUsuario;
  activo: boolean;
};

export type EdicionUsuarioInput = {
  id: string;
  nombre?: string;
  rol?: RolUsuario;
  activo?: boolean;
};

// ============================================================
// RESUMEN PARA LAS TARJETAS
// ============================================================

export type ResumenUsuarios = {
  total: number;
  administradores: number;
  vendedores: number;
  activos: number;
};

// ============================================================
// RESPUESTAS DE LA API /api/usuarios
// ============================================================

export type UsuarioApiExito = {
  ok: true;
  usuario: {
    id: string;
    nombre: string;
    email: string;
    rol: RolUsuario;
    activo: boolean;
    created_at: string;
  };
};

export type UsuarioApiError = {
  ok: false;
  mensaje: string;
};

export type UsuarioApiRespuesta = UsuarioApiExito | UsuarioApiError;

// ============================================================
// UTILIDAD DE FECHA (mismo criterio que formatoCOP en types/mesas.ts)
// ============================================================

export function formatoFechaCO(fechaIso: string): string {
  const fecha = new Date(fechaIso);

  return fecha.toLocaleDateString("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
