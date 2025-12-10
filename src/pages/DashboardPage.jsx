import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Calendar, Users, Bell, TrendingUp,
    Clock, CheckCircle, AlertCircle, Star, Loader2,
    ExternalLink, Eye
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { useNotifications } from "@/contexts/NotificationsContext";
import { api } from "@/api.js";

const DashboardPage = () => {
    const { user } = useAuth();
    const { refreshUnreadCount } = useNotifications();
    const [events, setEvents] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingNotifications, setLoadingNotifications] = useState(true);
    const [error, setError] = useState(null);
    const [updatingEventId, setUpdatingEventId] = useState(null);
    const [markingAsReadId, setMarkingAsReadId] = useState(null);

    // Маппинг данных из EventCardDTO к формату компонентов
    const mapEventData = (event) => {
        return {
            id: event.id,
            title: event.name,
            description: event.short_description || event.description,
            fullDescription: event.description,
            image: event.image_url,
            startDate: event.starts_at,
            endDate: event.ends_at,
            participants: event.participants_count,
            maxParticipants: event.max_participants_count,
            status: event.status.toLowerCase(), // ACTIVE → active, PAST → past, REJECTED → rejected
            isParticipating: event.participation_status === 'PARTICIPATING',
            location: event.location,
            participation_status: event.participation_status, // Сохраняем для обновления
        };
    };

    const mapNotificationData = (notification) => {
        return {
            id: notification.id,
            title: notification.title,
            description: notification.content,
            date: notification.created_at,
            status: notification.acked_at === null ? "unread" : "read",
            cta_url: notification.cta_url,
            cta_label: notification.cta_label,
        };
    };

    // Загрузка событий с сервера
    const loadEvents = async () => {
        setLoading(true);
        setError(null);

        try {
            // Загружаем активные и прошедшие события для получения полной статистики
            const [activeData, pastData] = await Promise.all([
                api.getEventCards({ status: "ACTIVE" }),
                api.getEventCards({ status: "PAST" })
            ]);

            // Объединяем и маппим все события
            const allData = [...activeData, ...pastData];
            const mappedEvents = allData.map(mapEventData);
            setEvents(mappedEvents);
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.message || 'Ошибка при загрузке событий';
            setError(errorMessage);
            toast.error(errorMessage);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    // Загрузка последних уведомлений
    const loadRecentNotifications = async () => {
        setLoadingNotifications(true);
        try {
            const response = await api.getNotifications({
                include_acked: false, // Только непрочитанные
                limit: 5, // Берем 5 последних
                offset: 0,
            });

            const mappedNotifications = response.map(mapNotificationData);
            setNotifications(mappedNotifications);
        } catch (err) {
            console.error('Ошибка при загрузке уведомлений:', err);
            // Не показываем ошибку пользователю на дашборде
            setNotifications([]);
        } finally {
            setLoadingNotifications(false);
        }
    };

    // Загрузка данных при монтировании
    useEffect(() => {
        loadEvents();
        loadRecentNotifications();
    }, []);

    useEffect(() => {
        const intervalId = setInterval(() => {
            loadRecentNotifications();
        }, 10000);

        return () => clearInterval(intervalId);
    }, []);

    // Ближайшие события
    const upcomingEvents = events
        .filter(e => {
            if (e.status !== "active") return false;
            const eventDate = new Date(e.startDate);
            const now = new Date();
            // Проверяем, что событие еще не началось
            return eventDate > now;
        })
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 3);

    // Мои события
    const myEvents = events
        .filter(e => e.isParticipating)
        .slice(0, 3);

    // Статистика
    const stats = {
        totalEvents: events.length,
        activeEvents: events.filter(e => e.status === "active").length,
        myEvents: events.filter(e => e.isParticipating).length,
        upcomingEvents: events.filter(e =>
            e.status === "active" &&
            new Date(e.startDate) > new Date()
        ).length,
    };

    // Обработка изменения участия (оптимистичное обновление)
    const handleParticipationChange = (eventId, newStatus) => {
        setEvents(prevEvents =>
            prevEvents.map(event => {
                if (event.id === eventId) {
                    return {
                        ...event,
                        isParticipating: newStatus === 'PARTICIPATING',
                        participation_status: newStatus,
                        participants: newStatus === 'PARTICIPATING'
                            ? event.participants + 1
                            : Math.max(0, event.participants - 1)
                    };
                }
                return event;
            })
        );
    };

    // Обработка участия в событии
    const handleParticipate = async (eventId) => {
        const event = events.find(e => e.id === eventId);
        if (!event || updatingEventId === eventId) return;

        const previousStatus = event.participation_status;

        // Оптимистичное обновление
        handleParticipationChange(eventId, 'PARTICIPATING');
        setUpdatingEventId(eventId);

        try {
            await api.updateParticipation(eventId, { status: 'PARTICIPATING' });
            toast.success('Вы успешно записались на событие!');
        } catch (error) {
            // Откат изменений при ошибке
            handleParticipationChange(eventId, previousStatus);
            const errorMessage = error.response?.data?.detail || error.message || 'Ошибка при записи на событие';
            toast.error(errorMessage);
        } finally {
            setUpdatingEventId(null);
        }
    };

    const handleMarkAsRead = async (notificationId) => {
        setMarkingAsReadId(notificationId);
        try {
            await api.ackNotifications([notificationId]);

            setNotifications(prev =>
                prev.map(n =>
                    n.id === notificationId
                        ? { ...n, status: "read" }
                        : n
                )
            );

            refreshUnreadCount();

            toast.success('Уведомление отмечено как прочитанное');
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.message || 'Ошибка при отметке уведомления';
            toast.error(errorMessage);
        } finally {
            setMarkingAsReadId(null);
        }
    };

    const handleNotificationCTA = (notification, e) => {
        e.stopPropagation();
        if (notification.cta_url) {
            window.open(notification.cta_url, '_blank', 'noopener,noreferrer');
        }
    };

    return (
        <div className="space-y-4 md:space-y-8">
            {/* Приветствие */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10
                dark:bg-gradient-to-r dark:from-primary/15 dark:to-primary/25 rounded-xl p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">Добро пожаловать!</h1>
                        <p className="text-sm md:text-base text-muted-foreground">
                            Здесь вы можете управлять своими событиями и быть в курсе всего происходящего
                        </p>
                    </div>
                    {user.role === "ADMINISTRATOR" && (
                        <Button className="mt-4 md:mt-0 w-full md:w-auto min-h-[44px]" asChild>
                            <Link to="/admin?create_event"> {/*добавить потом обработку query там чтоб открывать диалог*/}
                                <Calendar className="mr-2 h-4 w-4"/>
                                Создать событие
                            </Link>
                        </Button>
                    )}
                </div>
            </div>

            {/* Основные разделы */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
                {/* Ближайшие события */}
                <Card className="lg:col-span-2">
                    <CardHeader className="p-4 md:p-6">
                        <CardTitle className="flex items-center text-lg md:text-xl">
                            <Clock className="mr-2 h-4 w-4 md:h-5 md:w-5 text-primary" />
                            Ближайшие события
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4 md:p-6">
                        {loading ? (
                            <div className="text-center py-8">
                                <Loader2 className="h-8 w-8 mx-auto text-muted-foreground animate-spin mb-4" />
                                <p className="text-sm text-muted-foreground">Загрузка событий...</p>
                            </div>
                        ) : error ? (
                            <div className="text-center py-8">
                                <AlertCircle className="h-8 w-8 mx-auto text-destructive mb-4" />
                                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                                <Button variant="outline" size="sm" onClick={loadEvents}>
                                    Попробовать снова
                                </Button>
                            </div>
                        ) : upcomingEvents.length === 0 ? (
                            <div className="text-center py-8">
                                <Clock className="h-8 w-8 mx-auto text-muted-foreground mb-4" />
                                <p className="text-sm text-muted-foreground">Нет предстоящих событий</p>
                            </div>
                        ) : (
                            <div className="space-y-3 md:space-y-4">
                                {upcomingEvents.map(event => (
                                    <div key={event.id} className="flex flex-col md:flex-row md:items-center md:justify-between p-3 md:p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-card gap-3 md:gap-0">
                                        <div className="flex items-center flex-1">
                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center mr-3 md:mr-4 flex-shrink-0">
                                                <Calendar className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-sm md:text-base truncate">{event.title}</h3>
                                                <p className="text-xs md:text-sm text-muted-foreground">
                                                    {new Date(event.startDate).toLocaleDateString('ru-RU', {
                                                        day: 'numeric',
                                                        month: 'long',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center justify-between md:flex-col md:items-end md:text-right gap-2 md:gap-0">
                                            <div className="text-xs md:text-sm font-medium">{event.participants} участников</div>
                                            {event.isParticipating ? (
                                                <div className="text-xs md:text-sm text-green-600 dark:text-green-400 flex items-center mt-6">
                                                    <CheckCircle className="h-3 w-3 mr-1" />
                                                    Вы участвуете
                                                </div>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    className="min-h-[40px] md:min-h-[32px] text-xs md:text-sm px-4 mt-6"
                                                    onClick={() => handleParticipate(event.id)}
                                                    disabled={updatingEventId === event.id || loading}
                                                >
                                                    {updatingEventId === event.id ? (
                                                        <>
                                                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                                            Загрузка...
                                                        </>
                                                    ) : (
                                                        'Участвовать'
                                                    )}
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <Button variant="outline" className="w-full mt-4 min-h-[44px] md:min-h-[40px]" asChild>
                            <Link to="/events">Все события →</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Боковая панель */}
                <div className="space-y-4 md:space-y-6">
                    {/* Мои события */}
                    <Card>
                        <CardHeader className="p-4 md:p-6">
                            <CardTitle className="flex items-center text-base md:text-lg">
                                <CheckCircle className="mr-2 h-4 w-4 md:h-5 md:w-5 text-green-600" />
                                Мои события
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6">
                            {loading ? (
                                <div className="text-center py-4">
                                    <Loader2 className="h-6 w-6 mx-auto text-muted-foreground animate-spin" />
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-2 md:space-y-3">
                                        {myEvents.map(event => (
                                            <div key={event.id} className="p-2 md:p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-card transition-colors cursor-pointer" onClick={() => window.location.href = `/events/${event.id}`}>
                                                <div className="font-medium text-sm md:text-base truncate">{event.title}</div>
                                                <div className="text-xs md:text-sm text-muted-foreground">
                                                    {new Date(event.startDate).toLocaleDateString('ru-RU', {
                                                        day: 'numeric',
                                                        month: 'short'
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {myEvents.length === 0 && (
                                        <div className="text-center py-4">
                                            <p className="text-sm md:text-base text-muted-foreground mb-3">Вы ещё не участвуете в событиях</p>
                                            <Button size="sm" asChild className="min-h-[44px] md:min-h-[32px]">
                                                <Link to="/events">Найти события</Link>
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </CardContent>
                    </Card>

                    {/* Уведомления */}
                    <Card>
                        <CardHeader className="p-4 md:p-6">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center text-base md:text-lg">
                                    <Bell className="mr-2 h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                                    Последние уведомления
                                </CardTitle>
                                {notifications.length > 0 && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-xs h-8 px-2"
                                        asChild
                                    >
                                        <Link to="/notifications">
                                            Все
                                        </Link>
                                    </Button>
                                )}
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6">
                            {loadingNotifications && !notifications.length ? (
                                <div className="text-center py-4">
                                    <Loader2 className="h-6 w-6 mx-auto text-muted-foreground animate-spin" />
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="text-center py-4">
                                    <Bell className="h-8 w-8 mx-auto text-muted-foreground/50 mb-3" />
                                    <p className="text-sm text-muted-foreground">Нет новых уведомлений</p>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="mt-3 min-h-[44px] md:min-h-[32px]"
                                        asChild
                                    >
                                        <Link to="/notifications">
                                            Все уведомления
                                        </Link>
                                    </Button>
                                </div>
                            ) : (
                                <div className="space-y-2 md:space-y-3">
                                    {notifications.slice(0, 3).map(notification => (
                                        <div
                                            key={notification.id}
                                            className={`p-2 md:p-3 border rounded-lg transition-colors cursor-pointer ${
                                                notification.status === "unread"
                                                    ? "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-950/50"
                                                    : "hover:bg-gray-50 dark:hover:bg-card"
                                            }`}
                                            onClick={() => notification.status === "unread" && handleMarkAsRead(notification.id)}
                                        >
                                            <div className="flex items-start gap-2">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h4 className="font-medium text-sm md:text-base truncate">
                                                            {notification.title}
                                                        </h4>
                                                        {notification.status === "unread" && (
                                                            <div className="flex items-center gap-1">
                                                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                                <span className="text-xs text-blue-500 hidden md:inline">
                                                                    Новое
                                                                </span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <p className="text-xs md:text-sm text-muted-foreground line-clamp-2 mb-2">
                                                        {notification.description}
                                                    </p>
                                                    <div className="flex items-center justify-between gap-2">
                                                        <span className="text-xs text-muted-foreground">
                                                            {new Date(notification.date).toLocaleDateString('ru-RU', {
                                                                day: 'numeric',
                                                                month: 'short',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                        <div className="flex items-center gap-1">
                                                            {notification.status === "unread" && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-6 px-2 text-xs"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleMarkAsRead(notification.id);
                                                                    }}
                                                                    disabled={markingAsReadId === notification.id}
                                                                >
                                                                    {markingAsReadId === notification.id ? (
                                                                        <Loader2 className="h-3 w-3 animate-spin" />
                                                                    ) : (
                                                                        <Eye className="h-3 w-3" />
                                                                    )}
                                                                </Button>
                                                            )}
                                                            {notification.cta_url && notification.cta_label && (
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="h-6 px-2 text-xs"
                                                                    onClick={(e) => handleNotificationCTA(notification, e)}
                                                                >
                                                                    {notification.cta_label}
                                                                    <ExternalLink className="ml-1 h-3 w-3" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {notifications.length > 3 && (
                                        <div className="pt-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full min-h-[44px] md:min-h-[32px]"
                                                asChild
                                            >
                                                <Link to="/notifications">
                                                    Показать все ({notifications.length})
                                                </Link>
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
