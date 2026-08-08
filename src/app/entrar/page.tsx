import Link from "next/link";
import type { Metadata } from "next";
import { Marca } from "@/components/Marca";
import { AvisoConfiguracao } from "@/components/AvisoConfiguracao";
import { FormularioAcesso } from "./FormularioAcesso";
import { supabaseConfigurado } from "@/lib/ambiente";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import type { Hospital } from "@/lib/tipos";

export const metadata: Metadata = { title: "Acesso da equipe" };

// A lista de unidades vem do banco a cada carregamento, não do build.
export const dynamic = "force-dynamic";

export default async function PaginaEntrar({
  searchParams,
}: {
  searchParams: Promise<{ proximo?: string }>;
}) {
  if (!supabaseConfigurado) return <AvisoConfiguracao />;

  const { proximo } = await searchParams;

  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("hospitais")
    .select("id, nome, cnes, municipio, uf")
    .order("nome");

  const hospitais = (data ?? []) as Hospital[];

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      {/* Coluna do formulário */}
      <main className="flex flex-col px-6 py-8 sm:px-10">
        <Link href="/" className="w-fit">
          <Marca />
        </Link>

        <div className="flex flex-1 items-center py-10">
          <div className="w-full max-w-md">
            <FormularioAcesso hospitais={hospitais} proximo={proximo} />
          </div>
        </div>

        <p className="text-[12.5px] text-tinta-suave">
          Protótipo acadêmico. Os dados de demonstração são fictícios.
        </p>
      </main>

      {/* Coluna editorial */}
      <aside className="hidden flex-col justify-center border-l border-linha bg-papel-fundo px-12 py-16 lg:flex">
        <p className="rotulo">Antes de entrar</p>
        <blockquote className="mt-5 max-w-md font-display text-[26px] leading-snug">
          “Ele chega calado, sem documento, e a gente recomeça tudo de novo. Na
          semana seguinte, outra vez do zero.”
        </blockquote>
        <p className="mt-4 text-[13.5px] text-tinta-suave">
          Fala recorrente de equipes de pronto-socorro sobre o atendimento à
          população em situação de rua.
        </p>

        <div className="mt-12 flex flex-col gap-4 border-t border-linha-forte pt-8">
          <Item
            titulo="Você enxerga a rede inteira"
            texto="O histórico não é do hospital, é da pessoa. Qualquer unidade cadastrada lê o mesmo prontuário."
          />
          <Item
            titulo="Cada abertura fica registrada"
            texto="A trilha de acesso guarda quem abriu, quando e se chegou pela pulseira ou pela busca."
          />
        </div>
      </aside>
    </div>
  );
}

function Item({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div>
      <p className="text-[15px] font-medium">{titulo}</p>
      <p className="mt-1 max-w-sm text-[14px] leading-relaxed text-tinta-media">
        {texto}
      </p>
    </div>
  );
}
