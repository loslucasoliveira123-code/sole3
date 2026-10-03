import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AppShell } from "@/components/AppShell";
import { responderIA, sugestoesIA } from "@/lib/sole-data";
import { NovoLancamento } from "@/components/Forms";
import { useCasal } from "@/lib/casal";
import { interpretarComandoLancamento, type RascunhoLancamento } from "@/lib/sole-command";
import { brl } from "@/lib/sole-data";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_authenticated/sole-ai")({
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
  const [rascunho, setRascunho] = useState<RascunhoLancamento | null>(null);
  const { data: casal } = useCasal();

  function enviar(pergunta: string) {
    const limpa = pergunta.trim().slice(0, 300);
    if (!limpa) return;
    const proposta = interpretarComandoLancamento(limpa, casal);
    if (proposta) {
      setMensagens((m) => [
        ...m,
        { de: "user", texto: limpa },
        {
          de: "ai",
          texto: `Identifiquei ${proposta.tipo === "despesa" ? "uma despesa" : "uma receita"} de ${brl(proposta.valor)}, em ${proposta.categoria}, para ${proposta.pagador}. Revise os dados antes de confirmar.`,
        },
      ]);
      setRascunho(proposta);
    } else {
      setMensagens((m) => [...m, { de: "user", texto: limpa }, { de: "ai", texto: responderIA(limpa) }]);
    }
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
          {["Gastei 180 no mercado", "Recebi 2.500 de salário ontem", ...sugestoesIA].map((s) => (
            <Button
              key={s}
              type="button"
              onClick={() => enviar(s)}
              variant="outline"
              className="h-auto w-full justify-start whitespace-normal rounded-2xl px-4 py-3.5 text-left text-[13px] shadow-none hover:border-accent/40 hover:bg-accent-soft/40"
            >
              {s}
            </Button>
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
        <Button
          type="submit"
          className="h-auto rounded-2xl px-5 text-[13px]"
        >
          Enviar
        </Button>
      </form>

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        O SOLE AI usa os dados que você autorizou e só registra um lançamento depois da sua confirmação.
      </p>
      <NovoLancamento
        open={Boolean(rascunho)}
        rascunho={rascunho}
        onClose={() => setRascunho(null)}
        onSaved={(acao, salvo) => {
          if (acao !== "criado" || !salvo) return;
          setMensagens((m) => [
            ...m,
            { de: "ai", texto: `Pronto. ${salvo.tipo === "despesa" ? "Despesa" : "Receita"} de ${brl(salvo.valor)} registrada em ${salvo.categoria}.` },
          ]);
        }}
      />
    </AppShell>
  );
}
