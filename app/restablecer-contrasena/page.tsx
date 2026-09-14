"use client";

import {
  FormEvent,
  MouseEvent as ReactMouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useRouter } from "next/navigation";

import { supabase } from "../../lib/supabase";

const LOGO_IMAGE_URL =
  "https://res.cloudinary.com/dv1gz4eqo/image/upload/v1789083650/LOGO-11_oeaddu.png";
const BACKGROUND_IMAGE_URL =
  "https://res.cloudinary.com/dv1gz4eqo/image/upload/v1789083980/ChatGPT_Image_10_sept_2026_06_45_54_p.m._azr58f.png";

// ============================================================
// TIPOS
// ============================================================

type EstadoPagina =
  | "verificando"
  | "listo"
  | "invalido"
  | "enviando"
  | "exito";

type Fortaleza = "vacia" | "debil" | "media" | "segura";

// ============================================================
// ÍCONOS (mismo set visual que Login)
// ============================================================

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

// ============================================================
// UTILIDAD: FORTALEZA DE CONTRASEÑA
//
// Indicador simple (no son reglas de validación adicionales,
// solo una guía visual). La única regla que se exige de verdad
// es el mínimo de 6 caracteres, validado en el submit.
// ============================================================

function calcularFortaleza(password: string): Fortaleza {
  if (!password) return "vacia";

  let puntos = 0;
  if (password.length >= 6) puntos += 1;
  if (password.length >= 10) puntos += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) puntos += 1;
  if (/[0-9]/.test(password)) puntos += 1;
  if (/[^A-Za-z0-9]/.test(password)) puntos += 1;

  if (puntos <= 1) return "debil";
  if (puntos <= 3) return "media";
  return "segura";
}

const ETIQUETA_FORTALEZA: Record<Fortaleza, string> = {
  vacia: "",
  debil: "Débil",
  media: "Media",
  segura: "Segura",
};

// ============================================================
// PÁGINA
// ============================================================

