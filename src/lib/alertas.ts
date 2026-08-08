import type { Prontuario, Severidade } from "./tipos";
import { rotuloGravidade } from "./formato";

export type Alerta = {
  chave: string;
  severidade: Severidade;
  titulo: string;
  detalhe: string;
  origem: "fixado" | "padrao" | "registro";
};

const PESO: Record<Severidade, number> = { critico: 0, atencao: 1, info: 2 };

const MES = 30 * 86_400_000;

function dentroDe(iso: string, meses: number): boolean {
  return Date.now() - new Date(iso).getTime() <= meses * MES;
}

function plural(n: number, um: string, muitos: string): string {
  return n === 1 ? `1 ${um}` : `${n} ${muitos}`;
}

/**
 * Monta a faixa de alertas do prontuário.
 *
 * Três fontes: o que a equipe fixou à mão, o que está registrado como
 * risco direto (alergia grave, doença transmissível) e o que só aparece
 * quando se olha o histórico inteiro — a recorrência. É essa terceira
 * que ninguém enxerga atendendo a pessoa pela primeira vez.
 */
export function montarAlertas(p: Prontuario): Alerta[] {
  const alertas: Alerta[] = [];
  const { paciente, alergias, condicoes, medicamentos, atendimentos, fixados } = p;

  // --- Fixados pela equipe -------------------------------------------
  for (const f of fixados) {
    if (!f.ativo) continue;
    alertas.push({
      chave: `fixado-${f.id}`,
      severidade: f.severidade,
      titulo: f.titulo,
      detalhe: f.descricao ?? "",
      origem: "fixado",
    });
  }

  // --- Alergias -------------------------------------------------------
  const graves = alergias.filter(
    (a) => a.gravidade === "grave" || a.gravidade === "anafilatica",
  );
  for (const a of graves) {
    alertas.push({
      chave: `alergia-${a.id}`,
      severidade: "critico",
      titulo: `Alergia a ${a.agente}`,
      detalhe: [rotuloGravidade[a.gravidade], a.reacao].filter(Boolean).join(" — "),
      origem: "registro",
    });
  }
  const leves = alergias.filter(
    (a) => a.gravidade !== "grave" && a.gravidade !== "anafilatica",
  );
  if (leves.length > 0) {
    alertas.push({
      chave: "alergias-leves",
      severidade: "atencao",
      titulo: `Outras alergias: ${leves.map((a) => a.agente).join(", ")}`,
      detalhe: "Reações leves a moderadas registradas.",
      origem: "registro",
    });
  }

  // --- Doenças transmissíveis ativas ----------------------------------
  for (const c of condicoes.filter(
    (c) => c.tipo === "transmissivel" && c.status !== "curada",
  )) {
    alertas.push({
      chave: `transmissivel-${c.id}`,
      severidade: c.status === "ativa" ? "critico" : "atencao",
      titulo: `${c.nome}${c.status === "controlada" ? " (controlada)" : ""}`,
      detalhe:
        c.observacao ??
        "Condição transmissível registrada. Verifique as precauções indicadas.",
      origem: "registro",
    });
  }

  // --- Saúde mental e dependência química ------------------------------
  const mental = condicoes.filter(
    (c) =>
      (c.tipo === "saude_mental" || c.tipo === "dependencia_quimica") &&
      c.status !== "curada",
  );
  if (mental.length > 0) {
    alertas.push({
      chave: "saude-mental",
      severidade: "atencao",
      titulo: mental.map((c) => c.nome).join(" · "),
      detalhe:
        "Considere no manejo e nas interações medicamentosas. Verifique acompanhamento no CAPS.",
      origem: "registro",
    });
  }

  // --- Recorrência: álcool --------------------------------------------
  const doAno = atendimentos.filter((a) => dentroDe(a.data_hora, 12));
  const comAlcool = doAno.filter((a) => a.sob_efeito_alcool);
  if (comAlcool.length >= 2) {
    alertas.push({
      chave: "recorrencia-alcool",
      severidade: comAlcool.length >= 3 ? "critico" : "atencao",
      titulo: `Embriaguez recorrente — ${comAlcool.length} de ${doAno.length} atendimentos em 12 meses`,
      detalhe:
        "Padrão de uso pesado de álcool. Avalie risco de abstinência nas primeiras 72h, reponha tiamina antes de glicose e ofereça encaminhamento ao CAPS AD.",
      origem: "padrao",
    });
  }

  // --- Recorrência: outras substâncias ---------------------------------
  const comSubstancias = doAno.filter((a) => a.sob_efeito_substancias);
  if (comSubstancias.length >= 2) {
    const quais = [
      ...new Set(comSubstancias.map((a) => a.substancias).filter(Boolean)),
    ].join(", ");
    alertas.push({
      chave: "recorrencia-substancias",
      severidade: "atencao",
      titulo: `Uso de substâncias em ${plural(comSubstancias.length, "atendimento", "atendimentos")} nos últimos 12 meses`,
      detalhe: quais
        ? `Registrado: ${quais}. Considere interações e síndrome de abstinência.`
        : "Considere interações e síndrome de abstinência.",
      origem: "padrao",
    });
  }

  // --- Recorrência: hipoglicemia ---------------------------------------
  const hipos = doAno.filter((a) => a.glicemia != null && a.glicemia < 60);
  if (hipos.length >= 2) {
    alertas.push({
      chave: "hipoglicemia",
      severidade: "critico",
      titulo: `Hipoglicemia grave em ${plural(hipos.length, "atendimento", "atendimentos")} no último ano`,
      detalhe: `Menor valor registrado: ${Math.min(
        ...hipos.map((h) => h.glicemia as number),
      )} mg/dL. Cheque a glicemia capilar já na triagem, antes de qualquer conduta.`,
      origem: "padrao",
    });
  }

  // --- Recorrência: evasão antes da alta -------------------------------
  const evasoes = atendimentos.filter((a) => a.desfecho === "evasao");
  if (evasoes.length >= 2) {
    alertas.push({
      chave: "evasao",
      severidade: "atencao",
      titulo: `Saiu antes da alta em ${plural(evasoes.length, "atendimento", "atendimentos")}`,
      detalhe:
        "A janela de contato é curta. Priorize exames e condutas resolutivas logo na primeira abordagem.",
      origem: "padrao",
    });
  }

  // --- Uso frequente do pronto-socorro ---------------------------------
  const seisMeses = atendimentos.filter(
    (a) => dentroDe(a.data_hora, 6) && a.tipo === "emergencia",
  );
  if (seisMeses.length >= 4) {
    alertas.push({
      chave: "uso-frequente",
      severidade: "atencao",
      titulo: `${seisMeses.length} passagens pela emergência em 6 meses`,
      detalhe:
        "Sinaliza necessidade não resolvida na atenção básica. Acione o Consultório na Rua ou a UBS de referência.",
      origem: "padrao",
    });
  }

  // --- Medicação de uso contínuo ---------------------------------------
  const continuos = medicamentos.filter((m) => m.em_uso);
  if (continuos.length > 0) {
    alertas.push({
      chave: "medicacao-continua",
      severidade: "info",
      titulo: `${plural(continuos.length, "medicamento", "medicamentos")} de uso contínuo`,
      detalhe: continuos
        .map((m) => [m.nome, m.dosagem].filter(Boolean).join(" "))
        .join(" · "),
      origem: "registro",
    });
  }

  // --- Lacunas de cadastro que atrapalham a decisão ---------------------
  if (!paciente.tipo_sanguineo || paciente.tipo_sanguineo === "desconhecido") {
    alertas.push({
      chave: "sem-tipagem",
      severidade: "info",
      titulo: "Tipo sanguíneo desconhecido",
      detalhe: "Colher tipagem na próxima oportunidade.",
      origem: "registro",
    });
  }

  if (!paciente.consentimento) {
    alertas.push({
      chave: "sem-consentimento",
      severidade: "info",
      titulo: "Consentimento não registrado",
      detalhe:
        "Registre o consentimento da pessoa para manter o histórico compartilhado entre as unidades.",
      origem: "registro",
    });
  }

  return alertas.sort((a, b) => PESO[a.severidade] - PESO[b.severidade]);
}

export function contarPorSeveridade(alertas: Alerta[]) {
  return {
    critico: alertas.filter((a) => a.severidade === "critico").length,
    atencao: alertas.filter((a) => a.severidade === "atencao").length,
    info: alertas.filter((a) => a.severidade === "info").length,
  };
}
