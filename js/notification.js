async function getVapidPublicKey() {
    const response = await fetch('https://testapi-wig0.onrender.com/vapid-key');
    const vapidKey = await response.json();
    console.log(vapidKey);
    return vapidKey.publicKey;
}

async function sendSubscription(subscription) {
    const data = await fetch('https://testapi-wig0.onrender.com/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    console.log(data.status);
    return data;
}

async function enableNotifications() {
    const publicVapidKey = await getVapidPublicKey();
    if ('serviceWorker' in navigator) {
        const register = await navigator.serviceWorker.register('../js/service-workers.js', {
            scope: '/js/'
        });
        await (await register.pushManager.getSubscription())?.unsubscribe();
        const subscription = await register.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicVapidKey)
        });

        await sendSubscription(subscription);
    }
}

async function sendPushNotification(notificationData) {
    try {
        const response = await fetch('https://testapi-wig0.onrender.com/send-push-notification', {
            method: 'POST',
            body: JSON.stringify(notificationData),
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            console.log('Notification sent successfully');
        } else {
            console.error('Failed to send notification:', response.statusText);
        }
    } catch (error) {
        console.error('Error sending notification:', error);
    }
}

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

document.addEventListener('DOMContentLoaded', async () => {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
        enableNotifications();

        // Функція для відправки сповіщень кожних 10 секунд
        async function sendPeriodicNotifications() {
            const notificationData = {
                title: 'New Notification',
                body: 'This is the body of the notification',
                icon: '../assets/majestic.png'
            };
            sendPushNotification(notificationData);
        }

        // Викликайте функцію для відправки сповіщень кожних 10 секунд
        setInterval(sendPeriodicNotifications, 10000);
    }
});
