/**
 * Leitura das variáveis do Supabase.
 *
 * O app precisa continuar de pé antes de o banco existir: enquanto as
 * chaves não estiverem preenchidas, as telas do sistema mostram o passo a
 * passo de configuração em vez de quebrar.
 */

export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const supabaseConfigurado =
  SUPABASE_URL.startsWith("http") && SUPABASE_ANON_KEY.length > 20;

/** URL pública usada nos QR Codes impressos na pulseira. */
export function urlBase(): string {
  const explicita = process.env.NEXT_PUBLIC_URL_BASE;
  if (explicita) return explicita.replace(/\/$/, "");

  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL;
  if (vercel) return `https://${vercel}`;

  return "http://localhost:3000";
}
