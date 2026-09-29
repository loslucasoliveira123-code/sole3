import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { NovoLancamento, Vazio } from "@/components/Forms";
import { brl } from "@/lib/sole-data";
import { gastoProjeto, nomeCasal, useCasal, useLancamentos, useMetas, useProjetos } from "@/lib/casal";
import { calcularTotais } from "@/lib/totais";
import { ListaLanc } from "@/components/ListaLanc";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "Painel — SOLE3" },
      { name: "description", content: "Patrimônio, saldo, orçamento e SOLE Score do casal calculados a partir dos seus lançamentos." },
      { property: "og:title", content: "Painel — SOLE3" },
      { property: "og:description", content: "O dinheiro do casal, organizado." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [espaco, setEspaco] = useState<"casal" | "projetos">("casal");
  const [novo, setNovo] = useState(false);
  const { data: casal } = useCasal();
  const { data: lanc = [], isLoading } = useLancamentos(casal?.id);
  const { data: metas = [] } = useMetas(casal?.id);
  const { data: projetos = [] } = useProjetos(casal?.id);
  const t = calcularTotais(lanc, metas, projetos);
  const mes = new Date().toLocaleDateString("pt-BR", { month: "long" });

  return (
    <AppShell>
      <div className="mt-7 rise">
        <p className="text-[13px] text-muted-foreground">Olá</p>
        <h1 className="mt-1 font-display text-[38px] leading-none tracking-tight text-balance">{nomeCasal(casal) || "…"}</h1>
      </div>

      <div className="-mx-5 mt-5 flex gap-2 px-5">
        {(["casal", "projetos"] as const).map((e) => (
          <button key={e} type="button" onClick={() => setEspaco(e)}
            className={`rounded-[14px] px-4 py-2.5 text-[13px] font-medium ${espaco === e ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"}`}>
            {e === "casal" ? "Casal" : "Projetos"}
          </button>
        ))}
      </div>

      {!isLoading && casal && lanc.length === 0 && metas.length === 0 && projetos.length === 0 ? (
        <>
          <Vazio titulo="Adicione seu primeiro lançamento" texto="Registre uma receita ou despesa e o painel calcula patrimônio, saldo e SOLE Score automaticamente." acao="+ Novo lançamento" onAcao={() => setNovo(true)} />
          {casal.membros.length < 2 && (
            <Link to="/mais" className="mt-4 block text-center text-[13px] text-accent underline">Convidar minha parceira</Link>
          )}
        </>
      ) : espaco === "projetos" ? (
        <section className="mt-5 space-y-4">
          {projetos.length === 0 && <p className="text-[13px] text-muted-foreground">Nenhum projeto ainda. <Link to="/projetos" className="text-accent underline">Criar projeto</Link></p>}
          {projetos.map((p) => {
            const g = gastoProjeto(lanc, p.id);
            const pct = p.orcamento > 0 ? (g.gasto / p.orcamento) * 100 : 0;
            return (
              <div key={p.id} className="folio border border-border p-5">
                <div className="flex justify-between text-[14px]"><span className="font-medium">{p.nome}</span><span className="text-muted-foreground">{p.status}</span></div>
                <p className="mt-2 text-[13px] text-muted-foreground">{brl(g.gasto)} de {brl(p.orcamento)}</p>
                <div className="mt-2 h-1.5 rounded-full bg-border"><div className={`h-full rounded-full ${pct > 100 ? "bg-destructive" : pct > 80 ? "bg-warning" : "bg-success"}`} style={{ width: `${Math.min(100, pct)}%` }} /></div>
              </div>
            );
          })}
        </section>
      ) : (
        <>
          <section className="folio mt-5 bg-primary px-6 py-6 text-primary-foreground rise">
            <p className="eyebrow text-primary-foreground/55">Patrimônio</p>
            <p className="mt-2 font-display text-[44px] leading-none tracking-tight">{brl(t.patrimonio)}</p>
            <div className="mt-5 flex gap-6 border-t border-primary-foreground/15 pt-4 text-[13px]">
              <div><p className="text-primary-foreground/55">Saldo</p><p className="mt-0.5 font-medium">{brl(t.saldo)}</p></div>
              <div><p className="text-primary-foreground/55">Economia do mês</p><p className="mt-0.5 font-medium">{brl(t.economia)}</p></div>
              <div><p className="text-primary-foreground/55">Em metas</p><p className="mt-0.5 font-medium">{brl(t.guardado)}</p></div>
            </div>
          </section>

          <section className="mt-6">
            <h2 className="font-display text-[22px] tracking-tight">SOLE Score</h2>
            <div className="folio mt-4 flex items-center gap-6 border border-border px-6 py-6">
              <div className="relative size-[134px] shrink-0">
                <div className="size-[134px] rounded-full" style={{ background: `conic-gradient(var(--accent) 0 ${t.score}%, var(--border) ${t.score}% 100%)` }} />
                <div className="absolute inset-[14px] grid place-items-center rounded-full bg-background text-center">
                  <div><p className="font-display text-[42px] leading-none tracking-tight">{t.score}</p><p className="mt-1 text-[11px] text-muted-foreground">de 100</p></div>
                </div>
              </div>
              <div className="text-[13px] leading-relaxed text-muted-foreground">
                <p className="font-medium text-foreground">{t.scoreTitulo}</p>
                <p className="mt-2">{t.scoreTexto}</p>
              </div>
            </div>
          </section>

          <section className="folio mt-6 border border-border p-5">
            <div className="flex items-baseline justify-between"><h2 className="font-display text-[20px] tracking-tight">Fluxo do mês</h2><span className="text-[11px] capitalize text-muted-foreground">{mes}</span></div>
            <div className="mt-4 flex justify-between text-[13px] text-muted-foreground">
              <span>Receitas <span className="font-medium text-success">{brl(t.recMes)}</span></span>
              <span>Despesas <span className="font-medium text-foreground">{brl(t.despMes)}</span></span>
            </div>
          </section>

          <section className="mt-6">
            <h2 className="font-display text-[22px] tracking-tight">Orçamento do mês</h2>
            <p className="mt-1 text-[12px] text-muted-foreground">Gastos por categoria, em relação às receitas do mês.</p>
            <div className="mt-4 space-y-4">
              {t.orcamento.length === 0 && <p className="text-[13px] text-muted-foreground">Nenhuma despesa neste mês.</p>}
              {t.orcamento.map((o) => (
                <div key={o.categoria}>
                  <div className="flex justify-between text-[13px]"><span className="font-medium">{o.categoria}</span><span className="text-muted-foreground">{brl(o.usado)} · {Math.round(o.pct)}%</span></div>
                  <div className="mt-2 h-1.5 rounded-full bg-border"><div className={`h-full rounded-full ${o.pct > 40 ? "bg-destructive" : o.pct > 25 ? "bg-warning" : "bg-success"}`} style={{ width: `${Math.min(100, o.pct)}%` }} /></div>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-7">
            <div className="flex items-baseline justify-between"><h2 className="font-display text-[22px] tracking-tight">Movimentos</h2><Link to="/movimentos" className="text-[11px] text-muted-foreground">Ver tudo</Link></div>
            <ListaLanc itens={lanc.slice(0, 4)} />
          </section>
        </>
      )}
      <NovoLancamento open={novo} onClose={() => setNovo(false)} />
    </AppShell>
  );
}

