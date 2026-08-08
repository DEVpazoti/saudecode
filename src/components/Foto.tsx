import { iniciais } from "@/lib/formato";

/**
 * Retrato de identificação.
 *
 * Sem foto, cai nas iniciais — nunca num ícone genérico de pessoa, que
 * não ajuda ninguém a reconhecer quem está na maca.
 */
export function Foto({
  nome,
  url,
  tamanho = 48,
  className = "",
}: {
  nome: string;
  url?: string | null;
  tamanho?: number;
  className?: string;
}) {
  const estilo = { width: tamanho, height: tamanho };

  if (url) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={url}
        alt={`Foto de ${nome}`}
        style={estilo}
        className={`shrink-0 rounded-[3px] border border-linha-forte object-cover ${className}`}
      />
    );
  }

  return (
    <div
      style={estilo}
      aria-hidden="true"
      className={`flex shrink-0 items-center justify-center rounded-[3px] border border-dashed border-linha-forte bg-folha-2 ${className}`}
    >
      <span
        className="dado font-medium text-tinta-suave"
        style={{ fontSize: Math.max(11, Math.round(tamanho * 0.3)) }}
      >
        {iniciais(nome)}
      </span>
    </div>
  );
}
