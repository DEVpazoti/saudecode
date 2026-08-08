"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { Marca } from "./Marca";
import { criarClienteNavegador } from "@/lib/supabase/cliente";
import { rotuloCargo } from "@/lib/formato";
import type { Profissional } from "@/lib/tipos";

const ITENS = [
  { href: "/painel", texto: "Painel", icone: PainelIcone },
  { href: "/pacientes", texto: "Pessoas", icone: PessoasIcone },
  { href: "/escanear", texto: "Escanear", icone: EscanearIcone },
] as const;

/**
 * A lombada da pasta: fina, fixa, sempre no mesmo lugar.
 * Em telas pequenas vira barra superior com as mesmas rotas.
 */
export function Navegacao({ profissional }: { profissional: Profissional }) {
  const caminho = usePathname();
  const router = useRouter();
  const [saindo, setSaindo] = useState(false);

  async function sair() {
    setSaindo(true);
    await criarClienteNavegador().auth.signOut();
    router.push("/");
    router.refresh();
  }

  const ativo = (href: string) =>
    caminho === href || caminho.startsWith(`${href}/`);

  const unidade = profissional.hospitais?.nome ?? "Unidade não vinculada";

  return (
    <>
      {/* ---------------------------------------------- barra (mobile) */}
      <header className="sem-impressao sticky top-0 z-30 border-b border-linha bg-papel/95 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-3">
          <Link href="/painel">
            <Marca />
          </Link>
          <button
            type="button"
            onClick={sair}
            disabled={saindo}
            className="text-[13px] text-tinta-suave hover:text-tinta"
          >
            Sair
          </button>
        </div>
        <nav className="flex border-t border-linha">
          {ITENS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-2.5 text-[13.5px] transition-colors ${
                ativo(item.href)
                  ? "border-carbono font-medium text-tinta"
                  : "border-transparent text-tinta-suave"
              }`}
            >
              <item.icone className="h-4 w-4" />
              {item.texto}
            </Link>
          ))}
        </nav>
      </header>

      {/* ---------------------------------------------- lombada (desktop) */}
      <aside className="sem-impressao sticky top-0 hidden h-screen w-60 shrink-0 flex-col border-r border-linha bg-papel-fundo lg:flex">
        <Link href="/painel" className="block px-5 py-5">
          <Marca />
        </Link>

        <nav className="flex flex-col gap-0.5 px-3">
          {ITENS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-[3px] px-3 py-2 text-[14.5px] transition-colors ${
                ativo(item.href)
                  ? "bg-folha font-medium text-tinta shadow-[2px_2px_0_rgba(26,26,36,0.06)] ring-1 ring-linha"
                  : "text-tinta-media hover:bg-folha/60 hover:text-tinta"
              }`}
            >
              <item.icone className="h-4 w-4 shrink-0" />
              {item.texto}
            </Link>
          ))}
        </nav>

        <div className="px-3 pt-5">
          <Link
            href="/pacientes/novo"
            className="botao botao-carbono w-full py-2 text-[13.5px]"
          >
            Novo cadastro
          </Link>
        </div>

        <div className="mt-auto border-t border-linha px-5 py-4">
          <p className="rotulo">Você</p>
          <p className="mt-1.5 text-[14px] leading-tight font-medium">
            {profissional.nome}
          </p>
          <p className="text-[12.5px] text-tinta-suave">
            {rotuloCargo[profissional.cargo] ?? profissional.cargo}
          </p>
          <p className="mt-2 text-[12.5px] leading-snug text-tinta-media">
            {unidade}
          </p>
          <button
            type="button"
            onClick={sair}
            disabled={saindo}
            className="mt-3 text-[13px] text-tinta-suave underline underline-offset-2 hover:text-tinta"
          >
            {saindo ? "Saindo…" : "Sair"}
          </button>
        </div>
      </aside>
    </>
  );
}

function PainelIcone({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden="true">
      <rect x="1.5" y="1.5" width="5.5" height="6.5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="1.5" width="5.5" height="4" stroke="currentColor" strokeWidth="1.4" />
      <rect x="1.5" y="9.5" width="5.5" height="5" stroke="currentColor" strokeWidth="1.4" />
      <rect x="9" y="7" width="5.5" height="7.5" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  );
}

function PessoasIcone({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden="true">
      <circle cx="6.5" cy="5" r="2.6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M1.6 14.4c0-2.7 2.2-4.5 4.9-4.5s4.9 1.8 4.9 4.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M11.4 3c1.3.3 2.2 1.4 2.2 2.7 0 .9-.4 1.7-1.1 2.2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function EscanearIcone({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" className={className} fill="none" aria-hidden="true">
      <path d="M1.6 5.2V2.6a1 1 0 0 1 1-1h2.6M10.8 1.6h2.6a1 1 0 0 1 1 1v2.6M14.4 10.8v2.6a1 1 0 0 1-1 1h-2.6M5.2 14.4H2.6a1 1 0 0 1-1-1v-2.6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M1.6 8h12.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
