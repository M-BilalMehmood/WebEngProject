import axios from 'axios';
import Cookies from 'js-cookie';

const API_URL = 'http://localhost:5000/api'; // Backend URL

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Include cookies in requests
});

/*api.interceptors.request.use(
    (config) => {
        const token = Cookies.get('token');
        if (token) {
            config.headers['Authorization'] = 'Bearer ' + token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);*/

// Example Login Function
export const login = async (email, password) => {
    try {
        const response = await api.post('/auth/login', { email, password });
        const { user } = response.data;
        // Token is already set in the cookie by the backend
        localStorage.setItem('user', JSON.stringify(user));
        return { user };
    } catch (error) {
        console.error('Login error:', error.response ? error.response.data : error.message);
        throw error.response ? error.response.data : new Error('Server error');
    }
};

// Other API functions...
export const signup = async (userData) => {
    try {
        const response = await api.post('/auth/register', userData);
        return response.data;
    } catch (error) {
        throw error.response.data;
    }
};

export const logout = () => {
    Cookies.remove('token');
    localStorage.removeItem('user');
};

export default api;