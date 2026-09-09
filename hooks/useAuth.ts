"use client";

import { useCallback, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";

import { supabase } from "../lib/supabase";

// ============================================================
// TIPOS
// ============================================================

export type RolUsuario = "administrador" | "vendedor";

export type PerfilUsuario = {
  id: string;
  nombre: string;
  email: string;
  rol: RolUsuario;
  activo: boolean;
  created_at: string;
};

export type UseAuthResult = {
  usuario: User | null;
  perfil: PerfilUsuario | null;
  cargando: boolean;
  error: string | null;

  iniciarSesion: (
    email: string,
    password: string
  ) => Promise<boolean>;

  cerrarSesion: () => Promise<void>;

  limpiarError: () => void;
};

// ============================================================
// HOOK
// ============================================================

export function useAuth(): UseAuthResult {
  const [usuario, setUsuario] = useState<User | null>(null);

  const [perfil, setPerfil] =
    useState<PerfilUsuario | null>(null);

  const [cargando, setCargando] = useState(true);

  const [error, setError] =
    useState<string | null>(null);

  // ============================================================
  // CARGAR PERFIL
  // ============================================================

  const cargarPerfil = useCallback(
    async (usuarioId: string) => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", usuarioId)
        .single();

      if (error) {
        console.error(
          "Error cargando perfil:",
          error.message
        );

        setPerfil(null);

        return null;
      }

      const perfilData = data as PerfilUsuario;

      setPerfil(perfilData);

      return perfilData;
    },
    []
  );

  // ============================================================
  // CARGAR SESIÓN ACTUAL
  // ============================================================

  useEffect(() => {
    let activo = true;

    async function cargarSesion() {
      setCargando(true);

      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!activo) return;

      if (session?.user) {
        setUsuario(session.user);

        const perfilData =
          await cargarPerfil(session.user.id);

        if (!activo) return;

        // Verificar si el usuario está activo
        if (perfilData && !perfilData.activo) {
          await supabase.auth.signOut();

          setUsuario(null);
          setPerfil(null);

          setError(
            "Este usuario se encuentra desactivado."
          );
        }
      } else {
        setUsuario(null);
        setPerfil(null);
      }

      if (activo) {
        setCargando(false);
      }
    }

    cargarSesion();

    // ============================================================
    // ESCUCHAR CAMBIOS DE AUTENTICACIÓN
    // ============================================================

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (_evento, session: Session | null) => {
        if (!activo) return;

        if (session?.user) {
          setUsuario(session.user);

          await cargarPerfil(session.user.id);
        } else {
          setUsuario(null);
          setPerfil(null);
        }

        if (activo) {
          setCargando(false);
        }
      }
    );

    return () => {
      activo = false;

      subscription.unsubscribe();
    };
  }, [cargarPerfil]);

  // ============================================================
  // INICIAR SESIÓN
  // ============================================================

  const iniciarSesion = useCallback(
    async (
      email: string,
      password: string
    ): Promise<boolean> => {
      setCargando(true);
      setError(null);

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (error) {
        setError(
          "Correo o contraseña incorrectos."
        );

        setCargando(false);

        return false;
      }

      if (!data.user) {
        setError(
          "No fue posible iniciar sesión."
        );

        setCargando(false);

        return false;
      }

      const perfilData =
        await cargarPerfil(data.user.id);

      if (!perfilData) {
        await supabase.auth.signOut();

        setError(
          "Tu usuario no tiene un perfil configurado."
        );

        setCargando(false);

        return false;
      }

      if (!perfilData.activo) {
        await supabase.auth.signOut();

        setError(
          "Este usuario se encuentra desactivado."
        );

        setCargando(false);

        return false;
      }

      setUsuario(data.user);

      setCargando(false);

      return true;
    },
    [cargarPerfil]
  );

  // ============================================================
  // CERRAR SESIÓN
  // ============================================================

  const cerrarSesion = useCallback(async () => {
    setCargando(true);

    await supabase.auth.signOut();

    setUsuario(null);
    setPerfil(null);

    setCargando(false);
  }, []);

  // ============================================================
  // LIMPIAR ERROR
  // ============================================================

  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  // ============================================================

  return {
    usuario,
    perfil,
    cargando,
    error,

    iniciarSesion,
    cerrarSesion,
    limpiarError,
  };
}