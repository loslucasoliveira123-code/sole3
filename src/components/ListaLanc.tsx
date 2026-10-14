import { brl } from "@/lib/sole-data";
import { dataCurta, useCasal, useProjetos } from "@/lib/casal";
import type { Lancamento } from "@/lib/casal";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ListaLanc({ itens, onSelect }: { itens: Lancamento[]; onSelect?: (item: Lancamento) => void }) {
  const { data: casal } = useCasal();
  const { data: projetos = [] } = useProjetos(casal?.id);
  const nomesProjetos = new Map(projetos.map((p) => [p.id, p.nome]));
  return (
    <div className="mt-3 divide-y divide-border">
      {itens.map((m) => (
        <Button
          key={m.id}
          type="button"
          onClick={() => onSelect?.(m)}
          disabled={!onSelect}
          variant="ghost"
          className="h-auto w-full justify-start rounded-none px-0 py-3 text-left hover:bg-transparent disabled:cursor-default"
          aria-label={onSelect ? `Editar ${m.titulo}` : undefined}
        >
          <span className={`grid size-9 shrink-0 place-items-center rounded-full text-[10px] font-medium ${m.tipo === "receita" ? "bg-success/15 text-success" : "bg-secondary"}`}>{m.pagador.slice(0, 2).toUpperCase()}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium">{m.categoria} · {m.titulo}</span>
            <span className="block text-[11px] text-muted-foreground">{dataCurta(m.data)} · {m.pagador}</span>
            {m.projeto_id && <span className="block whitespace-normal break-words text-[11px] text-accent">Projeto: {nomesProjetos.get(m.projeto_id) ?? "Carregando…"}</span>}
          </span>
          <span className={`shrink-0 text-[13px] font-medium ${m.tipo === "receita" ? "text-success" : ""}`}>{m.tipo === "receita" ? "+" : "-"}{brl(m.valor)}</span>
          {onSelect && <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
        </Button>
      ))}
    </div>
  );
}
