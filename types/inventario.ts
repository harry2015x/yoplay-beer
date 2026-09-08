// ARCHIVO: types/inventario.ts
// Tipos TypeScript del módulo Inventario.
// No modifica ni depende de types/mesas.ts.

export type ProductoInventario = {
  id: number;
  nombre: string;
  descripcion: string | null;
  categoria: string | null;
  stock: number;
  stockMinimo: number;
  unidad: string;
  precioCompra: number | null;
  precioVenta: number | null;
  activo: boolean;
  createdAt: string;
};

export type TipoMovimiento = "entrada" | "salida" | "ajuste";

export type MovimientoInventario = {
  id: number;
  productoId: number;
  productoNombre: string | null;
  tipo: TipoMovimiento;
  cantidad: number;
  stockAnterior: number;
  stockNuevo: number;
  motivo: string | null;
  createdAt: string;
};

export type NuevoProductoInput = {
  nombre: string;
  descripcion: string;
  categoria: string;
  stock: number;
  stockMinimo: number;
  unidad: string;
  precioCompra: number | null;
  precioVenta: number | null;
  activo: boolean;
};

export type EdicionProductoInput = {
  nombre: string;
  descripcion: string;
  categoria: string;
  stockMinimo: number;
  unidad: string;
  precioCompra: number | null;
  precioVenta: number | null;
  activo: boolean;
};

export type FiltroStock =
  | "todos"
  | "normal"
  | "bajo"
  | "sin_stock"
  | "inactivos";

export type FiltroMovimiento = "todos" | "entrada" | "salida" | "ajuste";

export type TipoNotificacion = "success" | "error" | "info";

export type NotificacionInventario = {
  tipo: TipoNotificacion;
  mensaje: string;
} | null;

export type ResumenInventario = {
  totalProductos: number;
  unidadesEnStock: number;
  stockBajo: number;
  valorEstimado: number;
};

export type UseInventarioResult = {
  // Estado
  productos: ProductoInventario[];
  movimientos: MovimientoInventario[];
  cargandoProductos: boolean;
  cargandoMovimientos: boolean;
  errorProductos: string | null;
  errorMovimientos: string | null;
  notificacion: NotificacionInventario;
  resumen: ResumenInventario;

  // Carga
  cargarProductos: () => Promise<void>;
  cargarMovimientos: () => Promise<void>;

  // CRUD de productos
  agregarProducto: (input: NuevoProductoInput) => Promise<boolean>;
  editarProducto: (
    id: number,
    input: EdicionProductoInput
  ) => Promise<boolean>;
  eliminarProducto: (id: number) => Promise<boolean>;

  // Movimientos de stock
  registrarEntrada: (
    productoId: number,
    cantidad: number,
    motivo: string
  ) => Promise<boolean>;
  registrarSalida: (
    productoId: number,
    cantidad: number,
    motivo: string
  ) => Promise<boolean>;
  registrarAjuste: (
    productoId: number,
    nuevoStock: number,
    motivo: string
  ) => Promise<boolean>;

  // Utilidades
  cerrarNotificacion: () => void;
};

// Determina el estado de stock de un producto.
export function calcularEstadoStock(
  producto: ProductoInventario
): "normal" | "bajo" | "sin_stock" {
  if (producto.stock === 0) return "sin_stock";
  if (producto.stock <= producto.stockMinimo) return "bajo";
  return "normal";
}
