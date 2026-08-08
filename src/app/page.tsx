import Link from "next/link";
import { Marca } from "@/components/Marca";
import { Pulseira } from "@/components/Pulseira";
import { urlBase } from "@/lib/ambiente";
import { urlDaPulseira } from "@/lib/codigo";

const CODIGO_DEMO = "SC-4KQ7-M2XB";

const ETAPAS = [
  {
    titulo: "A equipe cadastra",
    texto:
      "Na primeira vez que a pessoa é atendida, o enfermeiro preenche o que dá para preencher: nome, idade estimada, sinais particulares, o que ela usa, do que passa mal. Uma foto ajuda quem vier depois.",
  },
  {
    titulo: "O sistema imprime a pulseira",
    texto:
      "O cadastro gera um código único e um QR Code. A pulseira sai da impressora comum, com o essencial já legível a olho nu: nome, tipo sanguíneo e alergias graves.",
  },
  {
    titulo: "A próxima unidade lê",
    texto:
      "Em qualquer hospital da rede, a câmera do celular abre o prontuário inteiro. Sem precisar que a pessoa explique nada — que é justamente o que ela não consegue fazer.",
  },
];

const RECURSOS = [
  {
    titulo: "Padrões que só o histórico revela",
    texto:
      "Quatro chegadas alcoolizado em um ano não aparecem em nenhum atendimento isolado. O sistema conta e avisa antes de você abrir o prontuário.",
  },
  {
    titulo: "Reidentificação sem a pulseira",
    texto:
      "Pulseira se perde, é arrancada, é vendida. A busca também procura por apelido, tatuagem, cicatriz e local de permanência.",
  },
  {
    titulo: "Alergias no topo, sempre",
    texto:
      "Alergia grave e doença transmissível abrem o prontuário como carimbo vermelho, antes de qualquer dado biográfico.",
  },
  {
    titulo: "Encaminhamento à rede",
    texto:
      "Cada atendimento registra para onde a pessoa foi encaminhada — CAPS, CRAS, UBS, abrigo — para o próximo profissional saber o que já foi tentado.",
  },
  {
    titulo: "Classificação de risco",
    texto:
      "A triagem segue as cinco cores do protocolo de Manchester, do jeito que a equipe já trabalha.",
  },
  {
    titulo: "Trilha de acesso",
    texto:
      "Todo prontuário aberto fica registrado: quem abriu, quando e se chegou pela pulseira ou pela busca.",
  },
];

