"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { criarClienteServidor, profissionalAtual } from "@/lib/supabase/servidor";
import { gerarCodigo } from "@/lib/codigo";

export type Resultado = { erro: string | null };

// --------------------------------------------------------------------
// Leitura de formulário
// --------------------------------------------------------------------

function texto(dados: FormData, campo: string): string | null {
  const valor = dados.get(campo);
  if (typeof valor !== "string") return null;
  const limpo = valor.trim();
  return limpo === "" ? null : limpo;
}

function numero(dados: FormData, campo: string): number | null {
  const bruto = texto(dados, campo);
  if (bruto === null) return null;
  const n = Number(bruto.replace(",", "."));
  return Number.isFinite(n) ? n : null;
}

function inteiro(dados: FormData, campo: string): number | null {
  const n = numero(dados, campo);
  return n === null ? null : Math.round(n);
}

function booleano(dados: FormData, campo: string): boolean {
  const valor = dados.get(campo);
  return valor === "on" || valor === "true" || valor === "1";
}

/** `<select>` vazio precisa virar null, não string vazia, por causa dos CHECKs. */
function opcao(dados: FormData, campo: string): string | null {
  return texto(dados, campo);
}

// --------------------------------------------------------------------
// Cadastro
// --------------------------------------------------------------------

function camposDoPaciente(dados: FormData) {
  return {
    nome: texto(dados, "nome") ?? "",
    nome_social: texto(dados, "nome_social"),
    apelido: texto(dados, "apelido"),
    sem_documento: booleano(dados, "sem_documento"),
    cpf: texto(dados, "cpf"),
    cns: texto(dados, "cns"),
    rg: texto(dados, "rg"),
    nome_mae: texto(dados, "nome_mae"),
    data_nascimento: texto(dados, "data_nascimento"),
    idade_estimada: inteiro(dados, "idade_estimada"),
    sexo: opcao(dados, "sexo"),
    altura_cm: inteiro(dados, "altura_cm"),
    peso_kg: numero(dados, "peso_kg"),
    tipo_sanguineo: opcao(dados, "tipo_sanguineo"),
    foto_url: texto(dados, "foto_url"),
    sinais_particulares: texto(dados, "sinais_particulares"),
    local_permanencia: texto(dados, "local_permanencia"),
    contato_nome: texto(dados, "contato_nome"),
    contato_telefone: texto(dados, "contato_telefone"),
    contato_vinculo: texto(dados, "contato_vinculo"),
    observacoes: texto(dados, "observacoes"),
    consentimento: booleano(dados, "consentimento"),
  };
}

export async function criarPaciente(
  _anterior: Resultado,
  dados: FormData,
): Promise<Resultado> {
  const campos = camposDoPaciente(dados);
  if (!campos.nome) {
    return { erro: "Informe ao menos um nome — pode ser o apelido pelo qual a pessoa é conhecida." };
  }
  if (!campos.data_nascimento && campos.idade_estimada === null) {
    return { erro: "Informe a data de nascimento ou uma idade estimada." };
  }

  const supabase = await criarClienteServidor();
  const profissional = await profissionalAtual();
  if (!profissional) redirect("/entrar");

  let id: string | null = null;
  let ultimoErro = "";

  // O código é aleatório; em caso de colisão, tenta de novo.
  for (let tentativa = 0; tentativa < 4 && !id; tentativa++) {
    const { data, error } = await supabase
      .from("pacientes")
      .insert({
        ...campos,
        codigo: gerarCodigo(),
        hospital_cadastro_id: profissional.hospital_id,
        cadastrado_por: profissional.id,
      })
      .select("id")
      .single();

    if (data) id = data.id;
    else if (error) {
      ultimoErro = error.message;
      if (!error.message.includes("duplicate key")) break;
    }
  }

  if (!id) {
    return { erro: `Não foi possível salvar o cadastro: ${ultimoErro}` };
  }

  revalidatePath("/pacientes");
  revalidatePath("/painel");
  redirect(`/pacientes/${id}/pulseira?novo=1`);
}

export async function atualizarPaciente(
  _anterior: Resultado,
  dados: FormData,
): Promise<Resultado> {
  const id = texto(dados, "id");
  if (!id) return { erro: "Cadastro não identificado." };

  const campos = camposDoPaciente(dados);
  if (!campos.nome) return { erro: "O nome não pode ficar em branco." };

  const supabase = await criarClienteServidor();
  const { error } = await supabase.from("pacientes").update(campos).eq("id", id);

  if (error) return { erro: `Não foi possível salvar: ${error.message}` };

  revalidatePath(`/pacientes/${id}`);
  revalidatePath("/pacientes");
  redirect(`/pacientes/${id}`);
}

// --------------------------------------------------------------------
// Atendimento
// --------------------------------------------------------------------

