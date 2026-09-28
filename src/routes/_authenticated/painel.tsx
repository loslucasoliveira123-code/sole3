import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import {
  brl,
  fluxo,
  insights,
  movimentos,
  orcamentos,
  perfil,
  resumos,
  type Espaco,
} from "@/lib/sole-data";

export const Route = createFileRoute("/_authenticated/painel")({
  head: () => ({
    meta: [
      { title: "SOLE3 — O dinheiro do casal, organizado" },
      {
        name: "description",
        content:
          "Painel financeiro do casal: patrimônio, SOLE Score, fluxo de caixa, orçamento e projetos em um só lugar.",
      },
      { property: "og:title", content: "SOLE3 — O dinheiro do casal, organizado" },
      {
        property: "og:description",
        content:
          "Gestão financeira pessoal, do casal e de projetos com assistente inteligente.",
      },
    ],
  }),
  component: Dashboard,
});

const espacos: { id: Espaco; label: string }[] = [
  { id: "casal", label: "Casal" },
  { id: "projetos", label: "Projetos" },
];

const corEstado = {
  ok: "bg-success",
  atencao: "bg-warning",
  excedido: "bg-destructive",
} as const;

function Dashboard() {
  const [espaco, setEspaco] = useState<Espaco>("casal");
  const r = resumos[espaco];

  return (
    <AppShell>
      <div className="mt-7 rise">
        <p className="text-[13px] text-muted-foreground">Bom dia</p>
        <h1 className="mt-1 font-display text-[38px] leading-none tracking-tight text-balance">
          {espaco === "pessoal" ? perfil.nome : `${perfil.nome} & ${perfil.parceira}`}
        </h1>
      </div>

      <div className="-mx-5 mt-5 flex gap-2 overflow-x-auto px-5 pb-1">
        {espacos.map((e) => (
          <button
            key={e.id}
            type="button"
            onClick={() => setEspaco(e.id)}
            className={`shrink-0 rounded-[14px] px-4 py-2.5 text-[13px] font-medium transition-all ${
              espaco === e.id
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground hover:-translate-y-0.5"
            }`}
          >
            {e.label}
          </button>
        ))}
      </div>

      <section className="folio mt-5 bg-primary px-6 py-6 text-primary-foreground rise">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="eyebrow text-primary-foreground/55">Patrimônio</p>
            <p className="mt-2 font-display text-[44px] leading-none tracking-tight">
              {brl(r.patrimonio)}
            </p>
          </div>
          <span className="shrink-0 rounded-full bg-accent px-2.5 py-1 text-[11px] font-medium text-accent-foreground">
            {r.variacao}
          </span>
        </div>
        <div className="mt-5 flex gap-6 border-t border-primary-foreground/15 pt-4 text-[13px]">
          <div>
            <p className="text-primary-foreground/55">Saldo</p>
            <p className="mt-0.5 font-medium">{brl(r.saldo)}</p>
          </div>
          <div>
            <p className="text-primary-foreground/55">Economia</p>
            <p className="mt-0.5 font-medium">{brl(r.economia)}</p>
          </div>
          <div>
            <p className="text-primary-foreground/55">Dívidas</p>
            <p className="mt-0.5 font-medium">{brl(r.dividas)}</p>
          </div>
        </div>
      </section>

      <section className="mt-6">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-[22px] tracking-tight">SOLE Score</h2>
          <span className="text-[11px] text-muted-foreground">Atualizado hoje</span>
        </div>
        <div className="folio mt-4 flex items-center gap-6 border border-border px-6 py-6">
          <div className="relative size-[134px] shrink-0">
            <div
              className="size-[134px] rounded-full"
              style={{
                background: `conic-gradient(var(--accent) 0 ${r.score}%, var(--border) ${r.score}% 100%)`,
              }}
            />
            <div className="absolute inset-[14px] grid place-items-center rounded-full bg-background text-center">
              <div>
                <p className="font-display text-[42px] leading-none tracking-tight">{r.score}</p>
                <p className="mt-1 text-[11px] text-muted-foreground">de 100</p>
              </div>
            </div>
          </div>
          <div className="text-[13px] leading-relaxed text-muted-foreground">
            <p className="font-medium text-foreground">{r.scoreTitulo}</p>
            <p className="mt-2">{r.scoreTexto}</p>
          </div>
        </div>
      </section>

      <section className="folio mt-6 border border-border p-5 rise">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-[20px] tracking-tight">Fluxo de caixa</h2>
          <span className="text-[11px] text-muted-foreground">Novembro</span>
        </div>
        <div className="mt-4 flex items-center justify-between text-[13px] text-muted-foreground">
          <span>
            Receitas <span className="font-medium text-foreground">{brl(r.receitas)}</span>
          </span>
          <span>
            Despesas <span className="font-medium text-foreground">{brl(r.despesas)}</span>
          </span>
        </div>
        <div className="mt-3 flex h-24 items-end gap-1.5">
          {fluxo.map((h, i) => (
            <div
              key={i}
              className={`w-full rounded-t ${i % 3 === 0 ? "bg-foreground/40" : "bg-foreground/85"}`}
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-display text-[22px] tracking-tight">Orçamento</h2>
        <div className="mt-4 space-y-4">
          {orcamentos.map((o) => (
            <div key={o.categoria}>
              <div className="flex justify-between text-[13px]">
                <span className="font-medium">{o.categoria}</span>
                <span className="text-muted-foreground">
                  {brl(o.usado)} / {brl(o.limite)}
                </span>
              </div>
              <div className="mt-2 h-1.5 rounded-full bg-border">
                <div
                  className={`h-full rounded-full ${corEstado[o.estado]}`}
                  style={{ width: `${Math.min(100, (o.usado / o.limite) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <Link
        to="/sole-ai"
        className="mt-7 flex items-center gap-3 rounded-2xl border border-accent/25 bg-accent-soft/50 px-4 py-3.5"
      >
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent font-display text-sm text-accent-foreground">
          S
        </span>
        <span>
          <span className="eyebrow block text-accent">Insight do SOLE AI</span>
          <span className="mt-1 block text-[13px] leading-snug">{insights[espaco]}</span>
        </span>
      </Link>

      <section className="mt-7">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-[22px] tracking-tight">Movimentos</h2>
          <Link to="/movimentos" className="text-[11px] text-muted-foreground">
            Ver tudo
          </Link>
        </div>
        <div className="mt-3 divide-y divide-border">
          {movimentos.slice(0, 4).map((m) => (
            <div key={m.id} className="flex items-center gap-3 py-3">
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-full text-[10px] font-medium ${
                  m.valor > 0 ? "bg-success/15 text-success" : "bg-secondary"
                }`}
              >
                {m.iniciais}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] font-medium">
                  {m.categoria.split(" · ")[0]} · {m.titulo}
                </span>
                <span className="block text-[11px] text-muted-foreground">
                  {m.quando} · {m.pessoa}
                </span>
              </span>
              <span
                className={`text-[13px] font-medium ${m.valor > 0 ? "text-success" : ""}`}
              >
                {m.valor > 0 ? "+" : "-"}
                {brl(Math.abs(m.valor))}
              </span>
            </div>
          ))}
        </div>
      </section>
    </AppShell>
  );
}
