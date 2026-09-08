// ARCHIVO: hooks/useInventario.ts
//
// Único responsable del estado del módulo Inventario.
// Debe instanciarse UNA SOLA VEZ en app/page.tsx:
//
//   const inventarioEstado = useInventario();
//   <InventarioModule estado={inventarioEstado} />
//
// No lo vuelvas a llamar dentro de InventarioModule ni de ningún
// componente hijo: reciben el estado por props.

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

// ------------------------------------------------------------
// Tipos de fila cruda de Supabase (snake_case)
// ------------------------------------------------------------
type ProductoRow = {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  stock: number;
  stock_minimo: number;
  unidad: string;
  precio_compra: number | null;
  precio_venta: number | null;
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
  productos: { nombre: string } | { nombre: string }[] | null;
};

function mapearProducto(fila: ProductoRow): ProductoInventario {
  return {
    id: fila.id,
    nombre: fila.nombre,
    descripcion: fila.descripcion,
    categoria: fila.categoria,
    stock: Number(fila.stock),
    stockMinimo: Number(fila.stock_minimo),
    unidad: fila.unidad,
    precioCompra:
      fila.precio_compra === null ? null : Number(fila.precio_compra),
    precioVenta:
      fila.precio_venta === null ? null : Number(fila.precio_venta),
    activo: fila.activo,
    createdAt: fila.created_at,
  };
}

function extraerNombreProducto(
  relacion: MovimientoRow["productos"]
): string | null {
  if (!relacion) return null;
  if (Array.isArray(relacion)) {
    return relacion[0]?.nombre ?? null;
  }
  return relacion.nombre ?? null;
}

function mapearMovimiento(fila: MovimientoRow): MovimientoInventario {
  return {
    id: fila.id,
    productoId: fila.producto_id,
    productoNombre: extraerNombreProducto(fila.productos),
    tipo: fila.tipo,
    cantidad: Number(fila.cantidad),
    stockAnterior: Number(fila.stock_anterior),
    stockNuevo: Number(fila.stock_nuevo),
    motivo: fila.motivo,
    createdAt: fila.created_at,
  };
}

function mensajeDeError(error: unknown, fallback: string): string {
  if (error && typeof error === "object" && "message" in error) {
    const mensaje = (error as { message?: unknown }).message;
    if (typeof mensaje === "string" && mensaje.length > 0) {
      return mensaje;
    }
  }
  return fallback;
}

