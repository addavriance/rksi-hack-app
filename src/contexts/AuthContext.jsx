import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';
import { toast } from 'sonner';

const AuthContext = createContext({
    user: null,
    loading: true,
    isAuthenticated: false,
    login: async () => {},
    register: async () => {},
    logout: () => {},
    checkSession: async () => {},
});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Проверка сессии при инициализации
    useEffect(() => {
        const initAuth = async () => {
            try {
                // Проверяем, есть ли токены в localStorage
                const token = localStorage.getItem('login_session_token');
                const uid = localStorage.getItem('login_session_uid');

                if (!token || !uid) {
                    setLoading(false);
                    return;
                }

                // Пробуем получить информацию о текущем пользователе
                const userData = await api.getActiveLogin();

                if (userData && userData.username) {
                    setUser({
                        username: userData.username,
                        token,
                        uid,
                    });
                    toast.success(`С возвращением, ${userData.username}!`);
                }
            } catch (error) {
                console.error('Ошибка при проверке сессии:', error);
                // Если сессия невалидна, очищаем токены
                localStorage.removeItem('login_session_token');
                localStorage.removeItem('login_session_uid');
            } finally {
                setLoading(false);
            }
        };

        initAuth();
    }, []);

    // Логин
    const login = async (username, password) => {
        try {
            const result = await api.login(username, password);

            if (result && result.login_session_token && result.login_session_uid) {
                setUser({
                    username,
                    token: result.login_session_token,
                    uid: result.login_session_uid,
                });
                toast.success('Вход выполнен успешно!');
                return { success: true };
            }

            throw new Error('Неверный ответ от сервера');
        } catch (error) {
            const errorMessage = error.response?.data?.detail ||
                error.message ||
                'Ошибка при входе';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // Регистрация
    const register = async (username, password) => {
        try {
            const result = await api.register(username, password);
            toast.success('Регистрация успешна! Теперь войдите в систему.');
            return { success: true };
        } catch (error) {
            const errorMessage = error.response?.data?.detail ||
                error.message ||
                'Ошибка при регистрации';
            toast.error(errorMessage);
            return { success: false, error: errorMessage };
        }
    };

    // Выход
    const logout = () => {
        api.logout();
        setUser(null);
        toast.success('Выход выполнен');
    };

    // Ручная проверка сессии
    const checkSession = async () => {
        try {
            const userData = await api.getActiveLogin();
            if (userData && userData.username) {
                toast.success(`Текущий пользователь: ${userData.username}`);
                return { success: true, username: userData.username };
            }
        } catch (error) {
            toast.error('Нет активной сессии');
            return { success: false };
        }
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        checkSession,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};
