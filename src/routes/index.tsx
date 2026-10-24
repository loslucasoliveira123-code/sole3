import logo2 from "@/assets/sole3-logo-sem-fundo.png";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Entrar — SOLE3" },
      {
        name: "description",
        content: "Crie sua conta ou entre no SOLE3 para organizar o dinheiro do casal e seus projetos.",
      },
      { property: "og:title", content: "Entrar — SOLE3" },
      {
        property: "og:description",
        content: "Gestão financeira pessoal, do casal e de projetos. Crie sua conta grátis.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

type Modo = "entrar" | "cadastrar";

function AuthPage() {
  const navigate = useNavigate();
  const [modo, setModo] = useState<Modo>("entrar");
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/painel", replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" && session) navigate({ to: "/painel", replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setErro(null);
    setAviso(null);
    setCarregando(true);
    try {
      if (modo === "cadastrar") {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: senha,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: nome },
          },
        });
        if (error) throw error;
        if (!data.session) {
          setAviso("Enviamos um link de confirmação para o seu e-mail. Confirme para entrar.");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password: senha });
        if (error) throw error;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Algo deu errado.";
      setErro(
        msg.includes("Invalid login")
          ? "E-mail ou senha incorretos."
          : msg.includes("already registered")
            ? "Este e-mail já tem cadastro. Tente entrar."
            : msg,
      );
    } finally {
      setCarregando(false);
    }
  }

  async function social(provider: "google" | "apple") {
    setErro(null);
    const result = await lovable.auth.signInWithOAuth(provider, {
      redirect_uri: window.location.origin,
    });
    if (result.error) setErro("Não foi possível entrar agora. Tente novamente.");
  }

  const input =
    "w-full rounded-xl border border-border bg-card px-4 py-3 text-[15px] outline-none focus:border-foreground";

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-12">
      <div className="rise">
        <img src={logo2} alt="SOLE3" className="mx-auto size-56 object-contain" width={224} height={224} />
        <h1 className="mt-3 font-display text-[30px] leading-[1.05] tracking-tight text-balance">
          {modo === "entrar" ? "Bem-vindo de volta" : "O dinheiro do casal, organizado."}
        </h1>
        <p className="mt-3 text-[14px] text-muted-foreground">
          {modo === "entrar"
            ? "Com Deus no centro de todas as coisas, cada passo do casal segue em direção a um futuro próspero e abençoado."
            : "Crie sua conta e comece a planejar o futuro."}
        </p>
      </div>

      <div className="mt-8 grid gap-3">
        <button
          type="button"
          onClick={() => social("google")}
          className="rounded-xl border border-border bg-card px-4 py-3 text-[15px] font-medium hover:bg-accent"
        >
          Continuar com Google
        </button>
        <button
          type="button"
          onClick={() => social("apple")}
          className="rounded-xl bg-foreground px-4 py-3 text-[15px] font-medium text-background hover:opacity-90"
        >
          Continuar com Apple
        </button>
      </div>

      <div className="my-6 flex items-center gap-3 text-[12px] text-muted-foreground">
        <span className="h-px flex-1 bg-border" /> ou com e-mail <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={enviar} className="grid gap-3">
        {modo === "cadastrar" && (
          <input className={input} placeholder="Seu nome" value={nome} onChange={(e) => setNome(e.target.value)} required />
        )}
        <input className={input} type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
        <input className={input} type="password" placeholder="Senha" value={senha} onChange={(e) => setSenha(e.target.value)} required minLength={6} autoComplete={modo === "entrar" ? "current-password" : "new-password"} />
        {erro && <p className="text-[13px] text-destructive">{erro}</p>}
        {aviso && <p className="text-[13px] text-success">{aviso}</p>}
        <button
          type="submit"
          disabled={carregando}
          className="mt-1 rounded-xl bg-primary px-4 py-3 text-[15px] font-medium text-primary-foreground disabled:opacity-60"
        >
          {carregando ? "Aguarde…" : modo === "entrar" ? "Entrar" : "Criar conta"}
        </button>
      </form>

      <button
        type="button"
        onClick={() => {
          setModo(modo === "entrar" ? "cadastrar" : "entrar");
          setErro(null);
          setAviso(null);
        }}
        className="mt-6 text-center text-[14px] text-muted-foreground"
      >
        {modo === "entrar" ? "Ainda não tem conta? " : "Já tem conta? "}
        <span className="font-medium text-foreground underline underline-offset-4">
          {modo === "entrar" ? "Cadastre-se" : "Entrar"}
        </span>
      </button>
    </main>
  );
}
