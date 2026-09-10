"use client";

import {
  FormEvent,
  MouseEvent as ReactMouseEvent,
  useCallback,
  useRef,
  useState,
  type CSSProperties,
} from "react";

type Props = {
  onIniciarSesion: (
    email: string,
    password: string
  ) => Promise<boolean>;

  cargando: boolean;
  error: string | null;
  limpiarError: () => void;
};

const LOGO_IMAGE_URL =
  "https://res.cloudinary.com/dv1gz4eqo/image/upload/v1789083650/LOGO-11_oeaddu.png";
const BACKGROUND_IMAGE_URL =
  "https://res.cloudinary.com/dv1gz4eqo/image/upload/v1789083980/ChatGPT_Image_10_sept_2026_06_45_54_p.m._azr58f.png";

function IconoCorreo() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path
        d="M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11Z"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <path
        d="m4 6.5 8 6.2 8-6.2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconoCandado() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <rect x="5" y="10.5" width="14" height="9.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 10.5V7.8a4 4 0 1 1 8 0v2.7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function IconoOjo({ visible }: { visible: boolean }) {
  if (visible) {
    return (
      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
        <path
          d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
          stroke="currentColor"
          strokeWidth="1.5"
        />
        <circle cx="12" cy="12" r="2.6" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" aria-hidden="true">
      <path d="M3.5 3.5l17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path
        d="M9.9 5.6A10.4 10.4 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a15.6 15.6 0 0 1-3.2 4.1M6.6 7.4A15.9 15.9 0 0 0 2.5 12s3.5 6.5 9.5 6.5a9.9 9.9 0 0 0 3.6-.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9.6 9.9a2.6 2.6 0 0 0 3.6 3.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export default function Login({
  onIniciarSesion,
  cargando,
  error,
  limpiarError,
}: Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [recordarme, setRecordarme] = useState(false);
  const escenaRef = useRef<HTMLElement>(null);

  async function manejarSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();

    limpiarError();

    await onIniciarSesion(
      email.trim(),
      password
    );
  }

  // Actualiza las variables CSS directamente sobre el nodo DOM (sin re-render)
  // para que el brillo del mouse sea fluido y no afecte el rendimiento.
  const manejarMovimientoMouse = useCallback((evento: ReactMouseEvent<HTMLElement>) => {
    const nodo = escenaRef.current;
    if (!nodo) return;
    const rect = nodo.getBoundingClientRect();
    nodo.style.setProperty("--mouse-x", `${evento.clientX - rect.left}px`);
    nodo.style.setProperty("--mouse-y", `${evento.clientY - rect.top}px`);
  }, []);

  return (
    <main
      ref={escenaRef}
      onMouseMove={manejarMovimientoMouse}
      className="escena"
      style={{ "--mouse-x": "50%", "--mouse-y": "40%" } as CSSProperties}
    >
      <div className="escena__overlay" aria-hidden="true" />
      <div className="escena__glow" aria-hidden="true" />

      <div className="tarjeta">
        <div className="tarjeta__logo-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={LOGO_IMAGE_URL} alt="YOPlay Beer" className="tarjeta__logo" />
        </div>

        <h1 className="tarjeta__titulo">Bienvenido</h1>
        <p className="tarjeta__subtitulo">Inicia sesión para continuar</p>

        {error && (
          <div role="alert" className="tarjeta__error">
            <span aria-hidden="true">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={manejarSubmit} noValidate>
          <div className="campo">
            <label htmlFor="email" className="campo__label">
              Correo electrónico
            </label>
            <div className="campo__control">
              <span className="campo__icono" aria-hidden="true">
                <IconoCorreo />
              </span>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(evento) => {
                  setEmail(evento.target.value);
                  limpiarError();
                }}
                placeholder="correo@ejemplo.com"
                required
                autoComplete="email"
                disabled={cargando}
              />
            </div>
          </div>

          <div className="campo">
            <label htmlFor="password" className="campo__label">
              Contraseña
            </label>
            <div className="campo__control">
              <span className="campo__icono" aria-hidden="true">
                <IconoCandado />
              </span>
              <input
                id="password"
                type={mostrarPassword ? "text" : "password"}
                value={password}
                onChange={(evento) => {
                  setPassword(evento.target.value);
                  limpiarError();
                }}
                placeholder="••••••••"
                required
                autoComplete="current-password"
                disabled={cargando}
              />
              <button
                type="button"
                className="campo__ojo"
                onClick={() => setMostrarPassword((valor) => !valor)}
                disabled={cargando}
                aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                aria-pressed={mostrarPassword}
              >
                <IconoOjo visible={mostrarPassword} />
              </button>
            </div>
          </div>

          <div className="opciones">
            <label className="opciones__recordarme">
              <input
                type="checkbox"
                checked={recordarme}
                onChange={(evento) => setRecordarme(evento.target.checked)}
                disabled={cargando}
              />
              <span>Recordarme</span>
            </label>

            <button type="button" className="opciones__olvido">
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          <button type="submit" disabled={cargando} className="boton">
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        <div className="pie">🔒 Acceso seguro</div>
      </div>

      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap");
      `}</style>

      <style jsx>{`
        .escena {
          position: relative;
          isolation: isolate;
          min-height: 100vh;
          min-height: 100dvh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          overflow: hidden;
          font-family: "Inter", "Montserrat", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          background-image: url(${BACKGROUND_IMAGE_URL});
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          background-attachment: fixed;
        }

        .escena__overlay {
          position: absolute;
          inset: 0;
          z-index: 0;
          background: linear-gradient(90deg, rgba(0, 0, 0, 0.85), rgba(0, 15, 5, 0.7), rgba(0, 0, 0, 0.88));
          -webkit-mask-image: radial-gradient(
            circle 340px at var(--mouse-x, 50%) var(--mouse-y, 40%),
            rgba(0, 0, 0, 0.5) 0%,
            rgba(0, 0, 0, 1) 100%
          );
          mask-image: radial-gradient(
            circle 340px at var(--mouse-x, 50%) var(--mouse-y, 40%),
            rgba(0, 0, 0, 0.5) 0%,
            rgba(0, 0, 0, 1) 100%
          );
        }

        .escena__glow {
          position: absolute;
          inset: 0;
          z-index: 1;
          pointer-events: none;
          background: radial-gradient(
            circle 320px at var(--mouse-x, 50%) var(--mouse-y, 40%),
            rgba(57, 255, 20, 0.16),
            rgba(57, 255, 20, 0) 70%
          );
          mix-blend-mode: screen;
          filter: blur(6px);
        }

        @media (hover: none), (pointer: coarse) {
          .escena__glow {
            display: none;
          }
          .escena__overlay {
            -webkit-mask-image: none;
            mask-image: none;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .escena__glow {
            display: none;
          }
        }

        .tarjeta {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 440px;
          padding: 40px;
          border-radius: 24px;
          background: rgba(15, 25, 20, 0.72);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.06);
          color: #fff;
        }

        .tarjeta__logo-wrap {
          position: relative;
          display: flex;
          justify-content: center;
          margin-bottom: 18px;
        }

        .tarjeta__logo-wrap::before {
          content: "";
          position: absolute;
          inset: -30% -10%;
          z-index: 0;
          background: radial-gradient(circle, rgba(57, 255, 20, 0.32), transparent 70%);
          filter: blur(22px);
          opacity: 0.45;
          animation: respirar 4.5s ease-in-out infinite;
        }

        .tarjeta__logo {
          position: relative;
          z-index: 1;
          max-width: 150px;
          max-height: 90px;
          width: auto;
          height: auto;
          object-fit: contain;
          filter: drop-shadow(0 0 5px rgba(57, 255, 20, 0.35)) drop-shadow(0 0 14px rgba(57, 255, 20, 0.22));
          transition: filter 0.35s ease, transform 0.35s ease;
        }

        .tarjeta__logo-wrap:hover .tarjeta__logo {
          transform: scale(1.045);
          filter: drop-shadow(0 0 6px rgba(57, 255, 20, 0.75)) drop-shadow(0 0 18px rgba(57, 255, 20, 0.55))
            drop-shadow(0 0 34px rgba(57, 255, 20, 0.38));
        }

        @keyframes respirar {
          0%,
          100% {
            opacity: 0.35;
          }
          50% {
            opacity: 0.7;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tarjeta__logo-wrap::before {
            animation: none;
          }
        }

        .tarjeta__titulo {
          margin: 0 0 6px;
          text-align: center;
          font-size: 26px;
          font-weight: 700;
          letter-spacing: -0.01em;
          color: #fff;
        }

        .tarjeta__subtitulo {
          margin: 0 0 26px;
          text-align: center;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.55);
        }

        .tarjeta__error {
          display: flex;
          gap: 8px;
          align-items: flex-start;
          background: rgba(239, 68, 68, 0.12);
          border: 1px solid rgba(239, 68, 68, 0.35);
          color: #fca5a5;
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 13.5px;
          margin-bottom: 18px;
        }

        .campo {
          margin-bottom: 18px;
        }

        .campo__label {
          display: block;
          margin-bottom: 7px;
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: 0.02em;
          color: rgba(255, 255, 255, 0.65);
        }

        .campo__control {
          position: relative;
          display: flex;
          align-items: center;
          background: rgba(255, 255, 255, 0.06);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          transition: border-color 0.25s ease, box-shadow 0.25s ease, background 0.25s ease;
        }

        .campo__control:focus-within {
          border-color: rgba(57, 255, 20, 0.7);
          box-shadow: 0 0 0 4px rgba(57, 255, 20, 0.1);
          background: rgba(255, 255, 255, 0.08);
        }

        .campo__icono {
          display: flex;
          padding-left: 14px;
          color: rgba(255, 255, 255, 0.4);
        }

        .campo__control input {
          flex: 1;
          min-width: 0;
          background: transparent;
          border: none;
          outline: none;
          padding: 13px 14px;
          color: #fff;
          font-size: 15px;
          font-family: inherit;
        }

        .campo__control input::placeholder {
          color: rgba(255, 255, 255, 0.32);
        }

        .campo__control input:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .campo__ojo {
          display: flex;
          align-items: center;
          justify-content: center;
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.45);
          padding: 0 14px;
          height: 100%;
          transition: color 0.2s ease;
        }

        .campo__ojo:hover {
          color: rgba(57, 255, 20, 0.85);
        }

        .campo__ojo:focus-visible {
          outline: 2px solid rgba(57, 255, 20, 0.7);
          outline-offset: 2px;
          border-radius: 8px;
        }

        .opciones {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }

        .opciones__recordarme {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          color: rgba(255, 255, 255, 0.6);
          cursor: pointer;
        }

        .opciones__recordarme input {
          width: 16px;
          height: 16px;
          accent-color: #39ff14;
          cursor: pointer;
        }

        .opciones__olvido {
          background: none;
          border: none;
          padding: 0;
          font-size: 13px;
          font-family: inherit;
          color: rgba(57, 255, 20, 0.85);
          cursor: pointer;
        }

        .opciones__olvido:hover {
          color: #39ff14;
          text-decoration: underline;
        }

        .boton {
          width: 100%;
          height: 52px;
          border: none;
          border-radius: 12px;
          background: linear-gradient(135deg, #39ff14, #16c784);
          color: #062012;
          font-weight: 700;
          font-size: 15px;
          cursor: pointer;
          box-shadow: 0 8px 24px rgba(57, 255, 20, 0.22);
          transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
        }

        .boton:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(57, 255, 20, 0.35);
        }

        .boton:active:not(:disabled) {
          transform: translateY(0);
        }

        .boton:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          background: #597a68;
          box-shadow: none;
        }

        .boton:focus-visible {
          outline: 2px solid #fff;
          outline-offset: 3px;
        }

        .pie {
          margin-top: 22px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          text-align: center;
          font-size: 12px;
          color: rgba(255, 255, 255, 0.4);
        }

        @media (max-width: 480px) {
          .escena {
            padding: 16px;
            background-attachment: scroll;
          }
          .tarjeta {
            width: 92%;
            padding: 28px 22px;
          }
          .tarjeta__titulo {
            font-size: 22px;
          }
        }
      `}</style>
    </main>
  );
}
