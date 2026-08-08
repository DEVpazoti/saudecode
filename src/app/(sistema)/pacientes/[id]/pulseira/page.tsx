import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import QRCode from "qrcode";
import { carregarProntuario } from "@/lib/prontuario";
import { urlBase } from "@/lib/ambiente";
import { urlDaPulseira } from "@/lib/codigo";
import { Pulseira } from "@/components/Pulseira";
import { BotaoImprimir } from "@/components/BotaoImprimir";
import { idadeTexto, nomeExibicao } from "@/lib/formato";

export const metadata: Metadata = { title: "Pulseira" };
export const dynamic = "force-dynamic";

export default async function PaginaPulseira({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ novo?: string }>;
}) {
  const { id } = await params;
  const { novo } = await searchParams;

  const prontuario = await carregarProntuario(id);
  if (!prontuario) notFound();

  const { paciente, alergias, hospital } = prontuario;
  const url = urlDaPulseira(urlBase(), paciente.codigo);

  const qrGrande = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 0,
    color: { dark: "#1a1a24", light: "#00000000" },
  });

  const alergiasGraves = alergias
    .filter((a) => a.gravidade === "grave" || a.gravidade === "anafilatica")
    .map((a) => a.agente);

  return (
    <main className="mx-auto max-w-3xl px-5 py-8 sm:px-8 sm:py-10">
      <Link
        href={`/pacientes/${paciente.id}`}
        className="sem-impressao text-[13.5px] text-tinta-suave hover:text-tinta"
      >
        ← Prontuário
      </Link>

      {novo && (
        <div className="sem-impressao mt-4 border border-estavel/35 bg-estavel-veu px-4 py-3">
          <p className="text-[14.5px] font-medium text-estavel">
            Cadastro criado. A pulseira já está pronta para impressão.
          </p>
          <p className="mt-1 text-[13.5px] leading-relaxed text-tinta-media">
            Coloque no pulso da pessoa e explique, em linguagem simples, que o
            código serve para o próximo hospital saber o histórico dela.
          </p>
        </div>
      )}

      <header className="sem-impressao mt-6">
        <p className="rotulo">{paciente.codigo}</p>
        <h1 className="mt-1.5 text-[28px] leading-tight sm:text-[32px]">
          Pulseira de {nomeExibicao(paciente)}
        </h1>
        <p className="mt-2.5 max-w-prose text-[15px] leading-relaxed text-tinta-media">
          Imprima em papel comum e prenda na pulseira plástica, ou imprima
          direto em etiqueta adesiva. O QR Code guarda apenas o código — nenhum
          dado de saúde viaja no papel.
        </p>

        <div className="mt-5 flex flex-wrap gap-2.5">
          <BotaoImprimir>Imprimir pulseira</BotaoImprimir>
          <Link href={`/pacientes/${paciente.id}`} className="botao botao-vazado">
            Voltar ao prontuário
          </Link>
        </div>
      </header>

      {/* ------------------------------------------------ o que vai ao papel */}
      <div className="mt-8 flex flex-col gap-6">
        <section>
          <p className="rotulo sem-impressao mb-2">Pulseira · tamanho real</p>
          <Pulseira
            codigo={paciente.codigo}
            url={url}
            nome={nomeExibicao(paciente)}
            chamar={paciente.apelido}
            idade={idadeTexto(paciente)}
            tipoSanguineo={paciente.tipo_sanguineo}
            alergias={alergiasGraves}
            unidade={hospital?.nome}
          />
        </section>

        <section className="break-inside-avoid">
          <p className="rotulo sem-impressao mb-2">
            Cartão de bolso · para quem prefere não usar pulseira
          </p>

          <div className="folha-rasa flex max-w-md items-center gap-5 p-5">
            <div
              className="h-[132px] w-[132px] shrink-0 [&>svg]:h-full [&>svg]:w-full"
              dangerouslySetInnerHTML={{ __html: qrGrande }}
            />
            <div className="min-w-0">
              <p className="rotulo">SaudeCode</p>
              <p className="mt-1 font-display text-[19px] leading-tight font-semibold">
                {nomeExibicao(paciente)}
              </p>
              <p className="dado mt-2 text-[14px] font-medium">{paciente.codigo}</p>
              <p className="mt-2 text-[11.5px] leading-relaxed text-tinta-suave">
                Em caso de atendimento, escaneie este código ou digite-o em
                saudecode.app para acessar o histórico de saúde.
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* ------------------------------------------------ instruções */}
      <section className="sem-impressao mt-8 border border-linha bg-folha-2 p-5">
        <h2 className="text-[17px]">Se a pulseira sumir</h2>
        <ul className="mt-3 flex flex-col gap-2 text-[14px] leading-relaxed text-tinta-media">
          <li className="pauta pb-2">
            O código é permanente. Basta abrir esta página e imprimir de novo —
            o histórico continua ligado ao mesmo código.
          </li>
          <li className="pauta pb-2">
            Sem a pulseira, procure a pessoa em{" "}
            <Link href="/pacientes" className="text-carbono underline underline-offset-2">
              Pessoas atendidas
            </Link>{" "}
            por apelido, tatuagem, cicatriz ou local de permanência.
          </li>
          <li>
            O código também pode ser digitado à mão na{" "}
            <Link href="/escanear" className="text-carbono underline underline-offset-2">
              tela de leitura
            </Link>
            , caso o QR esteja gasto demais para escanear.
          </li>
        </ul>
      </section>

      <p className="sem-impressao mt-5 text-[12.5px] leading-relaxed text-tinta-suave">
        O QR Code aponta para <span className="dado">{url}</span>. Sem estar
        logado no sistema, quem escanear não vê nada além da tela de acesso.
      </p>
    </main>
  );
}
