"use client";

import { useCallback, useEffect, useState } from "react";

import { supabase } from "../lib/supabase";
import type { PerfilUsuario } from "./useAuth";
import type { Notificacion } from "../types/mesas";
import type {
  EdicionUsuarioInput,
  NuevoUsuarioInput,
  ResumenUsuarios,
  UsuarioApiRespuesta,
} from "../types/usuarios";

// ============================================================
// TIPO DE RESULTADO DEL HOOK
// ============================================================

export type UseUsuariosResult = {
  usuarios: PerfilUsuario[];
  cargando: boolean;
  guardando: boolean;
  error: string | null;
  notificacion: Notificacion | null;
  resumen: ResumenUsuarios;

  cargarUsuarios: () => Promise<void>;
  crearUsuario: (datos: NuevoUsuarioInput) => Promise<boolean>;
  editarUsuario: (datos: EdicionUsuarioInput) => Promise<boolean>;
  cambiarEstadoUsuario: (id: string, activo: boolean) => Promise<boolean>;
  cerrarNotificacion: () => void;
};

// ============================================================
// HOOK
// ============================================================

export function useUsuarios(): UseUsuariosResult {
  const [usuarios, setUsuarios] = useState<PerfilUsuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notificacion, setNotificacion] =
    useState<Notificacion | null>(null);

  // ============================================================
  // NOTIFICACIONES
  // ============================================================

  const mostrarNotificacion = useCallback(
    (tipo: Notificacion["tipo"], mensaje: string) => {
      setNotificacion({ tipo, mensaje });
    },
    []
  );

  const cerrarNotificacion = useCallback(() => {
    setNotificacion(null);
  }, []);

  // ============================================================
  // CARGAR USUARIOS (lectura directa vía Supabase + RLS)
  // ============================================================

  const cargarUsuarios = useCallback(async () => {
    setCargando(true);
    setError(null);

    const { data, error: errorConsulta } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });

    if (errorConsulta) {
      console.error("Error cargando usuarios:", errorConsulta.message);

      setError("No fue posible cargar la lista de usuarios.");
      setUsuarios([]);
      setCargando(false);

      return;
    }

    setUsuarios((data ?? []) as PerfilUsuario[]);
    setCargando(false);
  }, []);

  useEffect(() => {
    cargarUsuarios();
  }, [cargarUsuarios]);

  // ============================================================
  // TOKEN DE SESIÓN (para autorizar la API route)
  // ============================================================

  const obtenerTokenSesion = useCallback(async (): Promise<
    string | null
  > => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    return session?.access_token ?? null;
  }, []);

  // ============================================================
  // CREAR USUARIO
  // ============================================================

  const crearUsuario = useCallback(
    async (datos: NuevoUsuarioInput): Promise<boolean> => {
      setGuardando(true);

      const token = await obtenerTokenSesion();

      if (!token) {
        mostrarNotificacion(
          "error",
          "Tu sesión expiró. Vuelve a iniciar sesión."
        );

        setGuardando(false);

        return false;
      }

      try {
        const respuesta = await fetch("/api/usuarios", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(datos),
        });

        const resultado =
          (await respuesta.json()) as UsuarioApiRespuesta;

        if (!respuesta.ok || !resultado.ok) {
          const mensaje = !resultado.ok
            ? resultado.mensaje
            : "No fue posible crear el usuario.";

          mostrarNotificacion("error", mensaje);
          setGuardando(false);

          return false;
        }

        setUsuarios((actuales) => [
          resultado.usuario as PerfilUsuario,
          ...actuales,
        ]);

        mostrarNotificacion("success", "Usuario creado correctamente.");
        setGuardando(false);

        return true;
      } catch (excepcion) {
        console.error("Error creando usuario:", excepcion);

        mostrarNotificacion("error", "No fue posible crear el usuario.");
        setGuardando(false);

        return false;
      }
    },
    [obtenerTokenSesion, mostrarNotificacion]
  );

  // ============================================================
  // EDITAR USUARIO (nombre / rol / activo)
  // ============================================================

  const editarUsuario = useCallback(
    async (datos: EdicionUsuarioInput): Promise<boolean> => {
      setGuardando(true);

      const token = await obtenerTokenSesion();

      if (!token) {
        mostrarNotificacion(
          "error",
          "Tu sesión expiró. Vuelve a iniciar sesión."
        );

        setGuardando(false);

        return false;
      }

      try {
        const respuesta = await fetch("/api/usuarios", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(datos),
        });

        const resultado =
          (await respuesta.json()) as UsuarioApiRespuesta;

        if (!respuesta.ok || !resultado.ok) {
          const mensaje = !resultado.ok
            ? resultado.mensaje
            : "No fue posible actualizar el usuario.";

          mostrarNotificacion("error", mensaje);
          setGuardando(false);

          return false;
        }

        const usuarioActualizado = resultado.usuario as PerfilUsuario;

        setUsuarios((actuales) =>
          actuales.map((usuarioActual) =>
            usuarioActual.id === usuarioActualizado.id
              ? usuarioActualizado
              : usuarioActual
          )
        );

        mostrarNotificacion(
          "success",
          "Usuario actualizado correctamente."
        );

        setGuardando(false);

        return true;
      } catch (excepcion) {
        console.error("Error editando usuario:", excepcion);

        mostrarNotificacion(
          "error",
          "No fue posible actualizar el usuario."
        );

        setGuardando(false);

        return false;
      }
    },
    [obtenerTokenSesion, mostrarNotificacion]
  );

  // ============================================================
  // ACTIVAR / DESACTIVAR (usa el mismo endpoint de edición)
  // ============================================================

  const cambiarEstadoUsuario = useCallback(
    async (id: string, activo: boolean): Promise<boolean> => {
      const exito = await editarUsuario({ id, activo });

      if (exito) {
        mostrarNotificacion(
          "success",
          activo
            ? "Usuario activado correctamente."
            : "Usuario desactivado correctamente."
        );
      }

      return exito;
    },
    [editarUsuario, mostrarNotificacion]
  );

  // ============================================================
  // RESUMEN DERIVADO
  // ============================================================

  const resumen: ResumenUsuarios = {
    total: usuarios.length,
    administradores: usuarios.filter(
      (usuarioItem) => usuarioItem.rol === "administrador"
    ).length,
    vendedores: usuarios.filter(
      (usuarioItem) => usuarioItem.rol === "vendedor"
    ).length,
    activos: usuarios.filter((usuarioItem) => usuarioItem.activo).length,
  };

  // ============================================================

  return {
    usuarios,
    cargando,
    guardando,
    error,
    notificacion,
    resumen,

    cargarUsuarios,
    crearUsuario,
    editarUsuario,
    cambiarEstadoUsuario,
    cerrarNotificacion,
  };
}
