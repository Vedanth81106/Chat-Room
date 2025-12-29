import apiClient from './ApiClient.js';

const getToken = () => localStorage.getItem('token');
const getAuthHeaders = () => {
    const token = getToken();
    return token ? {'Authorization' : `Bearer ${token}`} : {};
};

export const searchUsers = (query) => {
    return apiClient.get('/users/search',{
        params: {username : query},
        headers: getAuthHeaders()
    });
};