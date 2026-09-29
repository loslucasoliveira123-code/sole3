import { brl } from "@/lib/sole-data";
import { dataCurta } from "@/lib/casal";

export function ListaLanc({ itens }: { itens: { id: string; tipo: string; titulo: string; categoria: string; valor: number; data: string; pagador: string }[] }) {
  return (
    <div className="mt-3 divide-y divide-border">
      {itens.map((m) => (
        <div key={m.id} className="flex items-center gap-3 py-3">
          <span className={`grid size-9 shrink-0 place-items-center rounded-full text-[10px] font-medium ${m.tipo === "receita" ? "bg-success/15 text-success" : "bg-secondary"}`}>{m.pagador.slice(0, 2).toUpperCase()}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium">{m.categoria} · {m.titulo}</span>
            <span className="block text-[11px] text-muted-foreground">{dataCurta(m.data)} · {m.pagador}</span>
          </span>
          <span className={`text-[13px] font-medium ${m.tipo === "receita" ? "text-success" : ""}`}>{m.tipo === "receita" ? "+" : "-"}{brl(m.valor)}</span>
        </div>
      ))}
    </div>
  );
}
