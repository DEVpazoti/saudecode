import Link from "next/link";
import type { Metadata } from "next";
import { FormularioPaciente } from "@/components/FormularioPaciente";
import { criarPaciente } from "@/app/acoes/pacientes";

export const metadata: Metadata = { title: "Novo cadastro" };

export default function PaginaNovoPaciente() {
  return (
    <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <Link
        href="/pacientes"
        className="text-[13.5px] text-tinta-suave hover:text-tinta"
      >
        ← Pessoas atendidas
      </Link>

      <header className="mt-4 mb-7">
        <p className="rotulo">Primeiro atendimento</p>
        <h1 className="mt-1.5 text-[28px] leading-tight sm:text-[32px]">
          Novo cadastro
        </h1>
        <p className="mt-2.5 max-w-prose text-[15px] leading-relaxed text-tinta-media">
          Ao salvar, o sistema gera um código único e a pulseira sai pronta para
          impressão. Nada aqui é obrigatório além do nome e da idade.
        </p>
      </header>

      <FormularioPaciente acao={criarPaciente} />
    </main>
  );
}
