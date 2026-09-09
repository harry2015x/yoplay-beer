// ============================================================
// TYPES/VENTAS.TS
// Tipos compartidos para el módulo de Ventas
// ============================================================

export type EstadoVenta = "abierta" | "cerrada";

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
// VENTA CON INFORMACIÓN DE MESA Y USUARIO
// ============================================================

export type VentaDetalle = Venta & {
  mesaNumero: number | null;

  usuarioNombre: string;
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

  // Datos

  ventas: VentaDetalle[];

  resumenUsuarios: ResumenVentasUsuario[];


  // Estados

  cargando: boolean;

  error: string | null;


  // Resumen general

  totalVentasDia: number;

  cantidadVentasDia: number;


  // Funciones

  cargarVentas: () => Promise<void>;

  limpiarError: () => void;

};