import axios from 'axios';

class API {
    constructor() {
        this.apiClient = axios.create({
            baseURL: 'https://hack-rksi-api.lvalue.dev',
            timeout: 10000,
            headers: {
                'Content-Type': 'application/json',
            }
        });

        this.apiClient.interceptors.request.use((config) => {
            const token = localStorage.getItem('login_session_token');
            const uid = localStorage.getItem('login_session_uid');

            if (token && uid) {
                config.headers['X-Login-Session-Token'] = token;
                config.headers['X-Login-Session-Uid'] = uid;
            }

            return config;
        });
    }

    /**
     * Регистрация пользователя
     * @param {string} username - Имя пользователя
     * @param {string} password - Пароль
     * @returns {Promise<null>}
     */
    async register(username, password) {
        const response = await this.apiClient.post('/register', {
            username,
            password
        });
        return response.data;
    }

    /**
     * Авторизация пользователя
     * @param {string} username - Имя пользователя
     * @param {string} password - Пароль
     * @returns {Promise<{
     *   "login_session_uid": string,
     *   "login_session_token": string
     * }>} - Содержит login_session_uid и login_session_token
     */
    async login(username, password) {
        const response = await this.apiClient.post('/login', {
            username,
            password
        });

        if (response.data) {
            localStorage.setItem('login_session_token', response.data.login_session_token);
            localStorage.setItem('login_session_uid', response.data.login_session_uid);
        }

        return response.data;
    }

    /**
     * Получение информации о текущем пользователе
     * @returns {Promise<{username: string}>} - Содержит username текущего пользователя
     */
    async getActiveLogin() {
        const response = await this.apiClient.get('/login');
        return response.data;
    }

    /**
     * Очистка токенов из localStorage
     */
    logout() {
        localStorage.removeItem('login_session_token');
        localStorage.removeItem('login_session_uid');
    }
}

export const api = new API();
