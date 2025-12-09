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
        <div className="space-y-8">
            {/* Приветствие */}
            <div className="bg-gradient-to-r from-primary/5 to-primary/10
                dark:bg-gradient-to-r dark:from-primary/15 dark:to-primary/25 rounded-xl p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Добро пожаловать!</h1>
                        <p className="text-muted-foreground">
                            Здесь вы можете управлять своими событиями и быть в курсе всего происходящего
                        </p>
                    </div>
                    {user.role === "ADMIN" && (
                        <Button className="mt-4 md:mt-0">
                            <Calendar className="mr-2 h-4 w-4"/>
                            Создать событие
                        </Button>
                    )}
                </div>
            </div>

            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground dark:text-gray-400">Все события</p>
                                <p className="text-3xl font-bold dark:text-white">{stats.totalEvents}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                <Calendar className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground dark:text-gray-400">Активные</p>
                                <p className="text-3xl font-bold dark:text-white">{stats.activeEvents}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-green-100 dark:bg-green-900/30">
                                <Clock className="h-6 w-6 text-green-600 dark:text-green-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground dark:text-gray-400">Вы участвуете</p>
                                <p className="text-3xl font-bold dark:text-white">{stats.myEvents}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                                <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Предстоящие</p>
                                <p className="text-3xl font-bold">{stats.upcomingEvents}</p>
                            </div>
                            <div className="p-3 rounded-lg bg-orange-100 dark:bg-orange-900/30">
                                <TrendingUp className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Основные разделы */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Ближайшие события */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="flex items-center">
                            <Clock className="mr-2 h-5 w-5 text-primary" />
                            Ближайшие события
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {upcomingEvents.map(event => (
                                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-card">
                                    <div className="flex items-center">
                                        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mr-4">
                                            <Calendar className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold">{event.title}</h3>
                                            <p className="text-sm text-muted-foreground">
                                                {new Date(event.startDate).toLocaleDateString('ru-RU', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-medium">{event.participants} участников</div>
                                        {event.isParticipating ? (
                                            <div className="text-sm text-green-600 flex items-center mt-5">
                                                <CheckCircle className="h-3 w-3 mr-1" />
                                                Вы участвуете
                                            </div>
                                        ) : (
                                            <Button size="sm" asChild className="mt-5">
                                                <Link to={`/events/${event.id}`}>Участвовать</Link>
                                                {/*заглушка, но тут по логике нужен хендлер просто который
                                                оптимистично обновит состояние на то что мы участвуем и направит запрос на бек*/}
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full mt-4" asChild>
                            <Link to="/events">Все события →</Link>
                        </Button>
                    </CardContent>
                </Card>

                {/* Боковая панель */}
                <div className="space-y-6">
                    {/* Мои события */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <CheckCircle className="mr-2 h-5 w-5 text-green-600" />
                                Мои события
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {myEvents.map(event => (
                                    <div key={event.id} className="p-3 border rounded-lg">
                                        <div className="font-medium">{event.title}</div>
                                        <div className="text-sm text-muted-foreground">
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
                                    <p className="text-muted-foreground mb-3">Вы ещё не участвуете в событиях</p>
                                    <Button size="sm" asChild>
                                        <Link to="/events">Найти события</Link>
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Быстрые действия */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center">
                                <Bell className="mr-2 h-5 w-5 text-orange-600" />
                                Уведомления
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex items-center p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                                    <AlertCircle className="h-5 w-5 text-blue-600 mr-3" />
                                    <div>
                                        <div className="font-medium">Завтра: День рождения</div>
                                        <div className="text-sm text-muted-foreground">Не забудьте подтвердить участие</div>
                                    </div>
                                </div>
                                <div className="flex items-center p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                                    <Star className="h-5 w-5 text-green-600 mr-3" />
                                    <div>
                                        <div className="font-medium">Новое событие</div>
                                        <div className="text-sm text-muted-foreground">Тимбилдинг на следующей неделе</div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Статистика участия */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ваша активность</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span>Участие в событиях</span>
                                        <span>{stats.myEvents}/{stats.totalEvents}</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2">
                                        <div
                                            className="bg-primary rounded-full h-2"
                                            style={{ width: `${(stats.myEvents / stats.totalEvents) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t">
                                    <div className="flex justify-between items-center">
                                        <span className="text-sm text-muted-foreground">Средний рейтинг</span>
                                        <div className="flex items-center">
                                            <Star className="h-4 w-4 text-yellow-500 mr-1" />
                                            <span className="font-medium">4.8</span>
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
