import type { Alerta } from "@/lib/alertas";
import type { Severidade } from "@/lib/tipos";

const ESTILO: Record<Severidade, { caixa: string; texto: string; rotulo: string }> = {
  critico: {
    caixa: "border-critico/35 bg-critico-veu",
    texto: "text-critico",
    rotulo: "Crítico",
  },
  atencao: {
    caixa: "border-atencao/35 bg-atencao-veu",
    texto: "text-atencao",
    rotulo: "Atenção",
  },
  info: {
    caixa: "border-linha bg-folha-2",
    texto: "text-tinta-media",
    rotulo: "Registro",
  },
};

const ORIGEM: Record<Alerta["origem"], string> = {
  fixado: "fixado pela equipe",
  padrao: "padrão no histórico",
  registro: "do cadastro",
};

/**
 * A faixa que abre o prontuário — o carimbo na capa da pasta.
 * Ordenada por severidade, nunca por data.
 */
export function FaixaAlertas({ alertas }: { alertas: Alerta[] }) {
  if (alertas.length === 0) {
    return (
      <div className="border border-linha bg-folha-2 px-4 py-3 text-[14px] text-tinta-media">
        Nenhum alerta registrado até agora.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {alertas.map((alerta) => {
        const estilo = ESTILO[alerta.severidade];
        return (
          <div
            key={alerta.chave}
            className={`border border-l-[3px] px-4 py-3 ${estilo.caixa}`}
          >
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <span className={`carimbo ${estilo.texto}`}>{estilo.rotulo}</span>
              <p className={`text-[15px] leading-snug font-semibold ${estilo.texto}`}>
                {alerta.titulo}
              </p>
            </div>
            {alerta.detalhe && (
              <p className="mt-1.5 text-[13.5px] leading-relaxed text-tinta-media">
                {alerta.detalhe}
              </p>
            )}
            <p className="rotulo mt-1.5">{ORIGEM[alerta.origem]}</p>
          </div>
        );
      })}
    </div>
  );
}
