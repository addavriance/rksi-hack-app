import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';
import { toast } from 'sonner';
import {useNavigate} from "react-router-dom";
import {isProtectedPath, redirectTo} from "@/lib/utils.ts";

const AuthContext = createContext({
    user: null,
    isLoading: true,
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
                const token = localStorage.getItem('login_session_token');
                const uid = localStorage.getItem('login_session_uid');

                if (!token || !uid) {
                    setLoading(false);
                    return;
                }

                const userData = await api.getActiveLogin();

                if (userData && userData.email) {
                    setUser({
                        email: userData.email,
                        full_name: userData.full_name,
                        role: userData.role,
                        token,
                        uid,
                    });
                    isProtectedPath() && toast.success(`С возвращением, ${userData.full_name || userData.email}!`);
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
    const login = async (email, password) => {
        try {
            const result = await api.login(email, password);

            if (result && result.login_session_token && result.login_session_uid) {
                const userData = await api.getActiveLogin();

                setUser({
                    email: userData?.email || email,
                    full_name: userData?.full_name,
                    token: result.login_session_token,
                    uid: result.login_session_uid,
                });
                toast.success('Вход выполнен успешно!');
                redirectTo('/events'); // не navigate потому что мы за пределами области хука
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
    const register = async (email, password, full_name) => {
        try {
            const result = await api.register(email, password, full_name);
            return { success: true, data: result };
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
            if (userData && userData.email) {
                toast.success(`Текущий пользователь: ${userData.full_name || userData.email}`);
                return { success: true, email: userData.email, full_name: userData.full_name };
            }
        } catch (error) {
            toast.error('Нет активной сессии');
            return { success: false };
        }
    };

    const value = {
        user,
        isLoading: loading,
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
