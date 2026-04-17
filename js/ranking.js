import { supabaseClient } from './supabase_client.js';

async function carregarRanking() {
    const { data: ranking, error } = await supabaseClient
        .from('ranking_oficial')
        .select('*')
        // 1º Nível: Maior pontuação total
        .order('pontuacao_total', { ascending: false })
        
        // 2º Nível (Critério 1): Quem participou de mais atividades diferentes
        .order('total_atividades', { ascending: false })
        
        // 3º Nível (Critério 5): Quem chegou na pontuação primeiro (menor tempo)
        .order('ultimo_ponto_atribuido', { ascending: true });

    if (error) {
        console.error("Erro ao carregar ranking:", error);
        return;
    }

    exibirRankingNaTela(ranking);
}
// Executa a função assim que o DOM estiver carregado
document.addEventListener('DOMContentLoaded', carregarRanking);

// Opcional: Atualiza o ranking automaticamente a cada 30 segundos durante o evento
setInterval(carregarRanking, 30000); import CONFIG from './config.js';

// Inicializa o cliente do Supabase usando as configurações do config.js
const supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

/**
 * Procura os dados das turmas no Supabase e atualiza a tabela no HTML
 */
async function carregarRanking() {
    const rankingBody = document.getElementById('ranking-body');

    // Busca as turmas ordenadas pela maior pontuação
    const { data: turmas, error } = await supabaseClient
        .from('turmas')
        .select('nome_exibicao, pontuacao_total')
        .order('pontuacao_total', { ascending: false });

    if (error) {
        console.error('Erro ao procurar o ranking:', error.message);
        rankingBody.innerHTML = `<tr><td colspan="3">Erro ao carregar dados.</td></tr>`;
        return;
    }

    // Limpa a tabela antes de inserir os novos dados
    rankingBody.innerHTML = '';

    // Se não houver turmas registadas
    if (turmas.length === 0) {
        rankingBody.innerHTML = `<tr><td colspan="3">Nenhuma turma registada até ao momento.</td></tr>`;
        return;
    }

    // Preenche a tabela com os dados reais
    turmas.forEach((turma, index) => {
        const row = document.createElement('tr');

        // Destaque visual para o primeiro lugar
        const medalha = index === 0 ? '🥇' : `${index + 1}º`;

        row.innerHTML = `
            <td><strong>${medalha}</strong></td>
            <td>${turma.nome_exibicao}</td>
            <td>${turma.pontuacao_total} pts</td>
        `;

        rankingBody.appendChild(row);
    });
}

// Executa a função assim que o DOM estiver carregado
document.addEventListener('DOMContentLoaded', carregarRanking);

// Opcional: Atualiza o ranking automaticamente a cada 30 segundos durante o evento
setInterval(carregarRanking, 30000);
const { data: ranking } = await supabaseClient
    .from('turmas')
    .select('*')
    .order('pontuacao_total', { ascending: false }) // 1º critério: Pontos
    .order('vitorias_primeiro_lugar', { ascending: false }); // 2º critério: Desempate