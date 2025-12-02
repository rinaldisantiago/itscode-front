// js/repository/followingRepository.js

import { apiFetch } from '../fetch.js';

const FOLLOWING_API_URL = '/Following';

export class FollowingRepository {
    async followUser(userFollowingId, userFollowedId) {
        // ✅ CORRECCIÓN: El backend espera los IDs como Query Parameters.
        const url = `${FOLLOWING_API_URL}?userFollowingId=${userFollowingId}&userFollowedId=${userFollowedId}`;
        const config = {
            method: 'POST'
            // No se necesita body ni headers.
        };
        return apiFetch(url, config);
    }

    /**
     * Deja de seguir a un usuario.
     */
    async unfollowUser(userFollowingId, userFollowedId) {
        // ✅ CORRECCIÓN: El backend espera los IDs como Query Parameters con los nombres correctos.
        const url = `${FOLLOWING_API_URL}?userFollowingId=${userFollowingId}&userFollowedId=${userFollowedId}`;
        return apiFetch(url, { method: 'DELETE' });
    }
}