export default function RestablecerContrasenaPage() {
  const router = useRouter();
  const escenaRef = useRef<HTMLElement>(null);

  const [estado, setEstado] = useState<EstadoPagina>("verificando");
  const [errorSesion, setErrorSesion] = useState<string | null>(null);

  const [password, setPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [mostrarPassword, setMostrarPassword] = useState(false);
  const [mostrarConfirmar, setMostrarConfirmar] = useState(false);
  const [errorFormulario, setErrorFormulario] = useState<string | null>(null);

  // ============================================================
  // VERIFICAR SESIÓN DE RECUPERACIÓN
  //
  // Supabase, al abrir el enlace del correo, procesa el token
  // que viene en la URL y crea una sesión temporal de tipo
  // "recovery" (evento PASSWORD_RECOVERY). Si el enlace es
  // inválido o expiró, Supabase agrega ?error=... a la URL y
  // no se crea ninguna sesión.
  // ============================================================

  useEffect(() => {
    let activo = true;

    const params = new URLSearchParams(
      window.location.hash ? window.location.hash.substring(1) : window.location.search
    );

    if (params.get("error")) {
      setErrorSesion(
        params.get("error_description")?.replace(/\+/g, " ") ?? null
      );
      setEstado("invalido");
      return;
    }

    // --------------------------------------------------------
    // 1) Escuchamos el evento PASSWORD_RECOVERY, que es el que
    //    Supabase dispara cuando procesa el token del enlace de
    //    recuperación y crea la sesión temporal.
    // --------------------------------------------------------
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((evento, sesionEvento) => {
      if (!activo) return;

      // Log temporal solicitado para depuración
      console.log("Evento de Auth:", evento);
      console.log("Sesión actual:", sesionEvento);

      if (evento === "PASSWORD_RECOVERY") {
        setEstado("listo");
      }
    });

    // --------------------------------------------------------
    // 2) Respaldo: getSession() por si el evento ya se disparó
    //    antes de que este efecto se montara. Solo lo aceptamos
    //    si realmente hay sesión (no asumimos que cualquier
    //    sesión antigua en el navegador es válida para recovery,
    //    pero sí la usamos como respaldo porque updateUser()
    //    exige una sesión activa para funcionar).
    // --------------------------------------------------------
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (!activo) return;

      console.log("Sesión actual:", session);
      if (error) {
        console.error("Error al obtener la sesión:", error.message);
      }

      if (session) {
        setEstado((actual) => (actual === "verificando" ? "listo" : actual));
      }
    });

    // Si tras un momento no llegó ni el evento ni una sesión,
    // asumimos enlace inválido, expirado o sin sesión.
    const limite = setTimeout(() => {
      if (!activo) return;
      setEstado((actual) => {
        if (actual === "verificando") {
          setErrorSesion(
            "El enlace de recuperación no contiene una sesión válida. Solicita un nuevo enlace."
          );
          return "invalido";
        }
        return actual;
      });
    }, 4000);

    return () => {
      activo = false;
      clearTimeout(limite);
      subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const manejarMovimientoMouse = useCallback((evento: ReactMouseEvent<HTMLElement>) => {
    const nodo = escenaRef.current;
    if (!nodo) return;
    const rect = nodo.getBoundingClientRect();
    nodo.style.setProperty("--mouse-x", `${evento.clientX - rect.left}px`);
    nodo.style.setProperty("--mouse-y", `${evento.clientY - rect.top}px`);
  }, []);

  const fortaleza = calcularFortaleza(password);

  // ============================================================
  // ENVIAR NUEVA CONTRASEÑA
  // ============================================================

  async function manejarSubmit(evento: FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErrorFormulario(null);

    if (!password || !confirmarPassword) {
      setErrorFormulario("Por favor completa los dos campos.");
      return;
    }

    if (password.length < 6) {
      setErrorFormulario("La contraseña debe tener mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmarPassword) {
      setErrorFormulario("Las contraseñas deben coincidir.");
      return;
    }

    setEstado("enviando");

    // --------------------------------------------------------
    // 4) Antes de cambiar la contraseña, verificamos que exista
    //    una sesión válida. Si no la hay, updateUser() fallará
    //    igual, pero preferimos dar un mensaje claro y accionable.
    // --------------------------------------------------------
    const {
      data: { session },
      error: errorSesionActual,
    } = await supabase.auth.getSession();

    console.log("Sesión actual:", session);
    if (errorSesionActual) {
      console.error("Error al obtener la sesión:", errorSesionActual.message);
    }

    if (!session) {
      setErrorFormulario(
        "El enlace de recuperación no contiene una sesión válida. Solicita un nuevo enlace."
      );
      setEstado("invalido");
      return;
    }

    // --------------------------------------------------------
    // 5) Cambiar la contraseña únicamente mediante updateUser().
    // --------------------------------------------------------
    const { data, error } = await supabase.auth.updateUser({ password });

    console.log("Resultado de updateUser:", data);

    if (error) {
      // 7) Nunca mostrar solo un error genérico: se muestra el
      //    mensaje real que devuelve Supabase.
      console.error("Error al actualizar contraseña:", error);
      setErrorFormulario(error.message);
      setEstado("listo");
      return;
    }

    // Se cierra la sesión de recuperación: el usuario debe
    // iniciar sesión de nuevo con su nueva contraseña.
    await supabase.auth.signOut();

    setEstado("exito");

    setTimeout(() => {
      router.push("/");
    }, 3000);
  }

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

        {estado === "verificando" && (
          <>
            <h1 className="tarjeta__titulo">Verificando enlace...</h1>
            <p className="tarjeta__subtitulo">
              Estamos confirmando tu solicitud de recuperación.
            </p>
          </>
        )}

        {estado === "invalido" && (
          <>
            <h1 className="tarjeta__titulo">⚠️ Enlace inválido o expirado</h1>
            <p className="tarjeta__subtitulo">
              Por favor solicita nuevamente la recuperación de tu contraseña.
            </p>
            {errorSesion && <p className="tarjeta__detalle">{errorSesion}</p>}
            <button type="button" className="boton" onClick={() => router.push("/")}>
              Solicitar nuevo enlace
            </button>
          </>
        )}

        {estado === "exito" && (
          <div className="recuperar__exito">
            <span className="recuperar__exito-icono" aria-hidden="true">
              ✓
            </span>
            <div>
              <strong>Contraseña actualizada correctamente</strong>
              <p>Tu contraseña ha sido restablecida.</p>
              <p className="recuperar__exito-nota">
                Serás redirigido al inicio de sesión.
              </p>
            </div>
          </div>
        )}

        {(estado === "listo" || estado === "enviando") && (
          <>
            <h1 className="tarjeta__titulo">Restablecer contraseña</h1>
            <p className="tarjeta__subtitulo">
              Ingresa tu nueva contraseña para tu cuenta en YOPLAY BEER.
            </p>

            {errorFormulario && (
              <div role="alert" className="tarjeta__error">
                <span aria-hidden="true">⚠️</span>
                <span>{errorFormulario}</span>
              </div>
            )}

            <form onSubmit={manejarSubmit} noValidate>
              <div className="campo">
                <label htmlFor="password" className="campo__label">
                  Nueva contraseña
                </label>
                <div className="campo__control">
                  <span className="campo__icono" aria-hidden="true">
                    <IconoCandado />
                  </span>
                  <input
                    id="password"
                    type={mostrarPassword ? "text" : "password"}
                    value={password}
                    onChange={(evento) => setPassword(evento.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    disabled={estado === "enviando"}
                  />
                  <button
                    type="button"
                    className="campo__ojo"
                    onClick={() => setMostrarPassword((valor) => !valor)}
                    disabled={estado === "enviando"}
                    aria-label={mostrarPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                    aria-pressed={mostrarPassword}
                  >
                    <IconoOjo visible={mostrarPassword} />
                  </button>
                </div>

                {fortaleza !== "vacia" && (
                  <div className={`fortaleza fortaleza--${fortaleza}`}>
                    <span className="fortaleza__barra" />
                    <span className="fortaleza__barra" />
                    <span className="fortaleza__barra" />
                    <span className="fortaleza__texto">
                      {ETIQUETA_FORTALEZA[fortaleza]}
                    </span>
                  </div>
                )}
              </div>

              <div className="campo">
                <label htmlFor="confirmar-password" className="campo__label">
                  Confirmar nueva contraseña
                </label>
                <div className="campo__control">
                  <span className="campo__icono" aria-hidden="true">
                    <IconoCandado />
                  </span>
                  <input
                    id="confirmar-password"
                    type={mostrarConfirmar ? "text" : "password"}
                    value={confirmarPassword}
                    onChange={(evento) => setConfirmarPassword(evento.target.value)}
                    placeholder="••••••••"
                    required
                    autoComplete="new-password"
                    disabled={estado === "enviando"}
                  />
                  <button
                    type="button"
                    className="campo__ojo"
                    onClick={() => setMostrarConfirmar((valor) => !valor)}
                    disabled={estado === "enviando"}
                    aria-label={mostrarConfirmar ? "Ocultar contraseña" : "Mostrar contraseña"}
                    aria-pressed={mostrarConfirmar}
                  >
                    <IconoOjo visible={mostrarConfirmar} />
                  </button>
                </div>
              </div>

              <button type="submit" disabled={estado === "enviando"} className="boton">
                {estado === "enviando" ? "Actualizando..." : "Restablecer contraseña"}
              </button>
            </form>
          </>
        )}
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
          font-size: 24px;
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

        .tarjeta__detalle {
          margin: -14px 0 22px;
          text-align: center;
          font-size: 12.5px;
          color: rgba(255, 255, 255, 0.4);
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

        .fortaleza {
          display: flex;
          align-items: center;
          gap: 5px;
          margin-top: 9px;
        }

        .fortaleza__barra {
          flex: 1;
          height: 4px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.12);
          transition: background 0.25s ease;
        }

        .fortaleza__texto {
          margin-left: 4px;
          font-size: 11.5px;
          font-weight: 600;
          white-space: nowrap;
        }

        .fortaleza--debil .fortaleza__barra:nth-child(1) {
          background: #ef4444;
        }
        .fortaleza--debil .fortaleza__texto {
          color: #f87171;
        }

        .fortaleza--media .fortaleza__barra:nth-child(1),
        .fortaleza--media .fortaleza__barra:nth-child(2) {
          background: #f59e0b;
        }
        .fortaleza--media .fortaleza__texto {
          color: #fbbf24;
        }

        .fortaleza--segura .fortaleza__barra {
          background: #39ff14;
        }
        .fortaleza--segura .fortaleza__texto {
          color: #39ff14;
        }

        .recuperar__exito {
          display: flex;
          gap: 12px;
          align-items: flex-start;
          background: rgba(57, 255, 20, 0.1);
          border: 1px solid rgba(57, 255, 20, 0.35);
          border-radius: 12px;
          padding: 16px;
          color: rgba(255, 255, 255, 0.85);
        }

        .recuperar__exito-icono {
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #39ff14;
          color: #062012;
          font-weight: 700;
          font-size: 13px;
        }

        .recuperar__exito strong {
          display: block;
          margin-bottom: 6px;
          color: #fff;
          font-size: 15px;
        }

        .recuperar__exito p {
          margin: 0;
          font-size: 13.5px;
          line-height: 1.5;
          color: rgba(255, 255, 255, 0.7);
        }

        .recuperar__exito-nota {
          margin-top: 8px !important;
          color: rgba(255, 255, 255, 0.5) !important;
          font-size: 12.5px !important;
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
            font-size: 20px;
          }
        }
      `}</style>
    </main>
  );
}
