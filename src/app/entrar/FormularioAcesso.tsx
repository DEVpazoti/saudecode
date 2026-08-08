"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { criarClienteNavegador } from "@/lib/supabase/cliente";
import { rotuloCargo } from "@/lib/formato";
import type { Cargo, Hospital } from "@/lib/tipos";

type Aba = "entrar" | "criar";

const CARGOS: Cargo[] = [
  "enfermeiro",
  "tecnico",
  "medico",
  "assistente_social",
  "recepcao",
];

/** Traduz os erros do Supabase para algo que diga o que fazer. */
function mensagemDeErro(bruto: string): string {
  const m = bruto.toLowerCase();
  if (m.includes("invalid login credentials"))
    return "E-mail ou senha não conferem. Verifique e tente de novo.";
  if (m.includes("email not confirmed"))
    return "Esta conta ainda não foi confirmada. No Supabase, desmarque “Confirm email” em Authentication › Sign In / Providers.";
  if (m.includes("already registered") || m.includes("already been registered"))
    return "Já existe uma conta com este e-mail. Use a aba Entrar.";
  if (m.includes("password should be"))
    return "A senha precisa ter pelo menos 6 caracteres.";
  if (m.includes("rate limit") || m.includes("too many"))
    return "Muitas tentativas seguidas. Espere um minuto e tente de novo.";
  return bruto;
}

