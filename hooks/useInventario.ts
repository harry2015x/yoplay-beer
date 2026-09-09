// ARCHIVO: hooks/useInventario.ts

import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";

import type {
  EdicionProductoInput,
  MovimientoInventario,
  NotificacionInventario,
  NuevoProductoInput,
  ProductoInventario,
  ResumenInventario,
  TipoMovimiento,
  UseInventarioResult,
} from "../types/inventario";

// ============================================================
// TIPOS DE SUPABASE
// ============================================================

type ProductoRow = {
  id: number;

  nombre: string;
  descripcion: string | null;
  categoria: string | null;

  cantidad: number;
  cantidad_minima: number;

  unidad: string;

  precio_compra: number | null;
  precio_venta: number | null;

  imagen_url: string | null;

  activo: boolean;
  created_at: string;
};

type MovimientoRow = {
  id: number;

  producto_id: number;

  tipo: TipoMovimiento;

  cantidad: number;

  stock_anterior: number;
  stock_nuevo: number;

  motivo: string | null;

  created_at: string;

  productos:
    | { nombre: string }
    | { nombre: string }[]
    | null;
};

// ============================================================
// MAPEAR PRODUCTO
// ============================================================

function mapearProducto(
  fila: ProductoRow
): ProductoInventario {
  return {
    id: fila.id,

    nombre: fila.nombre,

    descripcion: fila.descripcion,

    categoria: fila.categoria,

    // SUPABASE → APP

    stock: Number(fila.cantidad),

    stockMinimo: Number(
      fila.cantidad_minima
    ),

    unidad: fila.unidad,

    precioCompra:
      fila.precio_compra === null
        ? null
        : Number(fila.precio_compra),

    precioVenta:
      fila.precio_venta === null
        ? null
        : Number(fila.precio_venta),

    // IMAGEN

    imagenUrl: fila.imagen_url,

    activo: fila.activo,

    createdAt: fila.created_at,
  };
}

// ============================================================
// OBTENER NOMBRE DEL PRODUCTO
// ============================================================

function extraerNombreProducto(
  relacion: MovimientoRow["productos"]
): string | null {
  if (!relacion) return null;

  if (Array.isArray(relacion)) {
    return relacion[0]?.nombre ?? null;
  }

  return relacion.nombre ?? null;
}

// ============================================================
// MAPEAR MOVIMIENTO
// ============================================================

function mapearMovimiento(
  fila: MovimientoRow
): MovimientoInventario {
  return {
    id: fila.id,

    productoId: fila.producto_id,

    productoNombre:
      extraerNombreProducto(
        fila.productos
      ),

    tipo: fila.tipo,

    cantidad:
      Number(fila.cantidad),

    stockAnterior:
      Number(fila.stock_anterior),

    stockNuevo:
      Number(fila.stock_nuevo),

    motivo: fila.motivo,

    createdAt: fila.created_at,
  };
}

// ============================================================
// MENSAJE DE ERROR
// ============================================================

function mensajeDeError(
  error: unknown,
  fallback: string
): string {
  if (
    error &&
    typeof error === "object" &&
    "message" in error
  ) {
    const mensaje = (
      error as {
        message?: unknown;
      }
    ).message;

    if (
      typeof mensaje === "string" &&
      mensaje.length > 0
    ) {
      return mensaje;
    }
  }

  return fallback;
}

// ============================================================
// HOOK PRINCIPAL
// ============================================================

