// js/randomUtils.js

// Генерація автомобільного номера (напр. "AA 1234 BC")
function generateRandomPlate() {
    const letters = "АВЕКМНОРСТХІ"; 
    const randomLetter = () => letters[Math.floor(Math.random() * letters.length)];
    const randomNumber = () => Math.floor(Math.random() * 10);
    return `${randomLetter()}${randomLetter()} ${randomNumber()}${randomNumber()}${randomNumber()}${randomNumber()} ${randomLetter()}${randomLetter()}`;
}

// Отримання випадкового елемента з масиву
function getRandomElement(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(Math.random() * arr.length)];
}

// Генерація випадкового числа в діапазоні (включно)
function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Поточний час із секундами
function getCurrentTimeFormatted() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
}