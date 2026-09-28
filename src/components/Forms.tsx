import { useState, type ReactNode } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  categoriasDespesa,
  categoriasReceita,
  nomeCasal,
  useCasal,
  useProjetos,
  useSalvar,
  type Meta,
} from "@/lib/casal";

export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/40" onClick={onClose}>
      <div
        className="rise max-h-[90vh] w-full max-w-[430px] overflow-y-auto rounded-t-3xl bg-background px-5 pt-5 pb-8"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-[24px] tracking-tight">{title}</h2>
          <button type="button" onClick={onClose} className="text-[13px] text-muted-foreground">
            Fechar
          </button>
        </div>
        <div className="mt-4 space-y-3">{children}</div>
      </div>
    </div>
  );
}

const campo =
  "w-full rounded-2xl border border-border bg-secondary px-4 py-3 text-[14px] outline-none placeholder:text-muted-foreground focus:border-accent";

export function Campo({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[12px] text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function Botao({ loading, children }: { loading?: boolean; children: ReactNode }) {
  return (
    <button
      type="submit"
      disabled={loading}
      className="mt-2 w-full rounded-2xl bg-primary py-3.5 text-[14px] font-medium text-primary-foreground disabled:opacity-60"
    >
      {loading ? "Salvando..." : children}
    </button>
  );
}

const parseValor = (s: string) => Number(s.replace(/\./g, "").replace(",", "."));
const hoje = () => new Date().toISOString().slice(0, 10);

const lancSchema = z.object({
  titulo: z.string().trim().min(1, "Informe uma descrição").max(80),
  valor: z.number().positive("Informe um valor maior que zero").max(1e10),
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida"),
});

export function NovoLancamento({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: casal } = useCasal();
  const { data: projetos = [] } = useProjetos(casal?.id);
  const [tipo, setTipo] = useState<"despesa" | "receita">("despesa");
  const [titulo, setTitulo] = useState("");
  const [valor, setValor] = useState("");
  const [categoria, setCategoria] = useState("Outros");
  const [data, setData] = useState(hoje());
  const [pagador, setPagador] = useState("Casal");
  const [projeto, setProjeto] = useState("");
  const salvar = useSalvar("lancamentos", (v: Record<string, unknown>) =>
    supabase.from("lancamentos").insert(v as never),
  );
  const pessoas = [...(casal?.membros.map((m) => m.nome.split(" ")[0] || "Eu") ?? []), "Casal"];
  const cats = tipo === "despesa" ? categoriasDespesa : categoriasReceita;

  return (
    <Sheet open={open} onClose={onClose} title="Novo lançamento">
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const p = lancSchema.safeParse({ titulo, valor: parseValor(valor), data });
          if (!p.success) { toast.error(p.error.issues[0]?.message ?? "Dados inválidos"); return; }
          try {
            await salvar.mutateAsync({
              casal_id: casal!.id,
              tipo,
              titulo: p.data.titulo,
              valor: p.data.valor,
              data: p.data.data,
              categoria,
              pagador,
              projeto_id: projeto || null,
            });
            toast.success("Lançamento salvo");
            setTitulo("");
            setValor("");
            onClose();
          } catch (err) {
            toast.error((err as Error).message);
          }
        }}
      >
        <div className="grid grid-cols-2 gap-2">
          {(["despesa", "receita"] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTipo(t);
                setCategoria("Outros");
              }}
              className={`rounded-2xl py-2.5 text-[13px] font-medium ${
                tipo === t ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
              }`}
            >
              {t === "despesa" ? "Despesa" : "Receita"}
            </button>
          ))}
        </div>
        <Campo label="Descrição">
          <input className={campo} value={titulo} onChange={(e) => setTitulo(e.target.value)} maxLength={80} placeholder="Ex.: Mercado, Salário" />
        </Campo>
        <div className="grid grid-cols-2 gap-2">
          <Campo label="Valor (R$)">
            <input className={campo} inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="0,00" />
          </Campo>
          <Campo label="Data">
            <input type="date" className={campo} value={data} onChange={(e) => setData(e.target.value)} />
          </Campo>
        </div>
        <Campo label="Categoria">
          <select className={campo} value={categoria} onChange={(e) => setCategoria(e.target.value)}>
            {cats.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Campo>
        <Campo label={tipo === "despesa" ? "Quem pagou" : "Quem recebeu"}>
          <select className={campo} value={pagador} onChange={(e) => setPagador(e.target.value)}>
            {pessoas.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
        </Campo>
        {projetos.length > 0 && (
          <Campo label="Projeto (opcional)">
            <select className={campo} value={projeto} onChange={(e) => setProjeto(e.target.value)}>
              <option value="">Nenhum</option>
              {projetos.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nome}
                </option>
              ))}
            </select>
          </Campo>
        )}
        <Botao loading={salvar.isPending}>Salvar lançamento</Botao>
      </form>
    </Sheet>
  );
}

const projSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome").max(60),
  descricao: z.string().trim().max(140),
  orcamento: z.number().min(0, "Orçamento inválido").max(1e10),
});

export function NovoProjeto({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: casal } = useCasal();
  const [nome, setNome] = useState("");
  const [descricao, setDescricao] = useState("");
  const [orcamento, setOrcamento] = useState("");
  const [prazo, setPrazo] = useState("");
  const [status, setStatus] = useState("Planejamento");
  const salvar = useSalvar("projetos", (v: Record<string, unknown>) =>
    supabase.from("projetos").insert(v as never),
  );
  return (
    <Sheet open={open} onClose={onClose} title="Novo projeto">
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const p = projSchema.safeParse({ nome, descricao, orcamento: parseValor(orcamento || "0") });
          if (!p.success) { toast.error(p.error.issues[0]?.message ?? "Dados inválidos"); return; }
          try {
            await salvar.mutateAsync({ casal_id: casal!.id, ...p.data, status, prazo: prazo ? `${prazo}-01` : null });
            toast.success("Projeto criado");
            setNome("");
            setDescricao("");
            setOrcamento("");
            onClose();
          } catch (err) {
            toast.error((err as Error).message);
          }
        }}
      >
        <Campo label="Nome">
          <input className={campo} value={nome} onChange={(e) => setNome(e.target.value)} maxLength={60} placeholder="Ex.: Reforma, Nova loja" />
        </Campo>
        <Campo label="Descrição">
          <input className={campo} value={descricao} onChange={(e) => setDescricao(e.target.value)} maxLength={140} />
        </Campo>
        <div className="grid grid-cols-2 gap-2">
          <Campo label="Orçamento (R$)">
            <input className={campo} inputMode="decimal" value={orcamento} onChange={(e) => setOrcamento(e.target.value)} placeholder="0,00" />
          </Campo>
          <Campo label="Prazo">
            <input type="month" className={campo} value={prazo} onChange={(e) => setPrazo(e.target.value)} />
          </Campo>
        </div>
        <Campo label="Situação">
          <select className={campo} value={status} onChange={(e) => setStatus(e.target.value)}>
            {["Planejamento", "Em execução", "Pausado", "Concluído"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </Campo>
        <Botao loading={salvar.isPending}>Criar projeto</Botao>
      </form>
    </Sheet>
  );
}

const metaSchema = z.object({
  nome: z.string().trim().min(1, "Informe o nome").max(60),
  objetivo: z.number().positive("Informe o valor objetivo").max(1e10),
  atual: z.number().min(0).max(1e10),
  aporte: z.number().min(0).max(1e10),
});

