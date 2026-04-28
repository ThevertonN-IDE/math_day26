import { supabaseClient } from './supabase_client.js';

console.log("🚀 Admin.js carregado com sucesso!");

// --- 1. FUNÇÕES GLOBAIS (Para o HTML enxergar os botões de excluir) ---
window.excluirTurma = async (id) => {
    if (confirm("Deseja realmente excluir esta turma? Isso apagará todos os pontos dela!")) {
        const { error } = await supabaseClient.from('turmas').delete().eq('id', id);
        if (error) alert("Erro ao excluir: " + error.message);
        else carregarTurmasAdmin();
    }
};

window.excluirAtividade = async (id) => {
    if (confirm("Excluir esta sala?")) {
        await supabaseClient.from('atividades').delete().eq('id', id);
        carregarAtividadesAdmin();
    }
};

// --- 2. FUNÇÃO PRINCIPAL DE VERIFICAÇÃO ---
async function verificarAcesso() {
    const { data: { session } } = await supabaseClient.auth.getSession();

    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    const { data: perfil, error } = await supabaseClient
        .from('perfis')
        .select('is_boss')
        .eq('id', session.user.id)
        .single();

    if (error) {
        console.error("Erro ao buscar perfil:", error.message);
        return;
    }

    // TUDO QUE DEPENDE DO PERFIL FICA AQUI DENTRO
    if (perfil?.is_boss) {
        console.log("⭐ Modo Boss confirmado!");
        const adminSection = document.getElementById('admin-turmas-section');
        if (adminSection) {
            adminSection.style.display = 'block';
            carregarTurmasAdmin();
            carregarAtividadesAdmin();
            configurarFormulariosAdmin();
        }
    }

    // Carrega os selects de pontuação para TODO MUNDO (Boss e Bolsista)
    popularSelects();
}

// --- 3. CARREGAMENTO DE LISTAS (ADMIN) ---
async function carregarTurmasAdmin() {
    const { data: turmas } = await supabaseClient.from('turmas').select('*').order('nome_exibicao');
    const lista = document.getElementById('lista-turmas-admin');
    if (lista && turmas) {
        // Correção: usando 'turmas.map' e 't.nome_exibicao'
        lista.innerHTML = turmas.map(t => `
            <li>
                ${t.nome_exibicao} 
                <button onclick="excluirTurma('${t.id}')" class="btn-delete">Excluir</button>
            </li>
        `).join('');
    }
}

async function carregarAtividadesAdmin() {
    const { data: atividades } = await supabaseClient.from('atividades').select('*').order('nome_sala');
    const lista = document.getElementById('lista-atividades-admin');
    if (lista && atividades) {
        // Correção: usando 'atividades.map' e 'a.nome_sala'
        lista.innerHTML = atividades.map(a => `
            <li>
                ${a.nome_sala} 
                <button onclick="excluirAtividade('${a.id}')" class="btn-delete">Excluir</button>
            </li>
        `).join('');
    }
}

// --- 4. POPULAR SELECTS (PARA LANÇAR PONTOS) ---
async function popularSelects() {
    const { data: turmas } = await supabaseClient.from('turmas').select('*').order('nome_exibicao');
    const { data: atividades } = await supabaseClient.from('atividades').select('*').order('nome_sala');

    const selectTurma = document.getElementById('select-turma');
    const selectAtiv = document.getElementById('select-atividade');

    if (selectTurma && turmas) {
        selectTurma.innerHTML = '<option value="">Selecione a Turma</option>' +
            turmas.map(t => `<option value="${t.id}">${t.nome_exibicao}</option>`).join('');
    }
    if (selectAtiv && atividades) {
        selectAtiv.innerHTML = '<option value="">Selecione a Atividade</option>' +
            atividades.map(a => `<option value="${a.id}">${a.nome_sala}</option>`).join('');
    }
}

// --- 5. CONFIGURAÇÃO DE FORMS ---
function configurarFormulariosAdmin() {
    document.getElementById('cadastro-atividade-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome-nova-sala').value;
        await supabaseClient.from('atividades').insert([{ nome_sala: nome }]);
        document.getElementById('cadastro-atividade-form').reset();
        carregarAtividadesAdmin();
        popularSelects(); // Atualiza o select de lançar pontos também
    });

    document.getElementById('cadastro-turma-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('novo-nome-turma').value;
        await supabaseClient.from('turmas').insert([{ nome_exibicao: nome, pontuacao_total: 0 }]);
        document.getElementById('cadastro-turma-form').reset();
        carregarTurmasAdmin();
        popularSelects();
    });
}

document.getElementById('logout-btn')?.addEventListener('click', async (e) => {
    e.preventDefault(); // Impede a página de recarregar antes da hora

    console.log("Encerrando sessão...");

    const { error } = await supabaseClient.auth.signOut();

    if (error) {
        console.error("Erro ao sair:", error.message);
    } else {
        // Limpa qualquer dado residual e manda para o login
        window.location.href = 'login.html';
    }
});
// --- 6. LÓGICA DE LANÇAMENTO DE PONTOS ---
document.getElementById('pontos-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const turmaId = document.getElementById('select-turma').value;
    const atividadeId = document.getElementById('select-atividade').value;
    const pontos = parseInt(document.getElementById('input-pontos').value);
    const feedback = document.getElementById('feedback');

    try {
        // 1. Registra o log na tabela (importante para o desempate que criamos)
        const { error: errorLog } = await supabaseClient
            .from('logs_pontuacao')
            .insert([{ turma_id: turmaId, atividade_id: atividadeId, pontos: pontos }]);
        if (errorLog) throw errorLog;

        // 2. Busca o total atual da turma
        const { data: turma, error: errorTurma } = await supabaseClient
            .from('turmas')
            .select('pontuacao_total')
            .eq('id', turmaId)
            .single();
        if (errorTurma) throw errorTurma;

        // 3. Atualiza a pontuação total
        const novoTotal = (turma.pontuacao_total || 0) + pontos;
        const { error: errorUpdate } = await supabaseClient
            .from('turmas')
            .update({ pontuacao_total: novoTotal })
            .eq('id', turmaId);
        if (errorUpdate) throw errorUpdate;

        // Sucesso visual
        feedback.style.display = 'block';
        feedback.style.color = 'var(--success)';
        feedback.innerText = "✅ Pontuação lançada com sucesso!";
        document.getElementById('pontos-form').reset();

        // Some com a mensagem após 3 segundos
        setTimeout(() => feedback.style.display = 'none', 3000);

    } catch (err) {
        feedback.style.display = 'block';
        feedback.style.color = 'var(--error)';
        feedback.innerText = "❌ Erro ao lançar: " + err.message;
    }
});
verificarAcesso();