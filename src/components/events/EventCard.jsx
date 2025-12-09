// components/events/EventCard.jsx
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, MapPin, Eye } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";

const EventCard = ({ event }) => {
    const statusColors = {
        active: "bg-green-100 text-green-800 border-green-200",
        past: "bg-gray-100 text-gray-800 border-gray-200",
        rejected: "bg-red-100 text-red-800 border-red-200",
    };

    const formatDate = (dateString) => {
        return format(new Date(dateString), "dd MMMM, HH:mm", { locale: ru });
    };

    return (
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-200 group cursor-pointer">
            {/* Изображение */}
            <div className="relative h-48 overflow-hidden">
                <img
                    src={event.image}
                    alt={event.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-3 right-3">
                    <Badge className={statusColors[event.status]}>
                        {event.status === "active" ? "Активное" :
                            event.status === "past" ? "Прошедшее" : "Отклонено"}
                    </Badge>
                </div>
                {event.isParticipating && (
                    <div className="absolute top-3 left-3">
                        <Badge className="bg-primary text-white">Вы участвуете</Badge>
                    </div>
                )}
            </div>

            <CardContent className="p-6">
                {/* Заголовок и категория */}
                <div className="mb-4">
                    <h3 className="text-lg font-semibold line-clamp-1 mb-1">
                        {event.title}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                        {event.description}
                    </p>
                </div>

                {/* Информация */}
                <div className="space-y-3 mb-6">
                    <div className="flex items-center text-sm">
                        <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{formatDate(event.startDate)}</span>
                    </div>

                    <div className="flex items-center text-sm">
                        <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{event.participants} / {event.maxParticipants || "∞"} участников</span>
                    </div>

                    {event.location && (
                        <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="line-clamp-1">{event.location}</span>
                        </div>
                    )}
                </div>

                {/* Действия */}
                <div className="flex gap-2">
                    <Button variant="outline" className="flex-1" size="sm">
                        <Eye className="h-4 w-4 mr-2" />
                        Подробнее
                    </Button>

                    {event.status === "active" && !event.isParticipating && (
                        <Button className="flex-1" size="sm">
                            Участвовать
                        </Button>
                    )}

                    {event.status === "active" && event.isParticipating && (
                        <Button variant="destructive-secondary" className="flex-1" size="sm">
                            Отменить
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default EventCard;
