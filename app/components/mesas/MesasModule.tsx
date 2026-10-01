"use client";

import { useMemo, useState } from "react";

import type { UseMesasResult } from "../../../hooks/useMesas";

import { useInventario } from "../../../hooks/useInventario";

import {
  Mesa,
  Producto,
} from "../../../types/mesas";

import type { MetodoPagoVenta } from "../../../types/ventas";

import MesasResumen from "./MesasResumen";

import MesasFiltros, {
  FiltroMesas,
} from "./MesasFiltros";

import MesaCard from "./MesaCard";

import MesaModal from "./MesaModal";

import ConfirmModal from "./ConfirmModal";

import CerrarCuentaModal from "./CerrarCuentaModal";

import Notificacion from "./Notificacion";

import {
  IconoAlerta,
  IconoBuscar,
  IconoMas,
  IconoSilla,
} from "./IconosMesas";


// ============================================================
// PROPS
// ============================================================

type Props = {

  estado: UseMesasResult;

  /**
   * true si el usuario autenticado tiene rol "administrador"
   * (ver hooks/useAuth.ts -> perfil.rol). Controla la visibilidad
   * de "Nueva mesa" y "Eliminar mesa".
   */
  esAdministrador: boolean;

};


// ============================================================
// COMPONENTE PRINCIPAL
// ============================================================

