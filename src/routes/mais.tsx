import { createFileRoute } from "@tanstack/react-router";
import { AppShell, PageTitle } from "@/components/AppShell";
import { brl, perfil, resumos } from "@/lib/sole-data";

export const Route = createFileRoute("/mais")({
  head: () => ({
    meta: [
      { title: "Mais — Patrimônio, cartões e configurações | SOLE3" },
      {
        name: "description",
        content:
          "Patrimônio, contas, cartões, investimentos, dívidas, relatórios e privacidade do casal.",
      },
      { property: "og:title", content: "Mais — Patrimônio e configurações | SOLE3" },
      {
        property: "og:description",
        content: "Todos os módulos do SOLE3 além do dia a dia financeiro.",
      },
    ],
  }),
  component: Mais,
});

const modulos = [
  { nome: "Contas", detalhe: "4 contas · corrente, poupança e carteira" },
  { nome: "Cartões", detalhe: "Fatura atual R$ 3.420 · 38% do limite" },
  { nome: "Investimentos", detalhe: "R$ 182.400 · renda fixa, fundos e cripto" },
  { nome: "Dívidas", detalhe: "R$ 6.890 em 2 contratos" },
  { nome: "Orçamento", detalhe: "Limites por categoria e alertas" },
  { nome: "Divisão de despesas", detalhe: "Lucas 60% · Marina 40%" },
  { nome: "Relatórios", detalhe: "Pessoal, casal, projetos e patrimônio" },
  { nome: "Privacidade e permissões", detalhe: "Privado · Compartilhado · Projeto" },
  { nome: "Notificações", detalhe: "Vencimentos, faturas, metas e insights" },
];

function Mais() {
  const r = resumos.casal;
  const ativos = r.patrimonio + r.investimentos;

  return (
    <AppShell>
      <PageTitle eyebrow={`${perfil.nome} & ${perfil.parceira}`} title="Mais" />

      <section className="folio mt-5 border border-border p-5">
        <p className="eyebrow text-muted-foreground">Patrimônio líquido</p>
        <p className="mt-2 font-display text-[36px] leading-none tracking-tight">
          {brl(ativos - r.dividas)}
        </p>
        <div className="mt-4 flex justify-between border-t border-border pt-4 text-[13px]">
          <span className="text-muted-foreground">
            Ativos <span className="font-medium text-foreground">{brl(ativos)}</span>
          </span>
          <span className="text-muted-foreground">
            Passivos <span className="font-medium text-foreground">{brl(r.dividas)}</span>
          </span>
        </div>
      </section>

      <div className="mt-6 divide-y divide-border">
        {modulos.map((m) => (
          <div key={m.nome} className="flex items-center gap-3 py-3.5">
            <span className="min-w-0 flex-1">
              <span className="block text-[14px] font-medium">{m.nome}</span>
              <span className="block text-[11px] text-muted-foreground">{m.detalhe}</span>
            </span>
            <span className="text-[13px] text-muted-foreground">→</span>
          </div>
        ))}
      </div>

      <p className="mt-6 text-[11px] leading-relaxed text-muted-foreground">
        Esta primeira versão usa dados de demonstração. O próximo passo é ativar contas de usuário,
        convite do parceiro e o banco de dados para gravar seus lançamentos reais.
      </p>
    </AppShell>
  );
}
