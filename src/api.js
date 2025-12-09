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
     * @param {string} email - Email пользователя
     * @param {string} password - Пароль
     * @param {string} full_name - Полное имя пользователя
     * @returns {Promise<{token: string}>} - Содержит токен для верификации
     */
    async register(email, password, full_name) {
        const response = await this.apiClient.post('/register', {
            email,
            password,
            full_name
        });
        return response.data;
    }

    /**
     * Авторизация пользователя
     * @param {string} email - Email пользователя
     * @param {string} password - Пароль
     * @returns {Promise<{
     *   "login_session_uid": string,
     *   "login_session_token": string
     * }>} - Содержит login_session_uid и login_session_token
     */
    async login(email, password) {
        const response = await this.apiClient.post('/login', {
            email,
            password
        });

        if (response.data) {
            localStorage.setItem('login_session_token', response.data.login_session_token);
            localStorage.setItem('login_session_uid', response.data.login_session_uid);
        }

        return response.data;
    }

    /**
     * Запрос на восстановление пароля
     * @param {string} email - Email пользователя
     * @returns {Promise<{}>} - Пустой объект при успехе
     */
    async recoveryRequest(email) {
        const response = await this.apiClient.post('/login/recovery', {
            email
        });
        return response.data;
    }

    /**
     * Сброс пароля
     * @param {string} token - Токен восстановления
     * @param {string} password - Новый пароль
     * @returns {Promise<{}>} - Пустой объект при успехе
     */
    async resetPassword(token, password) {
        const response = await this.apiClient.post('/login/recovery/submit', {
            token,
            password
        });
        return response.data;
    }

    /**
     * Верификация регистрации
     * @param {string} token - Токен верификации
     * @param {number} code - Код верификации
     * @returns {Promise<{}>} - Пустой объект при успехе
     */
    async verifyRegistration(token, code) {
        const response = await this.apiClient.post('/register/verification', {
            token,
            code
        });
        return response.data;
    }

    /**
     * Повторная отправка кода верификации (заглушка)
     * @param {string} token - Токен верификации
     * @returns {Promise<{}>} - Пустой объект при успехе
     */
    async resendVerificationCode(token) {
        // TODO: Заменить на реальный endpoint, когда он будет доступен
        // const response = await this.apiClient.post('/register/resend', { token });
        // return response.data;
        
        // Заглушка: симулируем задержку сети
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({});
            }, 500);
        });
    }

    /**
     * Получение информации о текущем пользователе
     * @returns {Promise<{email: string, full_name: string, role: "USER" | "ADMIN"}>} - Содержит email и full_name текущего пользователя
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
