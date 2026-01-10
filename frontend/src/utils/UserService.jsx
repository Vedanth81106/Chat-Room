import apiClient from './ApiClient.js';

export const searchUsers = (query) => {
    // No need to pass headers manually anymore!
    return apiClient.get('/users/search', {
        params: { username: query }
    });
};