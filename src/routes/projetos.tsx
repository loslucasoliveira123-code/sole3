import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageTitle } from "@/components/AppShell";
import { brl, projetos } from "@/lib/sole-data";

export const Route = createFileRoute("/projetos")({
  head: () => ({
    meta: [
      { title: "Projetos — SOLE3" },
      {
        name: "description",
        content:
          "Gestão financeira de projetos: orçamento, executado, receitas e margem de cada empreendimento.",
      },
      { property: "og:title", content: "Projetos — SOLE3" },
      {
        property: "og:description",
        content: "Orçado x realizado, saldo e DRE simplificada para cada projeto do casal.",
      },
    ],
  }),
  component: Projetos,
});

function Projetos() {
  return (
    <AppShell>
      <PageTitle eyebrow="Negócios e obras" title="Projetos" />

      <div className="mt-6 space-y-5">
        {projetos.map((p) => {
          const executado = (p.gasto / p.orcamento) * 100;
          const resultado = p.receita - p.gasto;
          return (
            <article key={p.id} className="folio border border-border p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-[22px] leading-tight tracking-tight">
                    {p.nome}
                  </h2>
                  <p className="mt-1 text-[12px] text-muted-foreground">{p.descricao}</p>
                </div>
                <span className="shrink-0 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                  {p.status}
                </span>
              </div>

              <div className="mt-5 flex items-baseline justify-between text-[13px]">
                <span className="text-muted-foreground">
                  Orçamento <span className="font-medium text-foreground">{brl(p.orcamento)}</span>
                </span>
                <span className="font-display text-[20px] tracking-tight">
                  {executado.toFixed(1).replace(".", ",")}%
                </span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-border">
                <div
                  className={`h-full rounded-full ${executado > 95 ? "bg-destructive" : executado > 80 ? "bg-warning" : "bg-accent"}`}
                  style={{ width: `${Math.min(100, executado)}%` }}
                />
              </div>

              <div className="mt-5 grid grid-cols-3 gap-3 border-t border-border pt-4 text-[13px]">
                <div>
                  <p className="text-muted-foreground">Gasto</p>
                  <p className="mt-0.5 font-medium">{brl(p.gasto)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Receitas</p>
                  <p className="mt-0.5 font-medium">{brl(p.receita)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Restante</p>
                  <p className="mt-0.5 font-medium">{brl(p.orcamento - p.gasto)}</p>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between text-[12px] text-muted-foreground">
                <span>Prazo · {p.prazo}</span>
                <span>
                  Resultado{" "}
                  <span className={resultado >= 0 ? "text-success" : "text-destructive"}>
                    {brl(resultado)}
                  </span>
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
