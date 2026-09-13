// ARCHIVO: app/components/inventario/InventarioFiltros.tsx
"use client";

import type { FiltroStock } from "../../../types/inventario";
import styles from "./inventario.module.css";

type Props = {
  busqueda: string;
  onBusquedaChange: (valor: string) => void;
  filtro: FiltroStock;
  onFiltroChange: (valor: FiltroStock) => void;

  // ==========================================================
  // CATEGORÍAS
  //
  // "categorias" ya incluye "Todos" como primer elemento y se
  // calcula dinámicamente en InventarioModule a partir de los
  // productos existentes (producto.categoria).
  // ==========================================================
  categorias: string[];
  categoriaSeleccionada: string;
  onCategoriaChange: (valor: string) => void;
};

const OPCIONES_STOCK: { valor: FiltroStock; etiqueta: string }[] = [
  { valor: "todos", etiqueta: "Todos" },
  { valor: "normal", etiqueta: "Stock normal" },
  { valor: "bajo", etiqueta: "Stock bajo" },
  { valor: "sin_stock", etiqueta: "Sin stock" },
  { valor: "inactivos", etiqueta: "Inactivos" },
];

export default function InventarioFiltros({
  busqueda,
  onBusquedaChange,
  filtro,
  onFiltroChange,
  categorias,
  categoriaSeleccionada,
  onCategoriaChange,
}: Props) {
  return (
    <div className={styles.filtrosPanel}>
      {/* ============================================== */}
      {/* BUSCADOR */}
      {/* ============================================== */}
      <div className={styles.filtroBuscador}>
        <span className={styles.filtroBuscadorIcono} aria-hidden="true">
          🔍
        </span>
        <input
          type="text"
          value={busqueda}
          onChange={(evento) => onBusquedaChange(evento.target.value)}
          placeholder="Buscar producto..."
          aria-label="Buscar producto por nombre o categoría"
          className={styles.filtroBuscadorInput}
        />
      </div>

      {/* ============================================== */}
      {/* CATEGORÍAS (dinámicas, generadas desde productos) */}
      {/* ============================================== */}
      {categorias.length > 1 && (
        <div className={styles.filtroGrupo}>
          <span className={styles.filtroGrupoEtiqueta}>Categorías</span>
          <div className={styles.chipsFila}>
            {categorias.map((categoria) => {
              const activo = categoriaSeleccionada === categoria;
              return (
                <button
                  key={categoria}
                  type="button"
                  onClick={() => onCategoriaChange(categoria)}
                  aria-pressed={activo}
                  className={
                    activo
                      ? `${styles.chip} ${styles.chipActivo}`
                      : styles.chip
                  }
                >
                  {categoria}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================================== */}
      {/* ESTADO DE INVENTARIO (filtros de stock existentes) */}
      {/* ============================================== */}
      <div className={styles.filtroGrupo}>
        <span className={styles.filtroGrupoEtiqueta}>
          Estado de inventario
        </span>
        <div className={styles.chipsFila}>
          {OPCIONES_STOCK.map((opcion) => {
            const activo = filtro === opcion.valor;
            return (
              <button
                key={opcion.valor}
                type="button"
                onClick={() => onFiltroChange(opcion.valor)}
                aria-pressed={activo}
                className={
                  activo
                    ? `${styles.chip} ${styles.chipActivo}`
                    : styles.chip
                }
              >
                {opcion.etiqueta}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
