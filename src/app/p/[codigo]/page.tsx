import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { buscarPorCodigo } from "@/lib/prontuario";
import { extrairCodigo } from "@/lib/codigo";
import { Marca } from "@/components/Marca";
import { AvisoConfiguracao } from "@/components/AvisoConfiguracao";
import { supabaseConfigurado } from "@/lib/ambiente";

export const metadata: Metadata = { title: "Abrindo prontuário" };
export const dynamic = "force-dynamic";

/**
 * Destino do QR Code impresso na pulseira.
 *
 * Resolve o código e manda direto para o prontuário. Quem não está
 * autenticado é parado antes daqui, pelo middleware — a pulseira sozinha
 * não revela nada.
 */
export default async function PaginaCodigo({
  params,
}: {
  params: Promise<{ codigo: string }>;
}) {
  if (!supabaseConfigurado) return <AvisoConfiguracao />;

  const { codigo: bruto } = await params;
  const codigo = extrairCodigo(decodeURIComponent(bruto));

  if (codigo) {
    const encontrado = await buscarPorCodigo(codigo);
    if (encontrado) redirect(`/pacientes/${encontrado.id}?via=qrcode`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
      <Link href="/painel" className="mb-8 w-fit">
        <Marca />
      </Link>

      <div className="folha p-7">
        <p className="rotulo">Código não encontrado</p>
        <h1 className="mt-3 text-[26px] leading-tight">
          Nenhum cadastro com o código{" "}
          <span className="dado">{decodeURIComponent(bruto)}</span>
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-tinta-media">
          Pode ser uma pulseira de outra rede, um código lido errado ou um
          cadastro que ainda não existe.
        </p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <Link href="/pacientes" className="botao botao-vazado">
            Buscar pela pessoa
          </Link>
          <Link href="/escanear" className="botao botao-vazado">
            Escanear de novo
          </Link>
          <Link href="/pacientes/novo" className="botao botao-carbono">
            Cadastrar pessoa
          </Link>
        </div>
      </div>
    </main>
  );
}
