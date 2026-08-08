import { redirect } from "next/navigation";
import { supabaseConfigurado } from "@/lib/ambiente";
import { AvisoConfiguracao } from "@/components/AvisoConfiguracao";
import { profissionalAtual } from "@/lib/supabase/servidor";
import { Navegacao } from "@/components/Navegacao";

// Tudo aqui depende da sessão e dos dados do momento: nada de cache estático.
export const dynamic = "force-dynamic";

export default async function LayoutSistema({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!supabaseConfigurado) return <AvisoConfiguracao />;

  const profissional = await profissionalAtual();
  if (!profissional) redirect("/entrar");

  return (
    <div className="min-h-screen lg:flex">
      <Navegacao profissional={profissional} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
