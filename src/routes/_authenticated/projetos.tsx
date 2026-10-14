import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { NovoProjeto, Vazio } from "@/components/Forms";
import { brl } from "@/lib/sole-data";
import { gastoProjeto, mesLongo, useCasal, useLancamentos, useProjetos, type Projeto } from "@/lib/casal";
import { Button } from "@/components/ui/button";
import { Pencil, ChevronRight } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/projetos")({
  head: () => ({
    meta: [
      { title: "Projetos — SOLE3" },
      { name: "description", content: "Projetos do casal com orçamento, prazo e gastos acompanhados." },
      { property: "og:title", content: "Projetos — SOLE3" },
      { property: "og:description", content: "Reforma, viagem ou negócio: orçamento e prazo sob controle." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Projetos,
});

function Projetos() {
  const [novo, setNovo] = useState(false);
  const [selecionado, setSelecionado] = useState<Projeto | null>(null);
  const qc = useQueryClient();
  const { data: casal } = useCasal();
  const { data: projetos = [], isLoading } = useProjetos(casal?.id);
  const { data: lanc = [] } = useLancamentos(casal?.id);

  return (
    <AppShell>
      <div className="flex items-end justify-between">
        <PageTitle eyebrow="Planejamento" title="Projetos" />
        {projetos.length > 0 && <Button type="button" onClick={() => setNovo(true)}>+ Projeto</Button>}
      </div>
      {!isLoading && projetos.length === 0 ? (
        <Vazio titulo="Nenhum projeto ainda" texto="Crie um projeto com orçamento e prazo. Depois ligue lançamentos a ele para acompanhar os gastos." acao="+ Criar projeto" onAcao={() => setNovo(true)} />
      ) : (
        <div className="mt-6 space-y-5">
          {projetos.map((p) => {
            const g = gastoProjeto(lanc, p.id);
            const pct = p.orcamento > 0 ? (g.gasto / p.orcamento) * 100 : 0;
            return (
              <article key={p.id} className="folio border border-border p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="min-w-0 break-words font-display text-[20px] leading-tight"><Link to="/projeto/$projetoId" params={{ projetoId: p.id }}>{p.nome}</Link></h2>
                  <Button type="button" size="icon" variant="ghost" aria-label={`Editar projeto ${p.nome}`} title="Editar projeto" onClick={() => setSelecionado(p)}><Pencil className="size-4" /></Button>
                </div>
                <span className="mt-1 inline-block text-[11px] text-muted-foreground">{p.status}</span>
                {p.descricao && <p className="mt-1 text-[13px] text-muted-foreground">{p.descricao}</p>}
                <div className="mt-4 flex items-baseline justify-between">
                  <p className="font-display text-[26px] leading-none tracking-tight">{brl(g.gasto)}</p>
                  <p className="text-[13px] text-muted-foreground">de {brl(p.orcamento)}</p>
                </div>
                <div className="mt-3 h-1.5 rounded-full bg-border"><div className={`h-full rounded-full ${pct > 100 ? "bg-destructive" : "bg-accent"}`} style={{ width: `${Math.min(100, pct)}%` }} /></div>
                <p className="mt-3 text-[12px] text-muted-foreground">Prazo: {mesLongo(p.prazo)}{g.receita > 0 ? ` · Receitas ${brl(g.receita)}` : ""}</p>
                 <Button asChild variant="ghost" className="mt-3 w-full justify-between px-0 text-accent"><Link to="/projeto/$projetoId" params={{ projetoId: p.id }}>Ver detalhes <ChevronRight className="size-4" /></Link></Button>
              </article>
            );
          })}
        </div>
      )}
      <NovoProjeto open={novo} onClose={() => setNovo(false)} />
      <NovoProjeto open={Boolean(selecionado)} projeto={selecionado} onClose={() => setSelecionado(null)} onDeleted={() => { void qc.invalidateQueries({ queryKey: ["lancamentos"] }); }} />
    </AppShell>
  );
}
