import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Users, Calendar, Plus, Download, Filter,
    UserCog, CalendarCheck, BarChart3
} from "lucide-react";
import UserManagement from "@/components/admin/UserManagement";
import EventManagement from "@/components/admin/EventManagement";
import { mockUsers } from "@/data/mockUsers";
import { mockEvents } from "@/data/mockEvents";

const AdminPage = () => {
    const [activeTab, setActiveTab] = useState("users");
    const [searchQuery, setSearchQuery] = useState("");

    const stats = {
        totalUsers: mockUsers.length,
        activeUsers: mockUsers.filter(u => u.status === "active").length,
        totalEvents: mockEvents.length,
        activeEvents: mockEvents.filter(e => e.status === "active").length,
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
                        <div className="flex gap-3">
                            <Button variant="outline">
                                <BarChart3 className="mr-2 h-4 w-4" />
                                Аналитика
                            </Button>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Создать событие
                            </Button>
                        </div>
                    </div>

                    {/* Статистика */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-lg bg-blue-100 mr-4">
                                        <Users className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Пользователи</p>
                                        <p className="text-2xl font-bold">{stats.totalUsers}</p>
                                        <p className="text-xs text-green-600">
                                            {stats.activeUsers} активных
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-lg bg-green-100 mr-4">
                                        <Calendar className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">События</p>
                                        <p className="text-2xl font-bold">{stats.totalEvents}</p>
                                        <p className="text-xs text-blue-600">
                                            {stats.activeEvents} активных
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-lg bg-purple-100 mr-4">
                                        <UserCog className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Администраторы</p>
                                        <p className="text-2xl font-bold">
                                            {mockUsers.filter(u => u.role === "ADMIN").length}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardContent className="p-6">
                                <div className="flex items-center">
                                    <div className="p-3 rounded-lg bg-orange-100 mr-4">
                                        <CalendarCheck className="h-6 w-6 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-muted-foreground">Участие</p>
                                        <p className="text-2xl font-bold">
                                            {mockEvents.reduce((sum, e) => sum + e.participants, 0)}
                                        </p>
                                        <p className="text-xs text-muted-foreground">всего участников</p>
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
                        <Button variant="outline">
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
                        <TabsTrigger value="settings">
                            Настройки
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="users" className="mt-0">
                        <UserManagement searchQuery={searchQuery} />
                    </TabsContent>

                    <TabsContent value="events" className="mt-0">
                        <EventManagement searchQuery={searchQuery} />
                    </TabsContent>

                    <TabsContent value="settings" className="mt-0">
                        <Card>
                            <CardContent className="p-6">
                                <h3 className="text-lg font-semibold mb-4">Настройки системы</h3>
                                <p className="text-muted-foreground">
                                    Раздел настроек в разработке
                                </p>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
};

export default AdminPage;