export default async function PaginaInicial() {
  const url = urlDaPulseira(urlBase(), CODIGO_DEMO);

  return (
    <div className="min-h-screen">
      {/* ------------------------------------------------ cabeçalho */}
      <header className="sticky top-0 z-20 border-b border-linha bg-papel/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3.5">
          <Marca />
          <nav className="flex items-center gap-5">
            <a
              href="#como-funciona"
              className="hidden text-[14px] text-tinta-media hover:text-tinta sm:block"
            >
              Como funciona
            </a>
            <a
              href="#privacidade"
              className="hidden text-[14px] text-tinta-media hover:text-tinta sm:block"
            >
              Privacidade
            </a>
            <Link href="/entrar" className="botao text-[13.5px]">
              Acessar o sistema
            </Link>
          </nav>
        </div>
      </header>

      {/* ------------------------------------------------ hero */}
      <section className="mx-auto max-w-5xl px-6 pt-16 pb-14 sm:pt-24 sm:pb-20">
        <p className="rotulo">Identificação em saúde · população em situação de rua</p>

        <h1 className="mt-5 max-w-3xl text-[34px] leading-[1.08] sm:text-[52px]">
          A pulseira responde o que a pessoa não consegue responder.
        </h1>

        <p className="mt-6 max-w-2xl text-[17px] leading-relaxed text-tinta-media">
          Quem vive na rua costuma chegar ao pronto-socorro sem documento, sem
          acompanhante e, muitas vezes, sem conseguir falar. O SaudeCode grava o
          histórico dessa pessoa num QR Code de pulseira. Um segundo de leitura e
          a equipe sabe quem está atendendo, do que ela é alérgica e tudo que já
          aconteceu antes.
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <Link href="/entrar" className="botao botao-carbono px-5 py-2.5">
            Entrar no sistema
          </Link>
          <a href="#como-funciona" className="botao botao-vazado px-5 py-2.5">
            Ver como funciona
          </a>
        </div>

        {/* O objeto */}
        <div className="mt-16">
          <div className="max-w-2xl -rotate-[0.8deg]">
            <Pulseira
              codigo={CODIGO_DEMO}
              url={url}
              nome="Antônio Ferreira da Silva"
              chamar="Toninho"
              idade="55 anos"
              tipoSanguineo="O+"
              alergias={["Dipirona"]}
              unidade="Santa Clara"
              className="shadow-[4px_5px_0_rgba(26,26,36,0.09)]"
            />
          </div>
          <p className="mt-4 max-w-md text-[13px] leading-relaxed text-tinta-suave">
            Pulseira real de um cadastro de demonstração. Aponte a câmera do
            celular para o código — ele abre o prontuário do Antônio neste
            mesmo sistema.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------ o problema */}
      <section className="border-y border-linha bg-papel-fundo">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-16 sm:grid-cols-[1.1fr_1fr] sm:py-20">
          <div>
            <p className="rotulo">O problema</p>
            <h2 className="mt-4 text-[27px] leading-tight sm:text-[32px]">
              O prontuário existe. Ele só não sabe que é da mesma pessoa.
            </h2>
          </div>
          <div className="flex flex-col gap-4 text-[15.5px] leading-relaxed text-tinta-media">
            <p>
              A pessoa é atendida numa UPA na terça e num hospital municipal na
              sexta. Cada unidade abre uma ficha nova, com um nome escrito de um
              jeito diferente, e recomeça do zero: pergunta o que ela toma, do
              que é alérgica, se já operou. Ela não sabe responder, ou não
              consegue, ou responde diferente a cada vez.
            </p>
            <p>
              O resultado é um remédio prescrito contra uma alergia que estava
              registrada em outro lugar. Um tratamento de tuberculose que
              recomeça pela terceira vez. Uma pessoa que já passou quatro vezes
              pela emergência no mesmo semestre sem que ninguém tenha somado
              essas quatro vezes.
            </p>
            <p className="text-tinta">
              Falta um jeito de a informação viajar junto com a pessoa. O
              SaudeCode é esse jeito: uma pulseira de dez gramas.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ como funciona */}
      <section id="como-funciona" className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <p className="rotulo">Como funciona</p>
        <h2 className="mt-4 max-w-xl text-[27px] leading-tight sm:text-[32px]">
          Três momentos, em ordem
        </h2>

        <ol className="mt-10 grid gap-5 sm:grid-cols-3">
          {ETAPAS.map((etapa, i) => (
            <li key={etapa.titulo} className="folha flex flex-col p-6">
              <span className="dado text-[13px] font-medium text-carbono">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 text-[19px] leading-snug">{etapa.titulo}</h3>
              <p className="mt-2.5 text-[14.5px] leading-relaxed text-tinta-media">
                {etapa.texto}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------ a faixa de alerta */}
      <section className="border-y border-linha bg-papel-fundo">
        <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
          <div className="grid gap-10 sm:grid-cols-[1fr_1.15fr] sm:items-center">
            <div>
              <p className="rotulo">O que abre o prontuário</p>
              <h2 className="mt-4 text-[27px] leading-tight sm:text-[32px]">
                Primeiro o que muda a conduta. Depois o resto.
              </h2>
              <p className="mt-4 text-[15.5px] leading-relaxed text-tinta-media">
                Nenhum prontuário começa por nome e endereço. Começa pelo que
                faria você agir diferente nos próximos dez minutos — inclusive o
                que só aparece quando se soma o histórico inteiro.
              </p>
            </div>

            {/* Amostra fiel da faixa que aparece no sistema */}
            <div className="folha p-5">
              <p className="rotulo mb-3">Antônio Ferreira da Silva</p>
              <div className="flex flex-col gap-2.5">
                <AmostraAlerta
                  cor="critico"
                  titulo="Alergia a Dipirona"
                  detalhe="Grave — edema de face e urticária generalizada"
                />
                <AmostraAlerta
                  cor="critico"
                  titulo="Embriaguez recorrente — 4 de 5 atendimentos em 12 meses"
                  detalhe="Avalie risco de abstinência nas primeiras 72h e reponha tiamina antes de glicose."
                />
                <AmostraAlerta
                  cor="atencao"
                  titulo="Dificuldade de fala por afasia"
                  detalhe="Entende o que é dito. Use perguntas de sim ou não e dê tempo para responder."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ recursos */}
      <section className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <p className="rotulo">No sistema</p>
        <h2 className="mt-4 max-w-lg text-[27px] leading-tight sm:text-[32px]">
          Feito para o turno da noite, com pressa e com o celular na mão
        </h2>

        <div className="mt-10 grid gap-x-10 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {RECURSOS.map((r) => (
            <div key={r.titulo} className="border-t border-linha-forte pt-4">
              <h3 className="text-[17px] leading-snug">{r.titulo}</h3>
              <p className="mt-2 text-[14.5px] leading-relaxed text-tinta-media">
                {r.texto}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ------------------------------------------------ privacidade */}
      <section id="privacidade" className="border-y border-linha bg-papel-fundo">
        <div className="mx-auto grid max-w-5xl gap-10 px-6 py-16 sm:grid-cols-[1fr_1.2fr] sm:py-20">
          <div>
            <p className="rotulo">Privacidade</p>
            <h2 className="mt-4 text-[27px] leading-tight sm:text-[32px]">
              Dado de saúde é dado sensível
            </h2>
          </div>
          <div className="flex flex-col gap-4 text-[15.5px] leading-relaxed text-tinta-media">
            <p>
              A pulseira não carrega nenhuma informação clínica: o QR Code só
              guarda um código aleatório. Quem escaneia sem estar logado no
              sistema não vê absolutamente nada — nem o nome.
            </p>
            <p>
              O prontuário só abre para profissional autenticado de uma unidade
              cadastrada, e cada abertura fica registrada na trilha de acesso,
              com hora e origem. O cadastro registra o consentimento da pessoa
              para o histórico ser compartilhado entre as unidades da rede.
            </p>
            <p className="text-tinta-suave">
              Este é um protótipo acadêmico. Antes de uso real seria preciso
              parecer do comitê de ética, avaliação de impacto à proteção de
              dados (LGPD, art. 11) e homologação junto à secretaria de saúde.
            </p>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ fechamento */}
      <section className="mx-auto max-w-5xl px-6 py-20 text-center sm:py-28">
        <h2 className="mx-auto max-w-xl text-[28px] leading-tight sm:text-[36px]">
          A informação já existe. Só precisa chegar junto com a pessoa.
        </h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/entrar" className="botao botao-carbono px-5 py-2.5">
            Entrar no sistema
          </Link>
          <Link href="/escanear" className="botao botao-vazado px-5 py-2.5">
            Escanear uma pulseira
          </Link>
        </div>
      </section>

      <footer className="border-t border-linha">
        <div className="mx-auto flex max-w-5xl flex-col gap-3 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
          <Marca />
          <p className="text-[13px] text-tinta-suave">
            Protótipo acadêmico · dados de demonstração são fictícios
          </p>
        </div>
      </footer>
    </div>
  );
}

function AmostraAlerta({
  cor,
  titulo,
  detalhe,
}: {
  cor: "critico" | "atencao";
  titulo: string;
  detalhe: string;
}) {
  const estilo =
    cor === "critico"
      ? "border-critico/35 bg-critico-veu text-critico"
      : "border-atencao/35 bg-atencao-veu text-atencao";

  return (
    <div className={`border-l-[3px] border ${estilo} px-3.5 py-2.5`}>
      <p className="text-[14px] font-semibold leading-snug">{titulo}</p>
      <p className="mt-1 text-[13px] leading-relaxed text-tinta-media">
        {detalhe}
      </p>
    </div>
  );
}
