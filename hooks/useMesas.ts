"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  ItemPedido,
  Mesa,
  Notificacion,
  Producto,
  Venta,
  totalPedido,
} from "../types/mesas";

/**
 * Único hook que administra el estado de Mesas y Ventas.
 *
 * Se llama UNA sola vez en app/page.tsx (evita el bug anterior de tener
 * cargarMesas / useEffect / setMesas duplicados) y su resultado se pasa
 * como props a los componentes de components/mesas/*, y también se usa
 * en las secciones "Inicio" y "Ventas" para no duplicar el estado.
 */
export function useMesas() {
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [ventas, setVentas] = useState<Venta[]>([]);
  const [cargandoMesas, setCargandoMesas] = useState(true);
  const [errorMesas, setErrorMesas] = useState<string | null>(null);
  const [mesaSeleccionadaId, setMesaSeleccionadaId] = useState<number | null>(null);
  const [notificacion, setNotificacion] = useState<Notificacion | null>(null);

  function mostrarNotificacion(tipo: Notificacion["tipo"], mensaje: string) {
    setNotificacion({ tipo, mensaje });
  }

  useEffect(() => {
    if (!notificacion) return;
    const temporizador = setTimeout(() => setNotificacion(null), 4000);
    return () => clearTimeout(temporizador);
  }, [notificacion]);

  async function cargarMesas() {
    setCargandoMesas(true);
    setErrorMesas(null);

    const { data, error } = await supabase.from("mesas").select("*").order("numero");

    if (error) {
      console.error("Error cargando mesas:", error);
      setErrorMesas("No se pudieron cargar las mesas. Verifica tu conexión e intenta de nuevo.");
      setCargandoMesas(false);
      return;
    }

    setMesas((anteriores) => {
      const porId = new Map(anteriores.map((mesa) => [mesa.id, mesa]));

      return (data ?? []).map((fila) => {
        const anterior = porId.get(fila.id);
        const estadoBd = String(fila.estado ?? "").toLowerCase();

        return {
          id: fila.id,
          numero: fila.numero,
          estado: estadoBd === "ocupada" ? "Ocupada" : "Libre",
          // El pedido en curso todavía no se persiste en Supabase (no existe
          // una tabla de detalle de pedido); se conserva lo que ya había en
          // memoria para no perder el carrito de una mesa al refrescar la lista.
          productos: anterior?.productos ?? [],
          total: anterior?.total ?? 0,
          abiertaDesde: anterior?.abiertaDesde ?? null,
        };
      });
    });

    setCargandoMesas(false);
  }

  useEffect(() => {
    cargarMesas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function abrirMesa(id: number) {
    const { error } = await supabase.from("mesas").update({ estado: "ocupada" }).eq("id", id);

    if (error) {
      console.error("Error abriendo mesa:", error);
      mostrarNotificacion("error", "No se pudo abrir la mesa. Intenta nuevamente.");
      return;
    }

    setMesas((prev) =>
      prev.map((mesa) =>
        mesa.id === id ? { ...mesa, estado: "Ocupada", abiertaDesde: new Date() } : mesa
      )
    );

    setMesaSeleccionadaId(id);
  }

  function seleccionarMesa(id: number) {
    setMesaSeleccionadaId(id);
  }

  function cerrarModal() {
    setMesaSeleccionadaId(null);
  }

  function agregarProducto(producto: Producto) {
    if (mesaSeleccionadaId === null) return;

    setMesas((prev) =>
      prev.map((mesa) => {
        if (mesa.id !== mesaSeleccionadaId) return mesa;

        const existente = mesa.productos.find((item) => item.productoId === producto.id);

        const nuevosProductos: ItemPedido[] = existente
          ? mesa.productos.map((item) =>
              item.productoId === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
            )
          : [
              ...mesa.productos,
              {
                productoId: producto.id,
                nombre: producto.nombre,
                precio: producto.precio,
                cantidad: 1,
              },
            ];

        return { ...mesa, productos: nuevosProductos, total: totalPedido(nuevosProductos) };
      })
    );
  }

  function aumentarCantidad(productoId: number) {
    if (mesaSeleccionadaId === null) return;

    setMesas((prev) =>
      prev.map((mesa) => {
        if (mesa.id !== mesaSeleccionadaId) return mesa;

        const nuevosProductos = mesa.productos.map((item) =>
          item.productoId === productoId ? { ...item, cantidad: item.cantidad + 1 } : item
        );

        return { ...mesa, productos: nuevosProductos, total: totalPedido(nuevosProductos) };
      })
    );
  }

  function disminuirCantidad(productoId: number) {
    if (mesaSeleccionadaId === null) return;

    setMesas((prev) =>
      prev.map((mesa) => {
        if (mesa.id !== mesaSeleccionadaId) return mesa;

        const nuevosProductos = mesa.productos
          .map((item) =>
            item.productoId === productoId ? { ...item, cantidad: item.cantidad - 1 } : item
          )
          .filter((item) => item.cantidad > 0);

        return { ...mesa, productos: nuevosProductos, total: totalPedido(nuevosProductos) };
      })
    );
  }

  function eliminarProducto(productoId: number) {
    if (mesaSeleccionadaId === null) return;

    setMesas((prev) =>
      prev.map((mesa) => {
        if (mesa.id !== mesaSeleccionadaId) return mesa;

        const nuevosProductos = mesa.productos.filter((item) => item.productoId !== productoId);

        return { ...mesa, productos: nuevosProductos, total: totalPedido(nuevosProductos) };
      })
    );
  }

  /** Devuelve true si la cuenta se cerró y la venta quedó registrada. */
  async function cerrarMesa(id: number): Promise<boolean> {
    const mesa = mesas.find((m) => m.id === id);
    if (!mesa) return false;

    if (mesa.productos.length === 0 || mesa.total <= 0) {
      mostrarNotificacion("error", "No puedes cerrar una mesa sin productos.");
      return false;
    }

    const { data: ventaCreada, error: errorVenta } = await supabase
      .from("ventas")
      .insert([{ mesa_id: mesa.id, total: mesa.total, estado: "cerrada" }])
      .select()
      .single();

    if (errorVenta) {
      console.error("Error registrando la venta:", errorVenta);
      mostrarNotificacion("error", "Error al guardar la venta en Supabase.");
      return false;
    }

    const { error: errorMesa } = await supabase
      .from("mesas")
      .update({ estado: "libre" })
      .eq("id", mesa.id);

    if (errorMesa) {
      console.error("Error liberando la mesa:", errorMesa);
      mostrarNotificacion(
        "error",
        "La venta se registró, pero la mesa no se pudo liberar. Actualiza la página."
      );
      return false;
    }

    setVentas((prev) => [
      ...prev,
      {
        id: ventaCreada.id,
        mesaId: mesa.id,
        mesaNumero: mesa.numero,
        total: mesa.total,
        fecha: new Date(),
      },
    ]);

    setMesas((prev) =>
      prev.map((m) =>
        m.id === id ? { ...m, estado: "Libre", total: 0, productos: [], abiertaDesde: null } : m
      )
    );

    setMesaSeleccionadaId(null);
    mostrarNotificacion("success", `Venta registrada correctamente (Mesa ${mesa.numero}).`);
    return true;
  }

  const mesaActual = useMemo(
    () => mesas.find((mesa) => mesa.id === mesaSeleccionadaId) ?? null,
    [mesas, mesaSeleccionadaId]
  );

  const ventasDelDia = useMemo(() => ventas.reduce((total, venta) => total + venta.total, 0), [ventas]);

  const resumen = useMemo(() => {
    const libres = mesas.filter((mesa) => mesa.estado === "Libre").length;
    const ocupadas = mesas.filter((mesa) => mesa.estado === "Ocupada").length;
    const ventasActivas = mesas.filter((mesa) => mesa.estado === "Ocupada" && mesa.total > 0).length;

    return { total: mesas.length, libres, ocupadas, ventasActivas };
  }, [mesas]);

  return {
    mesas,
    ventas,
    ventasDelDia,
    resumen,
    cargandoMesas,
    errorMesas,
    mesaActual,
    notificacion,
    cerrarNotificacion: () => setNotificacion(null),
    cargarMesas,
    abrirMesa,
    seleccionarMesa,
    cerrarModal,
    agregarProducto,
    aumentarCantidad,
    disminuirCantidad,
    eliminarProducto,
    cerrarMesa,
  };
}

export type UseMesasResult = ReturnType<typeof useMesas>;
