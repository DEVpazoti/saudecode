"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Erro({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[SaudeCode]", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
      <div className="folha p-7">
        <p className="rotulo">Algo falhou</p>
        <h1 className="mt-3 text-[26px] leading-tight">
          Não conseguimos carregar esta tela
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-tinta-media">
          Tente de novo. Se o atendimento não pode esperar, busque a pessoa pelo
          apelido ou pelos sinais particulares — a lista funciona mesmo quando o
          prontuário não abre.
        </p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <button type="button" onClick={reset} className="botao botao-carbono">
            Tentar de novo
          </button>
          <Link href="/pacientes" className="botao botao-vazado">
            Buscar uma pessoa
          </Link>
          <Link href="/escanear" className="botao botao-vazado">
            Escanear de novo
          </Link>
        </div>

        {error.digest && (
          <p className="dado mt-6 border-t border-linha pt-3 text-[11.5px] text-tinta-suave">
            Código do erro: {error.digest}
          </p>
        )}
      </div>
    </main>
  );
}
