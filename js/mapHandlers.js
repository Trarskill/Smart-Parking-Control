// js/mapHandlers.js

// Функція зміни візуального стану сектора (червона машина / зелена P)
function setSpotUI(spotElement, status) {
    if (!spotElement) return;
    const imgWrapper = spotElement.querySelector('.spot-img-wrapper');
    const img = spotElement.querySelector('img');

    if (status === 'occupied') {
        spotElement.className = 'spot-card-occupied'; 
        imgWrapper.className = 'spot-img-wrapper border-graphite-dark';
        img.src = 'assets/img/car_parking.png';
    } else {
        spotElement.className = 'spot-card-free';
        imgWrapper.className = 'spot-img-wrapper border-mint-dark';
        img.src = 'assets/img/free_place.png';
    }
}

// Функція малювання відсутніх секторів (E-xx)
function renderDynamicMapSpots(appState) {
    const parkingGrid = document.getElementById('parking-grid');
    if (!parkingGrid) return; 

    for (const spotId in appState.mapSpots) {
        let spotEl = document.getElementById(spotId);
        
        if (!spotEl) {
            const sectorName = spotId.replace('spot-', ''); 
            const isFree = appState.mapSpots[spotId] === 'free';
            
            spotEl = document.createElement('article');
            spotEl.id = spotId;
            spotEl.className = isFree ? 'spot-card-free' : 'spot-card-occupied';
            
            spotEl.innerHTML = `
                <div class="spot-label"> ${sectorName} </div>
                <div class="spot-img-wrapper ${isFree ? 'border-mint-dark' : 'border-graphite-dark'}">
                    <img src="assets/img/${isFree ? 'free_place.png' : 'car_parking.png'}" alt="Spot" class="spot-img">
                </div>
            `;
            parkingGrid.appendChild(spotEl);
        }
    }
}

// Головна функція ініціалізації та обробки кліків
// Приймає поточний стан (appState) та функції зворотного виклику (callbacks) з головного скрипта
function initMapLogic(appState, callbacks) {
    const parkingGrid = document.getElementById('parking-grid');
    if (!parkingGrid) return; 

    renderDynamicMapSpots(appState);

    const allSpots = document.querySelectorAll('[id^="spot-"]');
    allSpots.forEach(spot => {
        const spotId = spot.id; 
        const sectorName = spotId.replace('spot-', '');

        setSpotUI(spot, appState.mapSpots[spotId]);

        spot.addEventListener('click', () => {
            const currentStatus = appState.mapSpots[spotId];

            if (currentStatus === 'free') {
                appState.mapSpots[spotId] = 'occupied';
                setSpotUI(spot, 'occupied');
                callbacks.addLogEntry(generateRandomPlate(), sectorName, "В'їзд", true);
            } else {
                appState.mapSpots[spotId] = 'free';
                setSpotUI(spot, 'free');
                callbacks.addLogEntry(generateRandomPlate(), sectorName, "Виїзд", false);
            }
            
            callbacks.onMapUpdated(); 
        });
    });
}

// Слухаємо команду на глобальне перемалювання
window.addEventListener('mapNeedsRedraw', (e) => {
    const parkingGrid = document.getElementById('parking-grid');
    if (parkingGrid) {
        parkingGrid.innerHTML = ''; // Знищуємо старі блоки
        // e.detail містить appState та callbacks, які ми передамо з script.js
        initMapLogic(e.detail.appState, e.detail.callbacks); 
    }
});