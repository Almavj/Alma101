import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const auth = {
    async login(email: string, password: string) {
        const response = await axios.post(`${API_URL}/login.php`, {
            email,
            password
        });
        if (response.data.user) {
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    },

    async register(username: string, email: string, password: string) {
        const response = await axios.post(`${API_URL}/register.php`, {
            username,
            email,
            password
        });
        return response.data;
    },

    logout() {
        localStorage.removeItem('user');
    },

    getCurrentUser() {
        const userStr = localStorage.getItem('user');
        if (userStr) return JSON.parse(userStr);
        return null;
    }
};