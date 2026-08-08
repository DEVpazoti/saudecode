import Link from "next/link";
import type { Metadata } from "next";
import { criarClienteServidor, profissionalAtual } from "@/lib/supabase/servidor";
import { Foto } from "@/components/Foto";
import {
  corRisco,
  formatarDataHora,
  nomeExibicao,
  rotuloDesfecho,
  rotuloRisco,
  rotuloTipoAtendimento,
  tempoRelativo,
} from "@/lib/formato";
import type { Atendimento, ClassificacaoRisco, Paciente } from "@/lib/tipos";
import { agora as lerAgora, DIA_MS as DIA, desdeDias, ehHoje } from "@/lib/tempo";

export const metadata: Metadata = { title: "Painel" };
export const dynamic = "force-dynamic";

export default async function PaginaPainel() {
  const supabase = await criarClienteServidor();
  const profissional = await profissionalAtual();

  const desde180 = desdeDias(180);

  const [{ data: pacientesBruto }, { data: atendimentosBruto }] =
    await Promise.all([
      supabase
        .from("pacientes")
        .select(
          "id, codigo, nome, nome_social, apelido, foto_url, criado_em, ativo",
        )
        .eq("ativo", true)
        .order("criado_em", { ascending: false })
        .limit(500),
      supabase
        .from("atendimentos")
        .select("*, hospitais(nome)")
        .gte("data_hora", desde180)
        .order("data_hora", { ascending: false })
        .limit(500),
    ]);

  const pacientes = (pacientesBruto ?? []) as Paciente[];
  const atendimentos = (atendimentosBruto ?? []) as Atendimento[];

  const porId = new Map(pacientes.map((p) => [p.id, p]));

  const agora = lerAgora();
  const em = (a: Atendimento, dias: number) =>
    agora - new Date(a.data_hora).getTime() <= dias * DIA;

  const ultimos30 = atendimentos.filter((a) => em(a, 30));
  const hoje = atendimentos.filter((a) => ehHoje(a.data_hora, agora));
  const cadastros30 = pacientes.filter(
    (p) => agora - new Date(p.criado_em).getTime() <= 30 * DIA,
  );

  // Retornos frequentes: quem voltou três vezes ou mais em seis meses.
  const contagem = new Map<string, number>();
  for (const a of atendimentos) {
    contagem.set(a.paciente_id, (contagem.get(a.paciente_id) ?? 0) + 1);
  }
  const frequentes = [...contagem.entries()]
    .filter(([, n]) => n >= 3)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([id, n]) => ({ paciente: porId.get(id), total: n }))
    .filter((x): x is { paciente: Paciente; total: number } => Boolean(x.paciente));

  // Classificação de risco nos últimos 30 dias
  const cores: ClassificacaoRisco[] = [
    "vermelho",
    "laranja",
    "amarelo",
    "verde",
    "azul",
  ];
  const porRisco = cores.map((cor) => ({
    cor,
    total: ultimos30.filter((a) => a.classificacao_risco === cor).length,
  }));
  const maiorRisco = Math.max(1, ...porRisco.map((r) => r.total));

  // Para onde as pessoas foram encaminhadas
  const encaminhamentos = new Map<string, number>();
  for (const a of atendimentos) {
    if (!a.encaminhamento) continue;
    encaminhamentos.set(
      a.encaminhamento,
      (encaminhamentos.get(a.encaminhamento) ?? 0) + 1,
    );
  }
  const topEncaminhamentos = [...encaminhamentos.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  const alcool30 = ultimos30.filter((a) => a.sob_efeito_alcool).length;

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="rotulo">
            {profissional?.hospitais?.nome ?? "Rede SaudeCode"}
          </p>
          <h1 className="mt-1.5 text-[28px] leading-tight sm:text-[32px]">
            Painel da unidade
          </h1>
        </div>
        <div className="flex gap-2.5">
          <Link href="/escanear" className="botao botao-vazado">
            Escanear pulseira
          </Link>
          <Link href="/pacientes/novo" className="botao botao-carbono">
            Novo cadastro
          </Link>
        </div>
      </header>

      {/* ------------------------------------------------ números */}
      <section className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Numero
          valor={pacientes.length}
          rotulo="Pessoas cadastradas"
          nota="na rede toda"
        />
        <Numero
          valor={ultimos30.length}
          rotulo="Atendimentos"
          nota="últimos 30 dias"
        />
        <Numero valor={hoje.length} rotulo="Passagens" nota="hoje" />
        <Numero
          valor={cadastros30.length}
          rotulo="Novos cadastros"
          nota="últimos 30 dias"
        />
      </section>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        {/* -------------------------------------------- últimos atendimentos */}
        <section className="folha p-5">
          <div className="flex items-baseline justify-between">
            <h2 className="text-[19px]">Últimos atendimentos</h2>
            <Link
              href="/pacientes"
              className="text-[13.5px] text-carbono hover:underline"
            >
              Ver todas as pessoas
            </Link>
          </div>

          {atendimentos.length === 0 ? (
            <Vazio texto="Nenhum atendimento registrado nos últimos seis meses." />
          ) : (
            <ul className="mt-3 flex flex-col">
              {atendimentos.slice(0, 8).map((a) => {
                const p = porId.get(a.paciente_id);
                if (!p) return null;
                return (
                  <li key={a.id} className="pauta py-3">
                    <Link
                      href={`/pacientes/${p.id}`}
                      className="flex items-start gap-3 group"
                    >
                      <Foto nome={p.nome} url={p.foto_url} tamanho={38} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <p className="text-[15px] leading-tight font-medium group-hover:text-carbono">
                            {nomeExibicao(p)}
                          </p>
                          {a.classificacao_risco && (
                            <span
                              className="carimbo"
                              style={{ color: corRisco[a.classificacao_risco] }}
                            >
                              {rotuloRisco[a.classificacao_risco]}
                            </span>
                          )}
                        </div>
                        <p className="mt-0.5 truncate text-[13.5px] text-tinta-media">
                          {a.diagnostico ?? a.queixa ?? "Sem diagnóstico registrado"}
                        </p>
                        <p className="dado mt-1 text-[11.5px] text-tinta-suave">
                          {formatarDataHora(a.data_hora)} ·{" "}
                          {rotuloTipoAtendimento[a.tipo]}
                          {a.hospitais?.nome ? ` · ${a.hospitais.nome}` : ""}
                          {a.desfecho ? ` · ${rotuloDesfecho[a.desfecho]}` : ""}
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </section>

        <div className="flex flex-col gap-6">
          {/* ------------------------------------------ retornos frequentes */}
          <section className="folha p-5">
            <h2 className="text-[19px]">Retornam com frequência</h2>
            <p className="mt-1 text-[13px] leading-relaxed text-tinta-suave">
              Três ou mais atendimentos em seis meses. Costuma indicar
              necessidade não resolvida fora do hospital.
            </p>

            {frequentes.length === 0 ? (
              <Vazio texto="Ninguém com retorno frequente no período." />
            ) : (
              <ul className="mt-3 flex flex-col">
                {frequentes.map(({ paciente, total }) => (
                  <li key={paciente.id} className="pauta py-2.5">
                    <Link
                      href={`/pacientes/${paciente.id}`}
                      className="flex items-center gap-3 group"
                    >
                      <Foto
                        nome={paciente.nome}
                        url={paciente.foto_url}
                        tamanho={32}
                      />
                      <span className="min-w-0 flex-1 truncate text-[14.5px] group-hover:text-carbono">
                        {nomeExibicao(paciente)}
                      </span>
                      <span className="dado shrink-0 text-[13px] font-medium text-atencao">
                        {total}×
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          {/* ------------------------------------------ classificação de risco */}
          <section className="folha p-5">
            <h2 className="text-[19px]">Classificação de risco</h2>
            <p className="mt-1 text-[13px] text-tinta-suave">
              Últimos 30 dias · {ultimos30.length} atendimentos
            </p>

            <div className="mt-4 flex flex-col gap-2">
              {porRisco.map(({ cor, total }) => (
                <div key={cor} className="flex items-center gap-3">
                  <span className="w-24 shrink-0 text-[13px] text-tinta-media">
                    {rotuloRisco[cor]}
                  </span>
                  <div className="h-3.5 flex-1 border border-linha bg-folha-2">
                    <div
                      className="h-full"
                      style={{
                        width: `${(total / maiorRisco) * 100}%`,
                        backgroundColor: corRisco[cor],
                      }}
                    />
                  </div>
                  <span className="dado w-6 shrink-0 text-right text-[13px] tabular-nums">
                    {total}
                  </span>
                </div>
              ))}
            </div>

            {alcool30 > 0 && (
              <p className="mt-4 border-t border-linha pt-3 text-[13px] leading-relaxed text-tinta-media">
                <span className="dado font-medium text-atencao">
                  {alcool30}
                </span>{" "}
                {alcool30 === 1 ? "chegada" : "chegadas"} sob efeito de álcool
                nos últimos 30 dias.
              </p>
            )}
          </section>
        </div>
      </div>

      {/* ------------------------------------------------ encaminhamentos */}
      {topEncaminhamentos.length > 0 && (
        <section className="folha mt-6 p-5">
          <h2 className="text-[19px]">Encaminhamentos mais usados</h2>
          <p className="mt-1 text-[13px] text-tinta-suave">
            Para onde a rede tem enviado as pessoas nos últimos seis meses.
          </p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {topEncaminhamentos.map(([nome, total]) => (
              <li
                key={nome}
                className="flex items-center gap-2 border border-linha bg-folha-2 px-3 py-1.5 text-[13.5px]"
              >
                {nome}
                <span className="dado text-[12px] text-tinta-suave">{total}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      {cadastros30.length > 0 && (
        <p className="mt-6 text-[13px] text-tinta-suave">
          Cadastro mais recente: {nomeExibicao(cadastros30[0])} —{" "}
          {tempoRelativo(cadastros30[0].criado_em)}.
        </p>
      )}
    </main>
  );
}

function Numero({
  valor,
  rotulo,
  nota,
}: {
  valor: number;
  rotulo: string;
  nota: string;
}) {
  return (
    <div className="folha px-4 py-3.5">
      <p className="dado text-[30px] leading-none font-medium tabular-nums">
        {valor}
      </p>
      <p className="mt-2 text-[13.5px] leading-tight font-medium">{rotulo}</p>
      <p className="text-[12px] text-tinta-suave">{nota}</p>
    </div>
  );
}

function Vazio({ texto }: { texto: string }) {
  return (
    <p className="mt-4 border border-dashed border-linha-forte bg-folha-2 px-4 py-5 text-center text-[13.5px] text-tinta-suave">
      {texto}
    </p>
  );
}
