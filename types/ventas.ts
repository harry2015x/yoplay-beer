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
// PRODUCTO DENTRO DE UNA VENTA
// ============================================================

export type ProductoVenta = {

  id: number;

  productoId: number | null;

  nombre: string;

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

};


// ============================================================
// VENTA CON INFORMACIÓN DE MESA, USUARIO Y PRODUCTOS
// ============================================================

export type VentaDetalle =
  Venta & {

    mesaNumero: number | null;

    usuarioNombre: string;

    // ================================================
    // PRODUCTOS DE LA VENTA
    // ================================================

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

  // ========================================================
  // DATOS
  // ========================================================

  ventas: VentaDetalle[];

  resumenUsuarios:
    ResumenVentasUsuario[];


  // ========================================================
  // ESTADOS
  // ========================================================

  cargando: boolean;

  error: string | null;


  // ========================================================
  // RESUMEN GENERAL
  // ========================================================

  totalVentasDia: number;

  cantidadVentasDia: number;


  // ========================================================
  // FUNCIONES
  // ========================================================

  cargarVentas:
    () => Promise<void>;

  limpiarError:
    () => void;

};