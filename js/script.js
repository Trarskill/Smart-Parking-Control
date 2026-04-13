// js/script.js

document.addEventListener('DOMContentLoaded', () => {
    // Користувацький інтерфейс і логіка працюють разом
    const STORAGE_KEY = 'smartParkingData';
    let appState = JSON.parse(localStorage.getItem(STORAGE_KEY));
    let lastUpdateTimestamp = Date.now(); 
    let simTimerId = null; // Для керування швидкістю симуляції

    if (!appState) {
        appState = {
            logs: [],
            mapSpots: {},
            settings: { totalSpots: 55, simSpeed: 7 }
        };
    } else if (!appState.settings) {
        // Якщо старі збереження не мали налаштувань
        appState.settings = { totalSpots: 55, simSpeed: 7 };
    }

    // Функція "самолікування" на основі налаштувань
    // додає або видаляє місця, щоб їх кількість відповідала налаштуванням
    function syncSpotsCount() {
        const TOTAL = appState.settings.totalSpots;
        const hardcodedSpots = [
            'A-01','A-02','A-03','A-04','A-05','A-06','A-07','A-08','A-09','A-10',
            'B-01','B-02','B-03','B-04','B-05','B-06','B-07','B-08','B-09','B-10','B-11'
        ];
        
        hardcodedSpots.forEach(id => {
            if (!appState.mapSpots[`spot-${id}`]) appState.mapSpots[`spot-${id}`] = 'free'; 
        });

        let currentSpotKeys = Object.keys(appState.mapSpots);
        
        // Додаємо нові місця, якщо потрібно
        if (currentSpotKeys.length < TOTAL) {
            let eIndex = 1;
            while (currentSpotKeys.length < TOTAL) {
                const newId = `spot-E-${String(eIndex).padStart(2, '0')}`;
                if (!appState.mapSpots[newId]) {
                    appState.mapSpots[newId] = 'free';
                    currentSpotKeys.push(newId);
                }
                eIndex++;
            }
        } 
        else if (currentSpotKeys.length > TOTAL) {
            const keysToRemove = currentSpotKeys.slice(TOTAL);
            keysToRemove.forEach(key => delete appState.mapSpots[key]);
            currentSpotKeys = Object.keys(appState.mapSpots); 
        }

        // Запобігання багу: якщо зайнятих місць більше, ніж всього фізичних місць
        let occupiedCount = Object.values(appState.mapSpots).filter(s => s === 'occupied').length;
        if (occupiedCount > TOTAL) {
            for (const key of currentSpotKeys) {
                if(appState.mapSpots[key] === 'occupied') {
                    appState.mapSpots[key] = 'free';
                    occupiedCount--;
                    if(occupiedCount <= TOTAL) break;
                }
            }
        }
        saveState();
    }

    function saveState() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(appState));
    }

    function getAvailableCount() {
        return Object.values(appState.mapSpots).filter(status => status === 'free').length;
    }

    // Допоміжні функції виводу часу та генерації випадкових даних
    function updateClockUI() {
        const lastUpdateEl = document.getElementById('last-update-time');
        if (!lastUpdateEl) return;
        const diffSeconds = Math.floor((Date.now() - lastUpdateTimestamp) / 1000);
        if (diffSeconds < 60) {
            lastUpdateEl.textContent = `Система працює стабільно. Оновлено: ${diffSeconds} сек. тому`;
        } else {
            lastUpdateEl.textContent = `Система працює стабільно. Оновлено: ${Math.floor(diffSeconds / 60)} хв. тому`;
        }
    }
    setInterval(updateClockUI, 1000);

    // Генерація випадкових номерів для логів
    function renderStats() {
        const availableSpotsEl = document.getElementById('available-spots');
        const occupancyRateEl = document.getElementById('occupancy-rate');
        const avgTimeEl = document.getElementById('avg-time');
        const totalSpotsEl = document.getElementById('total-spots');

        if (availableSpotsEl) {
            const TOTAL = appState.settings.totalSpots;
            const currentAvailable = getAvailableCount();
            const occupiedSpots = TOTAL - currentAvailable;
            const occupancyPercentage = ((occupiedSpots / TOTAL) * 100).toFixed(2);
            
            // Тепер час генерується заново при кожному виклику renderStats()
            if (avgTimeEl) {
                avgTimeEl.textContent = `${getRandomInt(10, 40)}хв`;
            }

            if(totalSpotsEl) totalSpotsEl.textContent = TOTAL;
            availableSpotsEl.textContent = currentAvailable;
            occupancyRateEl.textContent = `${occupancyPercentage}%`;
        }
    }

    function renderLogs() {
        const logTableBody = document.getElementById('log-table-body');
        if (!logTableBody) return; 
        logTableBody.innerHTML = ''; 
        appState.logs.forEach(log => {
            const badgeClass = log.isEntry ? "status-badge-in" : "status-badge-out";
            const rowHTML = `
                <tr class="border-b border-mint-dark/20 hover:bg-white/30 transition-colors">
                    <td class="text-body px-4 py-3 font-medium whitespace-nowrap">${log.plate}</td>
                    <td class="text-body px-4 py-3 whitespace-nowrap">${log.sector}</td>
                    <td class="text-body px-4 py-3 text-graphite-dark whitespace-nowrap">${log.time}</td>
                    <td class="text-body px-4 py-3 whitespace-nowrap"><span class="${badgeClass}">${log.statusText}</span></td>
                </tr>`;
            logTableBody.insertAdjacentHTML('beforeend', rowHTML);
        });
    }

    // Функція для додавання нового запису в лог та оновлення інтерфейсу
    function addLogEntry(plate, sector, statusText, isEntry) {
        const newLog = {
            plate, sector, time: getCurrentTimeFormatted(), statusText, isEntry
        };
        appState.logs.unshift(newLog); 
        if (appState.logs.length > 8) appState.logs.pop(); 
        saveState();
        renderLogs(); 
    }

    // Головна функція симуляції, яка виконується циклічно з випадковою швидкістю
    function runSimulation() {
        const freeSpots = [];
        const occupiedSpots = [];
        for (const [spotId, status] of Object.entries(appState.mapSpots)) {
            if (status === 'free') freeSpots.push(spotId);
            else occupiedSpots.push(spotId);
        }

        const intendedChange = getRandomInt(-2, 2); 
        if (intendedChange !== 0) {
            const isEntry = intendedChange < 0; 
            let numberOfEvents = Math.abs(intendedChange);

            for (let i = 0; i < numberOfEvents; i++) {
                if (isEntry && freeSpots.length > 0) {
                    const randomIndex = getRandomInt(0, freeSpots.length - 1);
                    const spotToOccupy = freeSpots.splice(randomIndex, 1)[0]; 
                    appState.mapSpots[spotToOccupy] = 'occupied';
                    
                    addLogEntry(generateRandomPlate(), spotToOccupy.replace('spot-', ''), "В'їзд", true);
                    if(window.setSpotUI) window.setSpotUI(document.getElementById(spotToOccupy), 'occupied'); 
                
                } else if (!isEntry && occupiedSpots.length > 0) {
                    const randomIndex = getRandomInt(0, occupiedSpots.length - 1);
                    const spotToFree = occupiedSpots.splice(randomIndex, 1)[0];
                    appState.mapSpots[spotToFree] = 'free';
                    
                    addLogEntry(generateRandomPlate(), spotToFree.replace('spot-', ''), "Виїзд", false);
                    if(window.setSpotUI) window.setSpotUI(document.getElementById(spotToFree), 'free'); 
                }
            }
            saveState();
            renderStats();
            
            lastUpdateTimestamp = Date.now();
            updateClockUI();
        }

        // Швидкість з налаштувань (+- 2 секунди від базового значення для рандому)
        const baseSpeed = appState.settings.simSpeed * 1000;
        const nextUpdateIn = getRandomInt(Math.max(2000, baseSpeed - 2000), baseSpeed + 2000);
        
        simTimerId = setTimeout(runSimulation, nextUpdateIn);
    }

    // Функція для оновлення налаштувань з панелі керування
    window.updateSystemSettings = function(newSpots, newSpeed) {
        appState.settings.totalSpots = newSpots;
        appState.settings.simSpeed = newSpeed;
        
        // 1. Коригуємо масив місць під новий розмір
        syncSpotsCount();
        
        // 2. Оновлюємо візуальні цифри
        renderStats();
        
        // 3. Змінюємо швидкість симуляції миттєво
        if (simTimerId) clearTimeout(simTimerId);
        runSimulation(); 
        
        // 4. Даємо наказ мапі повністю перемалюватися
        window.dispatchEvent(new CustomEvent('mapNeedsRedraw', { 
            detail: { appState: appState, callbacks: mapCallbacks }
        }));
    };

    // При завантаженні сторінки синхронізуємо місця, відновлюємо статистику та логи
    syncSpotsCount(); 
    renderStats();    
    renderLogs();     
    
    // Колбеки для взаємодії з мапою (якщо вона є)
    const mapCallbacks = {
        addLogEntry: addLogEntry,
        onMapUpdated: () => {
            lastUpdateTimestamp = Date.now();
            updateClockUI();
            saveState();
            renderStats();
        }
    };
    
    // Якщо ми на мапі, малюємо її (з mapHandlers.js)
    if (typeof initMapLogic === 'function') {
        initMapLogic(appState, mapCallbacks);
    }
    
    updateClockUI(); 
    simTimerId = setTimeout(runSimulation, appState.settings.simSpeed * 1000); 
});