import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import logo from "@/assets/sole3-logo.png.asset.json";
import { nomeCasal, useCasal } from "@/lib/casal";
import { NovoLancamento } from "@/components/Forms";

const tabs = [
  { to: "/painel", label: "Início", glyph: "◱" },
  { to: "/movimentos", label: "Movim.", glyph: "≡" },
  { to: "/projetos", label: "Projetos", glyph: "◈" },
  { to: "/metas", label: "Metas", glyph: "◎" },
  { to: "/sole-ai", label: "SOLE AI", glyph: "✦" },
  { to: "/mais", label: "Mais", glyph: "⌁" },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const { data: casal } = useCasal();
  const [novo, setNovo] = useState(false);
  const eu = casal?.membros.find((m) => m.user_id === casal.meuId)?.nome ?? "";
  const iniciais = eu.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase() || "S";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[430px] px-5 pt-7 pb-28">
        <header className="flex items-center justify-between">
          <Link to="/painel" className="flex items-center gap-3">
            <img src={logo.url} alt="SOLE3" className="size-12 rounded-xl bg-card object-cover mix-blend-multiply" />
            <span>
              <span className="eyebrow block text-muted-foreground">SOLE3</span>
              <span className="block text-[13px] font-medium leading-tight">{nomeCasal(casal) || "…"}</span>
            </span>
          </Link>
          <Link to="/mais" className="grid size-10 place-items-center rounded-full bg-accent-soft font-display text-sm text-accent">
            {iniciais}
          </Link>
        </header>
        {children}
      </div>

      <button
        type="button"
        onClick={() => setNovo(true)}
        disabled={!casal}
        className="fixed bottom-20 right-4 z-40 sm:right-[calc(50%-199px)] rounded-full bg-accent px-4 py-3 text-[13px] font-medium text-accent-foreground shadow-lg"
      >
        + Novo lançamento
      </button>
      <NovoLancamento open={novo} onClose={() => setNovo(false)} />

      <nav className="fixed bottom-0 left-1/2 flex w-full max-w-[430px] -translate-x-1/2 items-center justify-between border-t border-border bg-background/95 px-2 py-2 backdrop-blur">
        {tabs.map((tab) => (
          <Link
            key={tab.to}
            to={tab.to}
            activeOptions={{ exact: tab.to === "/painel" }}
            className="flex flex-col items-center gap-0.5 px-2.5 py-1 text-[10px] font-medium text-muted-foreground transition-colors"
            activeProps={{ className: "text-foreground" }}
          >
            <span className="grid size-5 place-items-center text-[12px]">{tab.glyph}</span>
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

export function PageTitle({ eyebrow, title }: { eyebrow: string; title: string }) {
  return (
    <div className="mt-7 rise">
      <p className="eyebrow text-muted-foreground">{eyebrow}</p>
      <h1 className="mt-1.5 font-display text-[34px] leading-none tracking-tight text-balance">{title}</h1>
    </div>
  );
}
