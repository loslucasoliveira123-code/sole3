import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageTitle } from "@/components/AppShell";
import { brl, metas } from "@/lib/sole-data";

export const Route = createFileRoute("/_authenticated/metas")({
  head: () => ({
    meta: [
      { title: "Metas — SOLE3" },
      {
        name: "description",
        content: "Objetivos financeiros do casal com valor acumulado, aporte mensal e previsão.",
      },
      { property: "og:title", content: "Metas — SOLE3" },
      {
        property: "og:description",
        content: "Reserva, viagem, carro: acompanhe cada objetivo e a data estimada de conclusão.",
      },
    ],
  }),
  component: Metas,
});

function Metas() {
  const total = metas.reduce((s, m) => s + m.objetivo, 0);
  const acumulado = metas.reduce((s, m) => s + m.atual, 0);

  return (
    <AppShell>
      <PageTitle eyebrow="Objetivos" title="Metas" />

      <section className="folio mt-5 bg-primary px-6 py-6 text-primary-foreground">
        <p className="eyebrow text-primary-foreground/55">Acumulado</p>
        <p className="mt-2 font-display text-[40px] leading-none tracking-tight">{brl(acumulado)}</p>
        <p className="mt-2 text-[13px] text-primary-foreground/60">
          de {brl(total)} em {metas.length} metas ativas
        </p>
      </section>

      <div className="mt-6 space-y-5">
        {metas.map((m) => {
          const pct = (m.atual / m.objetivo) * 100;
          return (
            <article key={m.id} className="folio border border-border p-5">
              <div className="flex items-start justify-between gap-3">
                <h2 className="font-display text-[20px] leading-tight tracking-tight">{m.nome}</h2>
                <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[11px] text-muted-foreground">
                  {m.tipo}
                </span>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <p className="font-display text-[26px] leading-none tracking-tight">
                  {brl(m.atual)}
                </p>
                <p className="text-[13px] text-muted-foreground">{brl(m.objetivo)}</p>
              </div>
              <div className="mt-3 h-1.5 rounded-full bg-border">
                <div className="h-full rounded-full bg-accent" style={{ width: `${pct}%` }} />
              </div>
              <p className="mt-2 text-[12px] text-muted-foreground">
                {pct.toFixed(1).replace(".", ",")}% concluído
              </p>

              <div className="mt-4 flex justify-between border-t border-border pt-4 text-[13px]">
                <span className="text-muted-foreground">
                  Aporte <span className="font-medium text-foreground">{brl(m.aporte)}/mês</span>
                </span>
                <span className="text-muted-foreground">Previsão · {m.previsao}</span>
              </div>
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
