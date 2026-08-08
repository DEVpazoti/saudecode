import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { carregarProntuario } from "@/lib/prontuario";
import { montarAlertas } from "@/lib/alertas";
import { profissionalAtual } from "@/lib/supabase/servidor";
import { FaixaAlertas } from "@/components/FaixaAlertas";
import { FormularioAtendimento } from "@/components/FormularioAtendimento";
import { Foto } from "@/components/Foto";
import { idadeTexto, nomeExibicao } from "@/lib/formato";

export const metadata: Metadata = { title: "Registrar atendimento" };
export const dynamic = "force-dynamic";

export default async function PaginaAtendimento({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const prontuario = await carregarProntuario(id);
  if (!prontuario) notFound();

  const profissional = await profissionalAtual();
  const { paciente } = prontuario;

  // Só o que muda a conduta: o resto está no prontuário, a um clique.
  const criticos = montarAlertas(prontuario).filter(
    (a) => a.severidade === "critico",
  );

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <Link
        href={`/pacientes/${paciente.id}`}
        className="text-[13.5px] text-tinta-suave hover:text-tinta"
      >
        ← Prontuário
      </Link>

      <header className="mt-4 mb-6 flex items-center gap-4">
        <Foto nome={paciente.nome} url={paciente.foto_url} tamanho={56} />
        <div className="min-w-0">
          <p className="dado text-[12px] text-tinta-suave">{paciente.codigo}</p>
          <h1 className="text-[26px] leading-tight sm:text-[30px]">
            {nomeExibicao(paciente)}
          </h1>
          <p className="text-[13.5px] text-tinta-media">{idadeTexto(paciente)}</p>
        </div>
      </header>

      {criticos.length > 0 && (
        <section className="mb-6">
          <h2 className="rotulo mb-2.5">Não passe daqui sem ler</h2>
          <FaixaAlertas alertas={criticos} />
        </section>
      )}

      <FormularioAtendimento
        pacienteId={paciente.id}
        unidade={profissional?.hospitais?.nome ?? "sua unidade"}
      />
    </main>
  );
}
