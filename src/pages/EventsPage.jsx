import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
    const [events, setEvents] = useState([]); // События для текущей вкладки (с учетом фильтров)
    const [allEvents, setAllEvents] = useState([]); // Все события для статистики
    const [myEvents, setMyEvents] = useState([]); // События, где пользователь участвует
    const [activeEvents, setActiveEvents] = useState([]); // Активные события
    const [pastEvents, setPastEvents] = useState([]); // Прошедшие события
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [eventToCancel, setEventToCancel] = useState(null);

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

    // Загрузка всех событий для статистики и всех вкладок
    const loadAllEvents = async () => {
        setLoading(true);
        setError(null);
        
        try {
            // Параллельная загрузка всех категорий событий
            const [allData, activeData, pastData] = await Promise.all([
                api.getEventCards({}), // Все события для статистики
                api.getEventCards({ status: "ACTIVE" }), // Активные события
                api.getEventCards({ status: "PAST" }), // Прошедшие события
            ]);

            // Маппинг данных
            const mappedAllEvents = allData.map(mapEventData);
            const mappedActiveEvents = activeData.map(mapEventData);
            const mappedPastEvents = pastData.map(mapEventData);
            
            // Фильтрация событий, где пользователь участвует
            const mappedMyEvents = mappedAllEvents.filter(e => e.isParticipating);

            // Обновление всех состояний
            setAllEvents(mappedAllEvents);
            setActiveEvents(mappedActiveEvents);
            setPastEvents(mappedPastEvents);
            setMyEvents(mappedMyEvents);

            // Установка событий для текущей вкладки
            updateEventsForTab(activeTab, mappedAllEvents, mappedActiveEvents, mappedPastEvents, mappedMyEvents);
        } catch (err) {
            const errorMessage = err.response?.data?.detail || err.message || 'Ошибка при загрузке событий';
            setError(errorMessage);
            toast.error(errorMessage);
            setAllEvents([]);
            setActiveEvents([]);
            setPastEvents([]);
            setMyEvents([]);
            setEvents([]);
        } finally {
            setLoading(false);
        }
    };

    // Обновление событий для текущей вкладки
    const updateEventsForTab = (tab, all, active, past, my) => {
        switch (tab) {
            case "my-events":
                setEvents(my);
                break;
            case "active":
                setEvents(active);
                break;
            case "past":
                setEvents(past);
                break;
            default:
                setEvents(all);
        }
    };

    // Загрузка данных при монтировании
    useEffect(() => {
        loadAllEvents();
    }, []);

    // Обновление событий при переключении вкладки
    useEffect(() => {
        if (allEvents.length > 0 || activeEvents.length > 0 || pastEvents.length > 0 || myEvents.length > 0) {
            updateEventsForTab(activeTab, allEvents, activeEvents, pastEvents, myEvents);
        }
    }, [activeTab]);

    // Фильтрация событий (только поиск и фильтры, статус уже учтен в events)
    const filteredEvents = events.filter(event => {
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

    // Статистика (на основе всех событий, независимо от вкладки и фильтров)
    const stats = {
        total: allEvents.length,
        participating: allEvents.filter(e => e.isParticipating).length,
        upcoming: allEvents.filter(e => e.status === "active").length,
    };

    // Обновление события во всех массивах
    const updateEventInArray = (eventsArray, eventId, newStatus) => {
        return eventsArray.map(event => {
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
        });
    };

    // Обработка изменения участия (оптимистичное обновление)
    const handleParticipationChange = (eventId, newStatus) => {
        // Если пытаемся отменить участие, показываем диалог подтверждения
        if (newStatus === 'NONE') {
            const event = allEvents.find(e => e.id === eventId);
            if (event && event.isParticipating) {
                setEventToCancel({ id: eventId, title: event.title });
                setCancelDialogOpen(true);
                return;
            }
        }

        // Для участия в событии обновляем сразу
        applyParticipationChange(eventId, newStatus);
    };

    // Применение изменения участия (оптимистичное обновление)
    const applyParticipationChange = (eventId, newStatus) => {
        const isParticipating = newStatus === 'PARTICIPATING';
        
        // Функция для обновления события в массиве
        const updateEvent = (event) => {
            if (event.id === eventId) {
                return {
                    ...event,
                    isParticipating,
                    participation_status: newStatus,
                    participants: isParticipating 
                        ? event.participants + 1 
                        : Math.max(0, event.participants - 1)
                };
            }
            return event;
        };

        // Обновляем все массивы событий
        setAllEvents(prev => {
            const updated = prev.map(updateEvent);
            // Обновляем myEvents на основе обновленного allEvents
            setMyEvents(updated.filter(e => e.isParticipating));
            return updated;
        });
        
        setActiveEvents(prev => prev.map(updateEvent));
        setPastEvents(prev => prev.map(updateEvent));
        setEvents(prev => prev.map(updateEvent));
    };

    // Подтверждение отмены участия с API вызовом
    const handleConfirmCancel = async () => {
        if (!eventToCancel) return;

        const eventId = eventToCancel.id;
        const event = allEvents.find(e => e.id === eventId);
        const previousStatus = event?.participation_status;

        // Оптимистичное обновление
        applyParticipationChange(eventId, 'NONE');

        try {
            await api.updateParticipation(eventId, { status: 'NONE' });
            toast.success('Вы отменили участие в событии');
            setCancelDialogOpen(false);
            setEventToCancel(null);
        } catch (error) {
            // Откат изменений при ошибке
            if (previousStatus) {
                applyParticipationChange(eventId, previousStatus);
            }
            const errorMessage = error.response?.data?.detail || error.message || 'Ошибка при отмене участия';
            toast.error(errorMessage);
        }
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
                                            Мои события ({myEvents.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="active" className="flex-1 md:flex-none">
                                            Активные ({activeEvents.length})
                                        </TabsTrigger>
                                        <TabsTrigger value="past" className="flex-1 md:flex-none">
                                            Прошедшие ({pastEvents.length})
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
                                                onClick={loadAllEvents}
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

            {/* Диалог подтверждения отмены участия */}
            <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Отменить участие?</DialogTitle>
                        <DialogDescription>
                            Вы уверены, что хотите отменить участие в событии "{eventToCancel?.title}"? 
                            Это действие можно будет отменить, записавшись на событие снова.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button 
                            variant="outline" 
                            onClick={() => {
                                setCancelDialogOpen(false);
                                setEventToCancel(null);
                            }}
                        >
                            Нет, оставить
                        </Button>
                        <Button 
                            variant="destructive" 
                            onClick={handleConfirmCancel}
                        >
                            Да, отменить участие
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EventsPage;
