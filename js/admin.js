import { supabaseClient } from './supabase_client.js';

console.log("🚀 Admin.js carregado com sucesso!");

// --- 1. FUNÇÕES GLOBAIS (Para o HTML enxergar) ---
// Em módulos, precisamos pendurar no 'window' para o onclick funcionar
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

// --- 2. VERIFICAÇÃO DE ACESSO ---
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

    // Se for boss, ativa as funções de admin
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
}

// --- 3. CARREGAMENTO DE LISTAS ---
async function carregarTurmasAdmin() {
    const { data: turmas } = await supabaseClient.from('turmas').select('*').order('nome_exibicao');
    const lista = document.getElementById('lista-turmas-admin');
    if (lista) {
        lista.innerHTML = turmas.map(t => `
            <li class="list-group-item d-flex justify-content-between align-items-center" style="padding: 10px; border-bottom: 1px solid #eee;">
                ${t.nome_exibicao}
                <button onclick="excluirTurma('${t.id}')" style="background: var(--error); color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">🗑️</button>
            </li>
        `).join('');
    }
}

async function carregarAtividadesAdmin() {
    const { data: atividades } = await supabaseClient.from('atividades').select('*').order('nome_sala');
    const lista = document.getElementById('lista-atividades-admin');
    if (lista) {
        lista.innerHTML = atividades.map(a => `
            <li class="list-group-item d-flex justify-content-between align-items-center" style="padding: 10px; border-bottom: 1px solid #eee;">
                ${a.nome_sala}
                <button onclick="excluirAtividade('${a.id}')" style="background: none; border: 1px solid var(--error); color: var(--error); padding: 5px 10px; border-radius: 4px; cursor: pointer;">Excluir</button>
            </li>
        `).join('');
    }
}

// --- 4. CONFIGURAÇÃO DE FORMS ---
function configurarFormulariosAdmin() {
    const formAtividade = document.getElementById('cadastro-atividade-form');
    formAtividade?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('nome-nova-sala').value;
        const { error } = await supabaseClient.from('atividades').insert([{ nome_sala: nome }]);
        if (error) alert("Erro: " + error.message);
        else {
            formAtividade.reset();
            carregarAtividadesAdmin();
        }
    });

    const formTurma = document.getElementById('cadastro-turma-form');
    formTurma?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nome = document.getElementById('novo-nome-turma').value;
        const { error } = await supabaseClient.from('turmas').insert([{ nome_exibicao: nome, pontuacao_total: 0 }]);
        if (error) alert("Erro: " + error.message);
        else {
            formTurma.reset();
            carregarTurmasAdmin();
        }
    });
}

// Inicializa tudo
verificarAcesso();