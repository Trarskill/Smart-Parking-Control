// js/settings.js

// Ця функція буде викликана з settings.js при зміні налаштувань
// Вона оновлює глобальний стан, коригує масив місць, перерисовує статистику та перезапускає симуляцію
document.addEventListener('DOMContentLoaded', () => {
    // Глобальна функція для оновлення налаштувань з settings.js
    const modal = document.getElementById('settings-modal');
    const openBtn = document.getElementById('open-settings-btn');
    const closeBtn = document.getElementById('close-settings-btn');
    const form = document.getElementById('settings-form');
    const msgEl = document.getElementById('settings-msg');

    const spotsInput = document.getElementById('setting-total-spots');
    const speedInput = document.getElementById('setting-sim-speed');
    // ГЛОБАЛЬНА ФУНКЦІЯ ДЛЯ ОНОВЛЕННЯ НАЛАШТУВАНЬ
    if (!modal || !openBtn) return;

    // Відкриття вікна (Зчитуємо поточні параметри з пам'яті)
    openBtn.addEventListener('click', () => {
        const state = JSON.parse(localStorage.getItem('smartParkingData')) || {};
        const settings = state.settings || { totalSpots: 55, simSpeed: 7 };
        
        spotsInput.value = settings.totalSpots;
        speedInput.value = settings.simSpeed;
        
        msgEl.classList.add('hidden');
        modal.classList.remove('hidden');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
    });

    // Обробка форми налаштувань
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const newSpots = parseInt(spotsInput.value, 10);
        const newSpeed = parseInt(speedInput.value, 10);

        // Валідація введених даних
        if (isNaN(newSpots) || newSpots < 21 || newSpots > 99) {
            showMsg('Помилка: Кількість місць (21 - 99)', 'text-red-500');
            return;
        }
        if (isNaN(newSpeed) || newSpeed < 2 || newSpeed > 60) {
            showMsg('Помилка: Швидкість має бути (2 - 60)', 'text-red-500');
            return;
        }
        
        // Оновлення глобального стану та виклик функції з script.js для застосування змін
        if (window.updateSystemSettings) {
            window.updateSystemSettings(newSpots, newSpeed);
            showMsg('Settings applied!', 'text-mint-dark text-base');
            
            setTimeout(() => {
                modal.classList.add('hidden');
            }, 1500);
        }
    });

    // Функція для відображення повідомлень у вікні налаштувань
    function showMsg(text, colorClass) {
        msgEl.textContent = text;
        msgEl.className = `text-sm font-medium hidden text-center mt-2 ${colorClass}`;
        msgEl.classList.remove('hidden');
    }
});