export function FormularioAcesso({
  hospitais,
  proximo,
}: {
  hospitais: Hospital[];
  proximo?: string;
}) {
  const router = useRouter();
  const [aba, setAba] = useState<Aba>("entrar");
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  async function enviar(evento: React.FormEvent<HTMLFormElement>) {
    evento.preventDefault();
    setErro(null);
    setAviso(null);
    setEnviando(true);

    const dados = new FormData(evento.currentTarget);
    const email = String(dados.get("email") ?? "").trim();
    const senha = String(dados.get("senha") ?? "");
    const supabase = criarClienteNavegador();

    try {
      if (aba === "criar") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            data: {
              nome: String(dados.get("nome") ?? "").trim(),
              cargo: String(dados.get("cargo") ?? "enfermeiro"),
              registro: String(dados.get("registro") ?? "").trim(),
              hospital_id: String(dados.get("hospital_id") ?? ""),
            },
          },
        });

        if (error) {
          setErro(mensagemDeErro(error.message));
          return;
        }

        // Com confirmação de e-mail ligada, o Supabase não devolve sessão.
        if (!data.session) {
          setAviso(
            "Conta criada. Confirme o e-mail para entrar — ou desligue “Confirm email” no painel do Supabase e volte à aba Entrar.",
          );
          return;
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: senha,
        });
        if (error) {
          setErro(mensagemDeErro(error.message));
          return;
        }
      }

      router.push(proximo && proximo.startsWith("/") ? proximo : "/painel");
      router.refresh();
    } catch {
      setErro(
        "Não foi possível falar com o servidor. Verifique a conexão e as chaves do Supabase.",
      );
    } finally {
      setEnviando(false);
    }
  }

  const criando = aba === "criar";

  return (
    <div>
      <h1 className="text-[28px] leading-tight">
        {criando ? "Criar acesso da equipe" : "Acesso da equipe"}
      </h1>
      <p className="mt-2 text-[14.5px] text-tinta-media">
        {criando
          ? "Vincule seu acesso à unidade em que você atende."
          : "Entre com o e-mail cadastrado pela sua unidade."}
      </p>

      {/* Abas */}
      <div
        role="tablist"
        aria-label="Tipo de acesso"
        className="mt-7 flex border-b border-linha"
      >
        {(
          [
            ["entrar", "Entrar"],
            ["criar", "Criar acesso"],
          ] as const
        ).map(([valor, texto]) => (
          <button
            key={valor}
            type="button"
            role="tab"
            aria-selected={aba === valor}
            onClick={() => {
              setAba(valor);
              setErro(null);
              setAviso(null);
            }}
            className={`-mb-px border-b-2 px-4 py-2 text-[14px] transition-colors ${
              aba === valor
                ? "border-carbono font-medium text-tinta"
                : "border-transparent text-tinta-suave hover:text-tinta"
            }`}
          >
            {texto}
          </button>
        ))}
      </div>

      <form onSubmit={enviar} className="mt-6 flex flex-col gap-4">
        {criando && (
          <>
            <Campo rotulo="Nome completo" nome="nome" obrigatorio>
              <input
                id="nome"
                name="nome"
                type="text"
                required
                autoComplete="name"
                className="campo"
                placeholder="Ana Beatriz Souza"
              />
            </Campo>

            <div className="grid gap-4 sm:grid-cols-2">
              <Campo rotulo="Função" nome="cargo" obrigatorio>
                <select id="cargo" name="cargo" className="campo" defaultValue="enfermeiro">
                  {CARGOS.map((c) => (
                    <option key={c} value={c}>
                      {rotuloCargo[c]}
                    </option>
                  ))}
                </select>
              </Campo>

              <Campo rotulo="COREN / CRM" nome="registro">
                <input
                  id="registro"
                  name="registro"
                  type="text"
                  className="campo"
                  placeholder="COREN-SP 123456"
                />
              </Campo>
            </div>

            <Campo rotulo="Unidade" nome="hospital_id" obrigatorio>
              <select id="hospital_id" name="hospital_id" required className="campo" defaultValue="">
                <option value="" disabled>
                  Selecione a unidade
                </option>
                {hospitais.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.nome}
                    {h.municipio ? ` — ${h.municipio}/${h.uf}` : ""}
                  </option>
                ))}
              </select>
              {hospitais.length === 0 && (
                <p className="mt-1.5 text-[12.5px] text-atencao">
                  Nenhuma unidade cadastrada. Rode o supabase/seed.sql para
                  carregar as unidades de demonstração.
                </p>
              )}
            </Campo>
          </>
        )}

        <Campo rotulo="E-mail" nome="email" obrigatorio>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="campo"
            placeholder="ana.souza@hospital.sp.gov.br"
          />
        </Campo>

        <Campo rotulo="Senha" nome="senha" obrigatorio>
          <input
            id="senha"
            name="senha"
            type="password"
            required
            minLength={6}
            autoComplete={criando ? "new-password" : "current-password"}
            className="campo"
            placeholder="Mínimo de 6 caracteres"
          />
        </Campo>

        {erro && (
          <p
            role="alert"
            className="border border-critico/35 bg-critico-veu px-3.5 py-2.5 text-[13.5px] leading-relaxed text-critico"
          >
            {erro}
          </p>
        )}

        {aviso && (
          <p
            role="status"
            className="border border-atencao/35 bg-atencao-veu px-3.5 py-2.5 text-[13.5px] leading-relaxed text-atencao"
          >
            {aviso}
          </p>
        )}

        <button
          type="submit"
          disabled={enviando}
          className="botao botao-carbono mt-1 w-full py-2.5"
        >
          {enviando
            ? "Aguarde…"
            : criando
              ? "Criar acesso e entrar"
              : "Entrar"}
        </button>
      </form>

      {!criando && (
        <p className="mt-5 text-[13.5px] leading-relaxed text-tinta-suave">
          Primeira vez rodando o protótipo? Use{" "}
          <button
            type="button"
            onClick={() => setAba("criar")}
            className="text-carbono underline underline-offset-2"
          >
            Criar acesso
          </button>{" "}
          para gerar a conta da equipe.
        </p>
      )}
    </div>
  );
}

function Campo({
  rotulo,
  nome,
  obrigatorio = false,
  children,
}: {
  rotulo: string;
  nome: string;
  obrigatorio?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={nome} className="rotulo mb-1.5 block">
        {rotulo}
        {obrigatorio && <span className="text-critico"> *</span>}
      </label>
      {children}
    </div>
  );
}
