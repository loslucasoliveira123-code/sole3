import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const CONVITE_KEY = "sole3_convite_pendente";

export type Membro = { user_id: string; nome: string };
export type Casal = { id: string; meuId: string; membros: Membro[] };
export type Lancamento = {
  id: string;
  tipo: "receita" | "despesa";
  titulo: string;
  categoria: string;
  valor: number;
  data: string;
  pagador: string;
  projeto_id: string | null;
};
export type Projeto = {
  id: string;
  nome: string;
  descricao: string;
  orcamento: number;
  prazo: string | null;
  status: string;
};
export type Meta = {
  id: string;
  nome: string;
  objetivo: number;
  atual: number;
  aporte: number;
  prazo: string | null;
};

export const categoriasDespesa = [
  "Moradia",
  "Alimentação",
  "Transporte",
  "Saúde",
  "Educação",
  "Lazer",
  "Compras",
  "Contas",
  "Investimento",
  "Outros",
];
export const categoriasReceita = ["Salário", "Projeto", "Rendimentos", "Presente", "Outros"];

async function carregarCasal(): Promise<Casal> {
  const { data: u } = await supabase.auth.getUser();
  if (!u.user) throw new Error("Sessão expirada");
  const pendente = typeof window !== "undefined" ? localStorage.getItem(CONVITE_KEY) : null;
  if (pendente) {
    localStorage.removeItem(CONVITE_KEY);
    const { error } = await supabase.rpc("aceitar_convite", { _codigo: pendente });
    if (error && typeof window !== "undefined") window.alert(error.message);
  }
  const { data: id, error } = await supabase.rpc("meu_casal");
  if (error) throw error;
  const { data: membros, error: e2 } = await supabase
    .from("casal_membros")
    .select("user_id,nome")
    .eq("casal_id", id as string)
    .order("created_at");
  if (e2) throw e2;
  return { id: id as string, meuId: u.user.id, membros: membros ?? [] };
}

export function useCasal() {
  return useQuery({ queryKey: ["casal"], queryFn: carregarCasal, staleTime: 60_000 });
}

export function nomeCasal(c?: Casal) {
  if (!c) return "";
  const nomes = c.membros.map((m) => m.nome.split(" ")[0]).filter(Boolean);
  return nomes.length ? nomes.join(" & ") : "Meu espaço";
}

const num = <T extends Record<string, unknown>>(row: T, keys: (keyof T)[]) => {
  const r = { ...row };
  for (const k of keys) r[k] = Number(r[k]) as never;
  return r;
};

export function useLancamentos(casalId?: string) {
  return useQuery({
    queryKey: ["lancamentos", casalId],
    enabled: !!casalId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lancamentos")
        .select("id,tipo,titulo,categoria,valor,data,pagador,projeto_id")
        .eq("casal_id", casalId!)
        .order("data", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r) => num(r, ["valor"])) as Lancamento[];
    },
  });
}

export function useProjetos(casalId?: string) {
  return useQuery({
    queryKey: ["projetos", casalId],
    enabled: !!casalId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("projetos")
        .select("id,nome,descricao,orcamento,prazo,status")
        .eq("casal_id", casalId!)
        .order("created_at");
      if (error) throw error;
      return (data ?? []).map((r) => num(r, ["orcamento"])) as Projeto[];
    },
  });
}

export function useMetas(casalId?: string) {
  return useQuery({
    queryKey: ["metas", casalId],
    enabled: !!casalId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("metas")
        .select("id,nome,objetivo,atual,aporte,prazo")
        .eq("casal_id", casalId!)
        .order("created_at");
      if (error) throw error;
      return (data ?? []).map((r) => num(r, ["objetivo", "atual", "aporte"])) as Meta[];
    },
  });
}

/** Generic mutation that invalidates a list after success. */
export function useSalvar<V>(chave: string, fn: (v: V) => PromiseLike<{ error: unknown }>) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (v: V) => {
      const { error } = await fn(v);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: [chave] }),
  });
}

export const mesAtual = () => new Date().toISOString().slice(0, 7);

export function dataCurta(iso: string) {
  const [y = 0, m = 1, d = 1] = iso.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export function mesLongo(iso: string | null) {
  if (!iso) return "Sem prazo";
  const [y = 0, m = 1] = iso.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("pt-BR", { month: "short", year: "numeric" });
}

export function gastoProjeto(lista: Lancamento[], id: string) {
  let gasto = 0;
  let receita = 0;
  for (const l of lista) {
    if (l.projeto_id !== id) continue;
    if (l.tipo === "despesa") gasto += l.valor;
    else receita += l.valor;
  }
  return { gasto, receita };
}
