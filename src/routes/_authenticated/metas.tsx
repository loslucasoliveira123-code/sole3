import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { Aportar, NovaMeta, Vazio } from "@/components/Forms";
import { brl } from "@/lib/sole-data";
import { mesLongo, useCasal, useMetas, type Meta } from "@/lib/casal";

export const Route = createFileRoute("/_authenticated/metas")({
  head: () => ({
    meta: [
      { title: "Metas — SOLE3" },
      { name: "description", content: "Objetivos financeiros do casal com valor acumulado, aporte mensal e prazo." },
      { property: "og:title", content: "Metas — SOLE3" },
      { property: "og:description", content: "Acompanhe cada objetivo do casal até a conclusão." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Metas,
});

function Metas() {
  const [novo, setNovo] = useState(false);
  const [aportar, setAportar] = useState<Meta | null>(null);
  const { data: casal } = useCasal();
  const { data: metas = [], isLoading } = useMetas(casal?.id);
  const total = metas.reduce((s, m) => s + m.objetivo, 0);
  const acumulado = metas.reduce((s, m) => s + m.atual, 0);

  return (
    <AppShell>
      <div className="flex items-end justify-between">
        <PageTitle eyebrow="Objetivos" title="Metas" />
        {metas.length > 0 && <button type="button" onClick={() => setNovo(true)} className="rounded-2xl bg-primary px-4 py-2.5 text-[13px] font-medium text-primary-foreground">+ Meta</button>}
      </div>
      {!isLoading && metas.length === 0 ? (
        <Vazio titulo="Nenhuma meta ainda" texto="Defina um valor objetivo, quanto já têm guardado e o prazo." acao="+ Criar meta" onAcao={() => setNovo(true)} />
      ) : (
        <>
          <section className="folio mt-5 bg-primary px-6 py-6 text-primary-foreground">
            <p className="eyebrow text-primary-foreground/55">Acumulado</p>
            <p className="mt-2 font-display text-[40px] leading-none tracking-tight">{brl(acumulado)}</p>
            <p className="mt-2 text-[13px] text-primary-foreground/60">de {brl(total)} em {metas.length} metas</p>
          </section>
          <div className="mt-6 space-y-5">
            {metas.map((m) => {
              const pct = Math.min(100, (m.atual / m.objetivo) * 100);
              const falta = Math.max(0, m.objetivo - m.atual);
              const meses = m.aporte > 0 ? Math.ceil(falta / m.aporte) : null;
              return (
                <article key={m.id} className="folio border border-border p-5">
                  <h2 className="font-display text-[20px] leading-tight tracking-tight">{m.nome}</h2>
                  <div className="mt-4 flex items-baseline justify-between">
                    <p className="font-display text-[26px] leading-none tracking-tight">{brl(m.atual)}</p>
                    <p className="text-[13px] text-muted-foreground">{brl(m.objetivo)}</p>
                  </div>
                  <div className="mt-3 h-1.5 rounded-full bg-border"><div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} /></div>
                  <p className="mt-3 text-[12px] text-muted-foreground">
                    {Math.round(pct)}% · Prazo: {mesLongo(m.prazo)}
                    {meses !== null && falta > 0 ? ` · ~${meses} meses com ${brl(m.aporte)}/mês` : ""}
                  </p>
                  <button type="button" onClick={() => setAportar(m)} className="mt-3 text-[13px] font-medium text-accent">+ Adicionar valor</button>
                </article>
              );
            })}
          </div>
        </>
      )}
      <NovaMeta open={novo} onClose={() => setNovo(false)} />
      <Aportar meta={aportar} onClose={() => setAportar(null)} />
    </AppShell>
  );
}
