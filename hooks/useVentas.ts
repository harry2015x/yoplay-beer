"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

import type {
  ProductoVenta,
  VentaDetalle,
  ResumenVentasUsuario,
  UseVentasResult,
} from "../types/ventas";


// ============================================================
// UTILIDAD DE FECHA LOCAL (SIN DESFASE POR UTC)
// ============================================================
//
// SE MANTIENE SIN CAMBIOS.
//
// Estas utilidades ya NO se usan para decidir qué ventas
// pertenecen al módulo "Ventas" (eso ahora depende de
// jornada_id, ver más abajo). Se conservan porque otras partes
// del sistema (por ejemplo Reportes, si consulta por fecha
// específica) pueden seguir dependiendo de ellas. Si nada más
// las usa, se pueden eliminar en una limpieza posterior.
// ============================================================

export function construirRangoDelDia(fecha: Date): {
  inicioISO: string;
  finISO: string;
} {

  const inicioDia = new Date(
    fecha.getFullYear(),
    fecha.getMonth(),
    fecha.getDate(),
    0,
    0,
    0,
    0
  );

  const finDia = new Date(
    fecha.getFullYear(),
    fecha.getMonth(),
    fecha.getDate(),
    23,
    59,
    59,
    999
  );

  return {
    inicioISO: inicioDia.toISOString(),
    finISO: finDia.toISOString(),
  };

}


// ============================================================
// TRANSFORMACIÓN COMPARTIDA: VENTAS CRUDAS -> VentaDetalle[]
// ============================================================
//
// Esta lógica (buscar detalles por venta_id y armar el objeto
// VentaDetalle) es idéntica sin importar si las ventas se
// obtuvieron por rango de fechas o por jornada_id. Se extrajo
// aquí para que ninguna de las dos consultas duplique este
// código (regla: "no duplicar lógica").
// ============================================================

async function transformarVentasConDetalles(
  ventasData: any[]
): Promise<VentaDetalle[]> {

  if (!ventasData || ventasData.length === 0) {
    return [];
  }

  const ventasIds = ventasData.map((venta) => venta.id);

  const {
    data: detallesData,
    error: detallesError,
  } = await supabase
    .from("venta_detalles")
    .select(`
      id,
      venta_id,
      producto_id,
      nombre_producto,
      precio,
      cantidad,
      subtotal
    `)
    .in("venta_id", ventasIds);

  if (detallesError) {
    console.error("Error cargando detalles:", detallesError);
  }

  const productosPorVenta = new Map<number, ProductoVenta[]>();

  (detallesData || []).forEach((detalle: any) => {
    const producto: ProductoVenta = {
      id: detalle.id,
      productoId: detalle.producto_id ?? null,
      nombreProducto: detalle.nombre_producto ?? "Producto sin nombre",
      precio: Number(detalle.precio || 0),
      cantidad: Number(detalle.cantidad || 0),
      subtotal: Number(detalle.subtotal || 0),
    };

    const productosActuales = productosPorVenta.get(detalle.venta_id) ?? [];
    productosActuales.push(producto);
    productosPorVenta.set(detalle.venta_id, productosActuales);
  });

  return ventasData.map((venta: any) => ({
    id: venta.id,
    mesaId: venta.mesa_id,
    usuarioId: venta.usuario_id,
    total: Number(venta.total || 0),
    estado: venta.estado,
    createdAt: venta.created_at,
    closedAt: venta.closed_at,
    mesaNumero: venta.mesas?.numero ?? null,
    usuarioNombre: venta.profiles?.nombre ?? "Ventas sin usuario",
    productos: productosPorVenta.get(venta.id) ?? [],
  }));
}


// ============================================================
// CONSULTA: VENTAS ENTRE DOS FECHAS (ISO)
// ============================================================
//
// SE MANTIENE por compatibilidad con cualquier otro flujo que
// siga necesitando ventas de una fecha específica (ej. Reportes).
// Ya NO es utilizada por el hook useVentas ni por el módulo
// Ventas para calcular "ventas de la jornada".
// ============================================================

export async function consultarVentasEntreFechas(
  inicioISO: string,
  finISO: string
): Promise<VentaDetalle[]> {

  const {
    data: ventasData,
    error: ventasError,
  } = await supabase
    .from("ventas")
    .select(`
      id,
      mesa_id,
      usuario_id,
      total,
      estado,
      created_at,
      closed_at,

      mesas (
        numero
      ),

      profiles (
        nombre
      )
    `)
    .eq("estado", "cerrada")
    .gte("created_at", inicioISO)
    .lte("created_at", finISO)
    .order("created_at", { ascending: true });

  if (ventasError) {
    console.error("Error cargando ventas:", ventasError);
    throw new Error("No fue posible cargar las ventas.");
  }

  return transformarVentasConDetalles(ventasData || []);
}


// ============================================================
// OBTENER VENTAS DE UNA FECHA ESPECÍFICA
// ============================================================
//
// SE MANTIENE por compatibilidad (ver nota arriba).
// ============================================================

export async function obtenerVentasPorFecha(
  fecha: Date
): Promise<VentaDetalle[]> {

  const { inicioISO, finISO } = construirRangoDelDia(fecha);

  return consultarVentasEntreFechas(inicioISO, finISO);

}


