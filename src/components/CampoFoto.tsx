"use client";

import { useRef, useState } from "react";
import { criarClienteNavegador } from "@/lib/supabase/cliente";
import { Foto } from "./Foto";

const BUCKET = "fotos-pacientes";
const LIMITE_MB = 8;

/**
 * Retrato de identificação.
 *
 * No celular, `capture` abre a câmera direto — é assim que a foto costuma
 * ser tirada, na maca, com o aparelho do plantão. O upload acontece na
 * hora e o formulário guarda só a URL.
 */
export function CampoFoto({
  nome,
  inicial,
}: {
  nome: string;
  inicial?: string | null;
}) {
  const entrada = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState<string | null>(inicial ?? null);
  const [previa, setPrevia] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function selecionar(evento: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = evento.target.files?.[0];
    if (!arquivo) return;

    setErro(null);

    if (arquivo.size > LIMITE_MB * 1024 * 1024) {
      setErro(`A imagem tem mais de ${LIMITE_MB} MB. Tire outra foto com resolução menor.`);
      return;
    }

    setPrevia(URL.createObjectURL(arquivo));
    setEnviando(true);

    try {
      const supabase = criarClienteNavegador();
      const extensao = arquivo.name.split(".").pop()?.toLowerCase() ?? "jpg";
      const caminho = `${crypto.randomUUID()}.${extensao}`;

      const { error } = await supabase.storage
        .from(BUCKET)
        .upload(caminho, arquivo, { cacheControl: "3600", upsert: false });

      if (error) {
        setErro(
          error.message.includes("Bucket not found")
            ? "O bucket fotos-pacientes não existe. Rode o supabase/schema.sql para criá-lo."
            : `Não foi possível enviar a foto: ${error.message}`,
        );
        setPrevia(null);
        return;
      }

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(caminho);
      setUrl(data.publicUrl);
    } finally {
      setEnviando(false);
    }
  }

  function remover() {
    setUrl(null);
    setPrevia(null);
    setErro(null);
    if (entrada.current) entrada.current.value = "";
  }

  const mostrando = previa ?? url;

  return (
    <div className="flex items-start gap-4">
      <input type="hidden" name="foto_url" value={url ?? ""} />

      {mostrando ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mostrando}
          alt="Retrato de identificação"
          className={`h-[104px] w-[104px] shrink-0 rounded-[3px] border border-linha-forte object-cover ${
            enviando ? "opacity-50" : ""
          }`}
        />
      ) : (
        <Foto nome={nome || "?"} tamanho={104} />
      )}

      <div className="min-w-0 flex-1">
        <p className="rotulo mb-1.5">Retrato de identificação</p>

        <input
          ref={entrada}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={selecionar}
          className="sr-only"
          id="arquivo-foto"
        />

        <div className="flex flex-wrap gap-2">
          <label
            htmlFor="arquivo-foto"
            className="botao botao-vazado cursor-pointer text-[13.5px]"
          >
            {enviando ? "Enviando…" : mostrando ? "Trocar foto" : "Tirar ou escolher foto"}
          </label>
          {mostrando && !enviando && (
            <button
              type="button"
              onClick={remover}
              className="botao botao-vazado text-[13.5px]"
            >
              Remover
            </button>
          )}
        </div>

        <p className="mt-2 max-w-sm text-[12.5px] leading-relaxed text-tinta-suave">
          É o que permite reconhecer a pessoa quando a pulseira sumiu e ela não
          consegue dizer o nome. Peça permissão antes de fotografar.
        </p>

        {erro && (
          <p role="alert" className="mt-2 text-[12.5px] text-critico">
            {erro}
          </p>
        )}
      </div>
    </div>
  );
}
