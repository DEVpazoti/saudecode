"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { extrairCodigo } from "@/lib/codigo";

type Estado = "parado" | "iniciando" | "lendo" | "erro";

const ALVO = "leitor-qr";

export function Leitor() {
  const router = useRouter();
  const [estado, setEstado] = useState<Estado>("parado");
  const [erro, setErro] = useState<string | null>(null);
  const [manual, setManual] = useState("");
  const [erroManual, setErroManual] = useState<string | null>(null);

  // Guarda a instância para conseguir parar a câmera ao sair da tela.
  const leitor = useRef<{ stop: () => Promise<void>; clear: () => void } | null>(
    null,
  );
  const lido = useRef(false);

  useEffect(() => {
    return () => {
      const atual = leitor.current;
      leitor.current = null;
      atual?.stop().then(() => atual.clear()).catch(() => {});
    };
  }, []);

  async function iniciar() {
    setErro(null);
    setEstado("iniciando");
    lido.current = false;

    try {
      // Só no navegador: a biblioteca toca em document ao ser carregada.
      const { Html5Qrcode } = await import("html5-qrcode");
      const instancia = new Html5Qrcode(ALVO);
      leitor.current = instancia;

      await instancia.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 230, height: 230 } },
        (texto) => {
          if (lido.current) return;
          const codigo = extrairCodigo(texto);
          if (!codigo) return;

          lido.current = true;
          instancia
            .stop()
            .catch(() => {})
            .finally(() => router.push(`/p/${codigo}`));
        },
        () => {
          // Quadro sem QR legível — normal, não é erro.
        },
      );

      setEstado("lendo");
    } catch (falha) {
      leitor.current = null;
      setEstado("erro");
      const mensagem = falha instanceof Error ? falha.message : String(falha);
      setErro(
        /permission|denied|notallowed/i.test(mensagem)
          ? "A câmera foi bloqueada pelo navegador. Libere o acesso nas permissões do site e tente de novo — ou digite o código à mão abaixo."
          : /notfound|no camera|devices/i.test(mensagem)
            ? "Nenhuma câmera encontrada neste aparelho. Use a digitação do código abaixo."
            : `Não foi possível abrir a câmera: ${mensagem}`,
      );
    }
  }

  async function parar() {
    const atual = leitor.current;
    leitor.current = null;
    if (atual) {
      await atual.stop().catch(() => {});
      atual.clear();
    }
    setEstado("parado");
  }

  function enviarManual(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    const codigo = extrairCodigo(manual);
    if (!codigo) {
      setErroManual(
        "Código fora do formato. Ele tem a forma SC-0000-0000, como está impresso na pulseira.",
      );
      return;
    }
    router.push(`/p/${codigo}`);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ------------------------------------------------ câmera */}
      <section className="folha p-5">
        <h2 className="text-[19px]">Ler a pulseira</h2>
        <p className="mt-1.5 max-w-prose text-[13.5px] leading-relaxed text-tinta-media">
          Aponte a câmera para o QR Code. O prontuário abre sozinho assim que o
          código for reconhecido.
        </p>

        {/* Visor: molduras de corte nos quatro cantos */}
        <div className="relative mx-auto mt-5 aspect-square w-full max-w-sm border border-linha-forte bg-papel-fundo">
          <div id={ALVO} className="h-full w-full overflow-hidden" />

          {estado !== "lendo" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center">
              <p className="text-[14px] leading-relaxed text-tinta-media">
                {estado === "iniciando"
                  ? "Abrindo a câmera…"
                  : "A câmera fica desligada até você pedir."}
              </p>
              {estado !== "iniciando" && (
                <button type="button" onClick={iniciar} className="botao botao-carbono">
                  Ligar a câmera
                </button>
              )}
            </div>
          )}

          {[
            "top-0 left-0 border-t-2 border-l-2",
            "top-0 right-0 border-t-2 border-r-2",
            "bottom-0 left-0 border-b-2 border-l-2",
            "bottom-0 right-0 border-b-2 border-r-2",
          ].map((posicao) => (
            <span
              key={posicao}
              aria-hidden="true"
              className={`pointer-events-none absolute h-6 w-6 border-tinta ${posicao}`}
            />
          ))}
        </div>

        {estado === "lendo" && (
          <div className="mt-4 flex justify-center">
            <button type="button" onClick={parar} className="botao botao-vazado">
              Desligar a câmera
            </button>
          </div>
        )}

        {erro && (
          <p
            role="alert"
            className="mt-4 border border-atencao/35 bg-atencao-veu px-4 py-3 text-[13.5px] leading-relaxed text-atencao"
          >
            {erro}
          </p>
        )}
      </section>

      {/* ------------------------------------------------ digitação */}
      <section className="folha p-5">
        <h2 className="text-[19px]">Digitar o código</h2>
        <p className="mt-1.5 max-w-prose text-[13.5px] leading-relaxed text-tinta-media">
          Para quando o QR está gasto, sujo ou rasgado — o que acontece com
          frequência depois de algumas semanas no pulso.
        </p>

        <form onSubmit={enviarManual} className="mt-4 flex flex-col gap-2 sm:flex-row">
          <input
            value={manual}
            onChange={(e) => {
              setManual(e.target.value.toUpperCase());
              setErroManual(null);
            }}
            className="campo dado uppercase"
            placeholder="SC-0000-0000"
            aria-label="Código da pulseira"
            autoComplete="off"
            spellCheck={false}
          />
          <button type="submit" className="botao shrink-0">
            Abrir prontuário
          </button>
        </form>

        {erroManual && (
          <p role="alert" className="mt-2 text-[13px] text-critico">
            {erroManual}
          </p>
        )}
      </section>
    </div>
  );
}
