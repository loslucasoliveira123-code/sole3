# Plano: edição do nome do perfil

## O que será criado
- Adicionar na tela **Mais** uma seção **Seu perfil** com o nome atual da pessoa.
- Permitir editar e salvar o nome usado no aplicativo.
- Atualizar o nome tanto no perfil individual quanto na identificação compartilhada do casal.
- Refletir a mudança no avatar, no cabeçalho, na lista do casal e em futuros lançamentos.
- Exibir confirmação de sucesso ou uma mensagem clara em caso de erro.

## Detalhes técnicos
- Usar a sessão autenticada para garantir que cada pessoa altere somente o próprio nome.
- Validar e limitar o texto antes de salvar.
- Atualizar os dados em cache após o salvamento para a interface mudar imediatamente.
- Manter intactos os fluxos atuais de cadastro por e-mail, Apple e Google.

## Verificação
- Confirmar que a tela abre corretamente em celular e desktop.
- Testar a edição e o salvamento do nome com uma conta autenticada.
- Verificar que o novo nome aparece nas áreas do casal e no cabeçalho.