export default function MesasModule({

  estado,

  esAdministrador,

}: Props) {


  // ==========================================================
  // FILTROS
  // ==========================================================

  const [filtro, setFiltro] =
    useState<FiltroMesas>("todas");


  const [busqueda, setBusqueda] =
    useState("");


  // ==========================================================
  // MESA A CONFIRMAR
  // ==========================================================

  const [mesaAConfirmar, setMesaAConfirmar] =
    useState<Mesa | null>(null);


  // ==========================================================
  // MESA A ELIMINAR (solo administrador)
  // ==========================================================

  const [mesaAEliminar, setMesaAEliminar] =
    useState<Mesa | null>(null);


  // ==========================================================
  // PROCESANDO PAGO (evita doble clic en "Confirmar pago")
  // ==========================================================

  const [procesandoPago, setProcesandoPago] =
    useState(false);


  // ==========================================================
  // INVENTARIO
  // ==========================================================

  const {

    productos: productosInventario,

    cargandoProductos,

  } = useInventario();


  // ==========================================================
  // CONVERTIR PRODUCTOS DEL INVENTARIO
  // AL FORMATO UTILIZADO POR MESAS
  // ==========================================================

  const productos = useMemo<Producto[]>(() => {

    return productosInventario

      .filter((producto) => producto.activo)

      .map((producto) => ({

        id:
          producto.id,


        nombre:
          producto.nombre,


        // En inventario:
        // precioVenta
        //
        // En mesas:
        // precio

        precio:
          producto.precioVenta ?? 0,


        categoria:
          producto.categoria ?? null,


        imagenUrl:
          producto.imagenUrl ?? null,

      }));

  }, [productosInventario]);


  // ==========================================================
  // ESTADO DE MESAS
  // ==========================================================

  const {

    mesas,

    cargandoMesas,

    errorMesas,

    mesaActual,

    resumen,

    notificacion,

    cerrarNotificacion,

    cargarMesas,

    abrirMesa,

    seleccionarMesa,

    cerrarModal,

    agregarProducto,

    aumentarCantidad,

    disminuirCantidad,

    eliminarProducto,


    // ========================================================
    // LIBERAR UNA MESA VACÍA
    // ========================================================

    liberarMesa,


    // ========================================================
    // CERRAR UNA MESA CON PRODUCTOS
    // ========================================================

    cerrarMesa,


    // ========================================================
    // CREAR / ELIMINAR MESA (solo administrador)
    // ========================================================

    crearMesa,

    eliminarMesa,

    creandoMesa,

    eliminandoMesaId,


    // ========================================================
    // NOTA TEMPORAL DE LA MESA (SOLO FRONTEND, NO SUPABASE)
    // ========================================================

    notasMesas,

    establecerNotaMesa,


  } = estado;


  // ==========================================================
  // FILTRAR MESAS
  // ==========================================================

  const mesasFiltradas = useMemo(() => {

    return mesas.filter((mesa) => {


      // ======================================================
      // FILTRO POR ESTADO
      // ======================================================

      const coincideFiltro =

        filtro === "todas" ||


        (
          filtro === "libres" &&

          mesa.estado === "Libre"
        ) ||


        (
          filtro === "ocupadas" &&

          mesa.estado === "Ocupada"
        );


      // ======================================================
      // FILTRO POR BÚSQUEDA
      // ======================================================

      const coincideBusqueda =

        busqueda.trim() === "" ||


        String(mesa.numero).includes(

          busqueda.trim()

        );


      // ======================================================
      // RESULTADO
      // ======================================================

      return (

        coincideFiltro &&

        coincideBusqueda

      );

    });

  }, [

    mesas,

    filtro,

    busqueda,

  ]);


  // ==========================================================
  // ¿LA MESA A CONFIRMAR ESTÁ VACÍA?
  //
  // Vacía = sin productos o total <= 0. Se usa para decidir si
  // se muestra la confirmación de "liberar mesa" (sin venta) o
  // el nuevo modal de cierre de cuenta con método de pago.
  // ==========================================================

  function mesaEstaVacia(mesa: Mesa) {

    return (

      mesa.productos.length === 0 ||

      mesa.total <= 0

    );

  }


  const mesaAConfirmarVacia =

    mesaAConfirmar

      ? mesaEstaVacia(mesaAConfirmar)

      : false;


  // ==========================================================
  // CONFIRMAR LIBERACIÓN DE MESA VACÍA
  //
  // No registra venta. Simplemente vuelve a estado LIBRE.
  // ========================================================== 

  async function confirmarLiberacion() {

    if (!mesaAConfirmar) {

      return;

    }

    const exito = await liberarMesa(

      mesaAConfirmar.id

    );

    if (exito) {

      setMesaAConfirmar(null);

      cerrarModal();

    }

  }


  // ==========================================================
  // CONFIRMAR PAGO (MESA CON PRODUCTOS)
  //
  // El método de pago y el dinero recibido se validan y calculan
  // dentro de CerrarCuentaModal (estado local, no persistido). El
  // valor de la venta SIEMPRE es mesa.total (el total real de los
  // productos) — el dinero recibido nunca lo modifica.
  // ==========================================================

  async function confirmarPago(pago: {

    metodoPago: MetodoPagoVenta;

    montoEfectivo: number;

    montoTransferencia: number;

  }) {

    if (!mesaAConfirmar || procesandoPago) {

      return;

    }

    setProcesandoPago(true);

    const exito = await cerrarMesa(

      mesaAConfirmar.id,

      pago.metodoPago,

      pago.montoEfectivo,

      pago.montoTransferencia

    );

    setProcesandoPago(false);

    if (exito) {

      setMesaAConfirmar(null);

      cerrarModal();

    }

  }


  // ==========================================================
  // SOLICITAR CIERRE
  // ==========================================================

  function solicitarCierre(

    mesa: Mesa

  ) {


    setMesaAConfirmar(

      mesa

    );


    cerrarModal();


  }


  // ==========================================================
  // CREAR NUEVA MESA (solo administrador)
  // ==========================================================

  async function crearNuevaMesa() {

    if (!esAdministrador || creandoMesa) {

      return;

    }

    await crearMesa();

  }


  // ==========================================================
  // SOLICITAR ELIMINACIÓN DE UNA MESA (solo administrador)
  // ==========================================================

  function solicitarEliminacion(

    mesa: Mesa

  ) {

    if (!esAdministrador) {

      return;

    }

    setMesaAEliminar(mesa);

  }


  // ==========================================================
  // CONFIRMAR ELIMINACIÓN
  // ==========================================================

  async function confirmarEliminacion() {

    if (!mesaAEliminar) {

      return;

    }

    const exito = await eliminarMesa(

      mesaAEliminar.id

    );

    if (exito) {

      setMesaAEliminar(null);

    }

  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="mesas-modulo">


      {/* =====================================================
          ESTILOS
          Paleta YOPLAY BEER: verde, verde oscuro, naranja, rojo,
          tinta oscura y fondos claros (tokens --m-*).
          .mesa-btn y .mesas-modal-entrada también los usan los
          modales del módulo (MesaModal, ConfirmModal, etc.).
      ===================================================== */}

      <style>{`

        .mesas-modulo {
          --m-verde: #16a34a;
          --m-verde-hover: #15803d;
          --m-verde-medio: #157a3d;
          --m-verde-oscuro: #0f5c2e;
          --m-verde-suave: #dcfce7;
          --m-verde-texto: #166534;
          --m-neon: #39ff14;
          --m-naranja: #f59e0b;
          --m-naranja-hover: #d97706;
          --m-naranja-suave: #fef3c7;
          --m-naranja-borde: #fde68a;
          --m-naranja-texto: #92400e;
          --m-rojo: #ef4444;
          --m-rojo-oscuro: #b91c1c;
          --m-rojo-suave: #fef2f2;
          --m-rojo-borde: #fecaca;
          --m-tinta: #14181c;
          --m-tinta-hover: #1f2430;
          --m-texto: #1f2430;
          --m-gris: #6b7280;
          --m-gris-claro: #9aa3ad;
          --m-borde: #e4e7eb;
          --m-fondo: #f6f7f8;
          --m-sombra: 0 1px 2px rgba(16, 24, 40, 0.04), 0 4px 16px rgba(16, 24, 40, 0.05);
          --m-sombra-hover: 0 2px 4px rgba(16, 24, 40, 0.05), 0 14px 32px rgba(16, 24, 40, 0.1);
          color: var(--m-texto);
        }


        /* ---------- Botones compartidos (también modales) ---------- */

        .mesa-btn {
          transition:
            filter 120ms ease,
            transform 120ms ease;
        }

        .mesa-btn:hover:not(:disabled) {
          filter: brightness(1.07);
        }

        .mesa-btn:active:not(:disabled) {
          transform: scale(0.98);
        }

        .mesa-btn:focus-visible,
        .mesas-filtro-btn:focus-visible {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }

        .mesas-modal-entrada {
          animation: mesas-aparecer 160ms ease;
        }

        @keyframes mesas-aparecer {
          from {
            opacity: 0;
            transform: scale(0.97);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }


        /* ---------- Encabezado ---------- */

        .mesas-encabezado {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          margin-bottom: 22px;
        }

        .mesas-encabezado__marca {
          display: flex;
          align-items: center;
          gap: 14px;
          min-width: 0;
        }

        .mesas-encabezado__icono {
          width: 48px;
          height: 48px;
          flex-shrink: 0;
          border-radius: 14px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, var(--m-verde-oscuro), var(--m-verde-medio));
          color: var(--m-neon);
          box-shadow: 0 6px 16px rgba(15, 92, 46, 0.25);
        }

        .mesas-encabezado__titulo {
          margin: 0;
          font-size: 26px;
          font-weight: 800;
          line-height: 1.15;
          letter-spacing: -0.02em;
          color: var(--m-tinta);
        }

        .mesas-encabezado__subtitulo {
          margin: 3px 0 0;
          font-size: 14px;
          color: var(--m-gris);
        }

        .mesas-btn-nueva {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 46px;
          padding: 12px 20px;
          border: none;
          border-radius: 12px;
          background: var(--m-naranja);
          color: white;
          font-family: inherit;
          font-size: 15px;
          font-weight: 700;
          white-space: nowrap;
          cursor: pointer;
          box-shadow: 0 6px 16px rgba(245, 158, 11, 0.3);
          transition:
            background 160ms ease,
            box-shadow 160ms ease,
            filter 120ms ease,
            transform 120ms ease;
        }

        .mesas-btn-nueva:hover:not(:disabled) {
          background: var(--m-naranja-hover);
          box-shadow: 0 8px 20px rgba(217, 119, 6, 0.32);
        }

        .mesas-btn-nueva:disabled {
          cursor: default;
          opacity: 0.7;
          box-shadow: none;
        }


        /* ---------- Resumen ---------- */

        .mesas-resumen {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
          gap: 14px;
          margin-bottom: 18px;
        }

        .mesas-stat {
          --tono: var(--m-tinta);
          --tono-suave: rgba(20, 24, 28, 0.07);
          position: relative;
          overflow: hidden;
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 16px 18px;
          background: white;
          border: 1px solid var(--m-borde);
          border-radius: 16px;
          box-shadow: var(--m-sombra);
          transition:
            transform 200ms ease,
            box-shadow 200ms ease;
        }

        .mesas-stat::after {
          content: "";
          position: absolute;
          left: 0;
          top: 14px;
          bottom: 14px;
          width: 3px;
          border-radius: 0 3px 3px 0;
          background: var(--tono);
        }

        .mesas-stat:hover {
          transform: translateY(-2px);
          box-shadow: var(--m-sombra-hover);
        }

        .mesas-stat--verde {
          --tono: var(--m-verde);
          --tono-suave: rgba(22, 163, 74, 0.1);
        }

        .mesas-stat--naranja {
          --tono: var(--m-naranja);
          --tono-suave: rgba(245, 158, 11, 0.14);
          --tono-icono: #b45309;
        }

        .mesas-stat--verde-oscuro {
          --tono: var(--m-verde-oscuro);
          --tono-suave: rgba(15, 92, 46, 0.1);
        }

        .mesas-stat__icono {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          border-radius: 12px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--tono-suave);
          color: var(--tono-icono, var(--tono));
        }

        .mesas-stat__texto {
          min-width: 0;
        }

        .mesas-stat__etiqueta {
          margin: 0;
          font-size: 12.5px;
          font-weight: 600;
          color: var(--m-gris);
        }

        .mesas-stat__valor {
          margin: 2px 0 0;
          font-size: 28px;
          font-weight: 800;
          line-height: 1.1;
          letter-spacing: -0.02em;
          color: var(--m-tinta);
          font-variant-numeric: tabular-nums;
        }


        /* ---------- Filtros y búsqueda ---------- */

        .mesas-toolbar {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 10px;
          padding: 8px;
          margin-bottom: 22px;
          background: white;
          border: 1px solid var(--m-borde);
          border-radius: 16px;
          box-shadow: var(--m-sombra);
        }

        .mesas-segmentos {
          display: flex;
          gap: 4px;
          padding: 4px;
          border-radius: 12px;
          background: var(--m-fondo);
        }

        .mesas-filtro-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          min-height: 40px;
          padding: 9px 16px;
          border: none;
          border-radius: 9px;
          background: transparent;
          color: #4b5563;
          font-family: inherit;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition:
            background 160ms ease,
            color 160ms ease,
            box-shadow 160ms ease;
        }

        .mesas-filtro-btn:hover {
          background: rgba(20, 24, 28, 0.05);
          color: var(--m-tinta);
        }

        .mesas-filtro-btn[aria-selected="true"] {
          background: var(--m-tinta);
          color: white;
          box-shadow: 0 2px 8px rgba(20, 24, 28, 0.18);
        }

        .mesas-filtro-btn__punto {
          width: 7px;
          height: 7px;
          border-radius: 50%;
        }

        .mesas-filtro-btn--todas .mesas-filtro-btn__punto {
          display: none;
        }

        .mesas-filtro-btn--libres .mesas-filtro-btn__punto {
          background: var(--m-verde);
        }

        .mesas-filtro-btn--ocupadas .mesas-filtro-btn__punto {
          background: var(--m-naranja);
        }

        .mesas-busqueda {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1 1 240px;
          max-width: 340px;
        }

        .mesas-busqueda__icono {
          position: absolute;
          left: 12px;
          display: inline-flex;
          color: var(--m-gris-claro);
          pointer-events: none;
          transition: color 160ms ease;
        }

        .mesas-busqueda__input {
          width: 100%;
          min-height: 42px;
          padding: 10px 14px 10px 38px;
          border: 1px solid var(--m-borde);
          border-radius: 11px;
          background: var(--m-fondo);
          color: var(--m-texto);
          font-family: inherit;
          font-size: 14px;
          outline: none;
          transition:
            border-color 160ms ease,
            box-shadow 160ms ease,
            background 160ms ease;
        }

        .mesas-busqueda__input::placeholder {
          color: var(--m-gris-claro);
        }

        .mesas-busqueda__input:hover {
          border-color: #d1d5db;
        }

        .mesas-busqueda__input:focus {
          background: white;
          border-color: var(--m-verde);
          box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.15);
        }

        .mesas-busqueda:focus-within .mesas-busqueda__icono {
          color: var(--m-verde);
        }


        /* ---------- Error y estados vacíos ---------- */

        .mesas-aviso-error {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          align-items: center;
          gap: 12px;
          padding: 14px 16px;
          margin-bottom: 20px;
          background: var(--m-rojo-suave);
          border: 1px solid var(--m-rojo-borde);
          border-radius: 14px;
          color: #991b1b;
        }

        .mesas-aviso-error__mensaje {
          display: flex;
          align-items: center;
          gap: 10px;
          font-weight: 500;
        }

        .mesas-aviso-error__mensaje svg {
          flex-shrink: 0;
        }

        .mesas-aviso-error__btn {
          min-height: 40px;
          padding: 9px 16px;
          border: none;
          border-radius: 10px;
          background: #991b1b;
          color: white;
          font-family: inherit;
          font-weight: 700;
          white-space: nowrap;
          cursor: pointer;
        }

        .mesas-vacio {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          padding: 44px 24px;
          text-align: center;
          background: white;
          border: 1px dashed #d7dbe0;
          border-radius: 18px;
          color: var(--m-gris);
        }

        .mesas-vacio__icono {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--m-fondo);
          color: var(--m-gris-claro);
        }

        .mesas-vacio__texto {
          margin: 0;
          max-width: 360px;
          font-size: 15px;
        }


        /* ---------- Grilla y tarjetas ---------- */

        .mesas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(230px, 1fr));
          gap: 18px;
        }

        .mesa-card {
          --estado: var(--m-verde);
          --estado-brillo: #16c784;
          --estado-suave: var(--m-verde-suave);
          --estado-texto: var(--m-verde-texto);
          position: relative;
          overflow: hidden;
          container-type: inline-size;
          display: flex;
          flex-direction: column;
          gap: 14px;
          padding: 20px 18px 18px;
          background: white;
          border: 1px solid var(--m-borde);
          border-radius: 18px;
          box-shadow: var(--m-sombra);
          animation: mesas-tarjeta-entrada 260ms ease backwards;
          transition:
            transform 200ms ease,
            box-shadow 200ms ease,
            border-color 200ms ease;
        }

        .mesa-card::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, var(--estado), var(--estado-brillo));
        }

        .mesa-card--ocupada {
          --estado: var(--m-naranja);
          --estado-brillo: #fbbf24;
          --estado-suave: var(--m-naranja-suave);
          --estado-texto: var(--m-naranja-texto);
          background: linear-gradient(180deg, #fffbeb 0%, white 110px);
          border-color: var(--m-naranja-borde);
        }

        .mesa-card:hover {
          transform: translateY(-3px);
          box-shadow: var(--m-sombra-hover);
        }

        .mesa-card--libre:hover {
          border-color: #bbf7d0;
        }

        .mesa-card--ocupada:hover {
          border-color: #fcd34d;
        }

        @keyframes mesas-tarjeta-entrada {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }

        .mesa-card__cabecera {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .mesa-card__identidad {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
        }

        .mesa-card__icono {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          border-radius: 13px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--estado-suave);
          color: var(--estado-texto);
          transition: transform 200ms ease;
        }

        .mesa-card:hover .mesa-card__icono {
          transform: scale(1.06) rotate(-4deg);
        }

        .mesa-card__titulo {
          margin: 0;
          display: flex;
          flex-direction: column;
          line-height: 1.05;
        }

        .mesa-card__titulo-etiqueta {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--m-gris-claro);
        }

        .mesa-card__numero {
          margin-top: 2px;
          font-size: 26px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--m-tinta);
          font-variant-numeric: tabular-nums;
        }

        .mesa-card__estado {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          flex-shrink: 0;
          padding: 5px 10px;
          border-radius: 999px;
          background: var(--estado-suave);
          color: var(--estado-texto);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.06em;
        }

        .mesa-card__punto {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: var(--estado);
        }

        .mesa-card--ocupada .mesa-card__punto {
          animation: mesas-pulso 1.8s ease-out infinite;
        }

        @keyframes mesas-pulso {
          0% {
            box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.55);
          }
          70%,
          100% {
            box-shadow: 0 0 0 6px rgba(245, 158, 11, 0);
          }
        }

        .mesa-card__nota {
          padding: 9px 12px;
          background: #fffbeb;
          border: 1px dashed #fcd34d;
          border-radius: 12px;
        }

        .mesa-card__nota-etiqueta {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.06em;
          color: var(--m-naranja-texto);
        }

        .mesa-card__nota-texto {
          display: block;
          margin-top: 3px;
          font-size: 13px;
          line-height: 1.35;
          color: #78350f;
          overflow-wrap: break-word;
        }

        .mesa-card__datos {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .mesa-card__total {
          display: flex;
          flex-direction: column;
          gap: 1px;
          padding: 11px 14px;
          background: white;
          border: 1px solid var(--m-borde);
          border-radius: 12px;
        }

        .mesa-card__total-etiqueta {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--m-gris-claro);
        }

        .mesa-card__total-valor {
          font-size: 24px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: var(--m-tinta);
          font-variant-numeric: tabular-nums;
          overflow-wrap: anywhere;
        }

        .mesa-card__meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .mesa-card__chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 5px 9px;
          border-radius: 8px;
          background: var(--m-fondo);
          color: #4b5563;
          font-size: 12.5px;
          font-weight: 600;
        }

        .mesa-card__chip svg {
          color: var(--m-gris-claro);
        }

        .mesa-card__chip--tiempo {
          background: var(--m-naranja-suave);
          color: var(--m-naranja-texto);
        }

        .mesa-card__chip--tiempo svg {
          color: inherit;
        }


        /* ---------- Acciones de la tarjeta ---------- */

        .mesa-card__acciones {
          margin-top: auto;
          display: grid;
          gap: 8px;
        }

        @container (min-width: 340px) {
          .mesa-card__acciones--doble {
            grid-template-columns: 1fr 1fr;
          }
        }

        .mesa-accion {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          min-height: 46px;
          padding: 10px 14px;
          border: 1px solid transparent;
          border-radius: 12px;
          font-family: inherit;
          font-size: 14.5px;
          font-weight: 700;
          cursor: pointer;
          transition:
            background 160ms ease,
            color 160ms ease,
            border-color 160ms ease,
            box-shadow 160ms ease,
            filter 120ms ease,
            transform 120ms ease;
        }

        .mesa-accion svg {
          flex-shrink: 0;
          transition: transform 160ms ease;
        }

        .mesa-accion--abrir {
          background: var(--m-verde);
          color: white;
          box-shadow: 0 6px 14px rgba(22, 163, 74, 0.28);
        }

        .mesa-accion--abrir:hover:not(:disabled) {
          background: var(--m-verde-hover);
          box-shadow: 0 8px 20px rgba(22, 163, 74, 0.34);
        }

        .mesa-accion--abrir:hover svg {
          transform: translateX(3px);
        }

        .mesa-accion--eliminar {
          min-height: 44px;
          background: transparent;
          border-color: var(--m-rojo-borde);
          color: #dc2626;
          font-size: 13.5px;
          font-weight: 600;
        }

        .mesa-accion--eliminar:hover:not(:disabled) {
          background: var(--m-rojo-suave);
          border-color: #fca5a5;
        }

        .mesa-accion--eliminar:disabled {
          cursor: default;
          opacity: 0.6;
        }

        .mesa-accion--gestionar {
          background: var(--m-tinta);
          color: white;
          box-shadow: 0 6px 14px rgba(20, 24, 28, 0.18);
        }

        .mesa-accion--gestionar:hover:not(:disabled) {
          background: var(--m-tinta-hover);
        }

        .mesa-accion--cerrar {
          background: var(--m-rojo-suave);
          border-color: var(--m-rojo-borde);
          color: var(--m-rojo-oscuro);
        }

        .mesa-accion--cerrar:hover:not(:disabled) {
          background: var(--m-rojo);
          border-color: var(--m-rojo);
          color: white;
          box-shadow: 0 6px 14px rgba(239, 68, 68, 0.28);
        }

        .mesa-accion:focus-visible,
        .mesas-btn-nueva:focus-visible,
        .mesas-filtro-btn:focus-visible {
          outline: 2px solid var(--m-verde);
          outline-offset: 2px;
        }


        /* ---------- Cargando ---------- */

        .mesas-skeleton {
          background:
            linear-gradient(
              90deg,
              #eceff3 25%,
              #f6f7f9 37%,
              #eceff3 63%
            );
          background-size: 400% 100%;
          animation: mesas-shimmer 1.4s ease infinite;
          border-radius: 18px;
          height: 200px;
        }

        @keyframes mesas-shimmer {
          0% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0 50%;
          }
        }


        /* ---------- Responsive ---------- */

        @media (min-width: 641px) and (max-width: 1024px) {
          .mesas-grid {
            grid-template-columns: repeat(auto-fill, minmax(210px, 1fr));
            gap: 16px;
          }
        }

        @media (max-width: 640px) {
          .mesas-encabezado {
            flex-direction: column;
            align-items: stretch;
          }

          .mesas-encabezado__titulo {
            font-size: 22px;
          }

          .mesas-btn-nueva {
            width: 100%;
          }

          .mesas-resumen {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 10px;
          }

          .mesas-stat {
            flex-direction: column;
            align-items: flex-start;
            gap: 10px;
            padding: 14px;
          }

          .mesas-stat__icono {
            width: 36px;
            height: 36px;
            border-radius: 10px;
          }

          .mesas-stat__valor {
            font-size: 24px;
          }

          .mesas-toolbar {
            flex-direction: column;
            align-items: stretch;
          }

          .mesas-filtro-btn {
            flex: 1;
            padding: 9px 8px;
          }

          .mesas-busqueda {
            flex-basis: auto;
            max-width: none;
          }

          .mesas-grid {
            gap: 14px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .mesa-card,
          .mesa-card__punto,
          .mesas-skeleton {
            animation: none;
          }

          .mesa-card:hover,
          .mesas-stat:hover,
          .mesa-card:hover .mesa-card__icono {
            transform: none;
          }
        }

      `}</style>


      {/* =====================================================
          ENCABEZADO
      ===================================================== */}

      <div className="mesas-encabezado">

        <div className="mesas-encabezado__marca">

          <span className="mesas-encabezado__icono">

            <IconoSilla tamano={24} />

          </span>

          <div>

            <h2 className="mesas-encabezado__titulo">

              Mesas

            </h2>

            <p className="mesas-encabezado__subtitulo">

              Gestión y control de mesas

            </p>

          </div>

        </div>


        {/* =====================================================
            NUEVA MESA (SOLO ADMINISTRADOR)
        ===================================================== */}

        {esAdministrador && (

          <button

            onClick={crearNuevaMesa}

            disabled={creandoMesa}

            aria-label="Crear nueva mesa"

            className="mesa-btn mesas-btn-nueva"

          >

            {creandoMesa

              ? "Creando mesa..."

              : (
                <>
                  <IconoMas tamano={18} />
                  Nueva mesa
                </>
              )}

          </button>

        )}


      </div>


      {/* =====================================================
          RESUMEN
      ===================================================== */}

      <MesasResumen

        total={resumen.total}

        libres={resumen.libres}

        ocupadas={resumen.ocupadas}

        ventasActivas={resumen.ventasActivas}

      />


      {/* =====================================================
          FILTROS
      ===================================================== */}

      <MesasFiltros

        filtro={filtro}

        onCambiarFiltro={setFiltro}

        busqueda={busqueda}

        onCambiarBusqueda={setBusqueda}

      />


      {/* =====================================================
          ERROR
      ===================================================== */}

      {errorMesas && (

        <div

          role="alert"

          className="mesas-aviso-error"

        >


          <span className="mesas-aviso-error__mensaje">

            <IconoAlerta tamano={20} />

            <span>

              {errorMesas}

            </span>

          </span>


          <button

            onClick={cargarMesas}

            className="mesa-btn mesas-aviso-error__btn"

          >

            Reintentar

          </button>


        </div>

      )}


      {/* =====================================================
          CARGANDO MESAS
      ===================================================== */}

      {cargandoMesas ? (

        <div className="mesas-grid">


          {Array.from({

            length:
              8,

          }).map((_, indice) => (

            <div

              key={indice}

              className="mesas-skeleton"

              aria-hidden="true"

            />

          ))}


        </div>


      ) : !errorMesas &&

        mesas.length === 0 ? (


        <div className="mesas-vacio">

          <span className="mesas-vacio__icono">

            <IconoSilla tamano={26} />

          </span>

          <p className="mesas-vacio__texto">

            No hay mesas registradas.

          </p>

        </div>


      ) : !errorMesas &&

        mesasFiltradas.length === 0 ? (


        <div className="mesas-vacio">

          <span className="mesas-vacio__icono">

            <IconoBuscar tamano={24} />

          </span>

          <p className="mesas-vacio__texto">

            Ninguna mesa coincide con el filtro

            o la búsqueda actual.

          </p>

        </div>


      ) : null}


      {/* =====================================================
          LISTADO DE MESAS
      ===================================================== */}

      {!cargandoMesas &&

        !errorMesas &&

        mesasFiltradas.length > 0 && (

          <div className="mesas-grid">


            {mesasFiltradas.map(

              (mesa) => (

                <MesaCard

                  key={mesa.id}

                  mesa={mesa}

                  onAbrir={abrirMesa}

                  onGestionar={seleccionarMesa}

                  onSolicitarCierre={solicitarCierre}

                  esAdministrador={esAdministrador}

                  onSolicitarEliminar={solicitarEliminacion}

                  eliminando={

                    eliminandoMesaId === mesa.id

                  }

                  nota={notasMesas[mesa.id]}

                />

              )

            )}


          </div>

        )}


      {/* =====================================================
          MODAL DE LA MESA
      ===================================================== */}

      {mesaActual && (

        <MesaModal

          mesa={mesaActual}

          productos={productos}

          cargandoProductos={

            cargandoProductos

          }

          onCerrarModal={

            cerrarModal

          }

          onAgregarProducto={

            agregarProducto

          }

          onAumentar={

            aumentarCantidad

          }

          onDisminuir={

            disminuirCantidad

          }

          onEliminar={

            eliminarProducto

          }

          onSolicitarCierre={

            solicitarCierre

          }

          nota={

            notasMesas[mesaActual.id] ?? ""

          }

          onCambiarNota={(texto) =>

            establecerNotaMesa(mesaActual.id, texto)

          }

        />

      )}


      {/* =====================================================
          CIERRE DE CUENTA — MÉTODO DE PAGO (MESA CON PRODUCTOS)
      ===================================================== */}

      {mesaAConfirmar && !mesaAConfirmarVacia && (

        <CerrarCuentaModal

          key={mesaAConfirmar.id}

          mesa={mesaAConfirmar}

          procesando={procesandoPago}

          onConfirmar={confirmarPago}

          onCancelar={() =>

            !procesandoPago && setMesaAConfirmar(null)

          }

        />

      )}


      {/* =====================================================
          CONFIRMACIÓN
      ===================================================== */}

      <ConfirmModal

        abierto={

          mesaAConfirmar !== null &&

          mesaAConfirmarVacia

        }


        titulo={

          mesaAConfirmar

            ? `Liberar mesa — Mesa ${mesaAConfirmar.numero}`

            : ""

        }


        mensaje={

          mesaAConfirmar

            ? `Esta mesa no tiene productos registrados.

No se creará ninguna venta.

¿Deseas liberar la Mesa ${mesaAConfirmar.numero}?`

            : ""

        }


        etiquetaConfirmar="Liberar mesa"


        etiquetaCancelar="Cancelar"


        peligroso={true}


        onConfirmar={

          confirmarLiberacion

        }


        onCancelar={() =>

          setMesaAConfirmar(null)

        }

      />


      {/* =====================================================
          CONFIRMACIÓN DE ELIMINACIÓN (SOLO ADMINISTRADOR)
      ===================================================== */}

      <ConfirmModal

        abierto={

          esAdministrador &&

          mesaAEliminar !== null

        }

        titulo="Eliminar mesa"

        mensaje={

          mesaAEliminar

            ? `¿Deseas eliminar la Mesa ${mesaAEliminar.numero}?\n\nEsta acción no se puede deshacer.`

            : ""

        }

        etiquetaConfirmar={

          mesaAEliminar &&

          eliminandoMesaId ===

            mesaAEliminar.id

            ? "Eliminando..."

            : "🗑️ Eliminar"

        }

        etiquetaCancelar="Cancelar"

        peligroso={true}

        onConfirmar={

          confirmarEliminacion

        }

        onCancelar={() =>

          setMesaAEliminar(null)

        }

      />


      {/* =====================================================
          NOTIFICACIONES
      ===================================================== */}

      {notificacion && (

        <Notificacion

          notificacion={notificacion}

          onCerrar={

            cerrarNotificacion

          }

        />

      )}


    </div>

  );

}