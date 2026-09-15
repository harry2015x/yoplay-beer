// ============================================================
// TYPES/VENTAS.TS
// Tipos compartidos para el módulo de Ventas
// ============================================================


// ============================================================
// ESTADO DE LA VENTA
// ============================================================

export type EstadoVenta =
  | "abierta"
  | "cerrada";


// ============================================================
// MÉTODO DE PAGO
// ============================================================

export type MetodoPagoVenta =
  | "efectivo"
  | "transferencia"
  | "combinado";


// ============================================================
// PRODUCTO DE UNA VENTA
// ============================================================

export type ProductoVenta = {

  id: number;

  productoId: number | null;

  nombreProducto: string;

  precio: number;

  cantidad: number;

  subtotal: number;

};


// ============================================================
// VENTA
// ============================================================

export type Venta = {

  id: number;

  mesaId: number | null;

  usuarioId: string | null;

  total: number;

  estado: string;

  createdAt: string | null;

  closedAt: string | null;

  // ==========================================================
  // MÉTODO DE PAGO (null = venta anterior a esta funcionalidad,
  // registrada antes de que existiera la columna en Supabase).
  //
  // montoEfectivo + montoTransferencia siempre deben sumar
  // exactamente `total` cuando metodoPago no es null — nunca
  // incluyen dinero recibido de más ni cambio devuelto.
  // ==========================================================

  metodoPago: MetodoPagoVenta | null;

  montoEfectivo: number | null;

  montoTransferencia: number | null;

};


// ============================================================
// VENTA CON INFORMACIÓN COMPLETA
// ============================================================

export type VentaDetalle =
  Venta & {

    mesaNumero: number | null;

    usuarioNombre: string;

    productos: ProductoVenta[];

  };


// ============================================================
// RESUMEN DE VENTAS POR USUARIO
// ============================================================

export type ResumenVentasUsuario = {

  usuarioId: string | null;

  usuarioNombre: string;

  cantidadVentas: number;

  totalVentas: number;

  ventas: VentaDetalle[];

};


// ============================================================
// RESULTADO DEL HOOK
// ============================================================

export type UseVentasResult = {


  // ==========================================================
  // DATOS
  // ==========================================================

  ventas: VentaDetalle[];

  resumenUsuarios: ResumenVentasUsuario[];


  // ==========================================================
  // ESTADOS
  // ==========================================================

  cargando: boolean;

  error: string | null;


  // ==========================================================
  // RESUMEN GENERAL
  // ==========================================================

  totalVentasDia: number;

  cantidadVentasDia: number;


  // ==========================================================
  // FUNCIONES
  // ==========================================================

  cargarVentas: () => Promise<void>;

  limpiarError: () => void;

};