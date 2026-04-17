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
    if (lista) {
        lista.innerHTML = turmas.map(t => `
            <li style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee;">
                ${t.nome_exibicao}
                <button onclick="excluirTurma('${t.id}')" style="background: #ff4d4d; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Excluir</button>
            </li>
        `).join('');
    }
}

async function carregarAtividadesAdmin() {
    const { data: atividades } = await supabaseClient.from('atividades').select('*').order('nome_sala');
    const lista = document.getElementById('lista-atividades-admin');
    if (lista) {
        lista.innerHTML = atividades.map(a => `
            <li style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #eee;">
                ${a.nome_sala}
                <button onclick="excluirAtividade('${a.id}')" style="background: none; border: 1px solid #ff4d4d; color: #ff4d4d; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Excluir</button>
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
    // Adicione isso ao final do seu admin.js
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
}

// Inicializa tudo
verificarAcesso();