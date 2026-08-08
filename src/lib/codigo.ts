/**
 * Código da pulseira.
 *
 * Alfabeto sem os caracteres que a equipe confunde ao digitar à mão
 * quando a pulseira está gasta demais para escanear: 0/O, 1/I/L, 5/S, 8/B.
 */
const ALFABETO = "234679ACDEFGHJKMNPQRTUVWXYZ";

function bloco(tamanho: number): string {
  const bytes = new Uint8Array(tamanho);
  crypto.getRandomValues(bytes);
  let saida = "";
  for (const b of bytes) saida += ALFABETO[b % ALFABETO.length];
  return saida;
}

/** Ex.: SC-4KQ7-M2XB */
export function gerarCodigo(): string {
  return `SC-${bloco(4)}-${bloco(4)}`;
}

export function codigoValido(codigo: string): boolean {
  return /^SC-[2-9A-Z]{4}-[2-9A-Z]{4}$/.test(codigo.trim().toUpperCase());
}

/**
 * Aceita tanto o conteúdo cru do QR (uma URL) quanto um código digitado.
 * Retorna o código normalizado ou null.
 */
export function extrairCodigo(bruto: string): string | null {
  const texto = bruto.trim();
  if (!texto) return null;

  const achado = texto.toUpperCase().match(/SC-[2-9A-Z]{4}-[2-9A-Z]{4}/);
  if (achado) return achado[0];

  // Tolerante a quem digita sem os hifens
  const limpo = texto.toUpperCase().replace(/[^2-9A-Z]/g, "");
  if (/^SC[2-9A-Z]{8}$/.test(limpo)) {
    return `SC-${limpo.slice(2, 6)}-${limpo.slice(6, 10)}`;
  }

  return null;
}

/** Conteúdo gravado no QR Code da pulseira. */
export function urlDaPulseira(base: string, codigo: string): string {
  return `${base.replace(/\/$/, "")}/p/${codigo}`;
}
