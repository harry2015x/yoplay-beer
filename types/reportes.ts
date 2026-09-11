// ============================================================
// TYPES/REPORTES.TS
// Tipos compartidos para el módulo de Reportes
// ============================================================

import type { VentaDetalle } from "./ventas";

// ============================================================
// PERIODOS DISPONIBLES
// ============================================================

export type PeriodoReporte =
  | "hoy"
  | "ayer"
  | "semana"
  | "quincena"
  | "mes"
  | "personalizado";

// ============================================================
// RESUMEN GENERAL DEL PERIODO
// ============================================================

export type ResumenReporte = {
  totalVendido: number;
  cantidadVentas: number;
  productosVendidos: number;
  promedioPorVenta: number;
};

// ============================================================
// PRODUCTO MÁS VENDIDO
// ============================================================

export type ProductoMasVendido = {
  productoId: number | null;
  nombreProducto: string;
  cantidadVendida: number;
  totalGenerado: number;
};

// ============================================================
// VENTAS AGRUPADAS POR USUARIO
// ============================================================

export type VentasPorUsuarioReporte = {
  usuarioId: string | null;
  usuarioNombre: string;
  cantidadVentas: number;
  totalVendido: number;
};

// ============================================================
// VENTA DEL HISTORIAL
//
// Reutiliza el tipo VentaDetalle ya definido en types/ventas.ts
// ============================================================

export type VentaHistorial = VentaDetalle;

// ============================================================
// PUNTO DEL GRÁFICO DE VENTAS POR DÍA
// ============================================================

export type PuntoGraficoVentas = {
  fecha: string; // "YYYY-MM-DD" en hora de Bogotá
  etiqueta: string; // Ej: "lun 08"
  total: number;
};

export type DatosGrafico = PuntoGraficoVentas[];

// ============================================================
// RESULTADO DEL HOOK useReportes
// ============================================================

export type UseReportesResult = {
  // Periodo y fechas
  periodo: PeriodoReporte;
  fechaInicio: string; // "YYYY-MM-DD"
  fechaFin: string; // "YYYY-MM-DD"

  // Datos
  resumen: ResumenReporte;
  productosMasVendidos: ProductoMasVendido[];
  ventasPorUsuario: VentasPorUsuarioReporte[];
  historialVentas: VentaHistorial[];
  datosGrafico: DatosGrafico;

  // Estados
  cargando: boolean;
  error: string | null;

  // Acciones
  cambiarPeriodo: (periodo: PeriodoReporte) => void;
  aplicarRangoPersonalizado: (fechaInicio: string, fechaFin: string) => void;
  recargar: () => Promise<void>;
  limpiarError: () => void;
};

// ============================================================
// FORMATO DE MONEDA (COP)
// ============================================================

export function formatoCOP(valor: number): string {
  return Number(valor || 0).toLocaleString("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}