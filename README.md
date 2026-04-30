# I MATHDAY - Sistema de Gestão e Ranking 

Sistema desenvolvido para o evento acadêmico **I MATHDAY** do **IFRN Campus Santa Cruz**, promovido pelos bolsistas do PIBID de Matemática. A aplicação gerencia o lançamento de pontuações em tempo real e exibe um ranking dinâmico para os participantes.

## Funcionalidades

- **Ranking em Tempo Real**: Placar dinâmico com critérios de desempate automáticos (versatilidade e agilidade).
- **Painel Administrativo**: Área restrita para bolsistas e coordenadores lançarem pontos e gerenciarem salas/turmas.
- **Contagem Regressiva**: Cronômetro de precisão para a abertura do evento.
- **Autenticação Segura**: Gerenciamento de acesso via Supabase Auth.
- **Design Responsivo**: Interface adaptada para dispositivos móveis e desktop.

## Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3 (Variables) e JavaScript Moderno (ESM).
- **Backend-as-a-Service**: [Supabase](https://supabase.com/) (Database & Auth).
- **Deploy**: [CapRover](https://caprover.com/) no servidor oficial do IFRN.

## Estrutura do Projeto

- `/`: Arquivos principais e configurações de infraestrutura.
- `/js`: Lógica modular do sistema (Auth, Admin, Ranking).
- `/pages`: Telas de login e painel de controle.
- `/css`: Definições de estilo e variáveis globais.
- `captain-definition`: Configuração de deploy para o CapRover.

## Configuração Local

1. Clone o repositório:
   ```bash
   git clone [https://github.com/thevertonn-ide/math_day26.git](https://github.com/thevertonn-ide/math_day26.git) 