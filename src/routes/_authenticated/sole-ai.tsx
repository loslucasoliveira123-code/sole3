import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { createParser } from "eventsource-parser";
import { Mic, Square } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { responderIA, sugestoesIA } from "@/lib/sole-data";
import { NovoLancamento } from "@/components/Forms";
import { useCasal } from "@/lib/casal";
import { interpretarComandoLancamento, type RascunhoLancamento } from "@/lib/sole-command";
import { brl } from "@/lib/sole-data";
import { Button } from "@/components/ui/button";
import { recordWav } from "@/lib/record-wav";
import { supabase } from "@/integrations/supabase/client";

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
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: SoleAI,
});

type Mensagem = { de: "user" | "ai"; texto: string };

type Gravacao = Awaited<ReturnType<typeof recordWav>>;

async function lerMensagemErro(response: Response) {
  try {
    const body = (await response.json()) as { message?: string };
    return body.message ?? "Não foi possível transcrever a gravação.";
  } catch {
    return "Não foi possível transcrever a gravação.";
  }
}

async function transcrever(file: File) {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("Sua sessão expirou. Entre novamente.");

  const form = new FormData();
  form.append("file", file, file.name);
  const response = await fetch("/api/transcribe", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  if (!response.ok) throw new Error(await lerMensagemErro(response));
  if (!response.body) throw new Error("A transcrição não retornou conteúdo.");

  let textoFinal = "";
  let textoParcial = "";
  let erroFluxo = "";
  const parser = createParser({
    onEvent(event) {
      if (event.data === "[DONE]") return;
      try {
        const payload = JSON.parse(event.data) as { type?: string; delta?: string; text?: string; message?: string; error?: { message?: string } };
        const tipo = payload.type ?? event.event;
        if (tipo === "transcript.text.delta" && payload.delta) textoParcial += payload.delta;
        if (tipo === "transcript.text.done" && payload.text) textoFinal = payload.text;
        if (tipo?.includes("error")) erroFluxo = payload.error?.message ?? payload.message ?? "A transcrição foi interrompida.";
      } catch {
        // Frames sem JSON não fazem parte da transcrição.
      }
    },
  });
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    parser.feed(decoder.decode(value, { stream: true }));
  }
  parser.feed(decoder.decode());
  if (erroFluxo) throw new Error(erroFluxo);
  const resultado = (textoFinal || textoParcial).trim();
  if (!resultado) throw new Error("Não consegui ouvir o comando. Tente falar novamente.");
  return resultado;
}

function extrairComandoDeVoz(transcricao: string) {
  const normalizada = transcricao.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const gatilho = normalizada.match(/^\s*(?:sole|soli|sol|soule)\s*[,.:;!?-]*\s*/i);
  const semGatilho = gatilho ? transcricao.slice(gatilho[0].length) : transcricao;
  const comando = semGatilho.trim().replace(/^eu\s+/i, "");
  return /^(?:gastei|paguei|comprei|desembolsei|recebi|ganhei|entrou|caiu)\b/i.test(comando) ? comando : null;
}

function SoleAI() {
  const [mensagens, setMensagens] = useState<Mensagem[]>([]);
  const [texto, setTexto] = useState("");
  const [rascunho, setRascunho] = useState<RascunhoLancamento | null>(null);
  const [gravando, setGravando] = useState(false);
  const [transcrevendo, setTranscrevendo] = useState(false);
  const [erroVoz, setErroVoz] = useState("");
  const [comandoPendente, setComandoPendente] = useState("");
  const gravacao = useRef<Gravacao | null>(null);
  const { data: casal } = useCasal();

  useEffect(() => () => {
    if (gravacao.current) void gravacao.current.stop().catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!casal || !comandoPendente) return;
    const comando = comandoPendente;
    setComandoPendente("");
    enviar(comando);
  }, [casal, comandoPendente]);

  function enviar(pergunta: string) {
    const limpa = pergunta.trim().slice(0, 300);
    if (!limpa) return;
    const pareceLancamento = /\b(gastei|paguei|comprei|desembolsei|recebi|ganhei|entrou|caiu)\b/i.test(limpa);
    if (pareceLancamento && !casal) {
      setComandoPendente(limpa);
      setTexto("");
      return;
    }
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

  async function finalizarGravacao() {
    const atual = gravacao.current;
    if (!atual) return;
    gravacao.current = null;
    setGravando(false);
    setTranscrevendo(true);
    try {
      const transcricao = await transcrever(await atual.stop());
      const comando = extrairComandoDeVoz(transcricao);
      if (!comando) {
        setErroVoz('Comece dizendo “Sole gastei…” ou “Sole recebi…”.');
        return;
      }
      enviar(comando);
    } catch (error) {
      setErroVoz(error instanceof Error ? error.message : "Não foi possível entender a gravação.");
    } finally {
      setTranscrevendo(false);
    }
  }

  async function alternarGravacao() {
    setErroVoz("");
    if (gravacao.current) {
      await finalizarGravacao();
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia) {
      setErroVoz("Este navegador não permite gravação por microfone.");
      return;
    }
    try {
      gravacao.current = await recordWav({
        onSpeechEnd: () => void finalizarGravacao(),
      });
      setGravando(true);
    } catch {
      setErroVoz("Permita o acesso ao microfone para registrar por voz.");
    }
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
        className="mt-6 flex items-stretch gap-2"
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
          className="min-w-0 flex-1 rounded-2xl border border-border bg-secondary px-4 py-3 text-[13px] outline-none placeholder:text-muted-foreground focus:border-accent"
        />
        <Button
          type="button"
          size="icon"
          variant={gravando ? "destructive" : "outline"}
          onClick={alternarGravacao}
          disabled={transcrevendo}
          aria-label={gravando ? "Parar gravação" : "Registrar por voz"}
          title={gravando ? "Parar gravação" : "Registrar por voz"}
          className="h-auto w-12 shrink-0 rounded-2xl"
        >
          {gravando ? <Square /> : <Mic />}
        </Button>
        <Button
          type="submit"
          disabled={gravando || transcrevendo}
          className="h-auto rounded-2xl px-4 text-[13px]"
        >
          {transcrevendo ? "Ouvindo…" : "Enviar"}
        </Button>
      </form>

      {(gravando || erroVoz) && (
        <p className={`mt-2 text-[12px] ${erroVoz ? "text-destructive" : "text-accent"}`} role={erroVoz ? "alert" : "status"}>
          {erroVoz || 'Gravando… diga “Sole gastei…” ou “Sole recebi…”. A gravação termina ao concluir a fala.'}
        </p>
      )}

      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
        Digite ou toque no microfone e comece com “Sole gastei…” ou “Sole recebi…”. O lançamento só é salvo depois da sua confirmação.
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
