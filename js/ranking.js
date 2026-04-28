import { supabaseClient } from './supabase_client.js';

/**
 * Gerencia a visibilidade da interface de ranking
 * @param {Array} turmas - Dados vindos do Supabase
 */
function gerenciarInterface(turmas) {
    const secaoRanking = document.getElementById('secao-ranking');
    const avisoRanking = document.getElementById('aviso-ranking');
    const tabelaBody = document.getElementById('tabela-ranking-body');

    // Se não houver turmas ou pontos, mantemos o suspense
    if (!turmas || turmas.length === 0) {
        secaoRanking.style.display = 'none';
        avisoRanking.style.display = 'block';
        return;
    }

    // Se houver dados, mostramos o ranking e escondemos o aviso
    tabelaBody.innerHTML = turmas.map((t, index) => {
        const medalha = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}º`;
        return `
            <tr>
                <td><span class="rank-badge">${medalha}</span></td>
                <td>${t.nome_exibicao}</td>
                <td><strong>${t.pontuacao_total}</strong> <small>pts</small></td>
            </tr>
        `;
    }).join('');

    secaoRanking.style.display = 'block';
    avisoRanking.style.display = 'none';
}

async function carregarRanking() {
    try {
        const { data: ranking, error } = await supabaseClient
            .from('ranking_oficial')
            .select('*')
            .order('pontuacao_total', { ascending: false })
            .order('total_atividades', { ascending: false })
            .order('ultimo_ponto_atribuido', { ascending: true });

        if (error) throw error;

        gerenciarInterface(ranking);
    } catch (err) {
        console.error("Erro na sincronização do MATDAY:", err.message);
    }
}

// Inicialização Única
document.addEventListener('DOMContentLoaded', carregarRanking);

// Polling de 30s apenas para o dia do evento
setInterval(carregarRanking, 30000);