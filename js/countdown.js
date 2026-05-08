/**
 * Lógica do Contador Regressivo - II MATDAY
 */

const targetDate = new Date("May 13, 2026 00:00:00").getTime();

function updateCountdown() {
    const now = new Date().getTime();
    const distance = targetDate - now;

    // Cálculos matemáticos para dias, horas, minutos e segundos
    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((distance % (1000 * 60)) / 1000);

    // Atualiza o HTML se os elementos existirem
    if (document.getElementById("days")) {
        document.getElementById("days").innerText = days.toString().padStart(2, '0');
        document.getElementById("hours").innerText = hours.toString().padStart(2, '0');
        document.getElementById("minutes").innerText = minutes.toString().padStart(2, '0');
        document.getElementById("seconds").innerText = seconds.toString().padStart(2, '0');
    }

    // Se o tempo acabar
    if (distance < 0) {
        clearInterval(timerInterval);
        document.getElementById("countdown").innerHTML = "<p style='font-size: 1.5rem; font-weight: bold; color: var(--warning);'>O EVENTO COMEÇOU! 🚀</p>";
    }
}

// Inicia o intervalo e executa a primeira vez imediatamente
const timerInterval = setInterval(updateCountdown, 1000);
updateCountdown();