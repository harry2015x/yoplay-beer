import { createClient } from "@supabase/supabase-js";

// NO CAMBIAR: esta es la configuración que ya funciona en el proyecto.
// Si tu archivo lib/supabase.ts actual ya es igual a este, no necesitas
// reemplazarlo por nada de este entregable.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);




