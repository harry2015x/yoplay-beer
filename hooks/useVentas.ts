"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { supabase } from "../lib/supabase";

import type {
  VentaDetalle,
  ResumenVentasUsuario,
  UseVentasResult,
} from "../types/ventas";


// ============================================================
// TIPO DE PRODUCTO DE UNA VENTA
// ============================================================

type ProductoVenta = {
  id: number;

  productoId: number | null;

  nombre: string;

  precio: number;

  cantidad: number;

  subtotal: number;
};


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
  // OBTENER INICIO DEL DÍA
  // ==========================================================

  const obtenerInicioDia = () => {

    const ahora = new Date();

    const inicioDia = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate(),
      0,
      0,
      0,
      0
    );

    return inicioDia.toISOString();

  };


  // ==========================================================
  // OBTENER FIN DEL DÍA
  // ==========================================================

  const obtenerFinDia = () => {

    const ahora = new Date();

    const finDia = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate(),
      23,
      59,
      59,
      999
    );

    return finDia.toISOString();

  };


  // ==========================================================
  // CARGAR VENTAS
  // ==========================================================

  const cargarVentas = useCallback(
    async () => {

      try {

        setCargando(true);

        setError(null);


        const inicioDia =
          obtenerInicioDia();

        const finDia =
          obtenerFinDia();


        // ======================================================
        // CONSULTA DE VENTAS + PRODUCTOS
        // ======================================================

        const {
          data,
          error: supabaseError,
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
            ),

            venta_detalles (
              id,
              producto_id,
              nombre_producto,
              precio,
              cantidad,
              subtotal
            )
          `)
          .eq(
            "estado",
            "cerrada"
          )
          .gte(
            "created_at",
            inicioDia
          )
          .lte(
            "created_at",
            finDia
          )
          .order(
            "created_at",
            {
              ascending: true,
            }
          );


        // ======================================================
        // ERROR
        // ======================================================

        if (supabaseError) {

          console.error(
            "Error cargando ventas:",
            supabaseError
          );

          setError(
            "No fue posible cargar las ventas."
          );

          setVentas([]);

          return;

        }


        // ======================================================
        // TRANSFORMAR DATOS
        // ======================================================

        const ventasTransformadas =
          (data || []).map(
            (venta: any) => {


              // ==================================================
              // PRODUCTOS DE LA VENTA
              // ==================================================

              const productos: ProductoVenta[] =
                (
                  venta.venta_detalles ||
                  []
                ).map(
                  (detalle: any) => {

                    return {

                      id:
                        detalle.id,

                      productoId:
                        detalle.producto_id ??
                        null,

                      nombre:
                        detalle.nombre_producto ??
                        "Producto",

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

                  }
                );


              // ==================================================
              // RETORNAR VENTA
              // ==================================================

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


                // ================================================
                // MESA
                // ================================================

                mesaNumero:
                  venta.mesas?.numero
                  ?? null,


                // ================================================
                // USUARIO
                // ================================================

                usuarioNombre:
                  venta.profiles?.nombre
                  ??
                  "Ventas sin usuario",


                // ================================================
                // PRODUCTOS
                // ================================================

                productos,

              };

            }
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
          "Ocurrió un error al cargar las ventas."
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
    useMemo(() => {

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

                cantidadVentas: 0,

                totalVentas: 0,

                ventas: [],

              }
            );

          }


          const resumen =
            mapa.get(usuarioId)!;


          resumen.cantidadVentas +=
            1;


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
  // CANTIDAD DE VENTAS
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