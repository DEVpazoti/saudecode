"use client";

import { useActionState } from "react";
import Link from "next/link";
import { BotaoEnviar, Campo, Erro, Linha, Secao } from "./Formulario";
import { registrarAtendimento, type Resultado } from "@/app/acoes/pacientes";
import { corRisco, rotuloRisco } from "@/lib/formato";
import type { ClassificacaoRisco } from "@/lib/tipos";

const RISCOS: { cor: ClassificacaoRisco; espera: string }[] = [
  { cor: "vermelho", espera: "imediato" },
  { cor: "laranja", espera: "10 min" },
  { cor: "amarelo", espera: "60 min" },
  { cor: "verde", espera: "120 min" },
  { cor: "azul", espera: "240 min" },
];

const VITAIS = [
  { nome: "pressao_sistolica", rotulo: "PA sistólica", unidade: "mmHg", placeholder: "120" },
  { nome: "pressao_diastolica", rotulo: "PA diastólica", unidade: "mmHg", placeholder: "80" },
  { nome: "frequencia_cardiaca", rotulo: "FC", unidade: "bpm", placeholder: "78" },
  { nome: "frequencia_respiratoria", rotulo: "FR", unidade: "irpm", placeholder: "16" },
  { nome: "temperatura", rotulo: "Temperatura", unidade: "°C", placeholder: "36,5", passo: "0.1" },
  { nome: "saturacao", rotulo: "SpO₂", unidade: "%", placeholder: "98" },
  { nome: "glicemia", rotulo: "Glicemia capilar", unidade: "mg/dL", placeholder: "95" },
];

