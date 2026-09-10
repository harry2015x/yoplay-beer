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
  ResumenVentasUsuario,
  UseVentasResult,
  VentaDetalle,
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
  // CARGAR VENTAS
  // ==========================================================

  const cargarVentas = useCallback(
    async () => {

      try {

        setCargando(true);

        setError(null);


        // ======================================================
        // FECHA ACTUAL
        // ======================================================

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

        const finDia = new Date(
          ahora.getFullYear(),
          ahora.getMonth(),
          ahora.getDate(),
          23,
          59,
          59,
          999
        );


        // ======================================================
        // CONSULTAR VENTAS
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
              venta_id,
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
            inicioDia.toISOString()
          )
          .lte(
            "created_at",
            finDia.toISOString()
          )
          .order(
            "created_at",
            {
              ascending: false,
            }
          );


        // ======================================================
        // VALIDAR ERROR
        // ======================================================

        if (supabaseError) {

          console.error(
            "Error cargando ventas:",
            supabaseError
          );

          setError(
            supabaseError.message
          );

          setVentas([]);

          return;

        }


        // ======================================================
        // TRANSFORMAR VENTAS
        // ======================================================

        const ventasTransformadas:
          VentaDetalle[] =
          (data ?? []).map(
            (venta: any) => {


              // ==================================================
              // TRANSFORMAR PRODUCTOS
              // ==================================================

              const productos:
                ProductoVenta[] =
                (venta.venta_detalles ?? []).map(
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
                          detalle.precio ?? 0
                        ),

                      cantidad:
                        Number(
                          detalle.cantidad ?? 0
                        ),

                      subtotal:
                        Number(
                          detalle.subtotal ??
                          (
                            Number(
                              detalle.precio ?? 0
                            )
                            *
                            Number(
                              detalle.cantidad ?? 0
                            )
                          )
                        ),

                    };

                  }
                );


              // ==================================================
              // RETORNAR VENTA
              // ==================================================

              return {

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
                    venta.total ?? 0
                  ),

                estado:
                  venta.estado
                  ?? "",

                createdAt:
                  venta.created_at
                  ?? null,

                closedAt:
                  venta.closed_at
                  ?? null,

                mesaNumero:
                  venta.mesas?.numero
                    ? Number(
                        venta.mesas.numero
                      )
                    : null,

                usuarioNombre:
                  venta.profiles?.nombre
                  ?? "Ventas sin usuario",

                productos:
                  productos,

              };

            }
          );


        // ======================================================
        // DEBUG
        // ======================================================

        console.log(
          "VENTAS CARGADAS:",
          ventasTransformadas
        );


        // ======================================================
        // GUARDAR ESTADO
        // ======================================================

        setVentas(
          ventasTransformadas
        );


      } catch (err) {

        console.error(
          "Error inesperado cargando ventas:",
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
          (venta) => {

            const claveUsuario =
              venta.usuarioId
              ?? "sin-usuario";


            // ==================================================
            // CREAR RESUMEN
            // ==================================================

            if (
              !mapa.has(
                claveUsuario
              )
            ) {

              mapa.set(
                claveUsuario,
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
              mapa.get(
                claveUsuario
              );


            if (!resumen) {
              return;
            }


            // ==================================================
            // AGREGAR VENTA
            // ==================================================

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
      [
        ventas
      ]
    );


  // ==========================================================
  // TOTAL VENTAS DEL DÍA
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