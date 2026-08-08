"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import {
  BotaoEnviar,
  Campo,
  Erro,
  Linha,
  Marcador,
  Secao,
} from "./Formulario";
import { CampoFoto } from "./CampoFoto";
import type { Resultado } from "@/app/acoes/pacientes";
import type { Paciente } from "@/lib/tipos";

const TIPOS_SANGUINEOS = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "desconhecido",
];

type Acao = (anterior: Resultado, dados: FormData) => Promise<Resultado>;

export function FormularioPaciente({
  acao,
  paciente,
}: {
  acao: Acao;
  paciente?: Paciente;
}) {
  const [estado, enviar] = useActionState<Resultado, FormData>(acao, {
    erro: null,
  });
  const [nome, setNome] = useState(paciente?.nome ?? "");
  const editando = Boolean(paciente);

  return (
    <form action={enviar} className="flex flex-col gap-5">
      {paciente && <input type="hidden" name="id" value={paciente.id} />}

      {/* -------------------------------------------- identificação */}
      <Secao
        titulo="Quem é a pessoa"
        descricao="Preencha o que der. Um cadastro incompleto vale muito mais do que nenhum — dá para completar no próximo atendimento."
      >
        <CampoFoto nome={nome} inicial={paciente?.foto_url} />

        <Campo
          rotulo="Nome"
          para="nome"
          obrigatorio
          dica="Se ela não souber ou não quiser dizer, registre o apelido pelo qual é conhecida."
        >
          <input
            id="nome"
            name="nome"
            type="text"
            required
            className="campo"
            defaultValue={paciente?.nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Antônio Ferreira da Silva"
          />
        </Campo>

        <Linha>
          <Campo
            rotulo="Nome social"
            para="nome_social"
            dica="Como quer ser chamada. Prevalece sobre o nome de registro em todo o sistema."
          >
            <input
              id="nome_social"
              name="nome_social"
              type="text"
              className="campo"
              defaultValue={paciente?.nome_social ?? ""}
            />
          </Campo>

          <Campo
            rotulo="Apelido na rua"
            para="apelido"
            dica="Muitas vezes é o único nome que a rede conhece."
          >
            <input
              id="apelido"
              name="apelido"
              type="text"
              className="campo"
              defaultValue={paciente?.apelido ?? ""}
              placeholder="Toninho"
            />
          </Campo>
        </Linha>

        <Linha colunas={3}>
          <Campo rotulo="Data de nascimento" para="data_nascimento">
            <input
              id="data_nascimento"
              name="data_nascimento"
              type="date"
              className="campo"
              defaultValue={paciente?.data_nascimento ?? ""}
            />
          </Campo>

          <Campo
            rotulo="Idade estimada"
            para="idade_estimada"
            dica="Use quando não houver data."
          >
            <input
              id="idade_estimada"
              name="idade_estimada"
              type="number"
              min={0}
              max={130}
              className="campo"
              defaultValue={paciente?.idade_estimada ?? ""}
              placeholder="47"
            />
          </Campo>

          <Campo rotulo="Sexo" para="sexo">
            <select
              id="sexo"
              name="sexo"
              className="campo"
              defaultValue={paciente?.sexo ?? "nao_informado"}
            >
              <option value="feminino">Feminino</option>
              <option value="masculino">Masculino</option>
              <option value="outro">Outro</option>
              <option value="nao_informado">Não informado</option>
            </select>
          </Campo>
        </Linha>
      </Secao>

      {/* -------------------------------------------- reconhecimento */}
      <Secao
        titulo="Como reconhecer sem a pulseira"
        descricao="Pulseira se perde, é arrancada, é trocada. Este é o campo que permite reencontrar o cadastro certo — e é o mais esquecido."
      >
        <Campo
          rotulo="Sinais particulares"
          para="sinais_particulares"
          dica="Tatuagens e onde ficam, cicatrizes, amputações, dentes faltando, marcas de queimadura."
        >
          <textarea
            id="sinais_particulares"
            name="sinais_particulares"
            rows={3}
            className="campo"
            defaultValue={paciente?.sinais_particulares ?? ""}
            placeholder="Cicatriz de 8 cm no antebraço esquerdo. Tatuagem de âncora no ombro direito."
          />
        </Campo>

        <Campo
          rotulo="Onde costuma ser encontrada"
          para="local_permanencia"
          dica="Ajuda a busca ativa e o Consultório na Rua a fazerem o retorno."
        >
          <input
            id="local_permanencia"
            name="local_permanencia"
            type="text"
            className="campo"
            defaultValue={paciente?.local_permanencia ?? ""}
            placeholder="Praça da Sé, dorme sob a marquise da Rua Boa Vista"
          />
        </Campo>
      </Secao>

      {/* -------------------------------------------- corpo */}
      <Secao
        titulo="Dados do corpo"
        descricao="Entram no cálculo de dose e aparecem impressos na pulseira."
      >
        <Linha colunas={3}>
          <Campo rotulo="Altura (cm)" para="altura_cm">
            <input
              id="altura_cm"
              name="altura_cm"
              type="number"
              min={30}
              max={260}
              className="campo"
              defaultValue={paciente?.altura_cm ?? ""}
              placeholder="172"
            />
          </Campo>

          <Campo rotulo="Peso (kg)" para="peso_kg">
            <input
              id="peso_kg"
              name="peso_kg"
              type="number"
              step="0.1"
              min={1}
              max={400}
              className="campo"
              defaultValue={paciente?.peso_kg ?? ""}
              placeholder="61,4"
            />
          </Campo>

          <Campo rotulo="Tipo sanguíneo" para="tipo_sanguineo">
            <select
              id="tipo_sanguineo"
              name="tipo_sanguineo"
              className="campo"
              defaultValue={paciente?.tipo_sanguineo ?? "desconhecido"}
            >
              {TIPOS_SANGUINEOS.map((t) => (
                <option key={t} value={t}>
                  {t === "desconhecido" ? "Desconhecido" : t}
                </option>
              ))}
            </select>
          </Campo>
        </Linha>
      </Secao>

      {/* -------------------------------------------- documentos */}
      <Secao
        titulo="Documentos"
        descricao="Quando existirem. A falta deles não impede o cadastro nem o atendimento."
      >
        <Marcador
          nome="sem_documento"
          rotulo="Está sem documentos no momento"
          dica="Sinaliza para a equipe da próxima unidade e para a assistência social."
          padrao={paciente ? paciente.sem_documento : true}
        />

        <Linha colunas={3}>
          <Campo rotulo="Cartão SUS (CNS)" para="cns">
            <input
              id="cns"
              name="cns"
              type="text"
              className="campo"
              defaultValue={paciente?.cns ?? ""}
            />
          </Campo>
          <Campo rotulo="CPF" para="cpf">
            <input
              id="cpf"
              name="cpf"
              type="text"
              className="campo"
              defaultValue={paciente?.cpf ?? ""}
            />
          </Campo>
          <Campo rotulo="RG" para="rg">
            <input
              id="rg"
              name="rg"
              type="text"
              className="campo"
              defaultValue={paciente?.rg ?? ""}
            />
          </Campo>
        </Linha>

        <Campo
          rotulo="Nome da mãe"
          para="nome_mae"
          dica="Costuma ser o que a pessoa lembra quando não lembra mais nada — e o que permite localizar o cadastro antigo no sistema do município."
        >
          <input
            id="nome_mae"
            name="nome_mae"
            type="text"
            className="campo"
            defaultValue={paciente?.nome_mae ?? ""}
          />
        </Campo>
      </Secao>

      {/* -------------------------------------------- contato */}
      <Secao
        titulo="Quem avisar"
        descricao="Familiar, equipe de rua, albergue, agente do CAPS — qualquer vínculo estável serve."
      >
        <Linha colunas={3}>
          <Campo rotulo="Nome" para="contato_nome">
            <input
              id="contato_nome"
              name="contato_nome"
              type="text"
              className="campo"
              defaultValue={paciente?.contato_nome ?? ""}
            />
          </Campo>
          <Campo rotulo="Telefone" para="contato_telefone">
            <input
              id="contato_telefone"
              name="contato_telefone"
              type="tel"
              className="campo"
              defaultValue={paciente?.contato_telefone ?? ""}
              placeholder="(11) 98812-4477"
            />
          </Campo>
          <Campo rotulo="Vínculo" para="contato_vinculo">
            <input
              id="contato_vinculo"
              name="contato_vinculo"
              type="text"
              className="campo"
              defaultValue={paciente?.contato_vinculo ?? ""}
              placeholder="Irmã"
            />
          </Campo>
        </Linha>
      </Secao>

      {/* -------------------------------------------- observações */}
      <Secao
        titulo="Observações e consentimento"
        descricao="O que a próxima equipe precisa saber para conseguir se comunicar com ela."
      >
        <Campo
          rotulo="Observações"
          para="observacoes"
          dica="Como ela se comunica, o que a acalma, o que a deixa agitada, com quem ela aceita falar."
        >
          <textarea
            id="observacoes"
            name="observacoes"
            rows={4}
            className="campo"
            defaultValue={paciente?.observacoes ?? ""}
            placeholder="Fala pouco após o AVC. Entende bem o que é dito. Responde melhor a perguntas de sim ou não."
          />
        </Campo>

        <Marcador
          nome="consentimento"
          rotulo="A pessoa consentiu em compartilhar o histórico entre as unidades"
          dica="Explique em linguagem simples o que o sistema faz. Sem consentimento o cadastro continua válido, mas fica sinalizado no prontuário."
          padrao={paciente ? paciente.consentimento : false}
        />
      </Secao>

      <Erro mensagem={estado.erro} />

      <div className="flex flex-wrap items-center gap-3 pb-4">
        <BotaoEnviar ocupado={editando ? "Salvando…" : "Gerando pulseira…"}>
          {editando ? "Salvar alterações" : "Cadastrar e gerar pulseira"}
        </BotaoEnviar>
        <Link
          href={paciente ? `/pacientes/${paciente.id}` : "/pacientes"}
          className="botao botao-vazado px-5 py-2.5"
        >
          Cancelar
        </Link>
      </div>
    </form>
  );
}
