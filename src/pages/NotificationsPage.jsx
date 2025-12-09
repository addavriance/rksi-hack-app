import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell } from "lucide-react";
import { mockNotifications } from "@/data/mockNotifications";

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState(mockNotifications);

    // Пометить все уведомления как прочитанные при открытии страницы
    useEffect(() => {
        setNotifications(prevNotifications =>
            prevNotifications.map(notification => ({
                ...notification,
                status: "read"
            }))
        );
    }, []);

    // Сортировка по дате (новые сверху)
    const sortedNotifications = [...notifications].sort((a, b) => 
        new Date(b.date) - new Date(a.date)
    );

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
                    {sortedNotifications.length === 0 ? (
                        <div className="text-center py-12">
                            <Bell className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                            <h3 className="text-lg font-medium mb-2">Нет уведомлений</h3>
                            <p className="text-muted-foreground">
                                Когда появятся новые уведомления, они отобразятся здесь
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-3 md:space-y-4">
                            {sortedNotifications.map(notification => (
                                <div
                                    key={notification.id}
                                    className="relative p-3 md:p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-card transition-colors"
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
                                            <p className="text-xs md:text-sm text-muted-foreground">
                                                {new Date(notification.date).toLocaleDateString('ru-RU', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default NotificationsPage;

