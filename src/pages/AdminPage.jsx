import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Users, Calendar, Download, Filter,
    UserCog, CalendarCheck
} from "lucide-react";
import UserManagement from "@/components/admin/UserManagement";
import EventManagement from "@/components/admin/EventManagement";
import { api } from "@/api";

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState("users");
    const [searchQuery, setSearchQuery] = useState("");
    const [stats, setStats] = useState({
        totalUsers: 0,
        activeUsers: 0,
        totalEvents: 0,
        activeEvents: 0,
        administrators: 0,
        totalParticipants: 0
    });

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);

            const users = await api.getUsers({ include_deleted: true });
            const activeUsers = users.filter(u => u.status === "ACTIVE");
            const admins = users.filter(u => u.role === "ADMINISTRATOR");

            const events = await api.getEvents();
            const activeEvents = events.filter(e => e.status === "ACTIVE");

            const totalParticipants = events.reduce((sum, event) => {
                return sum + (event.participants?.length || 0);
            }, 0);

            setStats({
                totalUsers: users.length,
                activeUsers: activeUsers.length,
                totalEvents: events.length,
                activeEvents: activeEvents.length,
                administrators: admins.length,
                totalParticipants
            });
        } catch (error) {
            console.error("Ошибка загрузки статистики:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        console.log("Экспорт данных");
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Шапка админки */}
            <div className="bg-white dark:bg-gray-950 border-b">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold">Администрирование</h1>
                            <p className="text-muted-foreground mt-1">
                                Управление пользователями и событиями
                            </p>
                        </div>
                    </div>

                    {/* Статистика */}
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center">
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 mr-3">
                                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Всего</p>
                                        <p className="text-xl font-bold">{stats.totalUsers}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center">
                                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 mr-3">
                                        <Users className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Активных</p>
                                        <p className="text-xl font-bold">{stats.activeUsers}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center">
                                    <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 mr-3">
                                        <UserCog className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Админов</p>
                                        <p className="text-xl font-bold">{stats.administrators}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center">
                                    <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900/30 mr-3">
                                        <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Событий</p>
                                        <p className="text-xl font-bold">{stats.totalEvents}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center">
                                    <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 mr-3">
                                        <CalendarCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Активных событий</p>
                                        <p className="text-xl font-bold">{stats.activeEvents}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-4">
                                <div className="flex items-center">
                                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 mr-3">
                                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Участников</p>
                                        <p className="text-xl font-bold">{stats.totalParticipants}</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Поиск и фильтры */}
                    <div className="flex gap-4">
                        <div className="relative flex-1">
                            <Input
                                placeholder="Поиск..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        </div>
                        <Button variant="outline" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" />
                            Экспорт
                        </Button>
                    </div>
                </div>
            </div>

            {/* Основной контент админки */}
            <div className="container mx-auto px-6 py-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="mb-6">
                        <TabsTrigger value="users">
                            <Users className="mr-2 h-4 w-4" />
                            Пользователи
                        </TabsTrigger>
                        <TabsTrigger value="events">
                            <Calendar className="mr-2 h-4 w-4" />
                            События
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="users" className="mt-0">
                        <UserManagement searchQuery={searchQuery} />
                    </TabsContent>

                    <TabsContent value="events" className="mt-0">
                        <EventManagement searchQuery={searchQuery} />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AdminPage;
