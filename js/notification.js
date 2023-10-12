// Підключення до сервісу сповіщень (якщо необхідно)
if ('serviceWorker' in navigator && 'PushManager' in window) {
    navigator.serviceWorker.register('../js/service-workers.js')
        .then(function (registration) {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(function (error) {
            console.error('Service Worker registration failed:', error);
        });
}

// Перевірка можливості відображення сповіщень
if ('Notification' in window && Notification.permission !== 'denied') {
    // Запит дозволу на відображення сповіщень
    Notification.requestPermission()
        .then(function (permission) {
            if (permission === 'granted') {
                // Дозвіл отримано, тут можна відображати сповіщення
                showNotification('Це ваше сповіщення');
            }
        });
}

// Функція для відображення сповіщень
function showNotification(повідомлення) {
    if (Notification.permission === 'granted') {
        const notification = new Notification(повідомлення);
    }
}
