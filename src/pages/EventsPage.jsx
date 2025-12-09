// pages/EventsPage.jsx
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Calendar, Users, Filter } from "lucide-react";
import EventCard from "@/components/events/EventCard";
import EventFilters from "@/components/events/EventFilters";
import { mockEvents } from "@/data/mockEvents";

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

    const filteredEvents = mockEvents.filter(event => {
        if (activeTab === "active") {
            if (event.status !== "active") return false;
        } else if (activeTab === "my-events") {
            if (!event.isParticipating) return false;
        } else if (activeTab === "past") {
            if (event.status !== "past") return false;
        }

        if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        if (filters.category && event.category !== filters.category) return false;

        return true;
    });

    const stats = {
        total: mockEvents.length,
        participating: mockEvents.filter(e => e.isParticipating).length,
        upcoming: mockEvents.filter(e => e.status === "active").length,
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Шапка */}
            <div className="bg-white border-b">
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
                                <Calendar className="h-10 w-10 text-primary/20" />
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
                                <Users className="h-10 w-10 text-primary/20" />
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
                                <Calendar className="h-10 w-10 text-primary/20" />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Вкладки событий */}
                <Card>
                    <CardContent className="p-0">
                        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                            <div className="border-b">
                                <div className="px-6">
                                    <TabsList className="w-full md:w-auto">
                                        <TabsTrigger value="my-events" className="flex-1 md:flex-none">
                                            Мои события ({mockEvents.filter(e => e.isParticipating).length})
                                        </TabsTrigger>
                                        <TabsTrigger value="active" className="flex-1 md:flex-none">
                                            Активные ({mockEvents.filter(e => e.status === "active").length})
                                        </TabsTrigger>
                                        <TabsTrigger value="past" className="flex-1 md:flex-none">
                                            Прошедшие ({mockEvents.filter(e => e.status === "past").length})
                                        </TabsTrigger>
                                    </TabsList>
                                </div>
                            </div>

                            {["my-events", "active", "past"].map(tab => (
                                <TabsContent key={tab} value={tab} className="m-0 p-6">
                                    {filteredEvents.length === 0 ? (
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
                                                <EventCard key={event.id} event={event} />
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
