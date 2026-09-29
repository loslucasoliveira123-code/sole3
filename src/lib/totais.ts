import { gastoProjeto, mesAtual, type Lancamento, type Meta, type Projeto } from "./casal";

export function calcularTotais(lanc: Lancamento[], metas: Meta[], projetos: Projeto[]) {
  const mes = mesAtual();
  let receitas = 0, despesas = 0, recMes = 0, despMes = 0;
  const porCat: Record<string, number> = {};
  for (const l of lanc) {
    const doMes = l.data.startsWith(mes);
    if (l.tipo === "receita") { receitas += l.valor; if (doMes) recMes += l.valor; }
    else {
      despesas += l.valor;
      if (doMes) { despMes += l.valor; porCat[l.categoria] = (porCat[l.categoria] ?? 0) + l.valor; }
    }
  }
  const guardado = metas.reduce((s, m) => s + m.atual, 0);
  const saldo = receitas - despesas;
  const patrimonio = saldo + guardado;
  const economia = recMes - despMes;

  // SOLE Score: poupança (40) + metas (30) + projetos no orçamento (30)
  const taxa = recMes > 0 ? Math.max(0, economia / recMes) : 0;
  const ptsPoup = Math.min(40, (taxa / 0.3) * 40);
  const progMetas = metas.length ? metas.reduce((s, m) => s + Math.min(1, m.atual / m.objetivo), 0) / metas.length : 0;
  const ptsMetas = progMetas * 30;
  const comOrc = projetos.filter((p) => p.orcamento > 0);
  const dentro = comOrc.filter((p) => gastoProjeto(lanc, p.id).gasto <= p.orcamento).length;
  const ptsProj = comOrc.length ? (dentro / comOrc.length) * 30 : lanc.length ? 15 : 0;
  const score = Math.round(ptsPoup + ptsMetas + ptsProj);
  const scoreTitulo = score >= 75 ? "Saúde financeira ótima" : score >= 50 ? "No caminho certo" : score > 0 ? "Pede atenção" : "Comece a registrar";
  const scoreTexto =
    recMes === 0
      ? "Registre as receitas do mês para calcular quanto vocês estão poupando."
      : `Vocês pouparam ${Math.round(taxa * 100)}% das receitas deste mês. O ideal é 30% ou mais.`;

  const orcamento = Object.entries(porCat)
    .sort((a, b) => b[1] - a[1])
    .map(([categoria, usado]) => ({ categoria, usado, pct: recMes > 0 ? (usado / recMes) * 100 : 100 }));

  return { receitas, despesas, recMes, despMes, saldo, patrimonio, guardado, economia, score, scoreTitulo, scoreTexto, orcamento };
}
