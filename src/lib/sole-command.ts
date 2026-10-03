import { categoriasDespesa, categoriasReceita, type Casal, type Lancamento } from "@/lib/casal";

export type RascunhoLancamento = Omit<Lancamento, "id">;

const regrasDespesa: Array<[string, string[]]> = [
  ["Alimentação", ["mercado", "supermercado", "restaurante", "lanche", "delivery", "comida", "padaria"]],
  ["Transporte", ["uber", "99", "combustível", "gasolina", "ônibus", "metro", "metrô", "estacionamento"]],
  ["Moradia", ["aluguel", "condomínio", "reforma", "casa"]],
  ["Saúde", ["farmácia", "remédio", "médico", "consulta", "exame", "dentista"]],
  ["Educação", ["curso", "escola", "faculdade", "livro"]],
  ["Lazer", ["cinema", "viagem", "show", "passeio", "bar"]],
  ["Compras", ["roupa", "sapato", "presente", "shopping"]],
  ["Contas", ["luz", "água", "internet", "telefone", "celular", "fatura"]],
  ["Investimento", ["investimento", "aporte", "cdb", "tesouro", "ações"]],
];

const regrasReceita: Array<[string, string[]]> = [
  ["Salário", ["salário", "salario", "pagamento", "holerite"]],
  ["Projeto", ["projeto", "freela", "freelance", "consultoria", "cliente"]],
  ["Rendimentos", ["rendimento", "dividendo", "juros", "aluguel recebido"]],
  ["Presente", ["presente", "doação", "doacao"]],
];

const normalizar = (texto: string) => texto.toLocaleLowerCase("pt-BR");

function dataDoComando(texto: string) {
  const hoje = new Date();
  if (normalizar(texto).includes("ontem")) hoje.setDate(hoje.getDate() - 1);
  const explicita = texto.match(/\b(\d{1,2})[\/-](\d{1,2})(?:[\/-](\d{2,4}))?\b/);
  if (explicita) {
    const anoInformado = explicita[3] ? Number(explicita[3]) : hoje.getFullYear();
    const ano = anoInformado < 100 ? 2000 + anoInformado : anoInformado;
    const mes = Number(explicita[2]);
    const dia = Number(explicita[1]);
    const data = new Date(ano, mes - 1, dia);
    if (data.getFullYear() === ano && data.getMonth() === mes - 1 && data.getDate() === dia) {
      return `${ano}-${String(mes).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    }
  }
  return hoje.toISOString().slice(0, 10);
}

function valorDoComando(texto: string) {
  const trecho = texto.match(/(?:r\$\s*)?(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})|\d+(?:[.,]\d{1,2})?)/i)?.[1];
  if (!trecho) return null;
  const valor = Number(trecho.includes(",") ? trecho.replace(/\./g, "").replace(",", ".") : trecho);
  return Number.isFinite(valor) && valor > 0 ? valor : null;
}

function categoriaDoComando(texto: string, tipo: Lancamento["tipo"]) {
  const regras = tipo === "despesa" ? regrasDespesa : regrasReceita;
  const categoria = regras.find(([, termos]) => termos.some((termo) => texto.includes(termo)))?.[0];
  const permitidas: readonly string[] = tipo === "despesa" ? categoriasDespesa : categoriasReceita;
  return categoria && permitidas.includes(categoria) ? categoria : "Outros";
}

function tituloDoComando(texto: string, valor: number) {
  const limpo = texto
    .replace(/r\$\s*/gi, "")
    .replace(String(valor).replace(".", ","), "")
    .replace(/\b(gastei|paguei|comprei|desembolsei|recebi|ganhei|entrou|caiu|quei|casal|lucas|hoje|ontem)\b/gi, "")
    .replace(/\b(de|do|da|no|na|por|para|em)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
  return limpo ? limpo.charAt(0).toUpperCase() + limpo.slice(1, 80) : "Lançamento pela SOLE AI";
}

export function interpretarComandoLancamento(comando: string, casal?: Casal): RascunhoLancamento | null {
  const texto = normalizar(comando);
  const despesa = /\b(gastei|paguei|comprei|desembolsei|gastou|pagou|comprou)\b/.test(texto);
  const receita = /\b(recebi|ganhei|entrou|caiu|recebeu|ganhou)\b/.test(texto);
  if (despesa === receita) return null;
  const valor = valorDoComando(texto);
  if (!valor || !casal) return null;
  const tipo: Lancamento["tipo"] = despesa ? "despesa" : "receita";
  const membros = casal.membros.map((m) => m.nome.split(" ")[0] ?? "").filter((nome) => nome.length > 0);
  const mencionado = membros.find((nome) => texto.includes(normalizar(nome)));
  const apelidoQuei = texto.includes("quei") ? membros.find((nome) => normalizar(nome).startsWith("quei")) ?? "Quei" : null;
  const eu = casal.membros.find((m) => m.user_id === casal.meuId)?.nome.split(" ")[0] ?? "Eu";
  const pagador = texto.includes("casal") ? "Casal" : mencionado ?? apelidoQuei ?? eu;

  return {
    tipo,
    titulo: tituloDoComando(comando, valor),
    categoria: categoriaDoComando(texto, tipo),
    valor,
    data: dataDoComando(texto),
    pagador,
    projeto_id: null,
  };
}