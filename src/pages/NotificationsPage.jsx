import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Loader2, ExternalLink } from "lucide-react";
import { api } from "@/api.js";
import { toast } from "sonner";

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [limit] = useState(50);
    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    // Маппинг данных из API формата в формат компонента
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

    // Загрузка уведомлений
    const loadNotifications = async (reset = false) => {
        if (reset) {
            setLoading(true);
            setOffset(0);
            setNotifications([]);
            setError(null);
        } else {
            setLoadingMore(true);
        }

        try {
            const currentOffset = reset ? 0 : offset;
            const response = await api.getNotifications({
                include_acked: true,
                limit,
                offset: currentOffset,
            });

            const mappedNotifications = response.map(mapNotificationData);

            if (reset) {
                setNotifications(mappedNotifications);
            } else {
                setNotifications(prev => [...prev, ...mappedNotifications]);
            }

            // Проверяем, есть ли еще уведомления для загрузки
            setHasMore(mappedNotifications.length === limit);
            setOffset(currentOffset + mappedNotifications.length);
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.message || 'Ошибка при загрузке уведомлений';
            setError(errorMessage);
            toast.error(errorMessage);
        } finally {
            setLoading(false);
            setLoadingMore(false);
        }
    };

    // Загрузка данных при монтировании
    useEffect(() => {
        loadNotifications(true);
    }, []);

    // Сортировка по дате (новые сверху)
    const sortedNotifications = [...notifications].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

    // Обработчик клика на уведомление для отметки как прочитанного
    const handleNotificationClick = async (notification) => {
        if (notification.status === "read") {
            return; // Уже прочитано, ничего не делаем
        }

        try {
            await api.ackNotifications([notification.id]);
            
            // Обновляем статус уведомления локально
            setNotifications(prevNotifications =>
                prevNotifications.map(n =>
                    n.id === notification.id
                        ? { ...n, status: "read" }
                        : n
                )
            );
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.message || 'Ошибка при отметке уведомления';
            toast.error(errorMessage);
        }
    };

    // Загрузка следующих уведомлений
    const handleLoadMore = () => {
        if (!loadingMore && hasMore) {
            loadNotifications(false);
        }
    };

    return (
        <div className="space-y-4 md:space-y-8">
            {/* Заголовок */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10
                dark:bg-gradient-to-r dark:from-primary/15 dark:to-primary/25 rounded-xl p-4 md:p-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 md:p-3 rounded-lg bg-primary/10">
                        <Bell className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2">Уведомления</h1>
                        <p className="text-sm md:text-base text-muted-foreground">
                            Все ваши уведомления и обновления
                        </p>
                    </div>
                </div>
            </div>

            {/* Список уведомлений */}
            <Card>
                <CardHeader className="p-4 md:p-6">
                    <CardTitle className="text-lg md:text-xl">
                        Все уведомления ({sortedNotifications.length})
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6">
                    {loading && notifications.length === 0 ? (
                        <div className="text-center py-12">
                            <Loader2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4 animate-spin" />
                            <p className="text-muted-foreground">Загрузка уведомлений...</p>
                        </div>
                    ) : error && notifications.length === 0 ? (
                        <div className="text-center py-12">
                            <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium mb-2">Ошибка загрузки</h3>
                            <p className="text-muted-foreground mb-4">{error}</p>
                            <Button 
                                variant="outline" 
                                onClick={() => loadNotifications(true)}
                            >
                                Попробовать снова
                            </Button>
                        </div>
                    ) : sortedNotifications.length === 0 ? (
                        <div className="text-center py-12">
                            <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium mb-2">Нет уведомлений</h3>
                            <p className="text-muted-foreground">
                                Когда появятся новые уведомления, они отобразятся здесь
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="space-y-3 md:space-y-4">
                                {sortedNotifications.map(notification => (
                                    <div
                                        key={notification.id}
                                        onClick={() => handleNotificationClick(notification)}
                                        className={`relative p-3 md:p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-card transition-colors ${
                                            notification.status === "unread" ? "cursor-pointer" : ""
                                        }`}
                                    >
                                        {/* Красный кружок для непрочитанных */}
                                        {notification.status === "unread" && (
                                            <div className="absolute top-3 md:top-4 right-3 md:right-4 w-3 h-3 bg-red-500 rounded-full"></div>
                                        )}
                                        
                                        <div className="flex items-start gap-3 md:gap-4 pr-6 md:pr-8">
                                            <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <Bell className="h-5 w-5 md:h-6 md:w-6 text-primary" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-semibold text-sm md:text-base mb-1 md:mb-2">
                                                    {notification.title}
                                                </h3>
                                                <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">
                                                    {notification.description}
                                                </p>
                                                <div className="flex items-center justify-between gap-2 flex-wrap">
                                                    <p className="text-xs md:text-sm text-muted-foreground">
                                                        {new Date(notification.date).toLocaleDateString('ru-RU', {
                                                            day: 'numeric',
                                                            month: 'long',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </p>
                                                    {notification.cta_url && notification.cta_label && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                window.open(notification.cta_url, '_blank', 'noopener,noreferrer');
                                                            }}
                                                            className="text-xs"
                                                        >
                                                            {notification.cta_label}
                                                            <ExternalLink className="ml-1 h-3 w-3" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Кнопка загрузки еще */}
                            {hasMore && (
                                <div className="mt-6 text-center">
                                    <Button
                                        variant="outline"
                                        onClick={handleLoadMore}
                                        disabled={loadingMore}
                                    >
                                        {loadingMore ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Загрузка...
                                            </>
                                        ) : (
                                            'Загрузить еще'
                                        )}
                                    </Button>
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default NotificationsPage;


