import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { carregarProntuario, registrarAcesso } from "@/lib/prontuario";
import { montarAlertas } from "@/lib/alertas";
import { removerItem } from "@/app/acoes/pacientes";
import { FaixaAlertas } from "@/components/FaixaAlertas";
import { Foto } from "@/components/Foto";
import { AdicionarItem, type CampoDescricao } from "@/components/AdicionarItem";
import {
  corRisco,
  formatarData,
  formatarDataHora,
  idadeTexto,
  imc,
  nomeExibicao,
  rotuloDesfecho,
  rotuloGravidade,
  rotuloRisco,
  rotuloSexo,
  rotuloTipoAtendimento,
  rotuloTipoCondicao,
  sinaisVitais,
  tempoRelativo,
} from "@/lib/formato";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ via?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const prontuario = await carregarProntuario(id);
  return {
    title: prontuario ? nomeExibicao(prontuario.paciente) : "Prontuário",
  };
}

export default async function PaginaProntuario({ params, searchParams }: Props) {
  const { id } = await params;
  const { via } = await searchParams;
  const prontuario = await carregarProntuario(id);
  if (!prontuario) notFound();

  const {
    paciente,
    hospital,
    alergias,
    condicoes,
    medicamentos,
    cirurgias,
    vacinas,
    atendimentos,
  } = prontuario;

  const alertas = montarAlertas(prontuario);
  await registrarAcesso(paciente.id, via === "qrcode" ? "qrcode" : "busca");

  const massaCorporal = imc(paciente);

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <Link
        href="/pacientes"
        className="sem-impressao text-[13.5px] text-tinta-suave hover:text-tinta"
      >
        ← Pessoas atendidas
      </Link>

      {/* ------------------------------------------------ capa */}
      <header className="folha mt-4 p-5 sm:p-6">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <Foto nome={paciente.nome} url={paciente.foto_url} tamanho={112} />

          <div className="min-w-0 flex-1">
            <p className="dado text-[12px] text-tinta-suave">
              {paciente.codigo}
            </p>
            <h1 className="mt-1 text-[28px] leading-tight sm:text-[32px]">
              {nomeExibicao(paciente)}
            </h1>

            {(paciente.apelido || paciente.nome_social) && (
              <p className="mt-1 text-[14.5px] text-tinta-media">
                {paciente.nome_social && paciente.nome_social !== paciente.nome && (
                  <>Nome de registro: {paciente.nome}. </>
                )}
                {paciente.apelido && <>Conhecida na rua como “{paciente.apelido}”.</>}
              </p>
            )}

            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
              <Dado rotulo="Idade" valor={idadeTexto(paciente)} />
              <Dado
                rotulo="Sexo"
                valor={paciente.sexo ? rotuloSexo[paciente.sexo] : "—"}
              />
              <Dado
                rotulo="Tipo sanguíneo"
                valor={
                  paciente.tipo_sanguineo === "desconhecido"
                    ? "Desconhecido"
                    : (paciente.tipo_sanguineo ?? "—")
                }
                destaque={
                  Boolean(paciente.tipo_sanguineo) &&
                  paciente.tipo_sanguineo !== "desconhecido"
                }
              />
              <Dado
                rotulo="Altura e peso"
                valor={
                  paciente.altura_cm || paciente.peso_kg
                    ? [
                        paciente.altura_cm ? `${paciente.altura_cm} cm` : null,
                        paciente.peso_kg
                          ? `${String(paciente.peso_kg).replace(".", ",")} kg`
                          : null,
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    : "—"
                }
                nota={massaCorporal ? `IMC ${String(massaCorporal).replace(".", ",")}` : undefined}
              />
            </dl>
          </div>
        </div>

        <div className="sem-impressao mt-5 flex flex-wrap gap-2.5 border-t border-linha pt-5">
          <Link
            href={`/pacientes/${paciente.id}/atendimento`}
            className="botao botao-carbono"
          >
            Registrar atendimento
          </Link>
          <Link
            href={`/pacientes/${paciente.id}/pulseira`}
            className="botao botao-vazado"
          >
            Pulseira e QR Code
          </Link>
          <Link
            href={`/pacientes/${paciente.id}/editar`}
            className="botao botao-vazado"
          >
            Editar cadastro
          </Link>
        </div>
      </header>

      {/* ------------------------------------------------ alertas */}
      <section className="mt-6">
        <h2 className="rotulo mb-2.5">Antes de qualquer conduta</h2>
        <FaixaAlertas alertas={alertas} />
        <AdicionarItem
          tabela="alertas"
          pacienteId={paciente.id}
          rotuloBotao="Fixar um alerta para a próxima equipe"
          campos={CAMPOS_ALERTA}
        />
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1.05fr] lg:items-start">
        {/* -------------------------------------------- coluna clínica */}
        <div className="flex flex-col gap-6">
          <Bloco titulo="Alergias" total={alergias.length}>
            {alergias.length === 0 ? (
              <Nada texto="Nenhuma alergia registrada. Pergunte e registre — mesmo a resposta “não sei”." />
            ) : (
              <ul className="flex flex-col">
                {alergias.map((a) => (
                  <ItemLista
                    key={a.id}
                    tabela="alergias"
                    id={a.id}
                    pacienteId={paciente.id}
                    titulo={a.agente}
                    carimbo={rotuloGravidade[a.gravidade]}
                    critico={a.gravidade === "grave" || a.gravidade === "anafilatica"}
                    detalhe={a.reacao}
                  />
                ))}
              </ul>
            )}
            <AdicionarItem
              tabela="alergias"
              pacienteId={paciente.id}
              rotuloBotao="Registrar alergia"
              campos={CAMPOS_ALERGIA}
            />
          </Bloco>

          <Bloco titulo="Doenças e condições" total={condicoes.length}>
            {condicoes.length === 0 ? (
              <Nada texto="Nenhuma condição registrada." />
            ) : (
              <ul className="flex flex-col">
                {condicoes.map((c) => (
                  <ItemLista
                    key={c.id}
                    tabela="condicoes"
                    id={c.id}
                    pacienteId={paciente.id}
                    titulo={c.nome}
                    carimbo={rotuloTipoCondicao[c.tipo]}
                    critico={c.tipo === "transmissivel" && c.status === "ativa"}
                    detalhe={[
                      c.cid10 ? `CID ${c.cid10}` : null,
                      c.status === "ativa"
                        ? "Ativa"
                        : c.status === "controlada"
                          ? "Controlada"
                          : "Curada",
                      c.desde ? `desde ${formatarData(c.desde)}` : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    observacao={c.observacao}
                  />
                ))}
              </ul>
            )}
            <AdicionarItem
              tabela="condicoes"
              pacienteId={paciente.id}
              rotuloBotao="Registrar condição"
              campos={CAMPOS_CONDICAO}
            />
          </Bloco>

          <Bloco
            titulo="Medicamentos"
            total={medicamentos.filter((m) => m.em_uso).length}
            nota="em uso"
          >
            {medicamentos.length === 0 ? (
              <Nada texto="Nenhum medicamento registrado." />
            ) : (
              <ul className="flex flex-col">
                {medicamentos.map((m) => (
                  <ItemLista
                    key={m.id}
                    tabela="medicamentos"
                    id={m.id}
                    pacienteId={paciente.id}
                    titulo={[m.nome, m.dosagem].filter(Boolean).join(" ")}
                    carimbo={m.em_uso ? "Em uso" : "Suspenso"}
                    detalhe={[m.frequencia, m.via].filter(Boolean).join(" · ")}
                    observacao={m.observacao}
                  />
                ))}
              </ul>
            )}
            <AdicionarItem
              tabela="medicamentos"
              pacienteId={paciente.id}
              rotuloBotao="Registrar medicamento"
              campos={CAMPOS_MEDICAMENTO}
            />
          </Bloco>

          <Bloco titulo="Cirurgias e procedimentos" total={cirurgias.length}>
            {cirurgias.length === 0 ? (
              <Nada texto="Nenhuma cirurgia registrada." />
            ) : (
              <ul className="flex flex-col">
                {cirurgias.map((c) => (
                  <ItemLista
                    key={c.id}
                    tabela="cirurgias"
                    id={c.id}
                    pacienteId={paciente.id}
                    titulo={c.procedimento}
                    carimbo={c.data ? formatarData(c.data) : undefined}
                    detalhe={c.local}
                    observacao={
                      c.complicacoes ? `Complicações: ${c.complicacoes}` : null
                    }
                  />
                ))}
              </ul>
            )}
            <AdicionarItem
              tabela="cirurgias"
              pacienteId={paciente.id}
              rotuloBotao="Registrar cirurgia"
              campos={CAMPOS_CIRURGIA}
            />
          </Bloco>

          <Bloco titulo="Vacinas" total={vacinas.length}>
            {vacinas.length === 0 ? (
              <Nada texto="Nenhuma vacina registrada." />
            ) : (
              <ul className="flex flex-col">
                {vacinas.map((v) => (
                  <ItemLista
                    key={v.id}
                    tabela="vacinas"
                    id={v.id}
                    pacienteId={paciente.id}
                    titulo={v.vacina}
                    carimbo={v.dose ?? undefined}
                    detalhe={v.data ? formatarData(v.data) : null}
                  />
                ))}
              </ul>
            )}
            <AdicionarItem
              tabela="vacinas"
              pacienteId={paciente.id}
              rotuloBotao="Registrar vacina"
              campos={CAMPOS_VACINA}
            />
          </Bloco>
        </div>

        {/* -------------------------------------------- coluna do histórico */}
        <div className="flex flex-col gap-6">
          <Bloco titulo="Linha do tempo" total={atendimentos.length} nota="atendimentos">
            {atendimentos.length === 0 ? (
              <Nada texto="Primeira passagem pela rede. Registre o atendimento ao final." />
            ) : (
              <ol className="mt-1 flex flex-col">
                {atendimentos.map((a) => {
                  const vitais = sinaisVitais(a);
                  return (
                    <li
                      key={a.id}
                      className="border-l border-linha-forte pb-5 pl-4 last:pb-0"
                    >
                      <div className="-ml-[21px] mb-2 flex items-center gap-2.5">
                        <span
                          className="h-2.5 w-2.5 shrink-0 rounded-full border-2 border-folha"
                          style={{
                            backgroundColor: a.classificacao_risco
                              ? corRisco[a.classificacao_risco]
                              : "var(--color-linha-forte)",
                          }}
                        />
                        <span className="dado text-[12px] text-tinta-suave">
                          {formatarDataHora(a.data_hora)} ·{" "}
                          {tempoRelativo(a.data_hora)}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <span className="carimbo text-tinta-media">
                          {rotuloTipoAtendimento[a.tipo]}
                        </span>
                        {a.classificacao_risco && (
                          <span
                            className="carimbo"
                            style={{ color: corRisco[a.classificacao_risco] }}
                          >
                            {rotuloRisco[a.classificacao_risco]}
                          </span>
                        )}
                        {a.sob_efeito_alcool && (
                          <span className="carimbo text-atencao">Álcool</span>
                        )}
                        {a.sob_efeito_substancias && (
                          <span className="carimbo text-atencao">
                            {a.substancias ?? "Substâncias"}
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-[15px] leading-snug font-medium">
                        {a.diagnostico ?? a.queixa ?? "Sem diagnóstico registrado"}
                      </p>

                      {a.diagnostico && a.queixa && (
                        <p className="mt-1 text-[13.5px] leading-relaxed text-tinta-media">
                          Queixa: {a.queixa}
                        </p>
                      )}

                      {vitais.length > 0 && (
                        <p className="dado mt-2 text-[12px] text-tinta-media">
                          {vitais.join("   ")}
                        </p>
                      )}

                      {a.conduta && (
                        <p className="mt-2 text-[13.5px] leading-relaxed text-tinta-media">
                          {a.conduta}
                        </p>
                      )}

                      <p className="mt-2 text-[12.5px] text-tinta-suave">
                        {[
                          a.hospitais?.nome,
                          a.profissionais?.nome,
                          a.desfecho ? rotuloDesfecho[a.desfecho] : null,
                          a.encaminhamento ? `→ ${a.encaminhamento}` : null,
                        ]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </li>
                  );
                })}
              </ol>
            )}
          </Bloco>

          {/* ------------------------------------------ contexto */}
          <Bloco titulo="Reconhecimento e contexto">
            <dl className="flex flex-col">
              <Detalhe
                rotulo="Sinais particulares"
                valor={paciente.sinais_particulares}
              />
              <Detalhe
                rotulo="Onde costuma ser encontrada"
                valor={paciente.local_permanencia}
              />
              <Detalhe
                rotulo="Quem avisar"
                valor={
                  paciente.contato_nome
                    ? [
                        paciente.contato_nome,
                        paciente.contato_vinculo,
                        paciente.contato_telefone,
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    : null
                }
              />
              <Detalhe rotulo="Observações da equipe" valor={paciente.observacoes} />
              <Detalhe
                rotulo="Documentos"
                valor={
                  [
                    paciente.cns ? `CNS ${paciente.cns}` : null,
                    paciente.cpf ? `CPF ${paciente.cpf}` : null,
                    paciente.rg ? `RG ${paciente.rg}` : null,
                    paciente.nome_mae ? `Mãe: ${paciente.nome_mae}` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ") || (paciente.sem_documento ? "Sem documentos" : null)
                }
              />
            </dl>

            <p className="mt-4 border-t border-linha pt-3 text-[12.5px] leading-relaxed text-tinta-suave">
              Cadastrada em {formatarData(paciente.criado_em)}
              {hospital ? ` no ${hospital.nome}` : ""}. Última atualização{" "}
              {tempoRelativo(paciente.atualizado_em)}.
            </p>
          </Bloco>
        </div>
      </div>
    </main>
  );
}

// ---------------------------------------------------------------- peças

function Dado({
  rotulo,
  valor,
  nota,
  destaque = false,
}: {
  rotulo: string;
  valor: string;
  nota?: string;
  destaque?: boolean;
}) {
  return (
    <div>
      <dt className="rotulo">{rotulo}</dt>
      <dd
        className={`dado mt-1 text-[14.5px] ${destaque ? "font-semibold" : ""}`}
      >
        {valor}
      </dd>
      {nota && <dd className="dado text-[12px] text-tinta-suave">{nota}</dd>}
    </div>
  );
}

function Bloco({
  titulo,
  total,
  nota,
  children,
}: {
  titulo: string;
  total?: number;
  nota?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="folha p-5">
      <div className="mb-3 flex items-baseline gap-2.5">
        <h2 className="text-[19px]">{titulo}</h2>
        {total !== undefined && (
          <span className="dado text-[12.5px] text-tinta-suave">
            {total}
            {nota ? ` ${nota}` : ""}
          </span>
        )}
      </div>
      {children}
    </section>
  );
}

function Nada({ texto }: { texto: string }) {
  return (
    <p className="text-[13.5px] leading-relaxed text-tinta-suave">{texto}</p>
  );
}

function Detalhe({
  rotulo,
  valor,
}: {
  rotulo: string;
  valor: string | null | undefined;
}) {
  return (
    <div className="pauta py-2.5">
      <dt className="rotulo">{rotulo}</dt>
      <dd
        className={`mt-1 text-[14px] leading-relaxed ${
          valor ? "text-tinta-media" : "text-tinta-suave"
        }`}
      >
        {valor || "Não registrado"}
      </dd>
    </div>
  );
}

function ItemLista({
  tabela,
  id,
  pacienteId,
  titulo,
  carimbo,
  detalhe,
  observacao,
  critico = false,
}: {
  tabela: string;
  id: string;
  pacienteId: string;
  titulo: string;
  carimbo?: string;
  detalhe?: string | null;
  observacao?: string | null;
  critico?: boolean;
}) {
  return (
    <li className="pauta group flex items-start gap-3 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <p
            className={`text-[14.5px] leading-snug font-medium ${
              critico ? "text-critico" : ""
            }`}
          >
            {titulo}
          </p>
          {carimbo && (
            <span
              className={`carimbo ${critico ? "text-critico" : "text-tinta-suave"}`}
            >
              {carimbo}
            </span>
          )}
        </div>
        {detalhe && (
          <p className="mt-0.5 text-[13px] text-tinta-media">{detalhe}</p>
        )}
        {observacao && (
          <p className="mt-0.5 text-[13px] leading-relaxed text-tinta-suave">
            {observacao}
          </p>
        )}
      </div>

      <form action={removerItem} className="sem-impressao shrink-0">
        <input type="hidden" name="tabela" value={tabela} />
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="paciente_id" value={pacienteId} />
        <button
          type="submit"
          title="Remover do prontuário"
          className="px-1 text-[16px] leading-none text-tinta-suave opacity-0 transition-opacity group-hover:opacity-100 hover:text-critico focus-visible:opacity-100"
        >
          ×
        </button>
      </form>
    </li>
  );
}

// ---------------------------------------------------------------- campos

const CAMPOS_ALERTA: CampoDescricao[] = [
  {
    nome: "titulo",
    rotulo: "O que a próxima equipe precisa saber",
    tipo: "texto",
    obrigatorio: true,
    placeholder: "Fica agitado se separado dos pertences",
  },
  {
    nome: "severidade",
    rotulo: "Severidade",
    tipo: "select",
    largura: "meia",
    padrao: "atencao",
    opcoes: [
      ["critico", "Crítico"],
      ["atencao", "Atenção"],
      ["info", "Informativo"],
    ],
  },
  { nome: "descricao", rotulo: "Como agir", tipo: "textarea" },
];

const CAMPOS_ALERGIA: CampoDescricao[] = [
  {
    nome: "agente",
    rotulo: "Agente",
    tipo: "texto",
    obrigatorio: true,
    largura: "meia",
    placeholder: "Dipirona",
  },
  {
    nome: "tipo",
    rotulo: "Tipo",
    tipo: "select",
    largura: "meia",
    padrao: "medicamento",
    opcoes: [
      ["medicamento", "Medicamento"],
      ["alimento", "Alimento"],
      ["ambiental", "Ambiental"],
      ["outro", "Outro"],
    ],
  },
  {
    nome: "gravidade",
    rotulo: "Gravidade",
    tipo: "select",
    largura: "meia",
    padrao: "moderada",
    opcoes: [
      ["leve", "Leve"],
      ["moderada", "Moderada"],
      ["grave", "Grave"],
      ["anafilatica", "Anafilática"],
    ],
  },
  { nome: "reacao", rotulo: "Reação observada", tipo: "texto", largura: "meia" },
];

const CAMPOS_CONDICAO: CampoDescricao[] = [
  {
    nome: "nome",
    rotulo: "Condição",
    tipo: "texto",
    obrigatorio: true,
    largura: "meia",
    placeholder: "Hipertensão arterial",
  },
  { nome: "cid10", rotulo: "CID-10", tipo: "texto", largura: "meia", placeholder: "I10" },
  {
    nome: "tipo",
    rotulo: "Tipo",
    tipo: "select",
    largura: "meia",
    padrao: "cronica",
    opcoes: [
      ["cronica", "Crônica"],
      ["aguda", "Aguda"],
      ["transmissivel", "Transmissível"],
      ["saude_mental", "Saúde mental"],
      ["dependencia_quimica", "Dependência química"],
    ],
  },
  {
    nome: "status",
    rotulo: "Situação",
    tipo: "select",
    largura: "meia",
    padrao: "ativa",
    opcoes: [
      ["ativa", "Ativa"],
      ["controlada", "Controlada"],
      ["curada", "Curada"],
    ],
  },
  { nome: "desde", rotulo: "Desde", tipo: "data", largura: "meia" },
  { nome: "observacao", rotulo: "Observação", tipo: "textarea" },
];

const CAMPOS_MEDICAMENTO: CampoDescricao[] = [
  {
    nome: "nome",
    rotulo: "Medicamento",
    tipo: "texto",
    obrigatorio: true,
    largura: "meia",
    placeholder: "Losartana",
  },
  { nome: "dosagem", rotulo: "Dosagem", tipo: "texto", largura: "meia", placeholder: "50 mg" },
  { nome: "frequencia", rotulo: "Frequência", tipo: "texto", largura: "meia", placeholder: "12/12h" },
  { nome: "via", rotulo: "Via", tipo: "texto", largura: "meia", placeholder: "Oral" },
  { nome: "inicio", rotulo: "Início", tipo: "data", largura: "meia" },
  { nome: "em_uso", rotulo: "Em uso agora", tipo: "check", largura: "meia", marcado: true },
];

const CAMPOS_CIRURGIA: CampoDescricao[] = [
  {
    nome: "procedimento",
    rotulo: "Procedimento",
    tipo: "texto",
    obrigatorio: true,
    placeholder: "Osteossíntese de fêmur esquerdo",
  },
  { nome: "data", rotulo: "Data", tipo: "data", largura: "meia" },
  { nome: "local", rotulo: "Onde foi feita", tipo: "texto", largura: "meia" },
  { nome: "complicacoes", rotulo: "Complicações", tipo: "texto" },
];

const CAMPOS_VACINA: CampoDescricao[] = [
  {
    nome: "vacina",
    rotulo: "Vacina",
    tipo: "texto",
    obrigatorio: true,
    largura: "meia",
    placeholder: "Antitetânica (dT)",
  },
  { nome: "dose", rotulo: "Dose", tipo: "texto", largura: "meia", placeholder: "Reforço" },
  { nome: "data", rotulo: "Data", tipo: "data", largura: "meia" },
];