export function NovaMeta({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { data: casal } = useCasal();
  const [nome, setNome] = useState("");
  const [objetivo, setObjetivo] = useState("");
  const [atual, setAtual] = useState("");
  const [aporte, setAporte] = useState("");
  const [prazo, setPrazo] = useState("");
  const salvar = useSalvar("metas", (v: Record<string, unknown>) => supabase.from("metas").insert(v as never));
  return (
    <Sheet open={open} onClose={onClose} title="Nova meta">
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const p = metaSchema.safeParse({
            nome,
            objetivo: parseValor(objetivo),
            atual: parseValor(atual || "0"),
            aporte: parseValor(aporte || "0"),
          });
          if (!p.success) { toast.error(p.error.issues[0]?.message ?? "Dados inválidos"); return; }
          try {
            await salvar.mutateAsync({ casal_id: casal!.id, ...p.data, prazo: prazo ? `${prazo}-01` : null });
            toast.success("Meta criada");
            setNome("");
            setObjetivo("");
            setAtual("");
            setAporte("");
            onClose();
          } catch (err) {
            toast.error((err as Error).message);
          }
        }}
      >
        <Campo label="Nome">
          <input className={campo} value={nome} onChange={(e) => setNome(e.target.value)} maxLength={60} placeholder="Ex.: Reserva de emergência" />
        </Campo>
        <div className="grid grid-cols-2 gap-2">
          <Campo label="Valor objetivo (R$)">
            <input className={campo} inputMode="decimal" value={objetivo} onChange={(e) => setObjetivo(e.target.value)} />
          </Campo>
          <Campo label="Já guardado (R$)">
            <input className={campo} inputMode="decimal" value={atual} onChange={(e) => setAtual(e.target.value)} placeholder="0" />
          </Campo>
          <Campo label="Aporte mensal (R$)">
            <input className={campo} inputMode="decimal" value={aporte} onChange={(e) => setAporte(e.target.value)} placeholder="0" />
          </Campo>
          <Campo label="Prazo">
            <input type="month" className={campo} value={prazo} onChange={(e) => setPrazo(e.target.value)} />
          </Campo>
        </div>
        <p className="text-[12px] text-muted-foreground">Meta compartilhada por {nomeCasal(casal)}.</p>
        <Botao loading={salvar.isPending}>Criar meta</Botao>
      </form>
    </Sheet>
  );
}

export function Aportar({ meta, onClose }: { meta: Meta | null; onClose: () => void }) {
  const [valor, setValor] = useState("");
  const salvar = useSalvar("metas", (v: { id: string; atual: number }) =>
    supabase.from("metas").update({ atual: v.atual }).eq("id", v.id),
  );
  return (
    <Sheet open={!!meta} onClose={onClose} title="Adicionar à meta">
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const v = parseValor(valor);
          if (!meta || !(v > 0)) { toast.error("Informe um valor maior que zero"); return; }
          try {
            await salvar.mutateAsync({ id: meta.id, atual: meta.atual + v });
            toast.success("Valor adicionado");
            setValor("");
            onClose();
          } catch (err) {
            toast.error((err as Error).message);
          }
        }}
      >
        <p className="text-[13px] text-muted-foreground">{meta?.nome}</p>
        <Campo label="Valor (R$)">
          <input className={campo} inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} autoFocus />
        </Campo>
        <Botao loading={salvar.isPending}>Adicionar</Botao>
      </form>
    </Sheet>
  );
}

export function Vazio({ titulo, texto, acao, onAcao }: { titulo: string; texto: string; acao: string; onAcao: () => void }) {
  return (
    <div className="folio mt-6 border border-dashed border-border px-6 py-10 text-center">
      <p className="font-display text-[22px] tracking-tight">{titulo}</p>
      <p className="mx-auto mt-2 max-w-[280px] text-[13px] text-muted-foreground">{texto}</p>
      <button type="button" onClick={onAcao} className="mt-5 rounded-2xl bg-primary px-5 py-3 text-[13px] font-medium text-primary-foreground">
        {acao}
      </button>
    </div>
  );
}
