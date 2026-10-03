import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { NovoLancamento, Vazio } from "@/components/Forms";
import { brl } from "@/lib/sole-data";
import { useCasal, useLancamentos, type Lancamento } from "@/lib/casal";
import { ListaLanc } from "@/components/ListaLanc";

export const Route = createFileRoute("/_authenticated/movimentos")({
  head: () => ({
    meta: [
      { title: "Movimentos — SOLE3" },
      { name: "description", content: "Todas as receitas e despesas do casal com busca e filtros." },
      { property: "og:title", content: "Movimentos — SOLE3" },
      { property: "og:description", content: "Receitas e despesas do casal em um só lugar." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Movimentos,
});

const filtros = ["Tudo", "Receitas", "Despesas"] as const;

function Movimentos() {
  const [filtro, setFiltro] = useState<(typeof filtros)[number]>("Tudo");
  const [busca, setBusca] = useState("");
  const [novo, setNovo] = useState(false);
  const [selecionado, setSelecionado] = useState<Lancamento | null>(null);
  const { data: casal } = useCasal();
  const { data: todos = [], isLoading } = useLancamentos(casal?.id);

  const lista = useMemo(
    () => todos.filter((m) => {
      const ok = filtro === "Tudo" || (filtro === "Receitas" ? m.tipo === "receita" : m.tipo === "despesa");
      return ok && `${m.titulo} ${m.categoria} ${m.pagador}`.toLowerCase().includes(busca.toLowerCase());
    }),
    [todos, filtro, busca],
  );
  const entradas = lista.filter((m) => m.tipo === "receita").reduce((s, m) => s + m.valor, 0);
  const saidas = lista.filter((m) => m.tipo === "despesa").reduce((s, m) => s + m.valor, 0);

  return (
    <AppShell>
      <PageTitle eyebrow="Receitas e despesas" title="Movimentos" />
      {!isLoading && todos.length === 0 ? (
        <Vazio titulo="Adicione seu primeiro lançamento" texto="Tudo o que vocês registrarem aparece aqui." acao="+ Novo lançamento" onAcao={() => setNovo(true)} />
      ) : (
        <>
          <div className="folio mt-5 flex gap-6 border border-border px-5 py-4 text-[13px]">
            <div><p className="text-muted-foreground">Entradas</p><p className="mt-0.5 font-medium text-success">{brl(entradas)}</p></div>
            <div><p className="text-muted-foreground">Saídas</p><p className="mt-0.5 font-medium">{brl(saidas)}</p></div>
            <div><p className="text-muted-foreground">Resultado</p><p className="mt-0.5 font-medium">{brl(entradas - saidas)}</p></div>
          </div>
          <input value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar" className="mt-4 w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-[14px] outline-none" />
          <div className="mt-3 flex gap-2">
            {filtros.map((f) => (
              <button key={f} type="button" onClick={() => setFiltro(f)} className={`rounded-[14px] px-4 py-2 text-[13px] font-medium ${filtro === f ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>{f}</button>
            ))}
          </div>
          <ListaLanc itens={lista} onSelect={setSelecionado} />
        </>
      )}
      <NovoLancamento open={novo} onClose={() => setNovo(false)} />
      <NovoLancamento open={Boolean(selecionado)} lancamento={selecionado} onClose={() => setSelecionado(null)} />
    </AppShell>
  );
}
