import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { brl, movimentos } from "@/lib/sole-data";

export const Route = createFileRoute("/movimentos")({
  head: () => ({
    meta: [
      { title: "Movimentos — SOLE3" },
      {
        name: "description",
        content: "Receitas, despesas, transferências e investimentos do casal em uma lista única.",
      },
      { property: "og:title", content: "Movimentos — SOLE3" },
      {
        property: "og:description",
        content: "Acompanhe cada lançamento financeiro por pessoa, categoria e data.",
      },
    ],
  }),
  component: Movimentos,
});

const filtros = ["Tudo", "Receitas", "Despesas"] as const;

function Movimentos() {
  const [filtro, setFiltro] = useState<(typeof filtros)[number]>("Tudo");
  const [busca, setBusca] = useState("");

  const lista = useMemo(
    () =>
      movimentos.filter((m) => {
        const passaFiltro =
          filtro === "Tudo" ||
          (filtro === "Receitas" && m.valor > 0) ||
          (filtro === "Despesas" && m.valor < 0);
        const texto = `${m.titulo} ${m.categoria} ${m.pessoa}`.toLowerCase();
        return passaFiltro && texto.includes(busca.toLowerCase());
      }),
    [filtro, busca],
  );

  const entradas = lista.filter((m) => m.valor > 0).reduce((s, m) => s + m.valor, 0);
  const saidas = lista.filter((m) => m.valor < 0).reduce((s, m) => s + Math.abs(m.valor), 0);

  return (
    <AppShell>
      <PageTitle eyebrow="Novembro" title="Movimentos" />

      <div className="folio mt-5 flex gap-6 border border-border px-5 py-4 text-[13px]">
        <div>
          <p className="text-muted-foreground">Entradas</p>
          <p className="mt-0.5 font-medium text-success">{brl(entradas)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Saídas</p>
          <p className="mt-0.5 font-medium">{brl(saidas)}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Resultado</p>
          <p className="mt-0.5 font-medium">{brl(entradas - saidas)}</p>
        </div>
      </div>

      <input
        value={busca}
        onChange={(e) => setBusca(e.target.value)}
        placeholder="Buscar: mercado, fatura, Lucas..."
        maxLength={80}
        className="mt-4 w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-[13px] outline-none placeholder:text-muted-foreground focus:border-accent"
      />

      <div className="mt-3 flex gap-2">
        {filtros.map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFiltro(f)}
            className={`rounded-[14px] px-4 py-2 text-[13px] font-medium transition-colors ${
              filtro === f
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-muted-foreground"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      <div className="mt-4 divide-y divide-border">
        {lista.map((m) => (
          <div key={m.id} className="flex items-center gap-3 py-3.5">
            <span
              className={`grid size-9 shrink-0 place-items-center rounded-full text-[10px] font-medium ${
                m.valor > 0 ? "bg-success/15 text-success" : "bg-secondary"
              }`}
            >
              {m.iniciais}
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13px] font-medium">{m.titulo}</span>
              <span className="block text-[11px] text-muted-foreground">
                {m.categoria} · {m.quando} · {m.pessoa}
              </span>
            </span>
            <span className={`text-[13px] font-medium ${m.valor > 0 ? "text-success" : ""}`}>
              {m.valor > 0 ? "+" : "-"}
              {brl(Math.abs(m.valor))}
            </span>
          </div>
        ))}
        {lista.length === 0 && (
          <p className="py-10 text-center text-[13px] text-muted-foreground">
            Nenhum movimento encontrado.
          </p>
        )}
      </div>
    </AppShell>
  );
}
