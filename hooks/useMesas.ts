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
 * Hook principal para administrar:
 * - Mesas
 * - Pedidos
 * - Ventas
 */
export function useMesas() {
  const [mesas, setMesas] = useState<Mesa[]>([]);

  const [ventas, setVentas] = useState<Venta[]>([]);

  const [cargandoMesas, setCargandoMesas] =
    useState(true);

  const [errorMesas, setErrorMesas] =
    useState<string | null>(null);

  const [
    mesaSeleccionadaId,
    setMesaSeleccionadaId,
  ] = useState<number | null>(null);

  const [notificacion, setNotificacion] =
    useState<Notificacion | null>(null);

  // ============================================================
  // NOTIFICACIONES
  // ============================================================

  function mostrarNotificacion(
    tipo: Notificacion["tipo"],
    mensaje: string
  ) {
    setNotificacion({
      tipo,
      mensaje,
    });
  }

  /**
   * Cierra automáticamente las notificaciones.
   */
  useEffect(() => {
    if (!notificacion) return;

    const temporizador = setTimeout(() => {
      setNotificacion(null);
    }, 4000);

    return () =>
      clearTimeout(temporizador);
  }, [notificacion]);

  // ============================================================
  // CARGAR MESAS DESDE SUPABASE
  // ============================================================

  async function cargarMesas() {
    setCargandoMesas(true);

    setErrorMesas(null);

    const { data, error } =
      await supabase
        .from("mesas")
        .select("*")
        .order("numero");

    if (error) {
      console.error(
        "Error cargando mesas:",
        error
      );

      setErrorMesas(
        "No se pudieron cargar las mesas. Verifica tu conexión e intenta de nuevo."
      );

      setCargandoMesas(false);

      return;
    }

    setMesas((anteriores) => {
      const porId = new Map(
        anteriores.map((mesa) => [
          mesa.id,
          mesa,
        ])
      );

      return (data ?? []).map((fila) => {
        const anterior =
          porId.get(fila.id);

        const estadoBd = String(
          fila.estado ?? ""
        ).toLowerCase();

        return {
          id: fila.id,

          numero: fila.numero,

          estado:
            estadoBd === "ocupada"
              ? "Ocupada"
              : "Libre",

          productos:
            anterior?.productos ?? [],

          total:
            anterior?.total ?? 0,

          abiertaDesde:
            anterior?.abiertaDesde ??
            null,
        };
      });
    });

    setCargandoMesas(false);
  }

  // ============================================================
  // CARGAR VENTAS DESDE SUPABASE
  // ============================================================

  async function cargarVentas() {
    const { data, error } =
      await supabase
        .from("ventas")
        .select("*")
        .order("created_at", {
          ascending: true,
        });

    if (error) {
      console.error(
        "Error cargando ventas:",
        error
      );

      mostrarNotificacion(
        "error",
        "No se pudieron cargar las ventas."
      );

      return;
    }

    const ventasCargadas: Venta[] =
      (data ?? []).map((fila) => ({
        id: fila.id,

        mesaId: fila.mesa_id,

        mesaNumero: fila.mesa_id,

        // ======================================================
        // USUARIO QUE REALIZÓ LA VENTA
        // ======================================================

        usuarioId:
          fila.usuario_id ?? null,

        total: Number(
          fila.total ?? 0
        ),

        fecha: fila.created_at
          ? new Date(fila.created_at)
          : new Date(),
      }));

    // ==========================================================
    // OBTENER EL NÚMERO REAL DE LAS MESAS
    // ==========================================================

    const {
      data: mesasData,
      error: errorMesas,
    } = await supabase
      .from("mesas")
      .select("id, numero");

    if (!errorMesas && mesasData) {
      const numerosMesas = new Map(
        mesasData.map((mesa) => [
          mesa.id,
          mesa.numero,
        ])
      );

      setVentas(
        ventasCargadas.map(
          (venta) => ({
            ...venta,

            mesaNumero:
              numerosMesas.get(
                venta.mesaId
              ) ?? venta.mesaId,
          })
        )
      );
    } else {
      setVentas(ventasCargadas);
    }
  }

  // ============================================================
  // CARGAR DATOS AL INICIAR
  // ============================================================

  useEffect(() => {
    async function cargarDatos() {
      await Promise.all([
        cargarMesas(),
        cargarVentas(),
      ]);
    }

    cargarDatos();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================
  // ABRIR MESA
  // ============================================================

  async function abrirMesa(
    id: number
  ) {
    const { error } =
      await supabase
        .from("mesas")
        .update({
          estado: "ocupada",
        })
        .eq("id", id);

    if (error) {
      console.error(
        "Error abriendo mesa:",
        error
      );

      mostrarNotificacion(
        "error",
        "No se pudo abrir la mesa. Intenta nuevamente."
      );

      return;
    }

    setMesas((prev) =>
      prev.map((mesa) =>
        mesa.id === id
          ? {
              ...mesa,

              estado: "Ocupada",

              abiertaDesde:
                new Date(),
            }
          : mesa
      )
    );

    setMesaSeleccionadaId(id);
  }

  // ============================================================
  // SELECCIONAR MESA
  // ============================================================

  function seleccionarMesa(
    id: number
  ) {
    setMesaSeleccionadaId(id);
  }

  // ============================================================
  // CERRAR MODAL
  // ============================================================

  function cerrarModal() {
    setMesaSeleccionadaId(null);
  }

  // ============================================================
  // AGREGAR PRODUCTO
  // ============================================================

  function agregarProducto(
    producto: Producto
  ) {
    if (
      mesaSeleccionadaId === null
    ) {
      return;
    }

    setMesas((prev) =>
      prev.map((mesa) => {
        if (
          mesa.id !==
          mesaSeleccionadaId
        ) {
          return mesa;
        }

        const existente =
          mesa.productos.find(
            (item) =>
              item.productoId ===
              producto.id
          );

        const nuevosProductos:
          ItemPedido[] = existente
            ? mesa.productos.map(
                (item) =>
                  item.productoId ===
                  producto.id
                    ? {
                        ...item,

                        cantidad:
                          item.cantidad + 1,
                      }
                    : item
              )
            : [
                ...mesa.productos,

                {
                  productoId:
                    producto.id,

                  nombre:
                    producto.nombre,

                  precio:
                    producto.precio,

                  cantidad: 1,

                  imagenUrl:
                    producto.imagenUrl ??
                    null,
                },
              ];

        return {
          ...mesa,

          productos:
            nuevosProductos,

          total:
            totalPedido(
              nuevosProductos
            ),
        };
      })
    );
  }

  // ============================================================
  // AUMENTAR CANTIDAD
  // ============================================================

  function aumentarCantidad(
    productoId: number
  ) {
    if (
      mesaSeleccionadaId === null
    ) {
      return;
    }

    setMesas((prev) =>
      prev.map((mesa) => {
        if (
          mesa.id !==
          mesaSeleccionadaId
        ) {
          return mesa;
        }

        const nuevosProductos =
          mesa.productos.map(
            (item) =>
              item.productoId ===
              productoId
                ? {
                    ...item,

                    cantidad:
                      item.cantidad + 1,
                  }
                : item
          );

        return {
          ...mesa,

          productos:
            nuevosProductos,

          total:
            totalPedido(
              nuevosProductos
            ),
        };
      })
    );
  }

  // ============================================================
  // DISMINUIR CANTIDAD
  // ============================================================

  function disminuirCantidad(
    productoId: number
  ) {
    if (
      mesaSeleccionadaId === null
    ) {
      return;
    }

    setMesas((prev) =>
      prev.map((mesa) => {
        if (
          mesa.id !==
          mesaSeleccionadaId
        ) {
          return mesa;
        }

        const nuevosProductos =
          mesa.productos
            .map((item) =>
              item.productoId ===
              productoId
                ? {
                    ...item,

                    cantidad:
                      item.cantidad - 1,
                  }
                : item
            )
            .filter(
              (item) =>
                item.cantidad > 0
            );

        return {
          ...mesa,

          productos:
            nuevosProductos,

          total:
            totalPedido(
              nuevosProductos
            ),
        };
      })
    );
  }

  // ============================================================
  // ELIMINAR PRODUCTO
  // ============================================================

  function eliminarProducto(
    productoId: number
  ) {
    if (
      mesaSeleccionadaId === null
    ) {
      return;
    }

    setMesas((prev) =>
      prev.map((mesa) => {
        if (
          mesa.id !==
          mesaSeleccionadaId
        ) {
          return mesa;
        }

        const nuevosProductos =
          mesa.productos.filter(
            (item) =>
              item.productoId !==
              productoId
          );

        return {
          ...mesa,

          productos:
            nuevosProductos,

          total:
            totalPedido(
              nuevosProductos
            ),
        };
      })
    );
  }

// ============================================================
// LIBERAR MESA SIN REGISTRAR VENTA
// ============================================================

async function liberarMesa(
  id: number
): Promise<boolean> {

  // ==========================================================
  // BUSCAR LA MESA
  // ==========================================================

  const mesa =
    mesas.find(
      (m) => m.id === id
    );

  if (!mesa) {

    mostrarNotificacion(
      "error",
      "No se encontró la mesa."
    );

    return false;

  }


  // ==========================================================
  // ACTUALIZAR MESA EN SUPABASE
  // ==========================================================

  const {
    error,
  } =
    await supabase
      .from("mesas")
      .update({
        estado: "libre",
      })
      .eq(
        "id",
        id
      );


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {

    console.error(
      "Error liberando mesa:",
      error
    );

    mostrarNotificacion(
      "error",
      "No se pudo liberar la mesa. Intenta nuevamente."
    );

    return false;

  }


  // ==========================================================
  // ACTUALIZAR ESTADO LOCAL
  // ==========================================================

  setMesas((prev) =>
    prev.map((mesa) =>

      mesa.id === id

        ? {

            ...mesa,

            estado:
              "Libre",

            productos:
              [],

            total:
              0,

            abiertaDesde:
              null,

          }

        : mesa

    )
  );


  // ==========================================================
  // CERRAR MODAL
  // ==========================================================

  setMesaSeleccionadaId(
    null
  );


  // ==========================================================
  // NOTIFICACIÓN
  // ==========================================================

  mostrarNotificacion(
    "success",
    `Mesa ${mesa.numero} liberada correctamente. No se registró ninguna venta.`
  );


  return true;

}



  // ============================================================
  // CERRAR MESA Y REGISTRAR VENTA
  // ============================================================

  async function cerrarMesa(
    id: number
  ): Promise<boolean> {

    // ==========================================================
    // BUSCAR MESA
    // ==========================================================

    const mesa =
      mesas.find(
        (m) => m.id === id
      );

    if (!mesa) {
      mostrarNotificacion(
        "error",
        "No se encontró la mesa."
      );

      return false;
    }

    // ==========================================================
    // VALIDAR PEDIDO
    // ==========================================================

    if (
      mesa.productos.length === 0 ||
      mesa.total <= 0
    ) {
      mostrarNotificacion(
        "error",
        "No puedes cerrar una mesa sin productos."
      );

      return false;
    }

    // ==========================================================
    // OBTENER USUARIO AUTENTICADO
    // ==========================================================

    const {
      data: datosUsuario,
      error: errorUsuario,
    } =
      await supabase.auth.getUser();

    const usuario =
      datosUsuario.user;

    if (
      errorUsuario ||
      !usuario
    ) {
      console.error(
        "Error obteniendo usuario:",
        errorUsuario
      );

      mostrarNotificacion(
        "error",
        "No se pudo identificar el usuario que realiza la venta."
      );

      return false;
    }

    // ==========================================================
    // CREAR VENTA
    // ==========================================================

    const {
      data: ventaCreada,
      error: errorVenta,
    } =
      await supabase
        .from("ventas")
        .insert([
          {
            mesa_id: mesa.id,

            usuario_id:
              usuario.id,

            total: mesa.total,

            estado: "cerrada",
          },
        ])
        .select()
        .single();

    if (
      errorVenta ||
      !ventaCreada
    ) {
      console.error(
        "Error registrando la venta:",
        errorVenta
      );

      mostrarNotificacion(
        "error",
        "Error al guardar la venta en Supabase."
      );

      return false;
    }

    // ==========================================================
    // PREPARAR DETALLES DE LA VENTA
    // ==========================================================

    const detallesVenta =
      mesa.productos.map(
        (producto) => ({
          venta_id:
            ventaCreada.id,

          producto_id:
            producto.productoId,

          nombre_producto:
            producto.nombre,

          precio:
            producto.precio,

          cantidad:
            producto.cantidad,

          subtotal:
            producto.precio *
            producto.cantidad,
        })
      );

    // ==========================================================
    // GUARDAR PRODUCTOS EN venta_detalles
    // ==========================================================

    const {
      error: errorDetalles,
    } =
      await supabase
        .from("venta_detalles")
        .insert(
          detallesVenta
        );

    if (errorDetalles) {
      console.error(
        "Error guardando detalle de venta:",
        errorDetalles
      );

      // ========================================================
      // ELIMINAR VENTA SI FALLÓ EL DETALLE
      // ========================================================

      const {
        error: errorEliminarVenta,
      } =
        await supabase
          .from("ventas")
          .delete()
          .eq(
            "id",
            ventaCreada.id
          );

      if (errorEliminarVenta) {
        console.error(
          "Error eliminando venta incompleta:",
          errorEliminarVenta
        );
      }

      mostrarNotificacion(
        "error",
        "No se pudieron guardar los productos de la venta."
      );

      return false;
    }

    // ==========================================================
    // LIBERAR MESA EN SUPABASE
    // ==========================================================

    const {
      error: errorMesa,
    } =
      await supabase
        .from("mesas")
        .update({
          estado: "libre",
        })
        .eq(
          "id",
          mesa.id
        );

    if (errorMesa) {
      console.error(
        "Error liberando mesa:",
        errorMesa
      );

      mostrarNotificacion(
        "error",
        "La venta fue registrada, pero la mesa no se pudo liberar."
      );

      return false;
    }

    // ==========================================================
    // AGREGAR VENTA AL ESTADO LOCAL
    // ==========================================================

    setVentas((prev) => [
      ...prev,

      {
        id:
          ventaCreada.id,

        mesaId:
          mesa.id,

        mesaNumero:
          mesa.numero,

        usuarioId:
          usuario.id,

        total:
          Number(
            mesa.total
          ),

        fecha:
          ventaCreada.created_at
            ? new Date(
                ventaCreada.created_at
              )
            : new Date(),
      },
    ]);

    // ==========================================================
    // LIBERAR MESA LOCALMENTE
    // ==========================================================

    setMesas((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,

              estado:
                "Libre",

              total: 0,

              productos: [],

              abiertaDesde:
                null,
            }
          : m
      )
    );

    // ==========================================================
    // CERRAR MESA SELECCIONADA
    // ==========================================================

    setMesaSeleccionadaId(null);

    // ==========================================================
    // NOTIFICACIÓN
    // ==========================================================

    mostrarNotificacion(
      "success",
      `Venta registrada correctamente (Mesa ${mesa.numero}).`
    );

    return true;
  }

  // ============================================================
  // MESA ACTUAL
  // ============================================================

  const mesaActual =
    useMemo(
      () =>
        mesas.find(
          (mesa) =>
            mesa.id ===
            mesaSeleccionadaId
        ) ?? null,
      [
        mesas,
        mesaSeleccionadaId,
      ]
    );

  // ============================================================
  // TOTAL DE VENTAS
  // ============================================================

  const ventasDelDia =
    useMemo(
      () =>
        ventas.reduce(
          (
            total,
            venta
          ) =>
            total +
            venta.total,
          0
        ),
      [ventas]
    );

  // ============================================================
  // RESUMEN DE MESAS
  // ============================================================

  const resumen =
    useMemo(() => {

      const libres =
        mesas.filter(
          (mesa) =>
            mesa.estado ===
            "Libre"
        ).length;

      const ocupadas =
        mesas.filter(
          (mesa) =>
            mesa.estado ===
            "Ocupada"
        ).length;

      const ventasActivas =
        mesas.filter(
          (mesa) =>
            mesa.estado ===
              "Ocupada" &&
            mesa.total > 0
        ).length;

      return {
        total:
          mesas.length,

        libres,

        ocupadas,

        ventasActivas,
      };
    }, [mesas]);

  // ============================================================
  // RETORNO DEL HOOK
  // ============================================================

  return {

    // ==========================================================
    // DATOS
    // ==========================================================

    mesas,

    ventas,

    ventasDelDia,

    resumen,

    cargandoMesas,

    errorMesas,

    mesaActual,

    notificacion,

    // ==========================================================
    // NOTIFICACIONES
    // ==========================================================

    cerrarNotificacion:
      () =>
        setNotificacion(
          null
        ),

    // ==========================================================
    // CARGAS
    // ==========================================================

    cargarMesas,

    cargarVentas,

    // ==========================================================
// MESAS
// ==========================================================

abrirMesa,

seleccionarMesa,

cerrarModal,

liberarMesa,

    // ==========================================================
    // PEDIDOS
    // ==========================================================

    agregarProducto,

    aumentarCantidad,

    disminuirCantidad,

    eliminarProducto,

    // ==========================================================
    // VENTAS
    // ==========================================================

    cerrarMesa,
  };
}

// ============================================================
// TIPO DEL RESULTADO DEL HOOK
// ============================================================

export type UseMesasResult =
  ReturnType<
    typeof useMesas
  >;