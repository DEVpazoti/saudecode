import type {
  Atendimento,
  ClassificacaoRisco,
  Desfecho,
  Paciente,
  TipoAtendimento,
} from "./tipos";

const FUSO = "America/Sao_Paulo";

export function formatarData(valor: string | null | undefined): string {
  if (!valor) return "—";
  const d = valor.length <= 10 ? new Date(`${valor}T12:00:00`) : new Date(valor);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: FUSO,
  }).format(d);
}

export function formatarDataHora(valor: string | null | undefined): string {
  if (!valor) return "—";
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: FUSO,
  }).format(d);
}

export function tempoRelativo(valor: string | null | undefined): string {
  if (!valor) return "—";
  const d = new Date(valor);
  if (Number.isNaN(d.getTime())) return "—";

  const dias = Math.floor((Date.now() - d.getTime()) / 86_400_000);
  if (dias <= 0) return "hoje";
  if (dias === 1) return "ontem";
  if (dias < 30) return `há ${dias} dias`;

  const meses = Math.floor(dias / 30);
  if (meses === 1) return "há 1 mês";
  if (meses < 12) return `há ${meses} meses`;

  const anos = Math.floor(meses / 12);
  return anos === 1 ? "há 1 ano" : `há ${anos} anos`;
}

/** Idade real quando há data de nascimento; estimada quando não há. */
export function idade(paciente: {
  data_nascimento: string | null;
  idade_estimada: number | null;
}): { valor: number | null; estimada: boolean } {
  if (paciente.data_nascimento) {
    const nasc = new Date(`${paciente.data_nascimento}T12:00:00`);
    if (!Number.isNaN(nasc.getTime())) {
      const hoje = new Date();
      let anos = hoje.getFullYear() - nasc.getFullYear();
      const m = hoje.getMonth() - nasc.getMonth();
      if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) anos--;
      return { valor: anos, estimada: false };
    }
  }
  if (paciente.idade_estimada != null) {
    return { valor: paciente.idade_estimada, estimada: true };
  }
  return { valor: null, estimada: false };
}

export function idadeTexto(paciente: {
  data_nascimento: string | null;
  idade_estimada: number | null;
}): string {
  const { valor, estimada } = idade(paciente);
  if (valor == null) return "idade não informada";
  return estimada ? `~${valor} anos (estimada)` : `${valor} anos`;
}

/** O nome que a equipe deve usar ao falar com a pessoa. */
export function nomeExibicao(paciente: Pick<Paciente, "nome" | "nome_social">) {
  return paciente.nome_social?.trim() || paciente.nome;
}

export function iniciais(nome: string): string {
  const partes = nome.trim().split(/\s+/).filter(Boolean);
  if (partes.length === 0) return "?";
  if (partes.length === 1) return partes[0].slice(0, 2).toUpperCase();
  return (partes[0][0] + partes[partes.length - 1][0]).toUpperCase();
}

export function imc(paciente: {
  altura_cm: number | null;
  peso_kg: number | null;
}): number | null {
  if (!paciente.altura_cm || !paciente.peso_kg) return null;
  const m = paciente.altura_cm / 100;
  return Number((paciente.peso_kg / (m * m)).toFixed(1));
}

// --------------------------------------------------------------------
// Rótulos
// --------------------------------------------------------------------

export const rotuloTipoAtendimento: Record<TipoAtendimento, string> = {
  emergencia: "Emergência",
  consulta: "Consulta",
  curativo: "Curativo",
  odontologico: "Odontológico",
  saude_mental: "Saúde mental",
  busca_ativa: "Busca ativa",
};

export const rotuloDesfecho: Record<Desfecho, string> = {
  alta: "Alta",
  internacao: "Internação",
  transferencia: "Transferência",
  evasao: "Evasão",
  encaminhamento: "Encaminhamento",
  obito: "Óbito",
};

export const rotuloRisco: Record<ClassificacaoRisco, string> = {
  vermelho: "Emergência",
  laranja: "Muito urgente",
  amarelo: "Urgente",
  verde: "Pouco urgente",
  azul: "Não urgente",
};

export const corRisco: Record<ClassificacaoRisco, string> = {
  vermelho: "var(--color-risco-vermelho)",
  laranja: "var(--color-risco-laranja)",
  amarelo: "var(--color-risco-amarelo)",
  verde: "var(--color-risco-verde)",
  azul: "var(--color-risco-azul)",
};

export const rotuloSexo: Record<string, string> = {
  feminino: "Feminino",
  masculino: "Masculino",
  outro: "Outro",
  nao_informado: "Não informado",
};

export const rotuloTipoCondicao: Record<string, string> = {
  cronica: "Crônica",
  aguda: "Aguda",
  transmissivel: "Transmissível",
  saude_mental: "Saúde mental",
  dependencia_quimica: "Dependência química",
};

export const rotuloGravidade: Record<string, string> = {
  leve: "Leve",
  moderada: "Moderada",
  grave: "Grave",
  anafilatica: "Anafilática",
};

export const rotuloCargo: Record<string, string> = {
  enfermeiro: "Enfermeiro(a)",
  tecnico: "Técnico(a) de enfermagem",
  medico: "Médico(a)",
  assistente_social: "Assistente social",
  recepcao: "Recepção",
  admin: "Administrador(a)",
};

/** Sinais vitais de um atendimento em formato compacto para a linha do tempo. */
export function sinaisVitais(a: Atendimento): string[] {
  const itens: string[] = [];
  if (a.pressao_sistolica && a.pressao_diastolica) {
    itens.push(`PA ${a.pressao_sistolica}/${a.pressao_diastolica}`);
  }
  if (a.frequencia_cardiaca) itens.push(`FC ${a.frequencia_cardiaca}`);
  if (a.frequencia_respiratoria) itens.push(`FR ${a.frequencia_respiratoria}`);
  if (a.temperatura) itens.push(`T ${a.temperatura.toString().replace(".", ",")}°`);
  if (a.saturacao) itens.push(`SpO₂ ${a.saturacao}%`);
  if (a.glicemia) itens.push(`Gli ${a.glicemia}`);
  return itens;
}
