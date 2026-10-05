import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { transcribeAudio } from "@/lib/transcribe.server";

const MAX_AUDIO_BYTES = 14 * 1024 * 1024;
const MAX_REQUEST_BYTES = MAX_AUDIO_BYTES + 512 * 1024;

function errorResponse(message: string, status: number) {
  return Response.json({ message }, { status });
}

export const Route = createFileRoute("/api/transcribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authorization = request.headers.get("authorization");
        if (!authorization?.startsWith("Bearer ")) return errorResponse("Entre na sua conta para usar o comando de voz.", 401);

        const token = authorization.slice(7);
        const supabaseUrl = process.env["SUPABASE_URL"];
        const publishableKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
        const lovableApiKey = process.env["LOVABLE_API_KEY"];
        if (!supabaseUrl || !publishableKey || !lovableApiKey) {
          return errorResponse("O comando de voz ainda não está disponível.", 503);
        }

        const authClient = createClient(supabaseUrl, publishableKey, {
          global: { headers: { Authorization: `Bearer ${token}` } },
          auth: { persistSession: false, autoRefreshToken: false },
        });
        const { data, error } = await authClient.auth.getClaims(token);
        if (error || !data?.claims?.sub) return errorResponse("Sua sessão expirou. Entre novamente.", 401);

        const contentLength = Number(request.headers.get("content-length") ?? 0);
        if (contentLength > MAX_REQUEST_BYTES) return errorResponse("A gravação ficou muito grande. Grave um comando mais curto.", 413);

        let form: FormData;
        try {
          form = await request.formData();
        } catch {
          return errorResponse("Não foi possível ler a gravação.", 400);
        }
        const audio = form.get("file");
        if (!(audio instanceof File) || !audio.size || audio.size > MAX_AUDIO_BYTES || !audio.type.startsWith("audio/")) {
          return errorResponse("A gravação está vazia ou em um formato inválido.", 400);
        }

        let upstream: Response;
        try {
          upstream = await transcribeAudio(
            {
              baseURL: "https://ai.gateway.lovable.dev/v1",
              apiKey: lovableApiKey,
              model: "openai/gpt-transcribe",
              maxFileBytes: MAX_AUDIO_BYTES,
            },
            audio,
          );
        } catch {
          return errorResponse("Não foi possível enviar a gravação. Tente novamente.", 500);
        }

        const headers = new Headers();
        headers.set("content-type", upstream.headers.get("content-type") ?? "text/event-stream; charset=utf-8");
        headers.set("cache-control", "no-cache, no-transform");
        for (const [name, value] of upstream.headers) {
          if (name.toLowerCase().startsWith("x-lovable-aig-")) headers.set(name, value);
        }
        return new Response(upstream.body, { status: upstream.status, headers });
      },
    },
  },
});