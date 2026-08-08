import Link from "next/link";
import { Marca } from "./Marca";

const PASSOS = [
  {
    titulo: "Crie um projeto no Supabase",
    detalhe:
      "Em supabase.com, crie um projeto novo. Escolha a região South America (São Paulo) para o banco ficar perto de quem vai usar.",
  },
  {
    titulo: "Rode o esquema do banco",
    detalhe:
      "No SQL Editor do projeto, cole e execute o conteúdo de supabase/schema.sql. Depois faça o mesmo com supabase/seed.sql para carregar os pacientes de demonstração.",
  },
  {
    titulo: "Desligue a confirmação por e-mail",
    detalhe:
      "Em Authentication › Sign In / Providers › Email, desmarque “Confirm email”. Sem isso, a conta criada no primeiro acesso fica pendente e não entra.",
  },
  {
    titulo: "Copie as chaves para .env.local",
    detalhe:
      "Em Project Settings › API, copie a Project URL e a chave anon public para NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY. Reinicie o npm run dev depois de salvar.",
  },
];

export function AvisoConfiguracao() {
  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-8 w-fit">
        <Marca />
      </Link>

      <div className="folha-pilha p-7 sm:p-9">
        <p className="rotulo mb-3">Configuração pendente</p>
        <h1 className="text-2xl sm:text-[27px]">
          Falta conectar o banco de dados
        </h1>
        <p className="mt-3 max-w-prose text-tinta-media">
          O SaudeCode guarda os prontuários no Supabase. Quatro passos e o
          sistema sobe com os dados de demonstração já carregados.
        </p>

        <ol className="mt-7 flex flex-col">
          {PASSOS.map((passo, i) => (
            <li key={passo.titulo} className="pauta flex gap-4 py-4">
              <span className="dado mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center border border-linha-forte text-[12px] text-tinta-media">
                {i + 1}
              </span>
              <div>
                <p className="font-medium">{passo.titulo}</p>
                <p className="mt-1 text-[14px] leading-relaxed text-tinta-media">
                  {passo.detalhe}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-7 border border-linha bg-folha-2 p-4">
          <p className="rotulo mb-2">.env.local</p>
          <pre className="dado overflow-x-auto text-[12.5px] leading-relaxed text-tinta-media">
{`NEXT_PUBLIC_SUPABASE_URL=https://seu-projeto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...`}
          </pre>
        </div>
      </div>

      <p className="mt-6 text-[13.5px] text-tinta-suave">
        O passo a passo completo, incluindo o deploy na Vercel, está no{" "}
        <span className="dado">README.md</span> do projeto.
      </p>
    </main>
  );
}
