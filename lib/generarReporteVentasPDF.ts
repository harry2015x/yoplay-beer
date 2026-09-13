import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import type { VentaDetalle } from "../types/ventas";


// ============================================================
// CONFIGURACIÓN
// ============================================================
//
// Logo real de YOPLAY BEER (recurso ya existente del proyecto,
// servido desde Cloudinary). Se descarga y convierte a base64
// en el navegador únicamente para insertarlo en el PDF; nunca
// se sube ni se guarda en ningún almacenamiento.
// ============================================================

const LOGO_URL =
  "https://res.cloudinary.com/dv1gz4eqo/image/upload/v1789265106/LOGO-13_e1v8tl.png";

// Paleta YOPLAY BEER
const COLOR_VERDE_OSCURO: [number, number, number] = [15, 42, 29]; // #0F2A1D
const COLOR_NEGRO: [number, number, number] = [17, 24, 39]; // #111827
const COLOR_GRIS_CLARO: [number, number, number] = [243, 244, 246]; // #F3F4F6
const COLOR_BLANCO: [number, number, number] = [255, 255, 255]; // #FFFFFF


// ============================================================
// FORMATO MONEDA (COP)
// ============================================================

export function formatearMoneda(valor: number): string {

  return new Intl.NumberFormat(
    "es-CO",
    {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }
  ).format(Number(valor || 0));

}


// ============================================================
// FECHA / HORA (usando SIEMPRE la fecha local, sin desfase UTC)
// ============================================================

function construirNombreArchivo(fecha: Date): string {

  const yyyy = fecha.getFullYear();
  const mm = String(fecha.getMonth() + 1).padStart(2, "0");
  const dd = String(fecha.getDate()).padStart(2, "0");

  return `YOPLAY-BEER-VENTAS-${yyyy}-${mm}-${dd}.pdf`;

}