export async function registrarAtendimento(
  _anterior: Resultado,
  dados: FormData,
): Promise<Resultado> {
  const pacienteId = texto(dados, "paciente_id");
  if (!pacienteId) return { erro: "Paciente não identificado." };

  const supabase = await criarClienteServidor();
  const profissional = await profissionalAtual();
  if (!profissional) redirect("/entrar");

  const { error } = await supabase.from("atendimentos").insert({
    paciente_id: pacienteId,
    hospital_id: profissional.hospital_id,
    profissional_id: profissional.id,
    tipo: opcao(dados, "tipo") ?? "emergencia",
    classificacao_risco: opcao(dados, "classificacao_risco"),
    queixa: texto(dados, "queixa"),
    pressao_sistolica: inteiro(dados, "pressao_sistolica"),
    pressao_diastolica: inteiro(dados, "pressao_diastolica"),
    frequencia_cardiaca: inteiro(dados, "frequencia_cardiaca"),
    frequencia_respiratoria: inteiro(dados, "frequencia_respiratoria"),
    temperatura: numero(dados, "temperatura"),
    saturacao: inteiro(dados, "saturacao"),
    glicemia: inteiro(dados, "glicemia"),
    sob_efeito_alcool: booleano(dados, "sob_efeito_alcool"),
    sob_efeito_substancias: booleano(dados, "sob_efeito_substancias"),
    substancias: texto(dados, "substancias"),
    diagnostico: texto(dados, "diagnostico"),
    cid10: texto(dados, "cid10"),
    conduta: texto(dados, "conduta"),
    desfecho: opcao(dados, "desfecho"),
    encaminhamento: texto(dados, "encaminhamento"),
    observacoes: texto(dados, "observacoes"),
  });

  if (error) return { erro: `Não foi possível registrar: ${error.message}` };

  revalidatePath(`/pacientes/${pacienteId}`);
  revalidatePath("/painel");
  redirect(`/pacientes/${pacienteId}`);
}

// --------------------------------------------------------------------
// Itens do prontuário
// --------------------------------------------------------------------

const TABELAS = [
  "condicoes",
  "alergias",
  "medicamentos",
  "cirurgias",
  "vacinas",
  "alertas",
] as const;

type Tabela = (typeof TABELAS)[number];

function camposDoItem(tabela: Tabela, dados: FormData) {
  switch (tabela) {
    case "condicoes":
      return {
        nome: texto(dados, "nome"),
        cid10: texto(dados, "cid10"),
        tipo: opcao(dados, "tipo") ?? "cronica",
        status: opcao(dados, "status") ?? "ativa",
        desde: texto(dados, "desde"),
        observacao: texto(dados, "observacao"),
      };
    case "alergias":
      return {
        agente: texto(dados, "agente"),
        tipo: opcao(dados, "tipo") ?? "medicamento",
        gravidade: opcao(dados, "gravidade") ?? "moderada",
        reacao: texto(dados, "reacao"),
      };
    case "medicamentos":
      return {
        nome: texto(dados, "nome"),
        dosagem: texto(dados, "dosagem"),
        frequencia: texto(dados, "frequencia"),
        via: texto(dados, "via"),
        em_uso: booleano(dados, "em_uso"),
        inicio: texto(dados, "inicio"),
        observacao: texto(dados, "observacao"),
      };
    case "cirurgias":
      return {
        procedimento: texto(dados, "procedimento"),
        data: texto(dados, "data"),
        local: texto(dados, "local"),
        complicacoes: texto(dados, "complicacoes"),
      };
    case "vacinas":
      return {
        vacina: texto(dados, "vacina"),
        dose: texto(dados, "dose"),
        data: texto(dados, "data"),
      };
    case "alertas":
      return {
        titulo: texto(dados, "titulo"),
        descricao: texto(dados, "descricao"),
        severidade: opcao(dados, "severidade") ?? "atencao",
      };
  }
}

/** Campo cuja ausência invalida o item. */
const OBRIGATORIO: Record<Tabela, string> = {
  condicoes: "nome",
  alergias: "agente",
  medicamentos: "nome",
  cirurgias: "procedimento",
  vacinas: "vacina",
  alertas: "titulo",
};

export async function adicionarItem(
  _anterior: Resultado,
  dados: FormData,
): Promise<Resultado> {
  const tabela = String(dados.get("tabela") ?? "") as Tabela;
  const pacienteId = texto(dados, "paciente_id");

  if (!TABELAS.includes(tabela)) return { erro: "Seção desconhecida." };
  if (!pacienteId) return { erro: "Paciente não identificado." };

  const campos = camposDoItem(tabela, dados) as Record<string, unknown>;
  if (!campos[OBRIGATORIO[tabela]]) {
    return { erro: "Preencha o campo obrigatório antes de adicionar." };
  }

  const supabase = await criarClienteServidor();
  const extra: Record<string, unknown> = {};

  if (tabela === "alertas") {
    const profissional = await profissionalAtual();
    extra.criado_por = profissional?.id ?? null;
  }

  const { error } = await supabase
    .from(tabela)
    .insert({ ...campos, ...extra, paciente_id: pacienteId });

  if (error) return { erro: `Não foi possível adicionar: ${error.message}` };

  revalidatePath(`/pacientes/${pacienteId}`);
  return { erro: null };
}

export async function removerItem(dados: FormData): Promise<void> {
  const tabela = String(dados.get("tabela") ?? "") as Tabela;
  const id = texto(dados, "id");
  const pacienteId = texto(dados, "paciente_id");

  if (!TABELAS.includes(tabela) || !id || !pacienteId) return;

  const supabase = await criarClienteServidor();
  await supabase.from(tabela).delete().eq("id", id);

  revalidatePath(`/pacientes/${pacienteId}`);
}

// A trilha de acesso (LGPD) mora em lib/prontuario.ts: é chamada só durante
// a renderização, e como Server Action viraria um endpoint público.
