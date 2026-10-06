export type TranscriptionConfig = {
  baseURL: string;
  apiKey: string;
  model: string;
  maxFileBytes: number;
};

export async function transcribeAudio(config: TranscriptionConfig, file: File) {
  if (!file.size || file.size > config.maxFileBytes) throw new Error("Tamanho de áudio inválido");
  if (!file.type.startsWith("audio/")) throw new Error("Formato de áudio inválido");

  const form = new FormData();
  form.append("model", config.model);
  form.append("file", file, file.name);
  form.append("response_format", "json");
  form.append("stream", "true");
  if (config.model === "openai/gpt-transcribe") {
    form.append("languages", "pt");
    form.append("keywords", "Sole, gasto, gastei, paguei, comprei, recebi, ganhei, reais");
    form.append("prompt", "Comando financeiro curto em português do Brasil iniciado pela palavra Sole.");
  } else if (config.model === "google/gemini-3.5-transcribe") {
    form.append("language", "pt-BR");
  }

  return fetch(`${config.baseURL}/audio/transcriptions`, {
    method: "POST",
    headers: { Authorization: `Bearer ${config.apiKey}` },
    body: form,
  });
}