"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { adicionarItem, type Resultado } from "@/app/acoes/pacientes";
import { BotaoEnviar, Erro } from "./Formulario";

export type CampoDescricao = {
  nome: string;
  rotulo: string;
  tipo: "texto" | "data" | "numero" | "textarea" | "select" | "check";
  opcoes?: [valor: string, rotulo: string][];
  padrao?: string;
  marcado?: boolean;
  placeholder?: string;
  obrigatorio?: boolean;
  largura?: "cheia" | "meia";
};

/**
 * O bloco "adicionar" que aparece no rodapé de cada seção do prontuário.
 * Fica fechado por padrão: o prontuário é para ler primeiro, escrever depois.
 */
export function AdicionarItem({
  tabela,
  pacienteId,
  rotuloBotao,
  campos,
}: {
  tabela: string;
  pacienteId: string;
  rotuloBotao: string;
  campos: CampoDescricao[];
}) {
  const [aberto, setAberto] = useState(false);
  const formulario = useRef<HTMLFormElement>(null);
  const [estado, enviar] = useActionState<Resultado, FormData>(adicionarItem, {
    erro: null,
  });

  // Deu certo: limpa e fecha, para o prontuário voltar a ser leitura.
  useEffect(() => {
    if (aberto && estado.erro === null && formulario.current?.dataset.enviado) {
      formulario.current.reset();
      formulario.current.dataset.enviado = "";
      setAberto(false);
    }
  }, [estado, aberto]);

  if (!aberto) {
    return (
      <button
        type="button"
        onClick={() => setAberto(true)}
        className="mt-3 w-full border border-dashed border-linha-forte py-2 text-[13.5px] text-tinta-media transition-colors hover:border-carbono hover:text-carbono"
      >
        + {rotuloBotao}
      </button>
    );
  }

  return (
    <form
      ref={formulario}
      action={(dados) => {
        if (formulario.current) formulario.current.dataset.enviado = "1";
        enviar(dados);
      }}
      className="mt-3 flex flex-col gap-3 border border-linha bg-folha-2 p-4"
    >
      <input type="hidden" name="tabela" value={tabela} />
      <input type="hidden" name="paciente_id" value={pacienteId} />

      <div className="grid gap-3 sm:grid-cols-2">
        {campos.map((campo) => (
          <div
            key={campo.nome}
            className={
              campo.largura === "meia" ? "" : "sm:col-span-2"
            }
          >
            {campo.tipo === "check" ? (
              <label className="flex items-center gap-2.5 text-[14px]">
                <input
                  type="checkbox"
                  name={campo.nome}
                  defaultChecked={campo.marcado}
                  className="h-4 w-4 accent-[var(--color-carbono)]"
                />
                {campo.rotulo}
              </label>
            ) : (
              <>
                <label
                  htmlFor={`${tabela}-${campo.nome}`}
                  className="rotulo mb-1.5 block"
                >
                  {campo.rotulo}
                  {campo.obrigatorio && <span className="text-critico"> *</span>}
                </label>

                {campo.tipo === "select" ? (
                  <select
                    id={`${tabela}-${campo.nome}`}
                    name={campo.nome}
                    defaultValue={campo.padrao}
                    className="campo"
                  >
                    {campo.opcoes?.map(([valor, rotulo]) => (
                      <option key={valor} value={valor}>
                        {rotulo}
                      </option>
                    ))}
                  </select>
                ) : campo.tipo === "textarea" ? (
                  <textarea
                    id={`${tabela}-${campo.nome}`}
                    name={campo.nome}
                    rows={2}
                    placeholder={campo.placeholder}
                    className="campo"
                  />
                ) : (
                  <input
                    id={`${tabela}-${campo.nome}`}
                    name={campo.nome}
                    type={
                      campo.tipo === "data"
                        ? "date"
                        : campo.tipo === "numero"
                          ? "number"
                          : "text"
                    }
                    required={campo.obrigatorio}
                    placeholder={campo.placeholder}
                    className="campo"
                  />
                )}
              </>
            )}
          </div>
        ))}
      </div>

      <Erro mensagem={estado.erro} />

      <div className="flex gap-2">
        <BotaoEnviar
          ocupado="Adicionando…"
          className="botao botao-carbono text-[13.5px]"
        >
          Adicionar
        </BotaoEnviar>
        <button
          type="button"
          onClick={() => setAberto(false)}
          className="botao botao-vazado text-[13.5px]"
        >
          Cancelar
        </button>
      </div>
    </form>
  );
}
