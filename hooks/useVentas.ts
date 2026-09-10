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


        // ====================================================
        // FECHAS DEL DÍA
        // ====================================================

        const inicioDia =
          obtenerInicioDia();

        const finDia =
          obtenerFinDia();


        // ====================================================
        // CONSULTAR VENTAS
        // ====================================================

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


        // ====================================================
        // ERROR
        // ====================================================

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


        console.log(
          "VENTAS CARGADAS:",
          data
        );


        // ====================================================
        // TRANSFORMAR DATOS
        // ====================================================

        const ventasTransformadas:
          VentaDetalle[] =
          (data || []).map(
            (venta: any) => {


              // ==============================================
              // TRANSFORMAR PRODUCTOS
              // ==============================================

              const productos:
                ProductoVenta[] =
                (
                  venta.venta_detalles || []
                ).map(
                  (detalle: any) => {

                    return {

                      id:
                        Number(
                          detalle.id
                        ),

                      productoId:
                        detalle.producto_id
                          ? Number(
                              detalle.producto_id
                            )
                          : null,

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

                  }
                );


              // ==============================================
              // RETORNAR VENTA
              // ==============================================

              return {

                // ============================================
                // DATOS DE LA VENTA
                // ============================================

                id:
                  Number(
                    venta.id
                  ),

                mesaId:
                  venta.mesa_id
                    ? Number(
                        venta.mesa_id
                      )
                    : null,

                usuarioId:
                  venta.usuario_id
                    ?? null,

                total:
                  Number(
                    venta.total || 0
                  ),

                estado:
                  venta.estado,

                createdAt:
                  venta.created_at
                    ?? null,

                closedAt:
                  venta.closed_at
                    ?? null,


                // ============================================
                // MESA
                // ============================================

                mesaNumero:
                  venta.mesas?.numero
                    ? Number(
                        venta.mesas.numero
                      )
                    : null,


                // ============================================
                // USUARIO
                // ============================================

                usuarioNombre:
                  venta.profiles?.nombre
                    ?? "Ventas sin usuario",


                // ============================================
                // PRODUCTOS
                // ============================================

                productos:

                  productos,

              };

            }
          );


        // ====================================================
        // GUARDAR VENTAS
        // ====================================================

        setVentas(
          ventasTransformadas
        );


        console.log(
          "VENTAS TRANSFORMADAS:",
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
    [
      cargarVentas
    ]
  );


  // ==========================================================
  // AGRUPAR VENTAS POR USUARIO
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
          (
            venta
          ) => {


            const usuarioId =
              venta.usuarioId
                ?? "sin-usuario";


            // ================================================
            // CREAR USUARIO
            // ================================================

            if (
              !mapa.has(
                usuarioId
              )
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


            // ================================================
            // OBTENER RESUMEN
            // ================================================

            const resumen =
              mapa.get(
                usuarioId
              )!;


            // ================================================
            // CANTIDAD
            // ================================================

            resumen.cantidadVentas +=
              1;


            // ================================================
            // TOTAL
            // ================================================

            resumen.totalVentas +=
              venta.total;


            // ================================================
            // AGREGAR VENTA
            // ================================================

            resumen.ventas.push(
              venta
            );


          }
        );


        return Array.from(
          mapa.values()
        );


      },
      [
        ventas
      ]
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
      [
        ventas
      ]
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

        setError(
          null
        );

      },
      []
    );


  // ==========================================================
  // RETURN
  // ==========================================================

  return {


    // ========================================================
    // DATOS
    // ========================================================

    ventas,

    resumenUsuarios,


    // ========================================================
    // ESTADOS
    // ========================================================

    cargando,

    error,


    // ========================================================
    // RESUMEN
    // ========================================================

    totalVentasDia,

    cantidadVentasDia,


    // ========================================================
    // FUNCIONES
    // ========================================================

    cargarVentas,

    limpiarError,

  };

}