"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { supabase } from "../lib/supabase";

import type {
  PeriodoReporte,
  ResumenReporte,
  ProductoMasVendido,
  VentasPorUsuarioReporte,
  VentaHistorial,
  DatosGrafico,
  UseReportesResult,
} from "../types/reportes";

import type { ProductoVenta } from "../types/ventas";

// ============================================================
// ZONA HORARIA: AMÉRICA/BOGOTÁ (UTC-5, sin horario de verano)
//
// Colombia no observa horario de verano, así que el offset
// es siempre -05:00. Esto permite calcular los límites de
// cada día sin depender de la zona horaria del navegador
// ni del servidor donde corra la app.
// ============================================================

const OFFSET_BOGOTA_HORAS = 5;

// Año/mes/día de "hoy" en hora de Bogotá
function obtenerHoyBogota(): { anio: number; mes: number; dia: number } {
  const ahoraUTC = new Date();
  const bogotaMs = ahoraUTC.getTime() - OFFSET_BOGOTA_HORAS * 60 * 60 * 1000;
  const bogotaWall = new Date(bogotaMs);

  return {
    anio: bogotaWall.getUTCFullYear(),
    mes: bogotaWall.getUTCMonth(),
    dia: bogotaWall.getUTCDate(),
  };
}

// 00:00:00.000 de Bogotá para un día dado => 05:00:00.000 UTC del mismo día
function inicioDiaBogota(anio: number, mes: number, dia: number): Date {
  return new Date(Date.UTC(anio, mes, dia, OFFSET_BOGOTA_HORAS, 0, 0, 0));
}

// 23:59:59.999 de Bogotá para un día dado => 04:59:59.999 UTC del día siguiente
function finDiaBogota(anio: number, mes: number, dia: number): Date {
  return new Date(
    Date.UTC(anio, mes, dia + 1, OFFSET_BOGOTA_HORAS - 1, 59, 59, 999)
  );
}

// "YYYY-MM-DD" -> componentes numéricos
function parsearFechaInput(
  valor: string
): { anio: number; mes: number; dia: number } | null {
  const partes = valor.split("-").map(Number);
  if (partes.length !== 3 || partes.some((n) => Number.isNaN(n))) return null;

  const [anio, mes, dia] = partes;
  return { anio, mes: mes - 1, dia };
}

// componentes numéricos -> "YYYY-MM-DD"
function formatearFechaInput(anio: number, mes: number, dia: number): string {
  const mm = String(mes + 1).padStart(2, "0");
  const dd = String(dia).padStart(2, "0");
  return `${anio}-${mm}-${dd}`;
}

// Clave de día en Bogotá ("YYYY-MM-DD") a partir de un timestamp ISO
function claveDiaBogota(fechaISO: string): string {
  const fecha = new Date(fechaISO);
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(fecha);
}

// Etiqueta corta de día para el gráfico, ej: "lun 08"
function etiquetaDiaBogota(fechaISO: string): string {
  const fecha = new Date(fechaISO);
  const texto = new Intl.DateTimeFormat("es-CO", {
    timeZone: "America/Bogota",
    weekday: "short",
    day: "2-digit",
  }).format(fecha);
  return texto.replace(".", "");
}

// ============================================================
// RANGO DE FECHAS SEGÚN EL PERIODO
// ============================================================

function calcularRango(
  periodo: PeriodoReporte,
  fechaInicioPersonalizada: string,
  fechaFinPersonalizada: string
): { desde: Date; hasta: Date } | null {
  const hoy = obtenerHoyBogota();

  switch (periodo) {
    case "hoy":
      return {
        desde: inicioDiaBogota(hoy.anio, hoy.mes, hoy.dia),
        hasta: finDiaBogota(hoy.anio, hoy.mes, hoy.dia),
      };

    case "ayer":
      return {
        desde: inicioDiaBogota(hoy.anio, hoy.mes, hoy.dia - 1),
        hasta: finDiaBogota(hoy.anio, hoy.mes, hoy.dia - 1),
      };

    case "semana":
      return {
        desde: inicioDiaBogota(hoy.anio, hoy.mes, hoy.dia - 6),
        hasta: finDiaBogota(hoy.anio, hoy.mes, hoy.dia),
      };

    case "quincena":
      return {
        desde: inicioDiaBogota(hoy.anio, hoy.mes, hoy.dia - 14),
        hasta: finDiaBogota(hoy.anio, hoy.mes, hoy.dia),
      };

    case "mes":
      return {
        desde: inicioDiaBogota(hoy.anio, hoy.mes, hoy.dia - 29),
        hasta: finDiaBogota(hoy.anio, hoy.mes, hoy.dia),
      };

    case "personalizado": {
      const inicio = parsearFechaInput(fechaInicioPersonalizada);
      const fin = parsearFechaInput(fechaFinPersonalizada);
      if (!inicio || !fin) return null;

      return {
        desde: inicioDiaBogota(inicio.anio, inicio.mes, inicio.dia),
        hasta: finDiaBogota(fin.anio, fin.mes, fin.dia),
      };
    }

    default:
      return null;
  }
}

