import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Users, Filter, Loader2 } from "lucide-react";
import { toast } from "sonner";
import EventCard from "@/components/events/EventCard";
import EventFilters from "@/components/events/EventFilters";
import { api } from "@/api.js";

const EventsPage = () => {
    const [activeTab, setActiveTab] = useState("my-events");
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({
        category: null,
        dateFrom: null,
        dateTo: null,
        participants: null,
    });
    const [showFilters, setShowFilters] = useState(false);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Маппинг данных из EventCardDTO к формату компонентов
    const mapEventData = (event) => {
        return {
            id: event.id,
            title: event.name,
            description: event.short_description || event.description,
            fullDescription: event.description, // Полное описание для popover
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

    // Загрузка событий с сервера
    const loadEvents = async () => {
        setLoading(true);
        setError(null);
        
        try {
            let apiParams = {};
            
            // Для вкладки "active" и "past" загружаем с соответствующим статусом
            if (activeTab === "active") {
                apiParams.status = "ACTIVE";
            } else if (activeTab === "past") {
                apiParams.status = "PAST";
            }
            // Для "my-events" загружаем все события (без фильтра), фильтрация будет на клиенте
            
            const data = await api.getEventCards(apiParams);
            const mappedEvents = data.map(mapEventData);
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

    // Загрузка данных при монтировании и изменении вкладки
    useEffect(() => {
        loadEvents();
    }, [activeTab]);

    // Фильтрация событий
    const filteredEvents = events.filter(event => {
        // Для вкладки "my-events" показываем только события, где пользователь участвует
        if (activeTab === "my-events") {
            if (!event.isParticipating) return false;
        }
        // Для "active" и "past" фильтрация уже сделана на сервере

        // Локальная фильтрация по поиску
        if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Фильтрация по категории (если будет в данных)
        if (filters.category && event.category !== filters.category) {
            return false;
        }

        // Фильтрация по датам
        if (filters.dateFrom) {
            const eventDate = new Date(event.startDate);
            const filterDate = new Date(filters.dateFrom);
            if (eventDate < filterDate) return false;
        }

        if (filters.dateTo) {
            const eventDate = new Date(event.startDate);
            const filterDate = new Date(filters.dateTo);
            if (eventDate > filterDate) return false;
        }

        // Фильтрация по количеству участников
        if (filters.participants) {
            const maxParticipants = parseInt(filters.participants);
            if (filters.participants === "200") {
                if (event.participants <= 100) return false;
            } else {
                if (event.participants > maxParticipants) return false;
            }
        }

        return true;
    });

    // Статистика
    const stats = {
        total: events.length,
        participating: events.filter(e => e.isParticipating).length,
        upcoming: events.filter(e => e.status === "active").length,
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

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
            {/* Шапка */}
            <div className="bg-white dark:bg-gray-950 border-b">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex justify-between items-center mb-6">
                        <div>
                            <h1 className="text-3xl font-bold">Электронная афиша</h1>
                            <p className="text-muted-foreground mt-1">
                                События и мероприятия
                            </p>
                        </div>
                        <Button className="bg-primary hover:bg-primary/90">
                            <Calendar className="mr-2 h-4 w-4" />
                            Календарь
                        </Button>
                    </div>

                    {/* Поиск и фильтры */}
                    <div className="flex gap-4 mb-6">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Поиск событий..."
                                className="pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button
                            variant="outline"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <Filter className="mr-2 h-4 w-4" />
                            Фильтры
                        </Button>
                    </div>

                    {showFilters && (
                        <EventFilters filters={filters} onFilterChange={setFilters} />
                    )}
                </div>
            </div>

            {/* Основной контент */}
            <div className="container mx-auto px-6 py-8">
                {/* Статистика */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Все события</p>
                                    <p className="text-3xl font-bold">{stats.total}</p>
                                </div>
                                <Calendar className="h-10 w-10 text-primary/40 dark:text-primary/70" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Вы участвуете</p>
                                    <p className="text-3xl font-bold">{stats.participating}</p>
                                </div>
                                <Users className="h-10 w-10 text-primary/40 dark:text-primary/70" />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-muted-foreground">Предстоящие</p>
                                    <p className="text-3xl font-bold">{stats.upcoming}</p>
                                </div>
                                <Calendar className="h-10 w-10 text-primary/40 dark:text-primary/70" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Вкладки событий */}
                <Card>
                    <CardContent className="p-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <div className="border-b">
                                <div className="px-6 py-2">
                                    <TabsList className="w-full md:w-auto">
                                        <TabsTrigger value="my-events" className="flex-1 md:flex-none">
                                            Мои события ({stats.participating})
                                        </TabsTrigger>
                                        <TabsTrigger value="active" className="flex-1 md:flex-none">
                                            Активные ({stats.upcoming})
                                        </TabsTrigger>
                                        <TabsTrigger value="past" className="flex-1 md:flex-none">
                                            Прошедшие ({events.filter(e => e.status === "past").length})
                                        </TabsTrigger>
                                    </TabsList>
                                </div>
                            </div>

                            {["my-events", "active", "past"].map(tab => (
                                <TabsContent key={tab} value={tab} className="m-0 p-6">
                                    {loading ? (
                                        <div className="text-center py-12">
                                            <Loader2 className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4 animate-spin" />
                                            <p className="text-muted-foreground">Загрузка событий...</p>
                                        </div>
                                    ) : error ? (
                                        <div className="text-center py-12">
                                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                            <h3 className="text-lg font-medium mb-2">Ошибка загрузки</h3>
                                            <p className="text-muted-foreground">{error}</p>
                                            <Button 
                                                variant="outline" 
                                                className="mt-4"
                                                onClick={loadEvents}
                                            >
                                                Попробовать снова
                                            </Button>
                                        </div>
                                    ) : filteredEvents.length === 0 ? (
                                        <div className="text-center py-12">
                                            <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                                            <h3 className="text-lg font-medium mb-2">
                                                {tab === "my-events" && "У вас пока нет событий"}
                                                {tab === "active" && "Нет активных событий"}
                                                {tab === "past" && "Нет прошедших событий"}
                                            </h3>
                                            <p className="text-muted-foreground">
                                                {tab === "my-events"
                                                    ? "Подтвердите участие в событиях, чтобы они появились здесь"
                                                    : "Скоро появятся новые события"}
                                            </p>
                                        </div>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                            {filteredEvents.map(event => (
                                                <EventCard 
                                                    key={event.id} 
                                                    event={event}
                                                    onParticipationChange={handleParticipationChange}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </TabsContent>
                            ))}
                        </Tabs>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default EventsPage;
