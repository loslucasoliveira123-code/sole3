import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { AppShell, PageTitle } from "@/components/AppShell";
import { brl } from "@/lib/sole-data";
import { nomeCasal, useCasal, useLancamentos, useMetas, useProjetos } from "@/lib/casal";
import { calcularTotais } from "@/lib/totais";

export const Route = createFileRoute("/_authenticated/mais")({
  head: () => ({
    meta: [
      { title: "Mais — Convite e conta | SOLE3" },
      { name: "description", content: "Convide sua parceira, veja o patrimônio do casal e gerencie sua conta." },
      { property: "og:title", content: "Mais — Convite e conta | SOLE3" },
      { property: "og:description", content: "Convide a parceira para compartilhar as finanças do casal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Mais,
});

function Mais() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: casal } = useCasal();
  const { data: lanc = [] } = useLancamentos(casal?.id);
  const { data: metas = [] } = useMetas(casal?.id);
  const { data: projetos = [] } = useProjetos(casal?.id);
  const t = calcularTotais(lanc, metas, projetos);
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const completo = (casal?.membros.length ?? 0) >= 2;

  async function convidar(e: React.FormEvent) {
    e.preventDefault();
    const p = z.string().trim().email().max(255).safeParse(email);
    if (!p.success) { toast.error("Informe um e-mail válido"); return; }
    setEnviando(true);
    const { data: u } = await supabase.auth.getUser();
    const { data, error } = await supabase.from("convites").insert({ casal_id: casal!.id, criado_por: u.user!.id }).select("codigo").single();
    setEnviando(false);
    if (error || !data) { toast.error(error?.message ?? "Erro ao criar convite"); return; }
    const link = `${window.location.origin}/convite/${data.codigo}`;
    const assunto = encodeURIComponent("Convite para o SOLE3");
    const corpo = encodeURIComponent(`Oi! Quero organizar nossas finanças juntos no SOLE3.\n\nCrie sua conta por este link e você verá os mesmos dados do casal:\n${link}`);
    try { await navigator.clipboard.writeText(link); } catch { /* ignore */ }
    window.location.href = `mailto:${encodeURIComponent(p.data)}?subject=${assunto}&body=${corpo}`;
    toast.success("Convite criado — o link também foi copiado");
  }

  return (
    <AppShell>
      <PageTitle eyebrow={nomeCasal(casal)} title="Mais" />

      <section className="folio mt-5 border border-border p-5">
        <p className="eyebrow text-muted-foreground">Patrimônio</p>
        <p className="mt-2 font-display text-[36px] leading-none tracking-tight">{brl(t.patrimonio)}</p>
        <div className="mt-4 flex justify-between border-t border-border pt-4 text-[13px] text-muted-foreground">
          <span>Saldo <span className="font-medium text-foreground">{brl(t.saldo)}</span></span>
          <span>Em metas <span className="font-medium text-foreground">{brl(t.guardado)}</span></span>
        </div>
      </section>

      <section className="folio mt-6 border border-border p-5">
        <h2 className="font-display text-[20px] tracking-tight">Casal</h2>
        <ul className="mt-2 text-[13px] text-muted-foreground">
          {casal?.membros.map((m) => <li key={m.user_id}>{m.nome || "Sem nome"}{m.user_id === casal.meuId ? " (você)" : ""}</li>)}
        </ul>
        {completo ? (
          <p className="mt-3 text-[13px]">Vocês dois já compartilham os mesmos dados.</p>
        ) : (
          <form onSubmit={convidar} className="mt-4 space-y-2">
            <p className="text-[13px]">Convide sua parceira por e-mail. Ao criar a conta pelo link, ela verá os mesmos dados.</p>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e-mail da parceira" maxLength={255}
              className="w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-[14px] outline-none focus:border-accent" />
            <button type="submit" disabled={enviando || !casal} className="w-full rounded-2xl bg-primary py-3 text-[14px] font-medium text-primary-foreground disabled:opacity-60">
              {enviando ? "Criando…" : "Enviar convite"}
            </button>
          </form>
        )}
      </section>

      <button
        type="button"
        onClick={async () => {
          await queryClient.cancelQueries();
          queryClient.clear();
          await supabase.auth.signOut();
          navigate({ to: "/", replace: true });
        }}
        className="mt-6 w-full rounded-xl border border-border py-3 text-[14px] font-medium"
      >
        Sair da conta
      </button>
    </AppShell>
  );
}
