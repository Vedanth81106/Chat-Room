import axios from 'axios';
import { getToken } from './auth';
import { baseURL } from './config'

const apiClient = axios.create({
    baseURL: baseURL
});

// Request Interceptor: Before any request is sent, do this:
apiClient.interceptors.request.use(
    (config) => {
        const token = getToken(); 
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;