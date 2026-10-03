import { brl } from "@/lib/sole-data";
import { dataCurta } from "@/lib/casal";
import type { Lancamento } from "@/lib/casal";
import { ChevronRight } from "lucide-react";

export function ListaLanc({ itens, onSelect }: { itens: Lancamento[]; onSelect?: (item: Lancamento) => void }) {
  return (
    <div className="mt-3 divide-y divide-border">
      {itens.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => onSelect?.(m)}
          disabled={!onSelect}
          className="flex w-full items-center gap-3 py-3 text-left disabled:cursor-default"
          aria-label={onSelect ? `Editar ${m.titulo}` : undefined}
        >
          <span className={`grid size-9 shrink-0 place-items-center rounded-full text-[10px] font-medium ${m.tipo === "receita" ? "bg-success/15 text-success" : "bg-secondary"}`}>{m.pagador.slice(0, 2).toUpperCase()}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium">{m.categoria} · {m.titulo}</span>
            <span className="block text-[11px] text-muted-foreground">{dataCurta(m.data)} · {m.pagador}</span>
          </span>
          <span className={`text-[13px] font-medium ${m.tipo === "receita" ? "text-success" : ""}`}>{m.tipo === "receita" ? "+" : "-"}{brl(m.valor)}</span>
          {onSelect && <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />}
        </button>
      ))}
    </div>
  );
}
