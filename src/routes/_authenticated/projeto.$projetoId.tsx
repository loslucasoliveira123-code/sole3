import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowLeft, Pencil, Plus } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { NovoLancamento, NovoProjeto } from "@/components/Forms";
import { ListaLanc } from "@/components/ListaLanc";
import { useCasal, useProjetos, useLancamentos, gastoProjeto, mesLongo, type Lancamento } from "@/lib/casal";
import { brl } from "@/lib/sole-data";

export const Route = createFileRoute("/_authenticated/projeto/$projetoId")({
  head: () => ({ meta: [
    { title: "Detalhes do projeto — SOLE3" },
    { name: "description", content: "Orçamento, receitas, despesas, categorias e todos os movimentos do seu projeto na SOLE3." },
    { property: "og:title", content: "Detalhes do projeto — SOLE3" },
    { property: "og:description", content: "Acompanhe os resultados financeiros e os movimentos do projeto." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ] }),
  component: DetalhesProjeto,
});

function DetalhesProjeto() {
  const { projetoId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: casal, isLoading: carregandoCasal, error: erroCasal } = useCasal();
  const { data: projetos = [], isLoading, error } = useProjetos(casal?.id);
  const { data: todos = [], isLoading: carregandoMovimentos, error: erroMovimentos } = useLancamentos(casal?.id);
  const [editando, setEditando] = useState(false);
  const [novo, setNovo] = useState(false);
  const [selecionado, setSelecionado] = useState<Lancamento | null>(null);
  const [filtro, setFiltro] = useState("Tudo");
  const [busca, setBusca] = useState("");
  const projeto = projetos.find((p) => p.id === projetoId);
  if (erroCasal || error || erroMovimentos) return <AppShell><p role="alert" className="mt-7 text-destructive">Não foi possível carregar o projeto.</p><Button variant="outline" className="mt-3" onClick={() => { void qc.invalidateQueries(); }}>Tentar novamente</Button></AppShell>;
  if (carregandoCasal || isLoading || carregandoMovimentos) return <AppShell><p role="status" className="mt-7 text-muted-foreground">Carregando projeto…</p></AppShell>;
  if (!projeto) return <AppShell><h1 className="mt-7 font-display text-2xl">Projeto não encontrado</h1><Button asChild variant="outline" className="mt-4"><Link to="/projetos">Voltar aos projetos</Link></Button></AppShell>;

  const movimentos = todos.filter((m) => m.projeto_id === projeto.id);
  const { gasto, receita } = gastoProjeto(movimentos, projeto.id);
  const pct = projeto.orcamento > 0 ? gasto / projeto.orcamento * 100 : 0;
  const categorias = new Map<string, number>();
  const pessoas = new Map<string, { receita: number; despesa: number }>();
  const meses = new Map<string, { receita: number; despesa: number }>();
  for (const m of movimentos) {
    if (m.tipo === "despesa") categorias.set(m.categoria, (categorias.get(m.categoria) ?? 0) + m.valor);
    const pessoa = pessoas.get(m.pagador) ?? { receita: 0, despesa: 0 };
    pessoa[m.tipo] += m.valor;
    pessoas.set(m.pagador, pessoa);
    const mes = m.data.slice(0, 7);
    const fluxo = meses.get(mes) ?? { receita: 0, despesa: 0 };
    fluxo[m.tipo] += m.valor;
    meses.set(mes, fluxo);
  }
  const lista = movimentos.filter((m) => (filtro === "Tudo" || m.tipo === (filtro === "Receitas" ? "receita" : "despesa")) && `${m.titulo} ${m.categoria} ${m.pagador}`.toLocaleLowerCase("pt-BR").includes(busca.toLocaleLowerCase("pt-BR")));

  return <AppShell>
    <Button asChild variant="ghost" className="mt-5 px-0 text-muted-foreground"><Link to="/projetos"><ArrowLeft className="size-4" /> Projetos</Link></Button>
    <div className="mt-3 flex items-start justify-between gap-3">
      <div className="min-w-0"><p className="text-xs text-accent">{projeto.status}</p><h1 className="mt-1 break-words font-display text-[30px] leading-tight">{projeto.nome}</h1></div>
      <Button variant="ghost" size="icon" title="Editar projeto" aria-label="Editar projeto" onClick={() => setEditando(true)}><Pencil className="size-4" /></Button>
    </div>
    {projeto.descricao && <p className="mt-3 break-words text-sm text-muted-foreground">{projeto.descricao}</p>}
    <p className="mt-2 text-xs text-muted-foreground">Prazo: {mesLongo(projeto.prazo)} · {movimentos.length} movimentos</p>

    <section className="mt-6 border-y border-border py-5">
      <h2 className="font-display text-xl">Resumo financeiro</h2>
      <dl className="mt-4 grid grid-cols-2 gap-x-3 gap-y-5">
        {[
          ["Orçamento", projeto.orcamento], ["Disponível no orçamento", projeto.orcamento - gasto],
          ["Receitas", receita], ["Despesas", gasto], ["Resultado", receita - gasto],
        ].map(([label, valor]) => <div key={String(label)} className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className={`mt-1 break-words text-lg font-medium ${Number(valor) < 0 ? "text-destructive" : label === "Receitas" ? "text-success" : ""}`}>{brl(Number(valor))}</dd></div>)}
      </dl>
      {projeto.orcamento > 0 ? <div className="mt-5"><p className={`text-xs ${pct > 100 ? "text-destructive" : "text-muted-foreground"}`}>{Math.round(pct)}% do orçamento utilizado{pct > 100 ? ` · Excedido em ${brl(gasto - projeto.orcamento)}` : ""}</p><progress aria-label="Orçamento utilizado" max={100} value={Math.min(100, pct)} className="mt-2 h-2 w-full accent-accent" /></div> : <p className="mt-4 text-xs text-muted-foreground">Orçamento não definido</p>}
    </section>

    {categorias.size > 0 && <section className="mt-6"><h2 className="font-display text-xl">Despesas por categoria</h2><div className="mt-4 space-y-3">{[...categorias].sort((a,b) => b[1] - a[1]).map(([nome, valor]) => <div key={nome}><div className="flex justify-between gap-2 text-xs"><span>{nome}</span><span className="text-muted-foreground">{brl(valor)} · {Math.round(valor / gasto * 100)}%</span></div><progress aria-label={`Participação de ${nome}`} value={valor} max={gasto} className="mt-1 h-1.5 w-full accent-accent" /></div>)}</div></section>}

    {meses.size > 0 && <section className="mt-6"><h2 className="font-display text-xl">Fluxo mensal</h2><div className="mt-3 overflow-x-auto"><table className="w-full text-left text-xs"><thead className="text-muted-foreground"><tr><th className="py-2 font-normal">Mês</th><th className="py-2 text-right font-normal">Receitas</th><th className="py-2 text-right font-normal">Despesas</th></tr></thead><tbody>{[...meses].sort((a,b) => a[0].localeCompare(b[0])).map(([mes, valores]) => <tr key={mes} className="border-t border-border"><td className="py-3">{mesLongo(mes)}</td><td className="py-3 text-right text-success">{brl(valores.receita)}</td><td className="py-3 text-right">{brl(valores.despesa)}</td></tr>)}</tbody></table></div></section>}

    {pessoas.size > 0 && <section className="mt-6"><h2 className="font-display text-xl">Por pessoa</h2><div className="mt-3 divide-y divide-border">{[...pessoas].map(([nome, valores]) => <div key={nome} className="py-3"><p className="break-words text-sm font-medium">{nome}</p><p className="mt-1 text-xs text-muted-foreground">Receitas {brl(valores.receita)} · Despesas {brl(valores.despesa)}</p></div>)}</div></section>}

    <section className="mt-6">
      <div className="flex items-center justify-between gap-2"><h2 className="font-display text-xl">Movimentos do projeto</h2><Button variant="outline" size="icon" title="Novo lançamento no projeto" aria-label="Novo lançamento no projeto" onClick={() => setNovo(true)}><Plus className="size-4" /></Button></div>
      {movimentos.length > 0 ? <><input aria-label="Buscar movimentos do projeto" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar" className="mt-4 w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-sm" /><div className="mt-3 flex gap-2">{["Tudo", "Receitas", "Despesas"].map((f) => <Button key={f} variant={filtro === f ? "default" : "secondary"} size="sm" aria-pressed={filtro === f} onClick={() => setFiltro(f)}>{f}</Button>)}</div><ListaLanc itens={lista} onSelect={setSelecionado} />{lista.length === 0 && <p className="mt-4 text-sm text-muted-foreground">Nenhum movimento encontrado.</p>}</> : <p className="mt-4 text-sm text-muted-foreground">Nenhum lançamento neste projeto.</p>}
    </section>
    <NovoLancamento open={novo} projetoId={projeto.id} onClose={() => setNovo(false)} />
    <NovoLancamento open={Boolean(selecionado)} lancamento={selecionado} onClose={() => setSelecionado(null)} />
    <NovoProjeto open={editando} projeto={projeto} onClose={() => setEditando(false)} onDeleted={() => { void qc.invalidateQueries({ queryKey: ["lancamentos"] }); void navigate({ to: "/projetos" }); }} />
  </AppShell>;
}