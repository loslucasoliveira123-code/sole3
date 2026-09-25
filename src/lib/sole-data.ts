export type Espaco = "pessoal" | "casal" | "projetos";

export const brl = (value: number) =>
  value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  });

export const perfil = {
  nome: "Lucas",
  parceira: "Marina",
  iniciais: "LM",
};

export type Resumo = {
  patrimonio: number;
  variacao: string;
  saldo: number;
  economia: number;
  dividas: number;
  receitas: number;
  despesas: number;
  investimentos: number;
  score: number;
  scoreTitulo: string;
  scoreTexto: string;
};

export const resumos: Record<Espaco, Resumo> = {
  pessoal: {
    patrimonio: 214800,
    variacao: "+2,8% no mês",
    saldo: 18240,
    economia: 640,
    dividas: 3120,
    receitas: 9200,
    despesas: 7180,
    investimentos: 86400,
    score: 79,
    scoreTitulo: "Boa trajetória.",
    scoreTexto:
      "Sua taxa de poupança está em 22%. Ampliar a reserva de emergência é o próximo passo natural.",
  },
  casal: {
    patrimonio: 486320,
    variacao: "+4,2% no mês",
    saldo: 38412,
    economia: 1204,
    dividas: 6890,
    receitas: 18400,
    despesas: 14820,
    investimentos: 182400,
    score: 86,
    scoreTitulo: "Saúde financeira sólida.",
    scoreTexto:
      "Bom fluxo de caixa e reserva crescendo. Mantenha as despesas sob controle para subir de nível.",
  },
  projetos: {
    patrimonio: 168000,
    variacao: "+6,1% no mês",
    saldo: 62600,
    economia: 4200,
    dividas: 0,
    receitas: 42000,
    despesas: 28400,
    investimentos: 0,
    score: 72,
    scoreTitulo: "Projetos dentro do plano.",
    scoreTexto:
      "A Nova Loja consumiu 58% do orçamento com 51% das etapas concluídas. Atenção ao ritmo de obras.",
  },
};

export const insights: Record<Espaco, string> = {
  pessoal:
    "Suas despesas com delivery subiram 18% frente à média de 3 meses. Reduzir duas noites por semana libera cerca de R$ 240.",
  casal:
    "Seu lazer passou 20% do limite. Redirecionar R$ 200 para investimentos mantém a meta da viagem em dia.",
  projetos:
    "Existe uma concentração de pagamentos de R$ 14.800 entre os dias 5 e 10 do próximo mês no projeto Nova Loja.",
};

export const fluxo = [70, 55, 82, 40, 64, 30, 74, 36, 58, 88, 44, 66];

export type Orcamento = {
  categoria: string;
  usado: number;
  limite: number;
  estado: "ok" | "atencao" | "excedido";
};

export const orcamentos: Orcamento[] = [
  { categoria: "Moradia", usado: 3400, limite: 3600, estado: "ok" },
  { categoria: "Alimentação", usado: 1100, limite: 1150, estado: "atencao" },
  { categoria: "Transporte", usado: 480, limite: 800, estado: "ok" },
  { categoria: "Lazer", usado: 720, limite: 600, estado: "excedido" },
];

export type Movimento = {
  id: string;
  titulo: string;
  categoria: string;
  quando: string;
  valor: number;
  pessoa: string;
  iniciais: string;
};

export const movimentos: Movimento[] = [
  {
    id: "1",
    titulo: "Mercado Central",
    categoria: "Alimentação · Supermercado",
    quando: "Hoje, 12:40",
    valor: -128.4,
    pessoa: "Marina",
    iniciais: "AL",
  },
  {
    id: "2",
    titulo: "99 Corrida",
    categoria: "Transporte · Aplicativo",
    quando: "Hoje, 08:15",
    valor: -24.9,
    pessoa: "Lucas",
    iniciais: "TR",
  },
  {
    id: "3",
    titulo: "Salário",
    categoria: "Receita · Trabalho",
    quando: "29 nov",
    valor: 9200,
    pessoa: "Lucas",
    iniciais: "RE",
  },
  {
    id: "4",
    titulo: "Fatura Platinum",
    categoria: "Cartão · Pagamento",
    quando: "28 nov",
    valor: -3420,
    pessoa: "Casal",
    iniciais: "CA",
  },
  {
    id: "5",
    titulo: "Aporte CDB",
    categoria: "Investimento · Renda fixa",
    quando: "27 nov",
    valor: -2000,
    pessoa: "Marina",
    iniciais: "IN",
  },
  {
    id: "6",
    titulo: "Aluguel",
    categoria: "Moradia · Aluguel",
    quando: "26 nov",
    valor: -2850,
    pessoa: "Casal",
    iniciais: "MO",
  },
  {
    id: "7",
    titulo: "Consultoria",
    categoria: "Receita · Projeto",
    quando: "24 nov",
    valor: 6400,
    pessoa: "Marina",
    iniciais: "RE",
  },
];

