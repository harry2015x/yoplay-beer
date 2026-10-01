// ============================================================
// ICONOS DEL MÓDULO MESAS
//
// Iconos SVG en línea (trazo, heredan currentColor). Solo
// presentación: no tienen lógica ni dependencias externas.
// ============================================================

import type { ReactNode } from "react";

type PropsIcono = {
  tamano?: number;
};

function Base({ tamano = 18, children }: PropsIcono & { children: ReactNode }) {
  return (
    <svg
      width={tamano}
      height={tamano}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {children}
    </svg>
  );
}

export function IconoSilla(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M7 3v10h10" />
      <path d="M7 13v8" />
      <path d="M17 13v8" />
      <path d="M7 17h10" />
    </Base>
  );
}

export function IconoCuadricula(props: PropsIcono) {
  return (
    <Base {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Base>
  );
}

export function IconoCheck(props: PropsIcono) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M8 12.5l2.7 2.7L16 9.5" />
    </Base>
  );
}

export function IconoReloj(props: PropsIcono) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </Base>
  );
}

export function IconoRecibo(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M6 3h12v18l-3-2-3 2-3-2-3 2z" />
      <path d="M9 8h6" />
      <path d="M9 12h6" />
    </Base>
  );
}

export function IconoTarjeta(props: PropsIcono) {
  return (
    <Base {...props}>
      <rect x="2.5" y="5" width="19" height="14" rx="2.5" />
      <path d="M2.5 10h19" />
      <path d="M6.5 15h3" />
    </Base>
  );
}

export function IconoGestionar(props: PropsIcono) {
  return (
    <Base {...props}>
      <rect x="8" y="2.5" width="8" height="4" rx="1" />
      <path d="M16 4.5h2a1.5 1.5 0 0 1 1.5 1.5v13.5A1.5 1.5 0 0 1 18 21H6a1.5 1.5 0 0 1-1.5-1.5V6A1.5 1.5 0 0 1 6 4.5h2" />
      <path d="M9 12h6" />
      <path d="M9 16h4" />
    </Base>
  );
}

export function IconoMas(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </Base>
  );
}

export function IconoFlecha(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M5 12h14" />
      <path d="M13 6l6 6-6 6" />
    </Base>
  );
}

export function IconoBasura(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M3.5 6h17" />
      <path d="M8.5 6V4h7v2" />
      <path d="M18.5 6l-1 14h-11l-1-14" />
      <path d="M10 10.5v5.5" />
      <path d="M14 10.5v5.5" />
    </Base>
  );
}

export function IconoBuscar(props: PropsIcono) {
  return (
    <Base {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20.5 20.5l-4.3-4.3" />
    </Base>
  );
}

export function IconoBolsa(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M5.5 7.5h13l-1 12.5h-11z" />
      <path d="M9 7.5V7a3 3 0 0 1 6 0v.5" />
    </Base>
  );
}

export function IconoNota(props: PropsIcono) {
  return (
    <Base {...props}>
      <path d="M5 4h14v10.5L13.5 20H5z" />
      <path d="M13.5 20v-5.5H19" />
    </Base>
  );
}

export function IconoAlerta(props: PropsIcono) {
  return (
    <Base {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.5v5.5" />
      <path d="M12 16.5h.01" />
    </Base>
  );
}
