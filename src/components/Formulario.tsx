"use client";

import { useFormStatus } from "react-dom";

export function Secao({
  titulo,
  descricao,
  children,
}: {
  titulo: string;
  descricao?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="folha p-5 sm:p-6">
      <h2 className="text-[19px] leading-tight">{titulo}</h2>
      {descricao && (
        <p className="mt-1.5 max-w-prose text-[13.5px] leading-relaxed text-tinta-media">
          {descricao}
        </p>
      )}
      <div className="mt-5 flex flex-col gap-4">{children}</div>
    </section>
  );
}

export function Campo({
  rotulo,
  para,
  dica,
  obrigatorio = false,
  children,
  className = "",
}: {
  rotulo: string;
  para: string;
  dica?: string;
  obrigatorio?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={para} className="rotulo mb-1.5 block">
        {rotulo}
        {obrigatorio && <span className="text-critico"> *</span>}
      </label>
      {children}
      {dica && (
        <p className="mt-1.5 text-[12.5px] leading-relaxed text-tinta-suave">
          {dica}
        </p>
      )}
    </div>
  );
}

export function Linha({
  children,
  colunas = 2,
}: {
  children: React.ReactNode;
  colunas?: 2 | 3 | 4;
}) {
  const grade = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[colunas];

  return <div className={`grid gap-4 ${grade}`}>{children}</div>;
}

export function Marcador({
  nome,
  rotulo,
  dica,
  padrao = false,
}: {
  nome: string;
  rotulo: string;
  dica?: string;
  padrao?: boolean;
}) {
  return (
    <label
      htmlFor={nome}
      className="flex cursor-pointer items-start gap-2.5 border border-linha bg-folha-2 px-3.5 py-3"
    >
      <input
        id={nome}
        name={nome}
        type="checkbox"
        defaultChecked={padrao}
        className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-carbono)]"
      />
      <span>
        <span className="block text-[14px] leading-snug font-medium">{rotulo}</span>
        {dica && (
          <span className="mt-0.5 block text-[12.5px] leading-relaxed text-tinta-suave">
            {dica}
          </span>
        )}
      </span>
    </label>
  );
}

export function Erro({ mensagem }: { mensagem: string | null }) {
  if (!mensagem) return null;
  return (
    <p
      role="alert"
      className="border border-critico/35 bg-critico-veu px-4 py-3 text-[13.5px] leading-relaxed text-critico"
    >
      {mensagem}
    </p>
  );
}

export function BotaoEnviar({
  children,
  ocupado,
  className = "botao botao-carbono px-5 py-2.5",
}: {
  children: React.ReactNode;
  ocupado?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={className}>
      {pending ? (ocupado ?? "Salvando…") : children}
    </button>
  );
}
