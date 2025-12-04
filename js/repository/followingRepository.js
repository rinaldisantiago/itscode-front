import { apiFetch } from '../fetch.js';

const FOLLOWING_API_URL = '/Following';

export class FollowingRepository {
    async followUser(userFollowingId, userFollowedId) {
        const url = `${FOLLOWING_API_URL}?userFollowingId=${userFollowingId}&userFollowedId=${userFollowedId}`;
        const config = {
            method: 'POST'
        };
        return apiFetch(url, config);
    }

    async unfollowUser(userFollowingId, userFollowedId) {
        const url = `${FOLLOWING_API_URL}?userFollowingId=${userFollowingId}&userFollowedId=${userFollowedId}`;
        return apiFetch(url, { method: 'DELETE' });
    }
}
