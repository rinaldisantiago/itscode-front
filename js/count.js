import { apiFetch } from './fetch.js';

const usersCount = document.getElementById('users_online');

const fetchConnectedUsers = async () => {
    if (!usersCount) return;

    try {
        const response = await apiFetch('/Session');
        if (response && typeof response.connectedUsers !== 'undefined') {
            usersCount.innerText = response.connectedUsers;
        }
    } catch (error) {
        usersCount.innerText = '1';
    }
};

fetchConnectedUsers();
setInterval(fetchConnectedUsers, 5000);