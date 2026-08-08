import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "@/lib/ambiente";
import type { Profissional } from "@/lib/tipos";

export async function criarClienteServidor() {
  const armazem = await cookies();

  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return armazem.getAll();
      },
      setAll(lista) {
        try {
          for (const { name, value, options } of lista) {
            armazem.set(name, value, options);
          }
        } catch {
          // Server Component não pode gravar cookie; o middleware já renova a sessão.
        }
      },
    },
  });
}

/** Profissional autenticado com a unidade em que trabalha, ou null. */
export async function profissionalAtual(): Promise<Profissional | null> {
  const supabase = await criarClienteServidor();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profissionais")
    .select("*, hospitais(*)")
    .eq("id", user.id)
    .maybeSingle();

  if (data) return data as Profissional;

  // Conta criada antes do gatilho existir: devolve um perfil mínimo
  // para não travar o acesso de quem já conseguiu entrar.
  return {
    id: user.id,
    nome: (user.user_metadata?.nome as string) ?? user.email ?? "Profissional",
    cargo: "enfermeiro",
    registro: null,
    hospital_id: null,
    hospitais: null,
  };
}
