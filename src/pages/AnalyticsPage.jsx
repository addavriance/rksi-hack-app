import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext.jsx";
import { api } from "@/api.js";
import { toast } from "sonner";
import {
    Users,
    Calendar,
    TrendingUp,
    UserCheck,
    BarChart3,
    Download,
    RefreshCw,
    Activity
} from "lucide-react";

import { StatCard } from "@/components/analytics/StatCard.jsx";
import { AdminChart } from "@/components/analytics/AdminChart";
import { HistogramChart } from "@/components/analytics/HistogramChart";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card.js";

const AnalyticsPage = () => {
    const { user } = useAuth();
    const [statistics, setStatistics] = useState(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState("overview");

    const loadStatistics = async () => {
        try {
            setRefreshing(true);
            const data = await api.getAdminStatistics();
            setStatistics(data);
        } catch (error) {
            const errorMessage = error.response?.data?.detail || error.message || 'Ошибка при загрузке статистики';
            toast.error(errorMessage);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        if (user?.role === "ADMINISTRATOR") {
            loadStatistics();
        }
    }, [user]);

    const handleExport = () => {
        // TODO: Реализовать экспорт данных
        toast.info("Экспорт данных в разработке");
    };

    if (!user || user.role !== "ADMINISTRATOR") {
        return (
            <div className="flex flex-col items-center justify-center h-[50vh]">
                <BarChart3 className="h-16 w-16 text-muted-foreground mb-4" />
                <h2 className="text-2xl font-bold mb-2">Доступ запрещен</h2>
                <p className="text-muted-foreground text-center">
                    Только администраторы могут просматривать эту страницу
                </p>
            </div>
        );
    }

    const mainScalars = statistics?.scalars?.slice(0, 4) || [];

    return (
        <div className="space-y-6 p-6">
            {/* Заголовок и действия */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Аналитика системы</h1>
                    <p className="text-muted-foreground">
                        Статистика и аналитика платформы мероприятий
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={loadStatistics}
                        disabled={refreshing}
                    >
                        <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                        Обновить
                    </Button>
                    <Button onClick={handleExport}>
                        <Download className="h-4 w-4 mr-2" />
                        Экспорт
                    </Button>
                </div>
            </div>

            {/* Основная статистика */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Всего пользователей"
                    value={mainScalars.find(s => s.name === "total_users")?.value || 0}
                    unit={mainScalars.find(s => s.name === "total_users")?.unit || ""}
                    icon={Users}
                    loading={loading}
                    trend={{ value: 12, period: "месяц" }}
                />
                <StatCard
                    title="Активных мероприятий"
                    value={mainScalars.find(s => s.name === "active_events")?.value || 0}
                    unit={mainScalars.find(s => s.name === "active_events")?.unit || ""}
                    icon={Calendar}
                    loading={loading}
                    trend={{ value: 8, period: "неделя" }}
                />
                <StatCard
                    title="Участий"
                    value={mainScalars.find(s => s.name === "total_participations")?.value || 0}
                    unit={mainScalars.find(s => s.name === "total_participations")?.unit || ""}
                    icon={UserCheck}
                    loading={loading}
                    trend={{ value: 15, period: "месяц" }}
                />
                <StatCard
                    title="Средняя заполняемость"
                    value={mainScalars.find(s => s.name === "avg_participation_rate")?.value || 0}
                    unit={mainScalars.find(s => s.name === "avg_participation_rate")?.unit || "%"}
                    icon={Activity}
                    loading={loading}
                    trend={{ value: 5, period: "месяц" }}
                />
            </div>

            {/* Табы с разделами аналитики */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
                <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-flex">
                    <TabsTrigger value="overview">Обзор</TabsTrigger>
                    <TabsTrigger value="users">Пользователи</TabsTrigger>
                    <TabsTrigger value="events">Мероприятия</TabsTrigger>
                </TabsList>

                {/* Обзор */}
                <TabsContent value="overview" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {statistics?.graphs?.[0] && (
                            <AdminChart
                                title="Регистрации пользователей"
                                description="Динамика новых регистраций"
                                data={statistics.graphs[0].points}
                                dataKey="y"
                                loading={loading}
                                color="var(--primary)"
                            />
                        )}
                        {statistics?.graphs?.[1] && (
                            <AdminChart
                                title="Создание мероприятий"
                                description="Количество новых мероприятий"
                                data={statistics.graphs[1].points}
                                dataKey="y"
                                loading={loading}
                                color="var(--secondary)"
                            />
                        )}
                    </div>

                    {statistics?.histograms?.[0] && (
                        <HistogramChart
                            title="Распределение мероприятий по участникам"
                            description="Количество мероприятий в разных диапазонах участников"
                            bins={statistics.histograms[0].bins}
                            loading={loading}
                        />
                    )}
                </TabsContent>

                {/* Пользователи */}
                <TabsContent value="users" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            {statistics?.scalars?.filter(s =>
                                s.name.includes("user") ||
                                s.name.includes("active") ||
                                s.name === "users_per_day"
                            ).map((scalar, index) => (
                                <Card key={index}>
                                    <CardContent className="pt-6">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    {scalar.name.replace(/_/g, ' ')}
                                                </p>
                                                <p className="text-2xl font-bold mt-2">
                                                    {scalar.value.toLocaleString('ru-RU')} {scalar.unit}
                                                </p>
                                            </div>
                                            <TrendingUp className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {statistics?.graphs?.find(g => g.name.includes("user")) && (
                            <AdminChart
                                title="Активность пользователей"
                                description="Посещаемость и активность"
                                data={statistics.graphs.find(g => g.name.includes("user"))?.points || []}
                                dataKey="y"
                                loading={loading}
                                type="bar"
                            />
                        )}
                    </div>
                </TabsContent>

                {/* Мероприятия */}
                <TabsContent value="events" className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            {statistics?.scalars?.filter(s =>
                                s.name.includes("event") ||
                                s.name.includes("participation")
                            ).map((scalar, index) => (
                                <Card key={index}>
                                    <CardContent className="pt-6">
                                        <div className="flex justify-between items-center">
                                            <div>
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    {scalar.name.replace(/_/g, ' ')}
                                                </p>
                                                <p className="text-2xl font-bold mt-2">
                                                    {scalar.value.toLocaleString('ru-RU')} {scalar.unit}
                                                </p>
                                            </div>
                                            <Calendar className="h-8 w-8 text-muted-foreground" />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {statistics?.graphs?.find(g => g.name.includes("event")) && (
                            <AdminChart
                                title="Участие в мероприятиях"
                                description="Количество участников на мероприятиях"
                                data={statistics.graphs.find(g => g.name.includes("event"))?.points || []}
                                dataKey="y"
                                loading={loading}
                            />
                        )}
                    </div>
                </TabsContent>
            </Tabs>

            {/* Дополнительная статистика */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statistics?.scalars?.slice(4).map((scalar, index) => (
                    <Card key={index}>
                        <CardHeader>
                            <CardTitle className="text-sm font-medium">
                                {scalar.name.replace(/_/g, ' ')}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {scalar.value.toLocaleString('ru-RU')} {scalar.unit}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default AnalyticsPage;
