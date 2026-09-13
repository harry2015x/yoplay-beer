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
// new Date().toISOString() por sí solo no genera el problema,
// pero construir un rango de "día completo" hay que hacerlo con
// año/mes/día LOCALES (getFullYear/getMonth/getDate), no parseando
// strings como "YYYY-MM-DD" con `new Date(string)" (eso sí se
// interpreta en UTC y puede correr el día). Esta función se usa
// tanto para "hoy" como para cualquier fecha seleccionada.
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
// CONSULTA COMPARTIDA: VENTAS ENTRE DOS FECHAS (ISO)
// ============================================================
//
// Esta función contiene EXACTAMENTE la misma lógica de consulta
// y transformación que antes vivía dentro de `cargarVentas`.
// Se extrajo para poder reutilizarla:
//   1) en el hook (comportamiento actual, "hoy"), y
//   2) en la exportación a PDF (fecha seleccionada por el usuario).
//
// Ante un error consultando "ventas", se lanza un error (en vez de
// solo hacer console.error) para que cada llamador decida cómo
// mostrarlo: el hook lo captura y setea `error`; el flujo de PDF
// lo captura y muestra "No fue posible generar el reporte PDF."
// ============================================================

export async function consultarVentasEntreFechas(
  inicioISO: string,
  finISO: string
): Promise<VentaDetalle[]> {

  // ==========================================================
  // CONSULTAR VENTAS
  // ==========================================================

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
    .eq(
      "estado",
      "cerrada"
    )
    .gte(
      "created_at",
      inicioISO
    )
    .lte(
      "created_at",
      finISO
    )
    .order(
      "created_at",
      {
        ascending: true,
      }
    );


  // ==========================================================
  // VALIDAR ERROR
  // ==========================================================

  if (ventasError) {

    console.error(
      "Error cargando ventas:",
      ventasError
    );

    throw new Error(
      "No fue posible cargar las ventas."
    );

  }


  // ==========================================================
  // SI NO HAY VENTAS
  // ==========================================================

  if (
    !ventasData ||
    ventasData.length === 0
  ) {

    return [];

  }


  // ==========================================================
  // OBTENER IDS DE LAS VENTAS
  // ==========================================================

  const ventasIds =
    ventasData.map(
      (venta) => venta.id
    );


  // ==========================================================
  // CONSULTAR DETALLES DE VENTAS
  // ==========================================================

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
    .in(
      "venta_id",
      ventasIds
    );


  // ==========================================================
  // VALIDAR ERROR DE DETALLES
  // ==========================================================

  if (detallesError) {

    console.error(
      "Error cargando detalles:",
      detallesError
    );

  }


  // ==========================================================
  // CREAR MAPA DE PRODUCTOS POR VENTA
  // ==========================================================

  const productosPorVenta =
    new Map<
      number,
      ProductoVenta[]
    >();


  (
    detallesData || []
  ).forEach(
    (detalle: any) => {


      const producto: ProductoVenta = {

        id:
          detalle.id,

        productoId:
          detalle.producto_id
            ?? null,

        nombreProducto:
          detalle.nombre_producto
            ?? "Producto sin nombre",

        precio:
          Number(
            detalle.precio || 0
          ),

        cantidad:
          Number(
            detalle.cantidad || 0
          ),

        subtotal:
          Number(
            detalle.subtotal || 0
          ),

      };


      const productosActuales =
        productosPorVenta.get(
          detalle.venta_id
        )
        ?? [];


      productosActuales.push(
        producto
      );


      productosPorVenta.set(
        detalle.venta_id,
        productosActuales
      );

    }
  );


  // ==========================================================
  // TRANSFORMAR VENTAS
  // ==========================================================

  const ventasTransformadas:
    VentaDetalle[] =
    ventasData.map(
      (venta: any) => {

        return {

          id:
            venta.id,

          mesaId:
            venta.mesa_id,

          usuarioId:
            venta.usuario_id,

          total:
            Number(
              venta.total || 0
            ),

          estado:
            venta.estado,

          createdAt:
            venta.created_at,

          closedAt:
            venta.closed_at,

          mesaNumero:
            venta.mesas?.numero
              ?? null,

          usuarioNombre:
            venta.profiles?.nombre
              ??
            "Ventas sin usuario",

          productos:
            productosPorVenta.get(
              venta.id
            )
            ?? [],

        };

      }
    );


  return ventasTransformadas;

}


// ============================================================
// OBTENER VENTAS DE UNA FECHA ESPECÍFICA
// ============================================================
//
// Usada por la exportación a PDF: NO toca el estado del hook,
// solo consulta y retorna. Permite exportar "hoy" o cualquier
// otra fecha que el usuario seleccione.
// ============================================================

export async function obtenerVentasPorFecha(
  fecha: Date
): Promise<VentaDetalle[]> {

  const { inicioISO, finISO } =
    construirRangoDelDia(fecha);

  return consultarVentasEntreFechas(
    inicioISO,
    finISO
  );

}


// ============================================================
// HOOK DE VENTAS
// ============================================================

export function useVentas(): UseVentasResult {


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
  // CARGAR VENTAS (comportamiento sin cambios: ventas de HOY)
  // ==========================================================

  const cargarVentas = useCallback(
    async () => {

      try {

        setCargando(true);

        setError(null);


        const { inicioISO, finISO } =
          construirRangoDelDia(new Date());


        const ventasTransformadas =
          await consultarVentasEntreFechas(
            inicioISO,
            finISO
          );


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
    []
  );


  // ==========================================================
  // CARGAR AUTOMÁTICAMENTE
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
  // TOTAL DE VENTAS DEL DÍA
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
  // CANTIDAD DE VENTAS DEL DÍA
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
