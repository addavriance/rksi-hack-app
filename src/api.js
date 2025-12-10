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
     * @returns {Promise<IssuedRegistrationDTO>} - Содержит токен для верификации
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
     * @returns {Promise<AuthorizationCredentialsDTO>} - Содержит login_session_uid и login_session_token
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
     * @returns {Promise<IssuedLoginRecoveryDTO>} - Пустой объект при успехе
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
     * @returns {Promise<LoginRecoverySubmitDTO>} - Пустой объект при успехе
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
     * @returns {Promise<VerifyRegistrationDTO>} - Пустой объект при успехе
     */
    async verifyRegistration(token, code) {
        const response = await this.apiClient.post('/register/verification', {
            token,
            code
        });
        return response.data;
    }

    /**
     * Повторная отправка кода верификации
     * @param {string} token - Токен верификации
     * @returns {Promise<{}>} - Пустой объект при успехе
     */
    async resendVerificationCode(token) {
        // TODO: Заменить на реальный endpoint, когда он будет доступен
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({});
            }, 500);
        });
    }

    /**
     * Получение информации о текущем пользователе
     * @returns {Promise<ActiveLoginDTO>} - Содержит email и full_name текущего пользователя
     */
    async getActiveLogin() {
        const response = await this.apiClient.get('/login');
        return response.data;
    }


    /**
     * Получение списка пользователей
     * @param {ListUsersParams} params - Параметры фильтрации
     * @returns {Promise<Array<UserDTO>>} - Список пользователей
     */
    async getUsers(params = {}) {
        const response = await this.apiClient.get('/users', { params });
        return response.data;
    }

    /**
     * Обновление пользователя
     * @param {number} userId - ID пользователя
     * @param {UpdateUserDTO} userData - Данные для обновления
     * @returns {Promise<UserDTO>} - Обновленный пользователь
     */
    async updateUser(userId, userData) {
        const response = await this.apiClient.put(`/users/${userId}`, userData);
        return response.data;
    }

    /**
     * Мягкое удаление пользователя
     * @param {number} userId - ID пользователя
     * @returns {Promise<void>}
     */
    async deleteUser(userId) {
        await this.apiClient.delete(`/users/${userId}`);
    }

    /**
     * Сброс пароля пользователя (админ)
     * @param {number} userId - ID пользователя
     * @param {ResetUserPasswordDTO} passwordData - Данные пароля
     * @returns {Promise<void>}
     */
    async resetUserPassword(userId, passwordData) {
        await this.apiClient.post(`/users/${userId}/reset-password`, passwordData);
    }

    /**
     * Получение списка мероприятий
     * @param {ListEventsParams} params - Параметры фильтрации
     * @returns {Promise<Array<EventDTO>>} - Список мероприятий
     */
    async getEvents(params = {}) {
        const response = await this.apiClient.get('/events', { params });
        return response.data;
    }

    /**
     * Создание мероприятия
     * @param {CreateEventDTO} eventData - Данные мероприятия
     * @returns {Promise<EventDTO>} - Созданное мероприятие
     */
    async createEvent(eventData) {
        const response = await this.apiClient.post('/events', eventData);
        return response.data;
    }

    /**
     * Получение конкретного мероприятия
     * @param {number} eventId - ID мероприятия
     * @returns {Promise<EventDTO>} - Мероприятие
     */
    async getEvent(eventId) {
        const response = await this.apiClient.get(`/events/${eventId}`);
        return response.data;
    }

    /**
     * Обновление мероприятия
     * @param {number} eventId - ID мероприятия
     * @param {UpdateEventDTO} eventData - Данные для обновления
     * @returns {Promise<EventDTO>} - Обновленное мероприятие
     */
    async updateEvent(eventId, eventData) {
        const response = await this.apiClient.put(`/events/${eventId}`, eventData);
        return response.data;
    }

    /**
     * Загрузка файла
     * @param {File} file - Файл для загрузки
     * @returns {Promise<UploadFileResponseDTO>} - URL загруженного файла
     */
    async uploadFile(file) {
        const formData = new FormData();
        formData.append('file', file);

        const response = await this.apiClient.post('/files', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });
        return response.data;
    }

    /**
     * Получение карточек мероприятий
     * @param {ListEventCardsParams} params - Параметры фильтрации
     * @returns {Promise<Array<EventCardDTO>>} - Карточки мероприятий
     */
    async getEventCards(params = {}) {
        const response = await this.apiClient.get('/events/cards', { params });
        return response.data;
    }

    /**
     * Обновление статуса участия
     * @param {number} eventId - ID мероприятия
     * @param {UpdateMyParticipationDTO} participationData - Данные участия
     * @returns {Promise<void>}
     */
    async updateParticipation(eventId, participationData) {
        await this.apiClient.put(`/events/${eventId}/participants/me`, participationData);
    }

    /**
     * Получение списка уведомлений
     * @param {Object} params - Параметры: include_acked (boolean), limit (number), offset (number)
     * @returns {Promise<Array<InstantNotificationDTO>>} - Список уведомлений
     */
    async getNotifications(params = {}) {
        const response = await this.apiClient.get('/notifications/instant', { params });
        return response.data;
    }

    /**
     * Отметка уведомлений как прочитанных
     * @param {Array<number>} ids - Массив ID уведомлений для отметки
     * @returns {Promise<void>}
     */
    async ackNotifications(ids) {
        await this.apiClient.post('/notifications/instant/ack', { ids });
    }

    /**
     * Получение статистики для администратора
     * @returns {Promise<AdminStatisticsDTO>} - Статистические данные
     */
    async getAdminStatistics() {
        const response = await this.apiClient.get('/statistics');
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