// ============================================================
// CONSULTA: VENTAS DE UNA JORNADA (jornada_id)
// ============================================================
//
// Esta es la consulta que ahora usa el módulo Ventas y el
// resumen de Inicio: NO depende de fechas ni de CURRENT_DATE,
// solo del jornada_id de la jornada abierta (o de cualquier
// jornada, si se quisiera reutilizar para ver el historial de
// una jornada ya cerrada, por ejemplo en el reporte del modal
// de cierre).
// ============================================================

export async function consultarVentasPorJornada(
  jornadaId: number
): Promise<VentaDetalle[]> {

  const {
    data: ventasData,
    error: ventasError,
  } = await supabase
    .from("ventas")
    .select(`
      id,
      mesa_id,
      usuario_id,
      total,
      estado,
      created_at,
      closed_at,

      mesas (
        numero
      ),

      profiles (
        nombre
      )
    `)
    .eq("estado", "cerrada")
    .eq("jornada_id", jornadaId)
    .order("created_at", { ascending: true });

  if (ventasError) {
    console.error("Error cargando ventas de la jornada:", ventasError);
    throw new Error("No fue posible cargar las ventas de la jornada.");
  }

  return transformarVentasConDetalles(ventasData || []);
}


// ============================================================
// HOOK DE VENTAS
// ============================================================
//
// CAMBIO IMPORTANTE:
//
// Antes: useVentas() cargaba las ventas de "hoy" (CURRENT_DATE).
// Ahora: useVentas(jornadaId) carga las ventas de la JORNADA
// ACTIVA. Si no hay jornada activa (jornadaId === null), no se
// muestran ventas (equivalente a "$0 / 0 ventas" en la interfaz).
//
// El llamador (page.tsx) es responsable de pasar el id de la
// jornada activa, obtenido de useJornada().
// ============================================================

export function useVentas(jornadaId: number | null): UseVentasResult {


  // ==========================================================
  // ESTADOS
  // ==========================================================

  const [ventas, setVentas] =
    useState<VentaDetalle[]>([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);


  // ==========================================================
  // CARGAR VENTAS DE LA JORNADA ACTIVA
  // ==========================================================

  const cargarVentas = useCallback(
    async () => {

      try {

        setCargando(true);

        setError(null);

        if (!jornadaId) {
          // No hay jornada activa: no hay ventas que mostrar.
          setVentas([]);
          return;
        }

        const ventasTransformadas =
          await consultarVentasPorJornada(jornadaId);

        setVentas(
          ventasTransformadas
        );


      } catch (err) {

        console.error(
          "Error inesperado:",
          err
        );

        setError(
          err instanceof Error && err.message
            ? err.message
            : "Ocurrió un error al cargar las ventas."
        );

        setVentas([]);


      } finally {

        setCargando(false);

      }

    },
    [jornadaId]
  );


  // ==========================================================
  // CARGAR AUTOMÁTICAMENTE (al montar y cada vez que cambia
  // la jornada activa: iniciar o cerrar jornada dispara recarga)
  // ==========================================================

  useEffect(
    () => {

      cargarVentas();

    },
    [cargarVentas]
  );


  // ==========================================================
  // AGRUPAR POR USUARIO
  // ==========================================================

  const resumenUsuarios =
    useMemo(
      () => {

        const mapa =
          new Map<
            string,
            ResumenVentasUsuario
          >();


        ventas.forEach(
          (venta) => {


            const usuarioId =
              venta.usuarioId
                ?? "sin-usuario";


            if (
              !mapa.has(usuarioId)
            ) {

              mapa.set(
                usuarioId,
                {

                  usuarioId:
                    venta.usuarioId,

                  usuarioNombre:
                    venta.usuarioNombre,

                  cantidadVentas:
                    0,

                  totalVentas:
                    0,

                  ventas:
                    [],

                }
              );

            }


            const resumen =
              mapa.get(usuarioId)!;


            resumen.cantidadVentas += 1;


            resumen.totalVentas +=
              venta.total;


            resumen.ventas.push(
              venta
            );


          }
        );


        return Array.from(
          mapa.values()
        );

      },
      [ventas]
    );


  // ==========================================================
  // TOTAL VENDIDO EN LA JORNADA ACTIVA
  // ==========================================================

  const totalVentasDia =
    useMemo(
      () => {

        return ventas.reduce(
          (
            acumulado,
            venta
          ) => {

            return (
              acumulado +
              venta.total
            );

          },
          0
        );

      },
      [ventas]
    );


  // ==========================================================
  // CANTIDAD DE VENTAS EN LA JORNADA ACTIVA
  // ==========================================================

  const cantidadVentasDia =
    ventas.length;


  // ==========================================================
  // LIMPIAR ERROR
  // ==========================================================

  const limpiarError =
    useCallback(
      () => {

        setError(null);

      },
      []
    );


  // ==========================================================
  // RETURN
  // ==========================================================

  return {

    ventas,

    resumenUsuarios,

    cargando,

    error,

    totalVentasDia,

    cantidadVentasDia,

    cargarVentas,

    limpiarError,

  };

}