export function useInventario(): UseInventarioResult {

  const [
    productos,
    setProductos
  ] = useState<ProductoInventario[]>([]);

  const [
    movimientos,
    setMovimientos
  ] = useState<MovimientoInventario[]>([]);

  const [
    cargandoProductos,
    setCargandoProductos
  ] = useState(true);

  const [
    cargandoMovimientos,
    setCargandoMovimientos
  ] = useState(true);

  const [
    errorProductos,
    setErrorProductos
  ] = useState<string | null>(null);

  const [
    errorMovimientos,
    setErrorMovimientos
  ] = useState<string | null>(null);

  const [
    notificacion,
    setNotificacion
  ] = useState<NotificacionInventario>(null);

  // ==========================================================
  // NOTIFICACIONES
  // ==========================================================

  const mostrarNotificacion = useCallback(
    (
      tipo: "success" | "error" | "info",
      mensaje: string
    ) => {
      setNotificacion({
        tipo,
        mensaje,
      });
    },
    []
  );

  const cerrarNotificacion = useCallback(
    () => {
      setNotificacion(null);
    },
    []
  );

  // ==========================================================
  // CARGAR PRODUCTOS
  // ==========================================================

  const cargarProductos = useCallback(
    async () => {

      setCargandoProductos(true);

      setErrorProductos(null);

      const {
        data,
        error
      } = await supabase
        .from("productos")
        .select("*")
        .order("nombre");

      if (error) {

        setErrorProductos(
          mensajeDeError(
            error,
            "No se pudieron cargar los productos."
          )
        );

        setCargandoProductos(false);

        return;
      }

      setProductos(
        ((data ?? []) as ProductoRow[])
          .map(mapearProducto)
      );

      setCargandoProductos(false);
    },
    []
  );

  // ==========================================================
  // CARGAR MOVIMIENTOS
  // ==========================================================

  const cargarMovimientos = useCallback(
    async () => {

      setCargandoMovimientos(true);

      setErrorMovimientos(null);

      const {
        data,
        error
      } = await supabase
        .from("movimientos_inventario")
        .select(`
          *,
          productos (
            nombre
          )
        `)
        .order(
          "created_at",
          {
            ascending: false
          }
        )
        .limit(200);

      if (error) {

        setErrorMovimientos(
          mensajeDeError(
            error,
            "No se pudo cargar el historial."
          )
        );

        setCargandoMovimientos(false);

        return;
      }

      setMovimientos(
        ((data ?? []) as MovimientoRow[])
          .map(mapearMovimiento)
      );

      setCargandoMovimientos(false);
    },
    []
  );

  // ==========================================================
  // CARGA INICIAL
  // ==========================================================

  useEffect(
    () => {

      cargarProductos();

      cargarMovimientos();

    },
    [
      cargarProductos,
      cargarMovimientos
    ]
  );

  // ==========================================================
  // AGREGAR PRODUCTO
  // ==========================================================

  const agregarProducto = useCallback(
    async (
      input: NuevoProductoInput
    ): Promise<boolean> => {

      const nombre =
        input.nombre.trim();

      if (!nombre) {

        mostrarNotificacion(
          "error",
          "El nombre del producto es obligatorio."
        );

        return false;
      }

      if (
        Number.isNaN(input.stock) ||
        Number.isNaN(input.stockMinimo) ||
        input.stock < 0 ||
        input.stockMinimo < 0
      ) {

        mostrarNotificacion(
          "error",
          "El stock y el stock mínimo deben ser válidos."
        );

        return false;
      }

      const {
        data,
        error
      } = await supabase
        .from("productos")
        .insert({

          nombre,

          descripcion:
            input.descripcion.trim() || null,

          categoria:
            input.categoria.trim() || null,

          // IMPORTANTE:
          // El stock inicial se registra
          // mediante el movimiento de inventario.

          cantidad: 0,

          cantidad_minima:
            input.stockMinimo,

          unidad:
            input.unidad.trim() || "unidad",

          precio_compra:
            input.precioCompra,

          precio_venta:
            input.precioVenta,

          // IMAGEN

          imagen_url:
            input.imagenUrl || null,

          activo:
            input.activo,

        })
        .select("*")
        .single();

      if (error || !data) {

        mostrarNotificacion(
          "error",
          mensajeDeError(
            error,
            "No se pudo guardar el producto."
          )
        );

        return false;
      }

      const productoCreado =
        mapearProducto(
          data as ProductoRow
        );

      // ==============================================
      // STOCK INICIAL
      // ==============================================

      if (input.stock > 0) {

        const {
          error: errorMovimiento
        } = await supabase
          .rpc(
            "registrar_movimiento_inventario",
            {

              p_producto_id:
                productoCreado.id,

              p_tipo:
                "entrada",

              p_cantidad:
                input.stock,

              p_motivo:
                "Stock inicial",

            }
          );

        if (errorMovimiento) {

          mostrarNotificacion(
            "error",
            mensajeDeError(
              errorMovimiento,
              "El producto se creó, pero no se pudo registrar el stock inicial."
            )
          );

          await cargarProductos();

          await cargarMovimientos();

          return false;
        }

        await cargarProductos();

        await cargarMovimientos();

        mostrarNotificacion(
          "success",
          "Producto agregado correctamente."
        );

        return true;
      }

      await cargarProductos();

      mostrarNotificacion(
        "success",
        "Producto agregado correctamente."
      );

      return true;

    },
    [
      cargarMovimientos,
      cargarProductos,
      mostrarNotificacion
    ]
  );

  // ==========================================================
  // EDITAR PRODUCTO
  // ==========================================================

  const editarProducto = useCallback(
    async (
      id: number,
      input: EdicionProductoInput
    ): Promise<boolean> => {

      const nombre =
        input.nombre.trim();

      if (!nombre) {

        mostrarNotificacion(
          "error",
          "El nombre del producto es obligatorio."
        );

        return false;
      }

      const {
        data,
        error
      } = await supabase
        .from("productos")
        .update({

          nombre,

          descripcion:
            input.descripcion.trim() || null,

          categoria:
            input.categoria.trim() || null,

          unidad:
            input.unidad.trim() || "unidad",

          cantidad_minima:
            input.stockMinimo,

          precio_compra:
            input.precioCompra,

          precio_venta:
            input.precioVenta,

          // IMAGEN

          imagen_url:
            input.imagenUrl || null,

          activo:
            input.activo,

        })
        .eq(
          "id",
          id
        )
        .select("*")
        .single();

      if (error || !data) {

        mostrarNotificacion(
          "error",
          mensajeDeError(
            error,
            "No se pudo actualizar el producto."
          )
        );

        return false;
      }

      const productoActualizado =
        mapearProducto(
          data as ProductoRow
        );

      setProductos(
        prev =>

          prev
            .map(
              producto =>

                producto.id === id
                  ? productoActualizado
                  : producto

            )
            .sort(
              (a, b) =>

                a.nombre.localeCompare(
                  b.nombre
                )
            )
      );

      mostrarNotificacion(
        "success",
        "Producto actualizado correctamente."
      );

      return true;

    },
    [
      mostrarNotificacion
    ]
  );

  // ==========================================================
  // ELIMINAR PRODUCTO
  // ==========================================================

  const eliminarProducto = useCallback(
    async (
      id: number
    ): Promise<boolean> => {

      const {
        error
      } = await supabase
        .from("productos")
        .delete()
        .eq(
          "id",
          id
        );

      if (error) {

        mostrarNotificacion(
          "error",
          mensajeDeError(
            error,
            "No se pudo eliminar el producto."
          )
        );

        return false;
      }

      setProductos(
        prev =>
          prev.filter(
            producto =>
              producto.id !== id
          )
      );

      setMovimientos(
        prev =>
          prev.filter(
            movimiento =>
              movimiento.productoId !== id
          )
      );

      mostrarNotificacion(
        "success",
        "Producto eliminado correctamente."
      );

      return true;

    },
    [
      mostrarNotificacion
    ]
  );

  // ==========================================================
  // EJECUTAR MOVIMIENTO
  // ==========================================================

  const ejecutarMovimiento = useCallback(
    async (
      productoId: number,
      tipo: TipoMovimiento,
      cantidad: number,
      motivo: string,
      mensajeExito: string
    ): Promise<boolean> => {

      if (
        Number.isNaN(cantidad) ||
        cantidad < 0
      ) {

        mostrarNotificacion(
          "error",
          "Ingresa una cantidad válida."
        );

        return false;
      }

      if (
        tipo === "ajuste" &&
        !motivo.trim()
      ) {

        mostrarNotificacion(
          "error",
          "El motivo es obligatorio para un ajuste."
        );

        return false;
      }

      const {
        error
      } = await supabase
        .rpc(
          "registrar_movimiento_inventario",
          {

            p_producto_id:
              productoId,

            p_tipo:
              tipo,

            p_cantidad:
              cantidad,

            p_motivo:
              motivo.trim() || null,

          }
        );

      if (error) {

        mostrarNotificacion(
          "error",
          mensajeDeError(

            error,

            tipo === "salida"

              ? "No hay suficiente stock para registrar la salida."

              : "Error al actualizar el inventario."

          )
        );

        await cargarProductos();

        return false;
      }

      // ====================================================
      // RECARGAR DATOS DESDE SUPABASE
      // ====================================================

      await cargarProductos();

      await cargarMovimientos();

      mostrarNotificacion(
        "success",
        mensajeExito
      );

      return true;

    },
    [
      cargarMovimientos,
      cargarProductos,
      mostrarNotificacion
    ]
  );

  // ==========================================================
  // ENTRADA
  // ==========================================================

  const registrarEntrada = useCallback(
    (
      productoId: number,
      cantidad: number,
      motivo: string
    ) =>

      ejecutarMovimiento(
        productoId,
        "entrada",
        cantidad,
        motivo,
        "Entrada registrada correctamente."
      ),

    [
      ejecutarMovimiento
    ]
  );

  // ==========================================================
  // SALIDA
  // ==========================================================

  const registrarSalida = useCallback(
    (
      productoId: number,
      cantidad: number,
      motivo: string
    ) =>

      ejecutarMovimiento(
        productoId,
        "salida",
        cantidad,
        motivo,
        "Salida registrada correctamente."
      ),

    [
      ejecutarMovimiento
    ]
  );

  // ==========================================================
  // AJUSTE
  // ==========================================================

  const registrarAjuste = useCallback(
    (
      productoId: number,
      nuevoStock: number,
      motivo: string
    ) =>

      ejecutarMovimiento(
        productoId,
        "ajuste",
        nuevoStock,
        motivo,
        "Ajuste registrado correctamente."
      ),

    [
      ejecutarMovimiento
    ]
  );

  // ==========================================================
  // RESUMEN
  // ==========================================================

  const resumen:
    ResumenInventario = useMemo(
      () => {

        let unidadesEnStock = 0;

        let stockBajo = 0;

        let valorEstimado = 0;

        for (
          const producto of productos
        ) {

          unidadesEnStock +=
            producto.stock;

          if (
            producto.stock > 0 &&
            producto.stock <= producto.stockMinimo
          ) {

            stockBajo += 1;

          }

          valorEstimado +=

            producto.stock *

            (
              producto.precioCompra ?? 0
            );

        }

        return {

          totalProductos:
            productos.length,

          unidadesEnStock,

          stockBajo,

          valorEstimado,

        };

      },
      [
        productos
      ]
    );

  // ==========================================================
  // RETORNO
  // ==========================================================

  return {

    productos,

    movimientos,

    cargandoProductos,

    cargandoMovimientos,

    errorProductos,

    errorMovimientos,

    notificacion,

    resumen,

    cargarProductos,

    cargarMovimientos,

    agregarProducto,

    editarProducto,

    eliminarProducto,

    registrarEntrada,

    registrarSalida,

    registrarAjuste,

    cerrarNotificacion,

  };

}