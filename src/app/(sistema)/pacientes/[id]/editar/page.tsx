import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { FormularioPaciente } from "@/components/FormularioPaciente";
import { atualizarPaciente } from "@/app/acoes/pacientes";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { nomeExibicao } from "@/lib/formato";
import type { Paciente } from "@/lib/tipos";

export const metadata: Metadata = { title: "Editar cadastro" };
export const dynamic = "force-dynamic";

export default async function PaginaEditarPaciente({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("pacientes")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (!data) notFound();
  const paciente = data as Paciente;

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <Link
        href={`/pacientes/${paciente.id}`}
        className="text-[13.5px] text-tinta-suave hover:text-tinta"
      >
        ← Prontuário
      </Link>

      <header className="mt-4 mb-7">
        <p className="dado text-[12px] text-tinta-suave">{paciente.codigo}</p>
        <h1 className="mt-1.5 text-[28px] leading-tight sm:text-[32px]">
          Editar cadastro de {nomeExibicao(paciente)}
        </h1>
        <p className="mt-2.5 max-w-prose text-[15px] leading-relaxed text-tinta-media">
          O código da pulseira não muda. Se ela foi perdida, imprima outra a
          partir do prontuário — o código continua o mesmo.
        </p>
      </header>

      <FormularioPaciente acao={atualizarPaciente} paciente={paciente} />
    </main>
  );
}
