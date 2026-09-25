import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { responderIA, sugestoesIA } from "@/lib/sole-data";

export const Route = createFileRoute("/sole-ai")({
  head: () => ({
    meta: [
      { title: "SOLE AI — Assistente financeiro do casal" },
      {
        name: "description",
        content:
          "Pergunte sobre gastos, orçamento, metas e projetos. O SOLE AI responde com os dados reais do casal.",
      },
      { property: "og:title", content: "SOLE AI — Assistente financeiro do casal" },
      {
        property: "og:description",
        content: "Seu dinheiro. Sua visão. Suas decisões.",
      },
    ],
  }),
  component: SoleAI,
});

type Mensagem = { de: "user" | "ai"; texto: string };

function SoleAI() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");

  function enviar(pergunta: string) {
    const limpa = pergunta.trim().slice(0, 300);
    if (!limpa) return;
    setMensagens((m) => [...m, { de: "user", texto: limpa }, { de: "ai", texto: responderIA(limpa) }]);
    setTexto("");
  }

  return (
    <AppShell>
      <div className="mt-7 rise">
        <p className="eyebrow text-accent">SOLE AI</p>
        <h1 className="mt-1.5 font-display text-[34px] leading-none tracking-tight text-balance">
          Seu dinheiro. Sua visão. Suas decisões.
        </h1>
      </div>

      {mensagens.length === 0 ? (
        <div className="mt-6 space-y-2">
          {sugestoesIA.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => enviar(s)}
              className="w-full rounded-2xl border border-border px-4 py-3.5 text-left text-[13px] transition-colors hover:border-accent/40 hover:bg-accent-soft/40"
            >
              {s}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {mensagens.map((m, i) => (
            <div
              key={i}
              className={
                m.de === "user"
                  ? "ml-auto max-w-[85%] rounded-2xl bg-primary px-4 py-3 text-[13px] text-primary-foreground"
                  : "max-w-[92%] rounded-2xl border border-accent/25 bg-accent-soft/45 px-4 py-3 text-[13px] leading-relaxed"
              }
            >
              {m.texto}
            </div>
          ))}
        </div>
      )}

      <form
        className="mt-6 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          enviar(texto);
        }}
      >
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={300}
          placeholder="Pergunte ou registre: gastei 180 no mercado"
          className="flex-1 rounded-2xl border border-border bg-secondary px-4 py-3 text-[13px] outline-none placeholder:text-muted-foreground focus:border-accent"
        />
        <button
          type="submit"
          className="rounded-2xl bg-primary px-5 text-[13px] font-medium text-primary-foreground"
        >
          Enviar
        </button>
      </form>

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        O SOLE AI responde apenas com dados que você autorizou. Ele nunca inventa números nem
        movimenta dinheiro.
      </p>
    </AppShell>
  );
}
