import { supabaseClient } from './supabase_client.js';

const loginForm = document.getElementById('login-form');
const errorMessage = document.getElementById('error-message');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Tentativa de login no Supabase
    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        console.error('Erro no login:', error.message);
        errorMessage.style.display = 'block';
    } else {
        // Login com sucesso: Redireciona para o painel de lançamento de pontos
        console.log('Login realizado com sucesso!');
        window.location.href = 'painel.html';
    }
});