export function FormularioAtendimento({
  pacienteId,
  unidade,
}: {
  pacienteId: string;
  unidade: string;
}) {
  const [estado, enviar] = useActionState<Resultado, FormData>(
    registrarAtendimento,
    { erro: null },
  );

  return (
    <form action={enviar} className="flex flex-col gap-5">
      <input type="hidden" name="paciente_id" value={pacienteId} />

      {/* -------------------------------------------- triagem */}
      <Secao
        titulo="Triagem"
        descricao={`O atendimento será registrado em ${unidade}, com a data e a hora de agora.`}
      >
        <Campo rotulo="Tipo de atendimento" para="tipo" obrigatorio>
          <select id="tipo" name="tipo" className="campo" defaultValue="emergencia">
            <option value="emergencia">Emergência</option>
            <option value="consulta">Consulta</option>
            <option value="curativo">Curativo</option>
            <option value="odontologico">Odontológico</option>
            <option value="saude_mental">Saúde mental</option>
            <option value="busca_ativa">Busca ativa</option>
          </select>
        </Campo>

        <fieldset>
          <legend className="rotulo mb-1.5">Classificação de risco</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {RISCOS.map(({ cor, espera }) => (
              <label
                key={cor}
                className="relative flex cursor-pointer flex-col gap-1 border border-linha bg-folha px-3 py-2.5 transition-colors hover:border-linha-forte has-checked:border-tinta has-checked:bg-folha-2"
              >
                <input
                  type="radio"
                  name="classificacao_risco"
                  value={cor}
                  className="sr-only"
                />
                <span
                  className="h-1.5 w-8"
                  style={{ backgroundColor: corRisco[cor] }}
                />
                <span className="text-[13.5px] leading-tight font-medium">
                  {rotuloRisco[cor]}
                </span>
                <span className="dado text-[11px] text-tinta-suave">{espera}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <Campo
          rotulo="Queixa"
          para="queixa"
          dica="O que trouxe a pessoa até aqui, com as palavras dela quando possível."
        >
          <textarea
            id="queixa"
            name="queixa"
            rows={2}
            className="campo"
            placeholder="Trazido pelo SAMU após queda na via"
          />
        </Campo>
      </Secao>

      {/* -------------------------------------------- sinais vitais */}
      <Secao
        titulo="Sinais vitais"
        descricao="Deixe em branco o que não foi aferido. A glicemia capilar entra no cálculo de alertas de hipoglicemia de repetição."
      >
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {VITAIS.map((v) => (
            <div key={v.nome}>
              <label htmlFor={v.nome} className="rotulo mb-1.5 block">
                {v.rotulo}
              </label>
              <div className="relative">
                <input
                  id={v.nome}
                  name={v.nome}
                  type="number"
                  step={v.passo}
                  className="campo pr-12"
                  placeholder={v.placeholder}
                />
                <span className="dado pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-[11px] text-tinta-suave">
                  {v.unidade}
                </span>
              </div>
            </div>
          ))}
        </div>
      </Secao>

      {/* -------------------------------------------- estado na chegada */}
      <Secao
        titulo="Estado na chegada"
        descricao="É a partir daqui que o sistema identifica recorrência ao longo dos meses. Registrar sem julgamento: o dado serve para cuidar, não para rotular."
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-2.5 border border-linha bg-folha-2 px-3.5 py-3">
            <input
              type="checkbox"
              name="sob_efeito_alcool"
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-carbono)]"
            />
            <span className="text-[14px] leading-snug">
              Chegou sob efeito de álcool
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-2.5 border border-linha bg-folha-2 px-3.5 py-3">
            <input
              type="checkbox"
              name="sob_efeito_substancias"
              className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-carbono)]"
            />
            <span className="text-[14px] leading-snug">
              Chegou sob efeito de outras substâncias
            </span>
          </label>
        </div>

        <Campo rotulo="Quais substâncias" para="substancias">
          <input
            id="substancias"
            name="substancias"
            type="text"
            className="campo"
            placeholder="Crack, cocaína…"
          />
        </Campo>
      </Secao>

      {/* -------------------------------------------- desfecho */}
      <Secao titulo="Avaliação e desfecho">
        <Linha>
          <Campo rotulo="Diagnóstico" para="diagnostico">
            <input
              id="diagnostico"
              name="diagnostico"
              type="text"
              className="campo"
              placeholder="Intoxicação alcoólica aguda"
            />
          </Campo>
          <Campo rotulo="CID-10" para="cid10">
            <input
              id="cid10"
              name="cid10"
              type="text"
              className="campo"
              placeholder="F10.0"
            />
          </Campo>
        </Linha>

        <Campo rotulo="Conduta" para="conduta">
          <textarea
            id="conduta"
            name="conduta"
            rows={3}
            className="campo"
            placeholder="Hidratação, tiamina antes de glicose, observação por 12h."
          />
        </Campo>

        <Linha>
          <Campo rotulo="Desfecho" para="desfecho">
            <select id="desfecho" name="desfecho" className="campo" defaultValue="alta">
              <option value="alta">Alta</option>
              <option value="internacao">Internação</option>
              <option value="transferencia">Transferência</option>
              <option value="encaminhamento">Encaminhamento</option>
              <option value="evasao">Evasão antes da alta</option>
              <option value="obito">Óbito</option>
            </select>
          </Campo>

          <Campo
            rotulo="Encaminhado para"
            para="encaminhamento"
            dica="CAPS, CRAS, UBS, abrigo, Consultório na Rua."
          >
            <input
              id="encaminhamento"
              name="encaminhamento"
              type="text"
              className="campo"
              placeholder="CAPS AD II Sé"
            />
          </Campo>
        </Linha>

        <Campo rotulo="Observações" para="observacoes">
          <textarea
            id="observacoes"
            name="observacoes"
            rows={3}
            className="campo"
            placeholder="O que a próxima equipe precisa saber sobre esta passagem."
          />
        </Campo>
      </Secao>

      <Erro mensagem={estado.erro} />

      <div className="flex flex-wrap items-center gap-3 pb-4">
        <BotaoEnviar ocupado="Registrando…">Registrar atendimento</BotaoEnviar>
        <Link
          href={`/pacientes/${pacienteId}`}
          className="botao botao-vazado px-5 py-2.5"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
