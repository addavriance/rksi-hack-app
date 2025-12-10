import { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../api';
import {useAuth} from "@/contexts/AuthContext.jsx";

const NotificationsContext = createContext({
    unreadCount: 0,
    isLoading: false,
    refreshUnreadCount: async () => {},
});

export const useNotifications = () => {
    const context = useContext(NotificationsContext);
    if (!context) {
        throw new Error('useNotifications must be used within NotificationsProvider');
    }
    return context;
};

export const NotificationsProvider = ({ children }) => {
    const { isAuthenticated } = useAuth();
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // Загрузка количества непрочитанных уведомлений
    const refreshUnreadCount = async () => {
        if (!isAuthenticated) return;

        setIsLoading(true);
        try {
            const response = await api.getNotifications({
                include_acked: false, // Только непрочитанные
                limit: 100, // Достаточно большое число для подсчета
                offset: 0,
            });
            setUnreadCount(response.length);
        } catch (error) {
            console.error('Ошибка при загрузке количества уведомлений:', error);
            // Не показываем ошибку пользователю, просто оставляем текущее значение
        } finally {
            setIsLoading(false);
        }
    };

    // Загрузка при монтировании
    useEffect(() => {
        refreshUnreadCount();
    }, [isAuthenticated]);

    // Polling каждые 5 секунд для обновления счетчика
    useEffect(() => {
        const intervalId = setInterval(() => {
            refreshUnreadCount();
        }, 5000);

        return () => clearInterval(intervalId);
    }, []);

    const value = {
        unreadCount,
        isLoading,
        refreshUnreadCount,
    };

    return (
        <NotificationsContext.Provider value={value}>
            {children}
        </NotificationsContext.Provider>
    );
};

