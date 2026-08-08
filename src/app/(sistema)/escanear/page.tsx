import Link from "next/link";
import type { Metadata } from "next";
import { Leitor } from "@/components/Leitor";

export const metadata: Metadata = { title: "Escanear pulseira" };

export default function PaginaEscanear() {
  return (
    <main className="mx-auto max-w-2xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="mb-7">
        <p className="rotulo">Identificação</p>
        <h1 className="mt-1.5 text-[28px] leading-tight sm:text-[32px]">
          Escanear pulseira
        </h1>
        <p className="mt-2.5 max-w-prose text-[15px] leading-relaxed text-tinta-media">
          Um segundo de leitura e o prontuário abre — mesmo que a pessoa não
          consiga dizer o próprio nome.
        </p>
      </header>

      <Leitor />

      <p className="mt-6 text-[13.5px] leading-relaxed text-tinta-suave">
        Sem pulseira e sem código?{" "}
        <Link href="/pacientes" className="text-carbono underline underline-offset-2">
          Busque por apelido ou sinais particulares
        </Link>{" "}
        — ou{" "}
        <Link
          href="/pacientes/novo"
          className="text-carbono underline underline-offset-2"
        >
          faça um cadastro novo
        </Link>
        .
      </p>
    </main>
  );
}
