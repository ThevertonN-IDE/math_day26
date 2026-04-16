import { supabaseClient } from './supabase_client.js';

// --- CONFIGURAÇÃO DE ADMINS ---
// Adicione aqui os e-mails que podem cadastrar turmas
const ADMIN_EMAILS = [
    'rubem.cabral@escolar.ifrn.edu.br', 
    'theverton.gutemberg@escolar.ifrn.edu.br'
];

const formPontos = document.getElementById('pontos-form');
const formTurma = document.getElementById('cadastro-turma-form');
const adminSection = document.getElementById('admin-turmas-section');
const selectTurma = document.getElementById('select-turma');
const selectAtividade = document.getElementById('select-atividade');
const feedback = document.getElementById('feedback');

// 1. Verificar Sessão e Permissão de Admin no Banco
async function verificarAcesso() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    const userEmail = session.user.email;

    // Consulta a tabela 'administradores' para ver se o e-mail está lá
    const { data: adminData, error } = await supabaseClient
        .from('administradores')
        .select('email')
        .eq('email', userEmail)
        .single();

    // Se o e-mail existir na tabela, mostra a seção de cadastro de turmas
    if (adminData) {
        document.getElementById('admin-turmas-section').style.display = 'block';
    }

    return session.user;
}

// 2. Função para carregar/recarregar os selects
async function carregarDados() {
    const { data: turmas } = await supabaseClient.from('turmas').select('*').order('nome_exibicao');
    selectTurma.innerHTML = '<option value="">Selecione a Turma</option>';
    turmas.forEach(t => {
        selectTurma.innerHTML += `<option value="${t.id}">${t.nome_exibicao}</option>`;
    });

    const { data: atividades } = await supabaseClient.from('atividades').select('*').order('nome_sala');
    selectAtividade.innerHTML = '<option value="">Selecione a Atividade</option>';
    atividades.forEach(a => {
        selectAtividade.innerHTML += `<option value="${a.id}">${a.nome_sala}</option>`;
    });
}

// 3. Lógica para CADASTRAR NOVA TURMA
formTurma.addEventListener('submit', async (e) => {
    e.preventDefault();
    const nome = document.getElementById('novo-nome-turma').value;

    const { error } = await supabaseClient
        .from('turmas')
        .insert([{ nome_exibicao: nome, pontuacao_total: 0 }]);

    if (error) {
        alert("Erro ao cadastrar turma: " + error.message);
    } else {
        alert("Turma '" + nome + "' cadastrada com sucesso! 🎉");
        formTurma.reset();
        carregarDados(); // Recarrega a lista para ela já aparecer no select de pontos
    }
});

// ... (Mantenha aqui a sua lógica de enviar pontos que já fizemos antes) ...

// Inicialização
verificarAcesso().then(() => carregarDados());