// ============================================================
// HOOK DE REPORTES
// ============================================================

export function useReportes(): UseReportesResult {
  const hoyBogota = obtenerHoyBogota();
  const hoyTexto = formatearFechaInput(
    hoyBogota.anio,
    hoyBogota.mes,
    hoyBogota.dia
  );

  const [periodo, setPeriodo] = useState<PeriodoReporte>("hoy");
  const [fechaInicio, setFechaInicio] = useState<string>(hoyTexto);
  const [fechaFin, setFechaFin] = useState<string>(hoyTexto);

  const [historialVentas, setHistorialVentas] = useState<VentaHistorial[]>([]);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==========================================================
  // CARGAR DATOS DEL PERIODO SELECCIONADO
  // ==========================================================

  const cargarReportes = useCallback(async () => {
    const rango = calcularRango(periodo, fechaInicio, fechaFin);

    if (!rango) {
      setError("El rango de fechas seleccionado no es válido.");
      setHistorialVentas([]);
      setCargando(false);
      return;
    }

    try {
      setCargando(true);
      setError(null);

      // ======================================================
      // CONSULTAR VENTAS CERRADAS DEL PERIODO
      // ======================================================

      const { data: ventasData, error: ventasError } = await supabase
        .from("ventas")
        .select(
          `
          id,
          mesa_id,
          usuario_id,
          total,
          estado,
          created_at,
          closed_at,

          mesas (
            numero
          ),

          profiles (
            nombre
          )
        `
        )
        .eq("estado", "cerrada")
        .gte("created_at", rango.desde.toISOString())
        .lte("created_at", rango.hasta.toISOString())
        .order("created_at", { ascending: false });

      if (ventasError) {
        console.error("Error cargando reportes (ventas):", ventasError);
        setError("No fue posible cargar los reportes.");
        setHistorialVentas([]);
        return;
      }

      if (!ventasData || ventasData.length === 0) {
        setHistorialVentas([]);
        return;
      }

      // ======================================================
      // CONSULTAR PRODUCTOS DE ESAS VENTAS
      // ======================================================

      const ventasIds = ventasData.map((venta: any) => venta.id);

      const { data: detallesData, error: detallesError } = await supabase
        .from("venta_detalles")
        .select(
          `
          id,
          venta_id,
          producto_id,
          nombre_producto,
          precio,
          cantidad,
          subtotal
        `
        )
        .in("venta_id", ventasIds);

      if (detallesError) {
        console.error("Error cargando reportes (detalles):", detallesError);
        setError("No fue posible cargar los productos de las ventas.");
      }

      const productosPorVenta = new Map<number, ProductoVenta[]>();

      (detallesData || []).forEach((detalle: any) => {
        const producto: ProductoVenta = {
          id: detalle.id,
          productoId: detalle.producto_id ?? null,
          nombreProducto: detalle.nombre_producto ?? "Producto sin nombre",
          precio: Number(detalle.precio || 0),
          cantidad: Number(detalle.cantidad || 0),
          subtotal: Number(detalle.subtotal || 0),
        };

        const actuales = productosPorVenta.get(detalle.venta_id) ?? [];
        actuales.push(producto);
        productosPorVenta.set(detalle.venta_id, actuales);
      });

      // ======================================================
      // TRANSFORMAR VENTAS
      // ======================================================

      const ventasTransformadas: VentaHistorial[] = ventasData.map(
        (venta: any) => ({
          id: venta.id,
          mesaId: venta.mesa_id,
          usuarioId: venta.usuario_id,
          total: Number(venta.total || 0),
          estado: venta.estado,
          createdAt: venta.created_at,
          closedAt: venta.closed_at,
          mesaNumero: venta.mesas?.numero ?? null,
          usuarioNombre: venta.profiles?.nombre ?? "Ventas sin usuario",
          productos: productosPorVenta.get(venta.id) ?? [],
        })
      );

      setHistorialVentas(ventasTransformadas);
    } catch (err) {
      console.error("Error inesperado cargando reportes:", err);
      setError("Ocurrió un error al cargar los reportes.");
      setHistorialVentas([]);
    } finally {
      setCargando(false);
    }
  }, [periodo, fechaInicio, fechaFin]);

  useEffect(() => {
    cargarReportes();
  }, [cargarReportes]);

  // ==========================================================
  // RESUMEN GENERAL
  // ==========================================================

  const resumen = useMemo<ResumenReporte>(() => {
    const totalVendido = historialVentas.reduce((acc, v) => acc + v.total, 0);
    const cantidadVentas = historialVentas.length;

    const productosVendidos = historialVentas.reduce((acc, venta) => {
      return acc + venta.productos.reduce((sub, p) => sub + p.cantidad, 0);
    }, 0);

    const promedioPorVenta =
      cantidadVentas > 0 ? totalVendido / cantidadVentas : 0;

    return { totalVendido, cantidadVentas, productosVendidos, promedioPorVenta };
  }, [historialVentas]);

  // ==========================================================
  // PRODUCTOS MÁS VENDIDOS
  // ==========================================================

  const productosMasVendidos = useMemo<ProductoMasVendido[]>(() => {
    const mapa = new Map<string, ProductoMasVendido>();

    historialVentas.forEach((venta) => {
      venta.productos.forEach((producto) => {
        const clave =
          producto.productoId != null
            ? String(producto.productoId)
            : producto.nombreProducto;

        if (!mapa.has(clave)) {
          mapa.set(clave, {
            productoId: producto.productoId,
            nombreProducto: producto.nombreProducto,
            cantidadVendida: 0,
            totalGenerado: 0,
          });
        }

        const actual = mapa.get(clave)!;
        actual.cantidadVendida += producto.cantidad;
        actual.totalGenerado += producto.subtotal;
      });
    });

    return Array.from(mapa.values()).sort(
      (a, b) => b.cantidadVendida - a.cantidadVendida
    );
  }, [historialVentas]);

  // ==========================================================
  // VENTAS POR USUARIO
  // ==========================================================

  const ventasPorUsuario = useMemo<VentasPorUsuarioReporte[]>(() => {
    const mapa = new Map<string, VentasPorUsuarioReporte>();

    historialVentas.forEach((venta) => {
      const clave = venta.usuarioId ?? "sin-usuario";

      if (!mapa.has(clave)) {
        mapa.set(clave, {
          usuarioId: venta.usuarioId,
          usuarioNombre: venta.usuarioNombre,
          cantidadVentas: 0,
          totalVendido: 0,
        });
      }

      const actual = mapa.get(clave)!;
      actual.cantidadVentas += 1;
      actual.totalVendido += venta.total;
    });

    return Array.from(mapa.values()).sort(
      (a, b) => b.totalVendido - a.totalVendido
    );
  }, [historialVentas]);

  // ==========================================================
  // DATOS DEL GRÁFICO (VENTAS POR DÍA, HORA BOGOTÁ)
  // ==========================================================

  const datosGrafico = useMemo<DatosGrafico>(() => {
    const mapa = new Map<string, number>();

    historialVentas.forEach((venta) => {
      const referencia = venta.closedAt ?? venta.createdAt;
      if (!referencia) return;

      const clave = claveDiaBogota(referencia);
      mapa.set(clave, (mapa.get(clave) ?? 0) + venta.total);
    });

    return Array.from(mapa.entries())
      .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
      .map(([fecha, total]) => ({
        fecha,
        etiqueta: etiquetaDiaBogota(`${fecha}T12:00:00-05:00`),
        total,
      }));
  }, [historialVentas]);

  // ==========================================================
  // CAMBIAR PERIODO
  // ==========================================================

  const cambiarPeriodo = useCallback(
    (nuevoPeriodo: PeriodoReporte) => {
      setPeriodo(nuevoPeriodo);

      if (nuevoPeriodo !== "personalizado") {
        setFechaInicio(hoyTexto);
        setFechaFin(hoyTexto);
      }
    },
    [hoyTexto]
  );

  // ==========================================================
  // APLICAR RANGO PERSONALIZADO
  // ==========================================================

  const aplicarRangoPersonalizado = useCallback(
    (inicio: string, fin: string) => {
      setPeriodo("personalizado");
      setFechaInicio(inicio);
      setFechaFin(fin);
    },
    []
  );

  // ==========================================================
  // LIMPIAR ERROR
  // ==========================================================

  const limpiarError = useCallback(() => setError(null), []);

  return {
    periodo,
    fechaInicio,
    fechaFin,
    resumen,
    productosMasVendidos,
    ventasPorUsuario,
    historialVentas,
    datosGrafico,
    cargando,
    error,
    cambiarPeriodo,
    aplicarRangoPersonalizado,
    recargar: cargarReportes,
    limpiarError,
  };
}