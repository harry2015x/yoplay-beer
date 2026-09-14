import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

if (!supabaseUrl || !supabaseKey) {
  // Esto ayuda a detectar en consola si en Vercel falta o cambió
  // el nombre de la variable de entorno (por ejemplo si el
  // proyecto de Supabase espera NEXT_PUBLIC_SUPABASE_ANON_KEY en
  // vez de NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY).
  console.error(
    "Faltan variables de entorno de Supabase (NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY)."
  );
}

// Se hace explícita la configuración de auth para que el manejo de
// la sesión de recuperación de contraseña (enlace con #access_token
// o ?code=) sea consistente y predecible en todo el sitio.
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    detectSessionInUrl: true,
    persistSession: true,
    autoRefreshToken: true,
  },
});