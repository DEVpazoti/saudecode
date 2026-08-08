import Link from "next/link";
import { Marca } from "@/components/Marca";

export default function NaoEncontrado() {
  return (
    <main className="mx-auto flex min-h-screen max-w-lg flex-col justify-center px-6 py-16">
      <Link href="/" className="mb-8 w-fit">
        <Marca />
      </Link>

      <div className="folha p-7">
        <p className="rotulo">Página não encontrada</p>
        <h1 className="mt-3 text-[26px] leading-tight">
          Este endereço não existe no sistema
        </h1>
        <p className="mt-3 text-[14.5px] leading-relaxed text-tinta-media">
          O cadastro pode ter sido removido, ou o link veio incompleto.
        </p>

        <div className="mt-6 flex flex-wrap gap-2.5">
          <Link href="/painel" className="botao botao-carbono">
            Ir ao painel
          </Link>
          <Link href="/pacientes" className="botao botao-vazado">
            Buscar uma pessoa
          </Link>
        </div>
      </div>
    </main>
  );
}
