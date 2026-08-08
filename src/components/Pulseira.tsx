import QRCode from "qrcode";

type Props = {
  codigo: string;
  url: string;
  nome: string;
  chamar?: string | null;
  idade?: string;
  tipoSanguineo?: string | null;
  alergias?: string[];
  unidade?: string;
  className?: string;
};

/**
 * A pulseira física, renderizada em HTML.
 *
 * Aparece em dois lugares e é a mesma peça nos dois: na página inicial,
 * como o objeto que explica o sistema, e na tela de impressão, onde sai
 * em papel. O QR é gerado de verdade — dá para apontar a câmera na tela.
 */
export async function Pulseira({
  codigo,
  url,
  nome,
  chamar,
  idade,
  tipoSanguineo,
  alergias = [],
  unidade,
  className = "",
}: Props) {
  const qr = await QRCode.toString(url, {
    type: "svg",
    errorCorrectionLevel: "M",
    margin: 0,
    color: { dark: "#1a1a24", light: "#00000000" },
  });

  const alergiaTexto = alergias.length > 0 ? alergias.join(" · ") : null;

  return (
    <div
      className={`flex items-stretch overflow-hidden rounded-[3px] border border-linha-forte bg-folha ${className}`}
    >
      {/* Furos de fecho — a ponta que dá a volta no pulso */}
      <div className="flex w-6 shrink-0 flex-col items-center justify-center gap-2 border-r border-dashed border-linha-forte bg-folha-2 py-3">
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className="h-1.5 w-1.5 rounded-full border border-linha-forte bg-papel"
          />
        ))}
      </div>

      <div className="flex flex-1 items-center gap-4 p-3.5">
        <div
          className="h-[74px] w-[74px] shrink-0 [&>svg]:h-full [&>svg]:w-full"
          dangerouslySetInnerHTML={{ __html: qr }}
        />

        <div className="min-w-0 flex-1">
          <p className="rotulo">SaudeCode {unidade ? `· ${unidade}` : ""}</p>
          <p className="mt-0.5 truncate font-display text-[17px] leading-tight font-semibold">
            {nome}
          </p>
          <p className="dado mt-0.5 text-[12px] text-tinta-suave">
            {[chamar ? `chamar de ${chamar}` : null, idade]
              .filter(Boolean)
              .join(" · ")}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {tipoSanguineo && tipoSanguineo !== "desconhecido" && (
              <span className="carimbo text-tinta">
                Sangue {tipoSanguineo}
              </span>
            )}
            {alergiaTexto && (
              <span className="carimbo text-critico">
                Alergia {alergiaTexto}
              </span>
            )}
          </div>
        </div>

        <div className="hidden shrink-0 border-l border-linha pl-4 sm:block">
          <p className="rotulo">Código</p>
          <p className="dado mt-0.5 text-[13px] font-medium">{codigo}</p>
          <p className="mt-2 max-w-[9rem] text-[10.5px] leading-tight text-tinta-suave">
            Escaneie ou digite o código em saudecode.app
          </p>
        </div>
      </div>
    </div>
  );
}
