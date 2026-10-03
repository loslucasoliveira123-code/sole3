# Edição de lançamentos e registros pela SOLE AI

## O que será construído

### 1. Editar e excluir lançamentos
- Tornar cada item da tela **Movimentos** selecionável.
- Abrir o formulário preenchido ao selecionar um lançamento.
- Permitir alterar tipo, descrição, valor, data, categoria, pagador/recebedor e projeto.
- Incluir exclusão com uma confirmação explícita para evitar remoções acidentais.
- Atualizar imediatamente painel, totais, projetos e listas após salvar ou excluir.

### 2. Registrar pela SOLE AI
- Reconhecer comandos simples em português, como:
  - “Gastei 180 no mercado”
  - “Recebi 2.500 de salário ontem”
  - “Quei pagou 70 de farmácia”
- Extrair valor, tipo, descrição, data, categoria e pagador/recebedor.
- Usar o **usuário atual** como identificação padrão quando o comando não informar outra pessoa.
- Inferir categorias por termos comuns, mantendo “Outros” quando não houver correspondência segura.
- Mostrar uma prévia editável antes de registrar; o lançamento só será criado após confirmação.
- Exibir confirmação no chat e refletir o novo registro em todas as telas.

## Regras de segurança e comportamento
- A SOLE AI nunca inventará valor nem salvará comandos ambíguos sem os dados mínimos.
- Edição e remoção continuarão restritas aos integrantes do casal pelas regras existentes.
- Nenhuma alteração estrutural no banco de dados é necessária.

## Validação
- Testar criação pela SOLE AI, edição completa e exclusão.
- Conferir atualização dos totais e funcionamento em telas móvel e desktop.
