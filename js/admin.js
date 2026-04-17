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

// Inicializa a verificação
verificarAcesso();