import { supabaseClient } from './supabase_client.js';

console.log("🚀 Admin.js carregado com sucesso!");

async function verificarAcesso() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    console.log("Usuário logado:", session.user.email);

    const { data: perfil, error } = await supabaseClient
        .from('perfis')
        .select('is_boss')
        .eq('id', session.user.id)
        .single();

    if (error) {
        console.error("Erro ao buscar perfil:", error.message);
        return;
    }

    // Se for boss, mostra a seção
    if (perfil?.is_boss) {
        console.log("⭐ Modo Boss confirmado!");
        const adminSection = document.getElementById('admin-turmas-section');
        if (adminSection) {
            adminSection.style.display = 'block';
        }
    }
}
// --- FUNÇÕES DE TURMAS ---
async function carregarTurmasAdmin() {
    const { data: turmas } = await supabaseClient.from('turmas').select('*').order('nome_exibicao');
    const lista = document.getElementById('lista-turmas-admin');
    lista.innerHTML = turmas.map(t => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            ${t.nome_exibicao}
            <button onclick="excluirTurma('${t.id}')" class="btn btn-danger btn-sm">🗑️ Excluir</button>
        </li>
    `).join('');
}

async function excluirTurma(id) {
    if (confirm("Deseja realmente excluir esta turma? Isso apagará todos os pontos dela!")) {
        const { error } = await supabaseClient.from('turmas').delete().eq('id', id);
        if (error) alert("Erro ao excluir: " + error.message);
        else carregarTurmasAdmin();
    }
}

// --- FUNÇÕES DE ATIVIDADES ---
const formAtividade = document.getElementById('cadastro-atividade-form');
formAtividade?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('nome-nova-sala').value;
    
    const { error } = await supabaseClient
        .from('atividades')
        .insert([{ nome_sala: nome }]);

    if (error) alert("Erro: " + error.message);
    else {
        formAtividade.reset();
        carregarAtividadesAdmin();
        // Se você tiver um select de atividades na página, chame a função que o atualiza aqui
    }
});

async function carregarAtividadesAdmin() {
    const { data: atividades } = await supabaseClient.from('atividades').select('*').order('nome_sala');
    const lista = document.getElementById('lista-atividades-admin');
    lista.innerHTML = atividades.map(a => `
        <li class="list-group-item d-flex justify-content-between align-items-center">
            ${a.nome_sala}
            <button onclick="excluirAtividade('${a.id}')" class="btn btn-outline-danger btn-sm">Excluir</button>
        </li>
    `).join('');
}

async function excluirAtividade(id) {
    if (confirm("Excluir esta sala?")) {
        await supabaseClient.from('atividades').delete().eq('id', id);
        carregarAtividadesAdmin();
    }
}

// Chame essas funções dentro do bloco 'if (perfil.is_boss)'
if (perfil && perfil.is_boss) {
    document.getElementById('admin-turmas-section').style.display = 'block';
    carregarTurmasAdmin();
    carregarAtividadesAdmin();
}
// Inicializa a verificação
verificarAcesso();