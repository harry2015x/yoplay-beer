import type { VentaDetalle } from "../types/ventas";
import type { Jornada } from "../hooks/useJornada";

import { generarReporteVentasPDF } from "./generarReporteVentasPDF";

// ============================================================
// generarReporteJornada
// ============================================================
//
// Función ÚNICA y reutilizable para generar el PDF de una
// jornada. La usan:
//
//   1) El botón "📄 Exportar PDF" del módulo Ventas.
//   2) El botón "📄 Descargar reporte" del modal Cerrar jornada.
//
// Ninguno de los dos duplica la lógica de generación: ambos
// llaman a esta misma función.
//
// El PDF se genera y descarga por completo en el navegador.
// No se sube ni se guarda en Supabase Storage.
// ============================================================
//
// NOTA / PENDIENTE:
//
// `generarReporteVentasPDF` (no compartido en esta conversación)
// hoy recibe { ventas, fecha, usuario } y arma el encabezado del
// PDF a partir de una única fecha de calendario. Mientras tanto,
// aquí le pasamos `jornada.fecha_inicio` como esa fecha para no
// romper su funcionamiento actual.
//
// Para cumplir el encabezado completo que pide la especificación
// (JORNADA #id, ESTADO abierta/cerrada, FECHA DE INICIO, FECHA DE
// CIERRE o "Jornada activa"), lib/generarReporteVentasPDF.ts debe
// actualizarse para aceptar y dibujar esos datos de la jornada en
// vez de una sola fecha genérica. Comparte ese archivo para
// completar ese último ajuste visual.
// ============================================================

type GenerarReporteJornadaParams = {
  jornada: Jornada;
  ventas: VentaDetalle[];
  usuario: string;
};

export async function generarReporteJornada({
  jornada,
  ventas,
  usuario,
}: GenerarReporteJornadaParams): Promise<void> {
  await generarReporteVentasPDF({
    ventas,
    fecha: new Date(jornada.fecha_inicio),
    usuario,
  });
}
