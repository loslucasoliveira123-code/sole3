import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { CONVITE_KEY } from "@/lib/casal";

export const Route = createFileRoute("/convite/$codigo")({
  head: () => ({
    meta: [
      { title: "Convite para o SOLE3" },
      { name: "description", content: "Você foi convidado(a) para compartilhar as finanças do casal no SOLE3." },
      { property: "og:title", content: "Convite para o SOLE3" },
      { property: "og:description", content: "Crie sua conta e veja os mesmos dados do casal." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Convite,
});

function Convite() {
  const { codigo } = Route.useParams();
  const navigate = useNavigate();
  useEffect(() => {
    if (/^[a-f0-9]{8,64}$/.test(codigo)) localStorage.setItem(CONVITE_KEY, codigo);
    navigate({ to: "/", replace: true });
  }, [codigo, navigate]);
  return <p className="p-10 text-center text-[14px] text-muted-foreground">Abrindo convite…</p>;
}
