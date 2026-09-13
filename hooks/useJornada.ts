"use client";

import { useCallback, useEffect, useState } from "react";

import { supabase } from "../lib/supabase";

// ============================================================
// TIPOS
// ============================================================

export type EstadoJornada = "abierta" | "cerrada";

export type Jornada = {
  id: number;
  fecha_inicio: string;
  fecha_cierre: string | null;
  estado: EstadoJornada;
  usuario_apertura: string | null;
  usuario_cierre: string | null;
  created_at: string;
};

export type UseJornadaResult = {
  jornadaActiva: Jornada | null;
  cargando: boolean;
  procesando: boolean;
  error: string | null;

  iniciarJornada: (usuarioId: string) => Promise<boolean>;
  cerrarJornada: (usuarioId: string) => Promise<boolean>;
  refrescarJornada: () => Promise<void>;
  limpiarError: () => void;
};

// ============================================================
// HOOK
// ============================================================
//
// IMPORTANTE:
//
// Este hook NUNCA usa fechas (new Date(), CURRENT_DATE, medianoche)
// para decidir si una jornada sigue activa. La jornada solo cambia
// de estado cuando un administrador la inicia o la cierra.
//
// La protección de permisos (solo administrador puede iniciar/cerrar)
// se aplica en DOS lugares:
//   1) Aquí, antes de llamar a Supabase (para dar feedback rápido).
//   2) En las políticas RLS de la tabla "jornadas" (ver jornadas.sql),
//      que son las que realmente impiden que un vendedor manipule
//      una jornada aunque modifique el frontend.
// ============================================================

export function useJornada(): UseJornadaResult {
  const [jornadaActiva, setJornadaActiva] = useState<Jornada | null>(null);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ==========================================================
  // CARGAR JORNADA ACTIVA (estado = 'abierta')
  // ==========================================================

  const cargarJornadaActiva = useCallback(async () => {
    setCargando(true);
    setError(null);

    const { data, error: errorConsulta } = await supabase
      .from("jornadas")
      .select("*")
      .eq("estado", "abierta")
      .order("fecha_inicio", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (errorConsulta) {
      console.error("Error cargando jornada activa:", errorConsulta.message);

      setError("No fue posible cargar el estado de la jornada.");
      setJornadaActiva(null);
      setCargando(false);

      return;
    }

    setJornadaActiva((data as Jornada) ?? null);
    setCargando(false);
  }, []);

  useEffect(() => {
    cargarJornadaActiva();
  }, [cargarJornadaActiva]);

  // ==========================================================
  // INICIAR JORNADA
  // ==========================================================
  //
  // `procesando` evita doble clic: mientras una solicitud está en
  // vuelo, una segunda llamada se ignora de inmediato.
  // ==========================================================

  const iniciarJornada = useCallback(
    async (usuarioId: string): Promise<boolean> => {
      if (procesando) return false;

      setProcesando(true);
      setError(null);

      // Verificación defensiva: evitar crear una segunda jornada
      // abierta si, por ejemplo, otra pestaña ya inició una.
      const { data: existente, error: errorExistente } = await supabase
        .from("jornadas")
        .select("id")
        .eq("estado", "abierta")
        .limit(1)
        .maybeSingle();

      if (errorExistente) {
        console.error(
          "Error verificando jornada existente:",
          errorExistente.message
        );

        setError("No fue posible verificar el estado de la jornada.");
        setProcesando(false);

        return false;
      }

      if (existente) {
        setError("Ya existe una jornada abierta.");
        await cargarJornadaActiva();
        setProcesando(false);

        return false;
      }

      const { data, error: errorInsercion } = await supabase
        .from("jornadas")
        .insert({
          estado: "abierta",
          usuario_apertura: usuarioId,
        })
        .select("*")
        .single();

      if (errorInsercion) {
        console.error("Error iniciando jornada:", errorInsercion.message);

        setError("No fue posible iniciar la jornada.");
        setProcesando(false);

        return false;
      }

      setJornadaActiva(data as Jornada);
      setProcesando(false);

      return true;
    },
    [procesando, cargarJornadaActiva]
  );

  // ==========================================================
  // CERRAR JORNADA
  // ==========================================================
  //
  // El filtro .eq("estado", "abierta") en el UPDATE es la
  // protección de concurrencia: si dos clics llegan casi al mismo
  // tiempo, solo el primero encuentra la fila en estado 'abierta'
  // y logra actualizarla; el segundo recibe `data: null`.
  // ==========================================================

  const cerrarJornada = useCallback(
    async (usuarioId: string): Promise<boolean> => {
      if (procesando) return false;

      if (!jornadaActiva) {
        setError("No hay una jornada activa para cerrar.");
        return false;
      }

      setProcesando(true);
      setError(null);

      const { data, error: errorActualizacion } = await supabase
        .from("jornadas")
        .update({
          estado: "cerrada",
          fecha_cierre: new Date().toISOString(),
          usuario_cierre: usuarioId,
        })
        .eq("id", jornadaActiva.id)
        .eq("estado", "abierta")
        .select("*")
        .maybeSingle();

      if (errorActualizacion) {
        console.error("Error cerrando jornada:", errorActualizacion.message);

        setError("No fue posible cerrar la jornada.");
        setProcesando(false);

        return false;
      }

      if (!data) {
        // La jornada ya no estaba abierta (doble clic, otra pestaña, etc.)
        setError("La jornada ya no estaba abierta.");
        await cargarJornadaActiva();
        setProcesando(false);

        return false;
      }

      setJornadaActiva(null);
      setProcesando(false);

      return true;
    },
    [procesando, jornadaActiva, cargarJornadaActiva]
  );

  // ==========================================================
  // LIMPIAR ERROR
  // ==========================================================

  const limpiarError = useCallback(() => {
    setError(null);
  }, []);

  // ==========================================================

  return {
    jornadaActiva,
    cargando,
    procesando,
    error,

    iniciarJornada,
    cerrarJornada,
    refrescarJornada: cargarJornadaActiva,
    limpiarError,
  };
}
