"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

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
 *
 * - Mesas
 * - Productos
 * - Pedidos
 * - Ventas
 */
export function useMesas() {
  // =====================================================
  // ESTADOS
  // =====================================================

  const [mesas, setMesas] =
    useState<Mesa[]>([]);

  /**
   * Productos reales cargados desde Inventario.
   */
  const [productos, setProductos] =
    useState<Producto[]>([]);

  const [ventas, setVentas] =
    useState<Venta[]>([]);

  const [cargandoMesas, setCargandoMesas] =
    useState(true);

  const [
    cargandoProductos,
    setCargandoProductos,
  ] = useState(true);

  const [
    errorMesas,
    setErrorMesas,
  ] = useState<string | null>(null);

  const [
    mesaSeleccionadaId,
    setMesaSeleccionadaId,
  ] = useState<number | null>(null);

  const [
    notificacion,
    setNotificacion,
  ] =
    useState<Notificacion | null>(null);

  // =====================================================
  // NOTIFICACIONES
  // =====================================================

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

  // =====================================================
  // CARGAR PRODUCTOS DESDE INVENTARIO
  // =====================================================

  /**
   * Carga los productos reales desde Supabase.
   *
   * Solo se muestran:
   *
   * - Productos activos.
   * - Productos con precio de venta.
   */
  async function cargarProductos() {
    setCargandoProductos(true);

    const { data, error } =
      await supabase
        .from("productos")
        .select(`
          id,
          nombre,
          categoria,
          precio_venta,
          imagen_url,
          activo
        `)
        .eq("activo", true)
        .order("nombre");

    if (error) {
      console.error(
        "Error cargando productos:",
        error
      );

      mostrarNotificacion(
        "error",
        "No se pudieron cargar los productos del inventario."
      );

      setCargandoProductos(false);

      return;
    }

    /**
     * Convertimos los datos de Supabase
     * al tipo Producto utilizado por Mesas.
     */
    const productosCargados: Producto[] =
      (data ?? [])
        .filter((fila) => {
          return (
            fila.precio_venta !== null &&
            Number(fila.precio_venta) > 0
          );
        })
        .map((fila) => ({
          id: Number(fila.id),

          nombre:
            fila.nombre ?? "Sin nombre",

          precio: Number(
            fila.precio_venta
          ),

          imagenUrl:
            fila.imagen_url ?? null,

          categoria:
            fila.categoria ?? null,
        }));

    setProductos(productosCargados);

    setCargandoProductos(false);
  }

  // =====================================================
  // CARGAR MESAS DESDE SUPABASE
  // =====================================================

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

    /**
     * Conservamos los productos locales
     * de las mesas mientras la mesa
     * permanece abierta.
     */
    setMesas((anteriores) => {
      const porId = new Map(
        anteriores.map((mesa) => [
          mesa.id,
          mesa,
        ])
      );

      return (data ?? []).map(
        (fila): Mesa => {
          const anterior =
            porId.get(fila.id);

          const estadoBd = String(
            fila.estado ?? ""
          ).toLowerCase();

          return {
            id: Number(fila.id),

            numero: Number(
              fila.numero
            ),

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
        }
      );
    });

    setCargandoMesas(false);
  }

  // =====================================================
  // CARGAR VENTAS DESDE SUPABASE
  // =====================================================

  async function cargarVentas() {
    const { data, error } =
      await supabase
        .from("ventas")
        .select("*")
        .order("id", {
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
        id: Number(fila.id),

        mesaId: Number(
          fila.mesa_id
        ),

        /**
         * Temporalmente usamos mesa_id.
         * Más abajo se reemplaza por
         * el número real de la mesa.
         */
        mesaNumero: Number(
          fila.mesa_id
        ),

        total: Number(
          fila.total
        ),

        fecha: fila.created_at
          ? new Date(
              fila.created_at
            )
          : new Date(),
      }));

    /**
     * Obtenemos el número real
     * de cada mesa.
     */
    const {
      data: mesasData,
      error: errorMesas,
    } = await supabase
      .from("mesas")
      .select("id, numero");

    if (
      !errorMesas &&
      mesasData
    ) {
      const numerosMesas =
        new Map(
          mesasData.map(
            (mesa) => [
              Number(mesa.id),
              Number(mesa.numero),
            ]
          )
        );

      setVentas(
        ventasCargadas.map(
          (venta) => ({
            ...venta,

            mesaNumero:
              numerosMesas.get(
                venta.mesaId
              ) ??
              venta.mesaId,
          })
        )
      );
    } else {
      setVentas(
        ventasCargadas
      );
    }
  }

  // =====================================================
  // CARGAR DATOS AL INICIAR
  // =====================================================

  useEffect(() => {
    async function cargarDatos() {
      await Promise.all([
        cargarMesas(),
        cargarVentas(),
        cargarProductos(),
      ]);
    }

    cargarDatos();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // =====================================================
  // ABRIR MESA
  // =====================================================

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

    /**
     * Abrimos automáticamente
     * el formulario de la mesa.
     */
    setMesaSeleccionadaId(id);
  }

  // =====================================================
  // SELECCIONAR MESA
  // =====================================================

  function seleccionarMesa(
    id: number
  ) {
    setMesaSeleccionadaId(id);
  }

  // =====================================================
  // CERRAR MODAL
  // =====================================================

  function cerrarModal() {
    setMesaSeleccionadaId(null);
  }

  // =====================================================
  // AGREGAR PRODUCTO
  // =====================================================

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
                          item.cantidad +
                          1,
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
                    imagenUrl: producto.imagenUrl ?? null,
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

  // =====================================================
  // AUMENTAR CANTIDAD
  // =====================================================

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
                      item.cantidad +
                      1,
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

  // =====================================================
  // DISMINUIR CANTIDAD
  // =====================================================

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
                      item.cantidad -
                      1,
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

  // =====================================================
  // ELIMINAR PRODUCTO
  // =====================================================

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

  // =====================================================
  // CERRAR MESA Y REGISTRAR VENTA
  // =====================================================

  async function cerrarMesa(
    id: number
  ): Promise<boolean> {
    const mesa =
      mesas.find(
        (m) => m.id === id
      );

    if (!mesa) {
      return false;
    }

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

    // =================================================
    // REGISTRAR VENTA
    // =================================================

    const {
      data: ventaCreada,
      error: errorVenta,
    } = await supabase
      .from("ventas")
      .insert([
        {
          mesa_id: mesa.id,

          total: mesa.total,

          estado: "cerrada",
        },
      ])
      .select()
      .single();

    if (errorVenta) {
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

    // =================================================
    // LIBERAR MESA
    // =================================================

    const {
      error: errorMesa,
    } = await supabase
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
        "La venta se registró, pero la mesa no se pudo liberar."
      );

      return false;
    }

    // =================================================
    // AGREGAR VENTA AL ESTADO LOCAL
    // =================================================

    setVentas((prev) => [
      ...prev,

      {
        id: ventaCreada.id,

        mesaId: mesa.id,

        mesaNumero:
          mesa.numero,

        total:
          Number(mesa.total),

        fecha:
          ventaCreada.created_at
            ? new Date(
                ventaCreada.created_at
              )
            : new Date(),
      },
    ]);

    // =================================================
    // LIBERAR MESA LOCALMENTE
    // =================================================

    setMesas((prev) =>
      prev.map((m) =>
        m.id === id
          ? {
              ...m,

              estado: "Libre",

              total: 0,

              productos: [],

              abiertaDesde:
                null,
            }
          : m
      )
    );

    setMesaSeleccionadaId(null);

    mostrarNotificacion(
      "success",
      `Venta registrada correctamente (Mesa ${mesa.numero}).`
    );

    return true;
  }

  // =====================================================
  // MESA ACTUAL
  // =====================================================

  const mesaActual = useMemo(
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

  // =====================================================
  // TOTAL DE VENTAS
  // =====================================================

  const ventasDelDia = useMemo(
    () =>
      ventas.reduce(
        (total, venta) =>
          total + venta.total,
        0
      ),

    [ventas]
  );

  // =====================================================
  // RESUMEN DE MESAS
  // =====================================================

  const resumen = useMemo(() => {
    const libres =
      mesas.filter(
        (mesa) =>
          mesa.estado === "Libre"
      ).length;

    const ocupadas =
      mesas.filter(
        (mesa) =>
          mesa.estado === "Ocupada"
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

  // =====================================================
  // RETURN
  // =====================================================

  return {
    // Mesas
    mesas,

    // Productos reales del inventario
    productos,

    // Ventas
    ventas,

    ventasDelDia,

    // Resumen
    resumen,

    // Cargas
    cargandoMesas,

    cargandoProductos,

    // Errores
    errorMesas,

    // Mesa actual
    mesaActual,

    // Notificación
    notificacion,

    cerrarNotificacion: () =>
      setNotificacion(null),

    // Carga de datos
    cargarMesas,

    cargarVentas,

    cargarProductos,

    // Mesas
    abrirMesa,

    seleccionarMesa,

    cerrarModal,

    // Pedido
    agregarProducto,

    aumentarCantidad,

    disminuirCantidad,

    eliminarProducto,

    // Venta
    cerrarMesa,
  };
}

export type UseMesasResult =
  ReturnType<typeof useMesas>;