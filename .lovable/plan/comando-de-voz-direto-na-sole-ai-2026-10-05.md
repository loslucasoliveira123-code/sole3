# Comando de voz direto na SOLE AI

## O que será alterado
- Aceitar falas como “Sole gastei 50 no mercado” e “Sole recebi 2.000 de salário”, sem exigir “Sole registre”.
- Detectar quando a pessoa termina de falar e finalizar a gravação automaticamente, mantendo o botão de parar como alternativa.
- Assim que a transcrição for entendida, abrir automaticamente o lançamento preenchido para revisão.
- Manter a confirmação explícita antes de salvar, evitando registros financeiros incorretos.

## Detalhes técnicos
- Detectar voz e silêncio no áudio local, sem enviar áudio continuamente.
- Reaproveitar a transcrição autenticada e o interpretador determinístico já existentes.
- Atualizar os textos de orientação e validar gravação, transcrição e abertura da prévia.