"use client";

export function BotaoImprimir({
  children = "Imprimir",
  className = "botao botao-carbono",
}: {
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <button type="button" onClick={() => window.print()} className={className}>
      {children}
    </button>
  );
}
