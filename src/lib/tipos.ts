export type Cargo =
  | "enfermeiro"
  | "tecnico"
  | "medico"
  | "assistente_social"
  | "recepcao"
  | "admin";

export type Severidade = "critico" | "atencao" | "info";

export type ClassificacaoRisco =
  | "vermelho"
  | "laranja"
  | "amarelo"
  | "verde"
  | "azul";

export type TipoAtendimento =
  | "emergencia"
  | "consulta"
  | "curativo"
  | "odontologico"
  | "saude_mental"
  | "busca_ativa";

export type Desfecho =
  | "alta"
  | "internacao"
  | "transferencia"
  | "evasao"
  | "encaminhamento"
  | "obito";

export type Hospital = {
  id: string;
  nome: string;
  cnes: string | null;
  municipio: string | null;
  uf: string | null;
};

export type Profissional = {
  id: string;
  nome: string;
  cargo: Cargo;
  registro: string | null;
  hospital_id: string | null;
  hospitais?: Hospital | null;
};

export type Paciente = {
  id: string;
  codigo: string;
  nome: string;
  nome_social: string | null;
  apelido: string | null;
  sem_documento: boolean;
  cpf: string | null;
  cns: string | null;
  rg: string | null;
  nome_mae: string | null;
  data_nascimento: string | null;
  idade_estimada: number | null;
  sexo: "feminino" | "masculino" | "outro" | "nao_informado" | null;
  altura_cm: number | null;
  peso_kg: number | null;
  tipo_sanguineo: string | null;
  foto_url: string | null;
  sinais_particulares: string | null;
  local_permanencia: string | null;
  contato_nome: string | null;
  contato_telefone: string | null;
  contato_vinculo: string | null;
  observacoes: string | null;
  consentimento: boolean;
  ativo: boolean;
  hospital_cadastro_id: string | null;
  cadastrado_por: string | null;
  criado_em: string;
  atualizado_em: string;
};

export type Condicao = {
  id: string;
  paciente_id: string;
  nome: string;
  cid10: string | null;
  tipo:
    | "cronica"
    | "aguda"
    | "transmissivel"
    | "saude_mental"
    | "dependencia_quimica";
  status: "ativa" | "controlada" | "curada";
  desde: string | null;
  observacao: string | null;
  criado_em: string;
};

export type Alergia = {
  id: string;
  paciente_id: string;
  agente: string;
  tipo: "medicamento" | "alimento" | "ambiental" | "outro";
  gravidade: "leve" | "moderada" | "grave" | "anafilatica";
  reacao: string | null;
  criado_em: string;
};

export type Medicamento = {
  id: string;
  paciente_id: string;
  nome: string;
  dosagem: string | null;
  frequencia: string | null;
  via: string | null;
  em_uso: boolean;
  inicio: string | null;
  fim: string | null;
  observacao: string | null;
  criado_em: string;
};

export type Cirurgia = {
  id: string;
  paciente_id: string;
  procedimento: string;
  data: string | null;
  local: string | null;
  complicacoes: string | null;
  observacao: string | null;
  criado_em: string;
};

export type Vacina = {
  id: string;
  paciente_id: string;
  vacina: string;
  dose: string | null;
  data: string | null;
  criado_em: string;
};

export type AlertaFixado = {
  id: string;
  paciente_id: string;
  titulo: string;
  descricao: string | null;
  severidade: Severidade;
  ativo: boolean;
  criado_por: string | null;
  criado_em: string;
};

export type Atendimento = {
  id: string;
  paciente_id: string;
  hospital_id: string | null;
  profissional_id: string | null;
  data_hora: string;
  tipo: TipoAtendimento;
  classificacao_risco: ClassificacaoRisco | null;
  queixa: string | null;
  pressao_sistolica: number | null;
  pressao_diastolica: number | null;
  frequencia_cardiaca: number | null;
  frequencia_respiratoria: number | null;
  temperatura: number | null;
  saturacao: number | null;
  glicemia: number | null;
  sob_efeito_alcool: boolean;
  sob_efeito_substancias: boolean;
  substancias: string | null;
  diagnostico: string | null;
  cid10: string | null;
  conduta: string | null;
  desfecho: Desfecho | null;
  encaminhamento: string | null;
  observacoes: string | null;
  criado_em: string;
  hospitais?: { nome: string } | null;
  profissionais?: { nome: string; cargo: Cargo } | null;
};

/** Tudo que o prontuário precisa, em uma estrutura só. */
export type Prontuario = {
  paciente: Paciente;
  alergias: Alergia[];
  condicoes: Condicao[];
  medicamentos: Medicamento[];
  cirurgias: Cirurgia[];
  vacinas: Vacina[];
  fixados: AlertaFixado[];
  atendimentos: Atendimento[];
  hospital: Hospital | null;
};