export function useInventario(): UseInventarioResult {
  const [productos, setProductos] = useState<ProductoInventario[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([]);
  const [cargandoProductos, setCargandoProductos] = useState<boolean>(true);
  const [cargandoMovimientos, setCargandoMovimientos] =
    useState<boolean>(true);
  const [errorProductos, setErrorProductos] = useState<string | null>(null);
  const [errorMovimientos, setErrorMovimientos] = useState<string | null>(
    null
  );
  const [notificacion, setNotificacion] =
    useState<NotificacionInventario>(null);

  const mostrarNotificacion = useCallback(
    (tipo: "success" | "error" | "info", mensaje: string) => {
      setNotificacion({ tipo, mensaje });
    },
    []
  );

  const cerrarNotificacion = useCallback(() => {
    setNotificacion(null);
  }, []);

  // ------------------------------------------------------------
  // Cargar productos
  // ------------------------------------------------------------
  const cargarProductos = useCallback(async () => {
    setCargandoProductos(true);
    setErrorProductos(null);

    const { data, error } = await supabase
      .from("productos")
      .select("*")
      .order("nombre");

    if (error) {
      setErrorProductos(
        mensajeDeError(error, "No se pudieron cargar los productos.")
      );
      setCargandoProductos(false);
      return;
    }

    setProductos(((data ?? []) as ProductoRow[]).map(mapearProducto));
    setCargandoProductos(false);
  }, []);

  // ------------------------------------------------------------
  // Cargar movimientos (historial)
  // ------------------------------------------------------------
  const cargarMovimientos = useCallback(async () => {
    setCargandoMovimientos(true);
    setErrorMovimientos(null);

    const { data, error } = await supabase
      .from("movimientos_inventario")
      .select("*, productos ( nombre )")
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      setErrorMovimientos(
        mensajeDeError(error, "No se pudo cargar el historial de movimientos.")
      );
      setCargandoMovimientos(false);
      return;
    }

    setMovimientos(((data ?? []) as MovimientoRow[]).map(mapearMovimiento));
    setCargandoMovimientos(false);
  }, []);

  useEffect(() => {
    cargarProductos();
    cargarMovimientos();
  }, [cargarProductos, cargarMovimientos]);

  // ------------------------------------------------------------
  // Agregar producto
  // ------------------------------------------------------------
  const agregarProducto = useCallback(
    async (input: NuevoProductoInput): Promise<boolean> => {
      const nombre = input.nombre.trim();

      if (!nombre) {
        mostrarNotificacion("error", "El nombre del producto es obligatorio.");
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
          "El stock y el stock mínimo deben ser números válidos mayores o iguales a 0."
        );
        return false;
      }
      if (
        (input.precioCompra !== null &&
          (Number.isNaN(input.precioCompra) || input.precioCompra < 0)) ||
        (input.precioVenta !== null &&
          (Number.isNaN(input.precioVenta) || input.precioVenta < 0))
      ) {
        mostrarNotificacion(
          "error",
          "Los precios deben ser números válidos mayores o iguales a 0."
        );
        return false;
      }

      const { data, error } = await supabase
        .from("productos")
        .insert({
          nombre,
          descripcion: input.descripcion.trim() || null,
          categoria: input.categoria.trim() || null,
          stock: 0,
          stock_minimo: input.stockMinimo,
          unidad: input.unidad.trim() || "unidad",
          precio_compra: input.precioCompra,
          precio_venta: input.precioVenta,
          activo: input.activo,
        })
        .select("*")
        .single();

      if (error || !data) {
        mostrarNotificacion(
          "error",
          mensajeDeError(error, "No se pudo guardar el producto.")
        );
        return false;
      }

      const productoCreado = mapearProducto(data as ProductoRow);

      // Si hay stock inicial, registrar como movimiento de entrada
      // para que quede reflejado en el historial (stockAnterior 0).
      if (input.stock > 0) {
        const { data: movimientoData, error: errorMovimiento } =
          await supabase
            .rpc("registrar_movimiento_inventario", {
              p_producto_id: productoCreado.id,
              p_tipo: "entrada",
              p_cantidad: input.stock,
              p_motivo: "Stock inicial",
            })
            .single();

        if (errorMovimiento || !movimientoData) {
          // El producto ya se creó; no lo eliminamos para no perder
          // el registro, pero avisamos del problema con el stock inicial.
          setProductos((prev) =>
            [...prev, productoCreado].sort((a, b) =>
              a.nombre.localeCompare(b.nombre)
            )
          );
          mostrarNotificacion(
            "error",
            "El producto se creó, pero no se pudo registrar el stock inicial."
          );
          return true;
        }

        const movimientoRow = movimientoData as {
          stock_nuevo: number;
        };
        const productoConStock: ProductoInventario = {
          ...productoCreado,
          stock: Number(movimientoRow.stock_nuevo),
        };

        setProductos((prev) =>
          [...prev, productoConStock].sort((a, b) =>
            a.nombre.localeCompare(b.nombre)
          )
        );
        cargarMovimientos();
        mostrarNotificacion("success", "Producto agregado correctamente.");
        return true;
      }

      setProductos((prev) =>
        [...prev, productoCreado].sort((a, b) =>
          a.nombre.localeCompare(b.nombre)
        )
      );
      mostrarNotificacion("success", "Producto agregado correctamente.");
      return true;
    },
    [cargarMovimientos, mostrarNotificacion]
  );

  // ------------------------------------------------------------
  // Editar producto (nunca modifica el stock directamente)
  // ------------------------------------------------------------
  const editarProducto = useCallback(
    async (id: number, input: EdicionProductoInput): Promise<boolean> => {
      const nombre = input.nombre.trim();

      if (!nombre) {
        mostrarNotificacion("error", "El nombre del producto es obligatorio.");
        return false;
      }
      if (Number.isNaN(input.stockMinimo) || input.stockMinimo < 0) {
        mostrarNotificacion(
          "error",
          "El stock mínimo debe ser un número válido mayor o igual a 0."
        );
        return false;
      }
      if (
        (input.precioCompra !== null &&
          (Number.isNaN(input.precioCompra) || input.precioCompra < 0)) ||
        (input.precioVenta !== null &&
          (Number.isNaN(input.precioVenta) || input.precioVenta < 0))
      ) {
        mostrarNotificacion(
          "error",
          "Los precios deben ser números válidos mayores o iguales a 0."
        );
        return false;
      }

      const { data, error } = await supabase
        .from("productos")
        .update({
          nombre,
          descripcion: input.descripcion.trim() || null,
          categoria: input.categoria.trim() || null,
          unidad: input.unidad.trim() || "unidad",
          stock_minimo: input.stockMinimo,
          precio_compra: input.precioCompra,
          precio_venta: input.precioVenta,
          activo: input.activo,
        })
        .eq("id", id)
        .select("*")
        .single();

      if (error || !data) {
        mostrarNotificacion(
          "error",
          mensajeDeError(error, "No se pudo actualizar el producto.")
        );
        return false;
      }

      const productoActualizado = mapearProducto(data as ProductoRow);
      setProductos((prev) =>
        prev
          .map((p) => (p.id === id ? productoActualizado : p))
          .sort((a, b) => a.nombre.localeCompare(b.nombre))
      );
      mostrarNotificacion("success", "Producto actualizado correctamente.");
      return true;
    },
    [mostrarNotificacion]
  );

  // ------------------------------------------------------------
  // Eliminar producto
  // ------------------------------------------------------------
  const eliminarProducto = useCallback(
    async (id: number): Promise<boolean> => {
      const { error } = await supabase.from("productos").delete().eq("id", id);

      if (error) {
        mostrarNotificacion(
          "error",
          mensajeDeError(error, "No se pudo eliminar el producto.")
        );
        return false;
      }

      setProductos((prev) => prev.filter((p) => p.id !== id));
      setMovimientos((prev) => prev.filter((m) => m.productoId !== id));
      mostrarNotificacion("success", "Producto eliminado correctamente.");
      return true;
    },
    [mostrarNotificacion]
  );

  // ------------------------------------------------------------
  // Movimientos de stock (entrada / salida / ajuste), vía RPC atómico
  // ------------------------------------------------------------
  const ejecutarMovimiento = useCallback(
    async (
      productoId: number,
      tipo: TipoMovimiento,
      cantidad: number,
      motivo: string,
      mensajeExito: string
    ): Promise<boolean> => {
      if (Number.isNaN(cantidad) || cantidad < 0) {
        mostrarNotificacion("error", "Ingresa una cantidad válida.");
        return false;
      }
      if (tipo === "ajuste" && !motivo.trim()) {
        mostrarNotificacion(
          "error",
          "El motivo es obligatorio para registrar un ajuste."
        );
        return false;
      }

      const { data, error } = await supabase
        .rpc("registrar_movimiento_inventario", {
          p_producto_id: productoId,
          p_tipo: tipo,
          p_cantidad: cantidad,
          p_motivo: motivo.trim() || null,
        })
        .single();

      if (error || !data) {
        mostrarNotificacion(
          "error",
          mensajeDeError(
            error,
            tipo === "salida"
              ? "No hay suficiente stock para registrar la salida."
              : "Error al actualizar el inventario."
          )
        );
        // Recargamos el producto para asegurar que el estado local
        // no quede desincronizado si algo cambió parcialmente.
        cargarProductos();
        return false;
      }

      const movimientoRow = data as MovimientoRow;
      const stockNuevo = Number(movimientoRow.stock_nuevo);

      setProductos((prev) =>
        prev.map((p) => (p.id === productoId ? { ...p, stock: stockNuevo } : p))
      );

      cargarMovimientos();
      mostrarNotificacion("success", mensajeExito);
      return true;
    },
    [cargarMovimientos, cargarProductos, mostrarNotificacion]
  );

  const registrarEntrada = useCallback(
    (productoId: number, cantidad: number, motivo: string) =>
      ejecutarMovimiento(
        productoId,
        "entrada",
        cantidad,
        motivo,
        "Entrada registrada correctamente."
      ),
    [ejecutarMovimiento]
  );

  const registrarSalida = useCallback(
    (productoId: number, cantidad: number, motivo: string) =>
      ejecutarMovimiento(
        productoId,
        "salida",
        cantidad,
        motivo,
        "Salida registrada correctamente."
      ),
    [ejecutarMovimiento]
  );

  const registrarAjuste = useCallback(
    (productoId: number, nuevoStock: number, motivo: string) =>
      ejecutarMovimiento(
        productoId,
        "ajuste",
        nuevoStock,
        motivo,
        "Ajuste registrado correctamente."
      ),
    [ejecutarMovimiento]
  );

  // ------------------------------------------------------------
  // Resumen
  // ------------------------------------------------------------
  const resumen: ResumenInventario = useMemo(() => {
    let unidadesEnStock = 0;
    let stockBajo = 0;
    let valorEstimado = 0;

    for (const producto of productos) {
      unidadesEnStock += producto.stock;
      if (producto.stock > 0 && producto.stock <= producto.stockMinimo) {
        stockBajo += 1;
      }
      valorEstimado += producto.stock * (producto.precioCompra ?? 0);
    }

    return {
      totalProductos: productos.length,
      unidadesEnStock,
      stockBajo,
      valorEstimado,
    };
  }, [productos]);

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
