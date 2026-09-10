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
  // INICIO DEL DÍA
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
  // FIN DEL DÍA
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
        // CONSULTAR VENTAS
        // ======================================================

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


        if (ventasError) {

          console.error(
            "Error cargando ventas:",
            ventasError
          );

          setError(
            "No fue posible cargar las ventas."
          );

          setVentas([]);

          return;

        }


        // ======================================================
        // SI NO HAY VENTAS
        // ======================================================

        if (
          !ventasData ||
          ventasData.length === 0
        ) {

          setVentas([]);

          return;

        }


        // ======================================================
        // OBTENER IDS DE LAS VENTAS
        // ======================================================

        const ventasIds =
          ventasData.map(
            (venta: any) =>
              venta.id
          );


        // ======================================================
        // CONSULTAR DETALLES DE LAS VENTAS
        // ======================================================

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


        if (detallesError) {

          console.error(
            "Error cargando detalles:",
            detallesError
          );

          setError(
            "No fue posible cargar los productos de las ventas."
          );

        }


        // ======================================================
        // AGRUPAR PRODUCTOS POR VENTA
        // ======================================================

        const productosPorVenta =
          new Map<
            number,
            ProductoVenta[]
          >();


        (
          detallesData || []
        ).forEach(
          (detalle: any) => {


            const producto:
              ProductoVenta = {

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
              ) || [];


            productosActuales.push(
              producto
            );


            productosPorVenta.set(
              detalle.venta_id,
              productosActuales
            );

          }
        );


        // ======================================================
        // TRANSFORMAR VENTAS
        // ======================================================

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


                // MESA

                mesaNumero:
                  venta.mesas?.numero
                    ?? null,


                // USUARIO

                usuarioNombre:
                  venta.profiles?.nombre
                    ??
                  "Ventas sin usuario",


                // PRODUCTOS

                productos:
                  productosPorVenta.get(
                    venta.id
                  ) || [],

              };

            }
          );


        // ======================================================
        // GUARDAR VENTAS
        // ======================================================

        console.log(
          "VENTAS COMPLETAS:",
          ventasTransformadas
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