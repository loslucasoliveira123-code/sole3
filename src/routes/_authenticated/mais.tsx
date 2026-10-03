import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
  const meuNome = casal?.membros.find((m) => m.user_id === casal.meuId)?.nome ?? "";
  const [nome, setNome] = useState("");
  const [salvandoNome, setSalvandoNome] = useState(false);
  const [email, setEmail] = useState("");
  const [enviando, setEnviando] = useState(false);
  const completo = (casal?.membros.length ?? 0) >= 2;

  useEffect(() => {
    setNome(meuNome);
  }, [meuNome]);

  async function salvarPerfil(e: React.FormEvent) {
    e.preventDefault();
    const validacao = z.string().trim().min(2, "Informe pelo menos 2 caracteres").max(80).safeParse(nome);
    if (!validacao.success) {
      toast.error(validacao.error.issues[0]?.message ?? "Informe um nome válido");
      return;
    }
    if (!casal) return;

    setSalvandoNome(true);
    const novoNome = validacao.data;
    const { error: perfilErro } = await supabase
      .from("profiles")
      .update({ display_name: novoNome, updated_at: new Date().toISOString() })
      .eq("id", casal.meuId);

    if (perfilErro) {
      setSalvandoNome(false);
      toast.error("Não foi possível atualizar seu nome");
      return;
    }

    const { error: membroErro } = await supabase
      .from("casal_membros")
      .update({ nome: novoNome })
      .eq("user_id", casal.meuId);

    if (membroErro) {
      await supabase
        .from("profiles")
        .update({ display_name: meuNome, updated_at: new Date().toISOString() })
        .eq("id", casal.meuId);
      setSalvandoNome(false);
      toast.error("Não foi possível atualizar seu nome");
      return;
    }

    await supabase.auth.updateUser({ data: { display_name: novoNome } });
    await queryClient.invalidateQueries({ queryKey: ["casal"] });
    setSalvandoNome(false);
    toast.success("Nome atualizado");
  }

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
        <h2 className="font-display text-[20px] tracking-tight">Seu perfil</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">
          Este nome aparece para você e para sua parceira.
        </p>
        <form onSubmit={salvarPerfil} className="mt-4 space-y-2">
          <label htmlFor="nome-perfil" className="block text-[12px] font-medium text-muted-foreground">
            Seu nome
          </label>
          <input
            id="nome-perfil"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            placeholder="Como você quer ser chamado"
            autoComplete="name"
            maxLength={80}
            required
            className="w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-[14px] outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={salvandoNome || !casal || nome.trim() === meuNome}
            className="w-full rounded-2xl bg-primary py-3 text-[14px] font-medium text-primary-foreground disabled:opacity-60"
          >
            {salvandoNome ? "Salvando…" : "Salvar nome"}
          </button>
        </form>
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
