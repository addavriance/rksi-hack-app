import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Calendar, Users, Bell, TrendingUp,
    Clock, CheckCircle, AlertCircle, Star
} from "lucide-react";
import { mockEvents } from "@/data/mockEvents";
import {useAuth} from "@/contexts/AuthContext.jsx";

const DashboardPage = () => {
    const {user} = useAuth();
    // Статистика
    const stats = {
        totalEvents: mockEvents.length,
        activeEvents: mockEvents.filter(e => e.status === "active").length,
        myEvents: mockEvents.filter(e => e.isParticipating).length,
        upcomingEvents: mockEvents.filter(e =>
            e.status === "active" &&
            new Date(e.startDate) > new Date()
        ).length,
    };

    // Ближайшие события
    const upcomingEvents = mockEvents
        .filter(e => e.status === "active" && new Date(e.startDate) > new Date())
        .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
        .slice(0, 3);

    // Мои события
    const myEvents = mockEvents
        .filter(e => e.isParticipating)
        .slice(0, 3);

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
                    {user.role === "ADMIN" && (
                        <Button className="mt-4 md:mt-0 w-full md:w-auto min-h-[44px]">
                            <Calendar className="mr-2 h-4 w-4"/>
                            Создать событие
                        </Button>
                    )}
                </div>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                <Card>
                    <CardContent className="p-4 md:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm text-muted-foreground dark:text-gray-400">Все события</p>
                                <p className="text-2xl md:text-3xl font-bold dark:text-white">{stats.totalEvents}</p>
                            </div>
                            <div className="p-2 md:p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <Calendar className="h-5 w-5 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 md:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm text-muted-foreground dark:text-gray-400">Активные</p>
                                <p className="text-2xl md:text-3xl font-bold dark:text-white">{stats.activeEvents}</p>
                            </div>
                            <div className="p-2 md:p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                                <Clock className="h-5 w-5 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 md:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm text-muted-foreground dark:text-gray-400">Вы участвуете</p>
                                <p className="text-2xl md:text-3xl font-bold dark:text-white">{stats.myEvents}</p>
                            </div>
                            <div className="p-2 md:p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                <Users className="h-5 w-5 md:h-6 md:w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4 md:p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs md:text-sm text-muted-foreground dark:text-gray-400">Предстоящие</p>
                                <p className="text-2xl md:text-3xl font-bold dark:text-white">{stats.upcomingEvents}</p>
                            </div>
                            <div className="p-2 md:p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                <TrendingUp className="h-5 w-5 md:h-6 md:w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
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
                                            <div className="text-xs md:text-sm text-green-600 dark:text-green-400 flex items-center">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Вы участвуете
                                            </div>
                                        ) : (
                                            <Button size="sm" asChild className="min-h-[40px] md:min-h-[32px] text-xs md:text-sm px-4">
                                                <Link to={`/events/${event.id}`}>Участвовать</Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
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
                            <div className="space-y-2 md:space-y-3">
                                {myEvents.map(event => (
                                    <div key={event.id} className="p-2 md:p-3 border rounded-lg">
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
                        </CardContent>
                    </Card>

                    {/* Быстрые действия */}
                    <Card>
                        <CardHeader className="p-4 md:p-6">
                            <CardTitle className="flex items-center text-base md:text-lg">
                                <Bell className="mr-2 h-4 w-4 md:h-5 md:w-5 text-orange-600" />
                                Уведомления
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6">
                            <div className="space-y-2 md:space-y-3">
                                <div className="flex items-start md:items-center p-2 md:p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                    <AlertCircle className="h-4 w-4 md:h-5 md:w-5 text-blue-600 mr-2 md:mr-3 flex-shrink-0 mt-0.5 md:mt-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm md:text-base">Завтра: День рождения</div>
                                        <div className="text-xs md:text-sm text-muted-foreground">Не забудьте подтвердить участие</div>
                                    </div>
                                </div>
                                <div className="flex items-start md:items-center p-2 md:p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                                    <Star className="h-4 w-4 md:h-5 md:w-5 text-green-600 mr-2 md:mr-3 flex-shrink-0 mt-0.5 md:mt-0" />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm md:text-base">Новое событие</div>
                                        <div className="text-xs md:text-sm text-muted-foreground">Тимбилдинг на следующей неделе</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Статистика участия */}
                    <Card>
                        <CardHeader className="p-4 md:p-6">
                            <CardTitle className="text-base md:text-lg">Ваша активность</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 md:p-6">
                            <div className="space-y-3 md:space-y-4">
                                <div>
                                    <div className="flex justify-between text-xs md:text-sm mb-1">
                                        <span>Участие в событиях</span>
                                        <span>{stats.myEvents}/{stats.totalEvents}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                                        <div
                                            className="bg-primary rounded-full h-2"
                                            style={{ width: `${(stats.myEvents / stats.totalEvents) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="pt-3 md:pt-4 border-t">
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs md:text-sm text-muted-foreground">Средний рейтинг</span>
                                        <div className="flex items-center">
                                            <Star className="h-3 w-3 md:h-4 md:w-4 text-yellow-500 mr-1" />
                                            <span className="font-medium text-sm md:text-base">4.8</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;
