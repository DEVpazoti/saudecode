import "server-only";
import { criarClienteServidor } from "./supabase/servidor";
import type {
  Alergia,
  AlertaFixado,
  Atendimento,
  Cirurgia,
  Condicao,
  Hospital,
  Medicamento,
  Paciente,
  Prontuario,
  Vacina,
} from "./tipos";

/** Todo o prontuário em um lote de consultas paralelas. */
export async function carregarProntuario(
  pacienteId: string,
): Promise<Prontuario | null> {
  const supabase = await criarClienteServidor();

  const { data: paciente } = await supabase
    .from("pacientes")
    .select("*, hospitais(*)")
    .eq("id", pacienteId)
    .maybeSingle();

  if (!paciente) return null;

  const [
    { data: alergias },
    { data: condicoes },
    { data: medicamentos },
    { data: cirurgias },
    { data: vacinas },
    { data: fixados },
    { data: atendimentos },
  ] = await Promise.all([
    supabase
      .from("alergias")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("gravidade"),
    supabase
      .from("condicoes")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("criado_em", { ascending: false }),
    supabase
      .from("medicamentos")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("em_uso", { ascending: false })
      .order("nome"),
    supabase
      .from("cirurgias")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("data", { ascending: false, nullsFirst: false }),
    supabase
      .from("vacinas")
      .select("*")
      .eq("paciente_id", pacienteId)
      .order("data", { ascending: false, nullsFirst: false }),
    supabase
      .from("alertas")
      .select("*")
      .eq("paciente_id", pacienteId)
      .eq("ativo", true)
      .order("criado_em", { ascending: false }),
    supabase
      .from("atendimentos")
      .select("*, hospitais(nome), profissionais(nome, cargo)")
      .eq("paciente_id", pacienteId)
      .order("data_hora", { ascending: false }),
  ]);

  const { hospitais, ...resto } = paciente as Paciente & {
    hospitais: Hospital | null;
  };

  return {
    paciente: resto as Paciente,
    hospital: hospitais ?? null,
    alergias: (alergias ?? []) as Alergia[],
    condicoes: (condicoes ?? []) as Condicao[],
    medicamentos: (medicamentos ?? []) as Medicamento[],
    cirurgias: (cirurgias ?? []) as Cirurgia[],
    vacinas: (vacinas ?? []) as Vacina[],
    fixados: (fixados ?? []) as AlertaFixado[],
    atendimentos: (atendimentos ?? []) as Atendimento[],
  };
}

/** Resolve o código impresso na pulseira. */
export async function buscarPorCodigo(
  codigo: string,
): Promise<{ id: string } | null> {
  const supabase = await criarClienteServidor();
  const { data } = await supabase
    .from("pacientes")
    .select("id")
    .eq("codigo", codigo.toUpperCase())
    .maybeSingle();

  return data ?? null;
}