function formatearFechaLarga(fecha: Date): string {

  return fecha.toLocaleDateString(
    "es-CO",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

}

function formatearHora(
  fecha: Date | string | null | undefined
): string {

  if (!fecha) return "--:--";

  const objeto =
    fecha instanceof Date
      ? fecha
      : new Date(fecha);

  if (Number.isNaN(objeto.getTime())) return "--:--";

  return objeto.toLocaleTimeString(
    "es-CO",
    {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    }
  );

}


// ============================================================
// CARGAR LOGO COMO BASE64 (best-effort; si falla, el PDF
// se genera igual, solo sin logo)
// ============================================================

async function cargarLogoBase64(): Promise<
  { dataUrl: string; ancho: number; alto: number } | null
> {

  try {

    const respuesta = await fetch(LOGO_URL);

    if (!respuesta.ok) return null;

    const blob = await respuesta.blob();

    const dataUrl = await new Promise<string>(
      (resolve, reject) => {

        const lector = new FileReader();

        lector.onload = () =>
          resolve(lector.result as string);

        lector.onerror = () =>
          reject(new Error("No se pudo leer el logo."));

        lector.readAsDataURL(blob);

      }
    );

    const dimensiones = await new Promise<
      { ancho: number; alto: number }
    >(
      (resolve, reject) => {

        const imagen = new Image();

        imagen.onload = () =>
          resolve({
            ancho: imagen.naturalWidth || 1,
            alto: imagen.naturalHeight || 1,
          });

        imagen.onerror = () =>
          reject(new Error("No se pudo procesar el logo."));

        imagen.src = dataUrl;

      }
    );

    return {
      dataUrl,
      ancho: dimensiones.ancho,
      alto: dimensiones.alto,
    };

  } catch (error) {

    console.error(
      "No fue posible cargar el logo para el PDF:",
      error
    );

    return null;

  }

}


// ============================================================
// TIPO DE ENTRADA
// ============================================================

type ParametrosReporte = {
  ventas: VentaDetalle[];
  fecha: Date;
  usuario: string;
};


// ============================================================
// GENERAR Y DESCARGAR EL REPORTE PDF
// ============================================================
//
// IMPORTANTE:
// - Se ejecuta 100% en el navegador del cliente.
// - No sube, no guarda, no persiste el archivo en ningún lado.
// - Al finalizar, dispara la descarga directa (doc.save) y el
//   PDF deja de existir para esta función: solo queda en el
//   dispositivo del usuario.
// ============================================================

export async function generarReporteVentasPDF(
  { ventas, fecha, usuario }: ParametrosReporte
): Promise<void> {

  const doc = new jsPDF({
    unit: "mm",
    format: "a4",
    orientation: "portrait",
  });

  const anchoPagina = doc.internal.pageSize.getWidth();
  const altoPagina = doc.internal.pageSize.getHeight();
  const margen = 14;

  const logo = await cargarLogoBase64();

  let cursorY = margen;


  // ----------------------------------------------------------
  // ENCABEZADO
  // ----------------------------------------------------------

  doc.setFillColor(...COLOR_NEGRO);
  doc.rect(0, 0, anchoPagina, 32, "F");

  const textoX =
    logo
      ? margen + (logo.ancho / logo.alto) * 16 + 6
      : margen;

  if (logo) {

    const altoLogo = 16;
    const anchoLogo = (logo.ancho / logo.alto) * altoLogo;

    try {
      doc.addImage(logo.dataUrl, "PNG", margen, 8, anchoLogo, altoLogo);
    } catch (error) {
      console.error("No fue posible insertar el logo en el PDF:", error);
    }

  }

  doc.setTextColor(...COLOR_BLANCO);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text("YOPLAY BEER", textoX, 16);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(225, 225, 225);
  doc.text("Sistema de ventas e inventario", textoX, 22);

  cursorY = 40;


  // ----------------------------------------------------------
  // TÍTULO
  // ----------------------------------------------------------

  doc.setTextColor(...COLOR_NEGRO);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text("REPORTE DE VENTAS DEL DÍA", margen, cursorY);

  cursorY += 8;


  // ----------------------------------------------------------
  // INFORMACIÓN (fecha, hora de generación, generado por)
  // ----------------------------------------------------------

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(90, 90, 90);

  doc.text(`Fecha: ${formatearFechaLarga(fecha)}`, margen, cursorY);

  doc.text(
    `Hora de generación: ${formatearHora(new Date())}`,
    anchoPagina - margen,
    cursorY,
    { align: "right" }
  );

  cursorY += 5.5;

  doc.text(`Generado por: ${usuario}`, margen, cursorY);

  cursorY += 9;


  // ----------------------------------------------------------
  // RESUMEN (tarjetas)
  // ----------------------------------------------------------

  const totalGeneral = ventas.reduce(
    (acumulado, venta) => acumulado + Number(venta.total || 0),
    0
  );

  const cantidadVentas = ventas.length;

  const cantidadProductos = ventas.reduce(
    (acumulado, venta) =>
      acumulado +
      venta.productos.reduce(
        (subacumulado, producto) => subacumulado + Number(producto.cantidad || 0),
        0
      ),
    0
  );

  const separacionTarjetas = 8;
  const anchoTarjeta =
    (anchoPagina - margen * 2 - separacionTarjetas * 2) / 3;
  const alturaTarjeta = 20;

  const tarjetas: Array<[string, string]> = [
    ["TOTAL VENDIDO", formatearMoneda(totalGeneral)],
    ["VENTAS REALIZADAS", String(cantidadVentas)],
    ["PRODUCTOS VENDIDOS", String(cantidadProductos)],
  ];

  tarjetas.forEach(([etiqueta, valor], indice) => {

    const x = margen + indice * (anchoTarjeta + separacionTarjetas);

    doc.setFillColor(...COLOR_GRIS_CLARO);
    doc.roundedRect(x, cursorY, anchoTarjeta, alturaTarjeta, 2, 2, "F");

    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(etiqueta, x + 4, cursorY + 7);

    doc.setTextColor(...COLOR_VERDE_OSCURO);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(valor, x + 4, cursorY + 16);

  });

  cursorY += alturaTarjeta + 10;


  // ----------------------------------------------------------
  // SIN VENTAS (defensivo: quien llama a esta función ya debe
  // validar esto antes y no invocarla; se deja como respaldo)
  // ----------------------------------------------------------

  if (cantidadVentas === 0) {

    doc.setFont("helvetica", "italic");
    doc.setFontSize(11);
    doc.setTextColor(120, 120, 120);
    doc.text(
      "No existen ventas registradas para esta fecha.",
      margen,
      cursorY
    );

    doc.save(construirNombreArchivo(fecha));

    return;

  }


  // ----------------------------------------------------------
  // LISTADO DE VENTAS
  // ----------------------------------------------------------

  ventas.forEach((venta, indice) => {

    const espacioEstimado = 24 + venta.productos.length * 7;

    if (cursorY + espacioEstimado > altoPagina - 24) {
      doc.addPage();
      cursorY = margen;
    }

    const numeroVenta = String(indice + 1).padStart(3, "0");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(...COLOR_NEGRO);
    doc.text(`VENTA #${numeroVenta}`, margen, cursorY);

    const horaVenta = formatearHora(venta.closedAt ?? venta.createdAt);
    const mesaTexto =
      venta.mesaNumero != null ? `Mesa ${venta.mesaNumero}` : "-";

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(110, 110, 110);
    doc.text(
      `Hora: ${horaVenta}   ·   Usuario: ${venta.usuarioNombre}   ·   ${mesaTexto}`,
      anchoPagina - margen,
      cursorY,
      { align: "right" }
    );

    cursorY += 5;

    const filas =
      venta.productos.length > 0
        ? venta.productos.map((producto) => [
            producto.nombreProducto,
            String(producto.cantidad),
            formatearMoneda(producto.precio),
            formatearMoneda(producto.subtotal),
          ])
        : [["Sin productos registrados", "-", "-", "-"]];

    autoTable(doc, {
      startY: cursorY,
      margin: { left: margen, right: margen },
      head: [["Producto", "Cantidad", "Precio unitario", "Subtotal"]],
      body: filas,
      theme: "grid",
      styles: {
        fontSize: 8.5,
        cellPadding: 2.2,
        textColor: COLOR_NEGRO,
        lineColor: [225, 227, 230],
      },
      headStyles: {
        fillColor: COLOR_VERDE_OSCURO,
        textColor: COLOR_BLANCO,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: COLOR_GRIS_CLARO,
      },
      columnStyles: {
        1: { halign: "center", cellWidth: 22 },
        2: { halign: "right", cellWidth: 32 },
        3: { halign: "right", cellWidth: 32 },
      },
    });

    cursorY =
      (doc as unknown as { lastAutoTable: { finalY: number } })
        .lastAutoTable.finalY + 4;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    doc.setTextColor(...COLOR_VERDE_OSCURO);
    doc.text(
      `TOTAL VENTA: ${formatearMoneda(venta.total)}`,
      anchoPagina - margen,
      cursorY,
      { align: "right" }
    );

    cursorY += 9;

  });


  // ----------------------------------------------------------
  // TOTAL GENERAL
  // ----------------------------------------------------------

  if (cursorY + 30 > altoPagina - 24) {
    doc.addPage();
    cursorY = margen;
  }

  doc.setFillColor(...COLOR_VERDE_OSCURO);
  doc.roundedRect(margen, cursorY, anchoPagina - margen * 2, 26, 2, 2, "F");

  doc.setTextColor(...COLOR_BLANCO);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.text("TOTAL VENDIDO DEL DÍA", margen + 6, cursorY + 9);

  doc.setFontSize(15);
  doc.text(formatearMoneda(totalGeneral), margen + 6, cursorY + 19);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.text(
    `Ventas realizadas: ${cantidadVentas}    Productos vendidos: ${cantidadProductos}`,
    anchoPagina - margen - 6,
    cursorY + 19,
    { align: "right" }
  );


  // ----------------------------------------------------------
  // PIE DE PÁGINA (todas las páginas)
  // ----------------------------------------------------------

  const totalPaginas = doc.getNumberOfPages();

  for (let pagina = 1; pagina <= totalPaginas; pagina += 1) {

    doc.setPage(pagina);

    doc.setDrawColor(...COLOR_GRIS_CLARO);
    doc.line(margen, altoPagina - 14, anchoPagina - margen, altoPagina - 14);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7.5);
    doc.setTextColor(130, 130, 130);
    doc.text(
      "YOPLAY BEER · Sistema de ventas e inventario",
      margen,
      altoPagina - 9
    );
    doc.text(
      `Página ${pagina} de ${totalPaginas}`,
      anchoPagina - margen,
      altoPagina - 9,
      { align: "right" }
    );

  }


  // ----------------------------------------------------------
  // DESCARGA DIRECTA (única acción de "guardado": al disco
  // del usuario, vía el navegador; nada se sube ni persiste)
  // ----------------------------------------------------------

  doc.save(construirNombreArchivo(fecha));

}