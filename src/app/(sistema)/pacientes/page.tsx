import Link from "next/link";
import type { Metadata } from "next";
import { criarClienteServidor } from "@/lib/supabase/servidor";
import { Foto } from "@/components/Foto";
import {
  idadeTexto,
  nomeExibicao,
  rotuloSexo,
  tempoRelativo,
} from "@/lib/formato";
import type { Alergia, Atendimento, Condicao, Paciente } from "@/lib/tipos";

export const metadata: Metadata = { title: "Pessoas atendidas" };
export const dynamic = "force-dynamic";

function escaparBusca(termo: string) {
  // Vírgula e parênteses quebram a sintaxe do filtro `or` do PostgREST.
  return termo.replace(/[,()%]/g, " ").trim();
}

export default async function PaginaPacientes({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const termo = escaparBusca(q ?? "");

  const supabase = await criarClienteServidor();

  let consulta = supabase
    .from("pacientes")
    .select("*")
    .eq("ativo", true)
    .order("criado_em", { ascending: false })
    .limit(100);

  if (termo) {
    const alvo = `%${termo}%`;
    consulta = consulta.or(
      [
        `nome.ilike.${alvo}`,
        `nome_social.ilike.${alvo}`,
        `apelido.ilike.${alvo}`,
        `codigo.ilike.${alvo}`,
        `sinais_particulares.ilike.${alvo}`,
        `local_permanencia.ilike.${alvo}`,
        `cns.ilike.${alvo}`,
        `cpf.ilike.${alvo}`,
      ].join(","),
    );
  }

  const { data: pacientesBruto, error } = await consulta;
  const pacientes = (pacientesBruto ?? []) as Paciente[];
  const ids = pacientes.map((p) => p.id);

  // Marcadores de risco e última passagem, em três consultas para a página toda.
  const [{ data: alergiasBruto }, { data: condicoesBruto }, { data: passagensBruto }] =
    ids.length > 0
      ? await Promise.all([
          supabase
            .from("alergias")
            .select("paciente_id, agente, gravidade")
            .in("paciente_id", ids)
            .in("gravidade", ["grave", "anafilatica"]),
          supabase
            .from("condicoes")
            .select("paciente_id, nome, tipo, status")
            .in("paciente_id", ids)
            .eq("tipo", "transmissivel")
            .neq("status", "curada"),
          supabase
            .from("atendimentos")
            .select("paciente_id, data_hora, diagnostico, queixa")
            .in("paciente_id", ids)
            .order("data_hora", { ascending: false }),
        ])
      : [{ data: [] }, { data: [] }, { data: [] }];

  const alergiasPor = agrupar(
    (alergiasBruto ?? []) as Pick<Alergia, "paciente_id" | "agente" | "gravidade">[],
  );
  const condicoesPor = agrupar(
    (condicoesBruto ?? []) as Pick<Condicao, "paciente_id" | "nome" | "tipo" | "status">[],
  );

  const ultimaPassagem = new Map<string, Pick<Atendimento, "data_hora" | "diagnostico" | "queixa">>();
  for (const a of (passagensBruto ?? []) as Atendimento[]) {
    if (!ultimaPassagem.has(a.paciente_id)) ultimaPassagem.set(a.paciente_id, a);
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="rotulo">Histórico da rede</p>
          <h1 className="mt-1.5 text-[28px] leading-tight sm:text-[32px]">
            Pessoas atendidas
          </h1>
        </div>
        <Link href="/pacientes/novo" className="botao botao-carbono">
          Novo cadastro
        </Link>
      </header>

      {/* ------------------------------------------------ busca */}
      <form action="/pacientes" method="get" className="mt-7">
        <label htmlFor="q" className="rotulo mb-1.5 block">
          Buscar
        </label>
        <div className="flex gap-2">
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={q ?? ""}
            className="campo"
            placeholder="Nome, apelido, código da pulseira, tatuagem, cicatriz, local…"
          />
          <button type="submit" className="botao shrink-0">
            Buscar
          </button>
        </div>
        <p className="mt-2 text-[12.5px] leading-relaxed text-tinta-suave">
          A pulseira se perde. A busca também procura por apelido, sinais
          particulares e local de permanência — o que a equipe consegue observar
          sem perguntar nada.
        </p>
      </form>

      {/* ------------------------------------------------ resultados */}
      <div className="mt-7">
        {error ? (
          <p className="border border-critico/35 bg-critico-veu px-4 py-3 text-[14px] text-critico">
            Não foi possível carregar a lista: {error.message}
          </p>
        ) : pacientes.length === 0 ? (
          <div className="border border-dashed border-linha-forte bg-folha-2 px-6 py-12 text-center">
            <p className="text-[15px] font-medium">
              {termo
                ? `Nenhuma pessoa encontrada para “${termo}”.`
                : "Nenhuma pessoa cadastrada ainda."}
            </p>
            <p className="mx-auto mt-2 max-w-sm text-[13.5px] leading-relaxed text-tinta-media">
              {termo
                ? "Tente por apelido ou por um sinal particular — tatuagem, cicatriz, o lugar onde costuma ficar."
                : "O primeiro cadastro gera a primeira pulseira."}
            </p>
            <Link href="/pacientes/novo" className="botao botao-carbono mt-5">
              Cadastrar pessoa
            </Link>
          </div>
        ) : (
          <>
            <p className="rotulo mb-3">
              {pacientes.length}{" "}
              {pacientes.length === 1 ? "pessoa" : "pessoas"}
              {termo ? ` para “${termo}”` : ""}
            </p>

            <ul className="flex flex-col gap-2.5">
              {pacientes.map((p) => {
                const alergias = alergiasPor.get(p.id) ?? [];
                const transmissiveis = condicoesPor.get(p.id) ?? [];
                const ultima = ultimaPassagem.get(p.id);

                return (
                  <li key={p.id}>
                    <Link
                      href={`/pacientes/${p.id}`}
                      className="folha group flex items-start gap-4 p-4 transition-shadow hover:shadow-[5px_5px_0_rgba(26,26,36,0.09)]"
                    >
                      <Foto nome={p.nome} url={p.foto_url} tamanho={56} />

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
                          <h2 className="text-[17px] leading-tight group-hover:text-carbono">
                            {nomeExibicao(p)}
                          </h2>
                          {p.apelido && (
                            <span className="text-[13.5px] text-tinta-suave">
                              “{p.apelido}”
                            </span>
                          )}
                        </div>

                        <p className="dado mt-1 text-[12px] text-tinta-suave">
                          {p.codigo} · {idadeTexto(p)}
                          {p.sexo ? ` · ${rotuloSexo[p.sexo]}` : ""}
                        </p>

                        {(alergias.length > 0 || transmissiveis.length > 0) && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {alergias.map((a) => (
                              <span
                                key={a.agente}
                                className="carimbo text-critico"
                              >
                                Alergia {a.agente}
                              </span>
                            ))}
                            {transmissiveis.map((c) => (
                              <span key={c.nome} className="carimbo text-critico">
                                {c.nome}
                              </span>
                            ))}
                          </div>
                        )}

                        {ultima && (
                          <p className="mt-2 truncate text-[13px] text-tinta-media">
                            <span className="text-tinta-suave">
                              Última passagem {tempoRelativo(ultima.data_hora)}:
                            </span>{" "}
                            {ultima.diagnostico ?? ultima.queixa ?? "—"}
                          </p>
                        )}
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </div>
    </main>
  );
}

function agrupar<T extends { paciente_id: string }>(itens: T[]) {
  const mapa = new Map<string, T[]>();
  for (const item of itens) {
    const lista = mapa.get(item.paciente_id);
    if (lista) lista.push(item);
    else mapa.set(item.paciente_id, [item]);
  }
  return mapa;
}