export type Projeto = {
  id: string;
  nome: string;
  descricao: string;
  orcamento: number;
  gasto: number;
  receita: number;
  status: string;
  prazo: string;
};

export const projetos: Projeto[] = [
  {
    id: "nova-loja",
    nome: "Nova Loja",
    descricao: "Abertura da unidade no shopping norte",
    orcamento: 150000,
    gasto: 87400,
    receita: 32000,
    status: "Em execução",
    prazo: "Mar 2026",
  },
  {
    id: "reforma",
    nome: "Reforma do apartamento",
    descricao: "Cozinha, varanda e pintura geral",
    orcamento: 60000,
    gasto: 41200,
    receita: 0,
    status: "Em execução",
    prazo: "Jan 2026",
  },
  {
    id: "casamento",
    nome: "Casamento",
    descricao: "Cerimônia e festa para 120 convidados",
    orcamento: 90000,
    gasto: 18600,
    receita: 0,
    status: "Planejamento",
    prazo: "Nov 2026",
  },
];

export type Meta = {
  id: string;
  nome: string;
  objetivo: number;
  atual: number;
  aporte: number;
  previsao: string;
  tipo: "Compartilhada" | "Individual";
};

export const metas: Meta[] = [
  {
    id: "reserva",
    nome: "Reserva de emergência",
    objetivo: 50000,
    atual: 18400,
    aporte: 1200,
    previsao: "Março de 2028",
    tipo: "Compartilhada",
  },
  {
    id: "viagem",
    nome: "Viagem ao Japão",
    objetivo: 32000,
    atual: 11800,
    aporte: 900,
    previsao: "Setembro de 2027",
    tipo: "Compartilhada",
  },
  {
    id: "carro",
    nome: "Troca do carro",
    objetivo: 85000,
    atual: 24200,
    aporte: 1500,
    previsao: "Maio de 2029",
    tipo: "Individual",
  },
];

export const sugestoesIA = [
  "Quanto posso gastar este mês?",
  "Como estão nossas finanças?",
  "Analise meus gastos.",
  "Como está nosso projeto?",
  "Quanto precisamos economizar?",
];

export const respostasIA: { gatilhos: string[]; resposta: string }[] = [
  {
    gatilhos: ["gastar", "posso gastar", "disponível"],
    resposta:
      "Com base no orçamento de novembro, vocês têm R$ 2.300 livres depois das contas fixas e do aporte das metas. Gastar até R$ 1.800 mantém a meta da viagem no prazo.",
  },
  {
    gatilhos: ["finanças", "como estão", "saúde"],
    resposta:
      "O SOLE Score do casal está em 86/100. Receitas de R$ 18.400 contra despesas de R$ 14.820, com economia de R$ 1.204 no mês. O ponto de atenção é a categoria Lazer, 20% acima do limite.",
  },
  {
    gatilhos: ["gastos", "analise", "maior despesa"],
    resposta:
      "As três maiores despesas do mês foram Moradia (R$ 3.400), Fatura Platinum (R$ 3.420) e Alimentação (R$ 1.100). O crescimento veio do cartão, 23% acima da média dos últimos 3 meses.",
  },
  {
    gatilhos: ["projeto", "loja", "obra"],
    resposta:
      "A Nova Loja consumiu R$ 87.400 de um orçamento de R$ 150.000 (58,3%), restando R$ 62.600. As receitas realizadas somam R$ 32.000. Há concentração de pagamentos entre os dias 5 e 10.",
  },
  {
    gatilhos: ["economizar", "meta", "reserva"],
    resposta:
      "Para atingir a reserva de R$ 50.000 até dezembro de 2027, o aporte precisa subir de R$ 1.200 para R$ 1.960 por mês. Hoje sobram R$ 2.300, então é viável.",
  },
];

export function responderIA(pergunta: string) {
  const texto = pergunta.toLowerCase();
  const achado = respostasIA.find((r) => r.gatilhos.some((g) => texto.includes(g)));
  return (
    achado?.resposta ??
    "Ainda não tenho dados suficientes para responder isso com precisão. Registre os lançamentos relacionados e eu refaço a análise — nunca vou estimar números que não existem."
  );
}
