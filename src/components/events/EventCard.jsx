import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Calendar, Users, MapPin, Eye, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { toast } from "sonner";
import { api } from "@/api.js";

const EventCard = ({ event, onParticipationChange }) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const statusColors = {
        active: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
        past: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
        rejected: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
    };

    const formatDate = (dateString) => {
        return format(new Date(dateString), "dd MMMM, HH:mm", { locale: ru });
    };

    const formatDateRange = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const startFormatted = format(start, "dd MMMM yyyy, HH:mm", { locale: ru });
        const endFormatted = format(end, "HH:mm", { locale: ru });
        
        // Если даты в один день, показываем компактно
        if (format(start, "dd.MM.yyyy") === format(end, "dd.MM.yyyy")) {
            return `${startFormatted} - ${endFormatted}`;
        }
        return `${startFormatted} - ${format(end, "dd MMMM yyyy, HH:mm", { locale: ru })}`;
    };

    // Обработка участия в событии
    const handleParticipate = async () => {
        if (isUpdating) return;
        
        const previousStatus = event.participation_status;

        // Оптимистичное обновление
        if (onParticipationChange) {
            onParticipationChange(event.id, 'PARTICIPATING');
        }

        setIsUpdating(true);

        try {
            await api.updateParticipation(event.id, { status: 'PARTICIPATING' });
            toast.success('Вы успешно записались на событие!');
        } catch (error) {
            // Откат изменений при ошибке
            if (onParticipationChange) {
                onParticipationChange(event.id, previousStatus);
            }
            const errorMessage = error.response?.data?.detail || error.message || 'Ошибка при записи на событие';
            toast.error(errorMessage);
        } finally {
            setIsUpdating(false);
        }
    };

    // Обработка отмены участия
    const handleCancel = async () => {
        if (isUpdating) return;
        
        const previousStatus = event.participation_status;

        // Оптимистичное обновление
        if (onParticipationChange) {
            onParticipationChange(event.id, 'NONE');
        }

        setIsUpdating(true);

        try {
            await api.updateParticipation(event.id, { status: 'NONE' });
            toast.success('Вы отменили участие в событии');
        } catch (error) {
            // Откат изменений при ошибке
            if (onParticipationChange) {
                onParticipationChange(event.id, previousStatus);
            }
            const errorMessage = error.response?.data?.detail || error.message || 'Ошибка при отмене участия';
            toast.error(errorMessage);
        } finally {
            setIsUpdating(false);
        }
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
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button variant="outline" className="flex-1" size="sm">
                                <Eye className="h-4 w-4 mr-2" />
                                Подробнее
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                            <div className="space-y-4">
                                {/* Заголовок */}
                                <h3 className="text-2xl font-semibold pr-8">
                                    {event.title}
                                </h3>

                                {/* Изображение */}
                                {event.image && (
                                    <div className="relative h-48 rounded-lg overflow-hidden">
                                        <img
                                            src={event.image}
                                            alt={event.title}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>
                                )}

                                {/* Статусы */}
                                <div className="flex gap-2 flex-wrap">
                                    <Badge className={statusColors[event.status]}>
                                        {event.status === "active" ? "Активное" :
                                            event.status === "past" ? "Прошедшее" : "Отклонено"}
                                    </Badge>
                                    {event.isParticipating && (
                                        <Badge className="bg-primary text-white">
                                            Вы участвуете
                                        </Badge>
                                    )}
                                </div>

                                {/* Полное описание */}
                                {(event.fullDescription || event.description) && (
                                    <div>
                                        <h4 className="text-sm font-medium mb-2">Описание</h4>
                                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                                            {event.fullDescription || event.description}
                                        </p>
                                    </div>
                                )}

                                {/* Информация о датах */}
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2">
                                        <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Дата и время</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDateRange(event.startDate, event.endDate)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Участники */}
                                    <div className="flex items-start gap-2">
                                        <Users className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-sm font-medium">Участники</p>
                                            <p className="text-sm text-muted-foreground">
                                                {event.participants} / {event.maxParticipants || "∞"} участников
                                            </p>
                                        </div>
                                    </div>

                                    {/* Локация */}
                                    {event.location && (
                                        <div className="flex items-start gap-2">
                                            <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium">Место проведения</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {event.location}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Кнопки действий в dialog */}
                                {event.status === "active" && (
                                    <div className="flex gap-2 pt-2 border-t">
                                        {!event.isParticipating ? (
                                            <Button 
                                                className="flex-1" 
                                                size="sm"
                                                onClick={() => {
                                                    setIsDialogOpen(false);
                                                    handleParticipate();
                                                }}
                                                disabled={isUpdating}
                                            >
                                                {isUpdating ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Загрузка...
                                                    </>
                                                ) : (
                                                    'Участвовать'
                                                )}
                                            </Button>
                                        ) : (
                                            <Button 
                                                variant="destructive" 
                                                className="flex-1" 
                                                size="sm"
                                                onClick={() => {
                                                    setIsDialogOpen(false);
                                                    handleCancel();
                                                }}
                                                disabled={isUpdating}
                                            >
                                                {isUpdating ? (
                                                    <>
                                                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                        Загрузка...
                                                    </>
                                                ) : (
                                                    'Отменить участие'
                                                )}
                                            </Button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </DialogContent>
                    </Dialog>

                    {event.status === "active" && !event.isParticipating && (
                        <Button 
                            className="flex-1" 
                            size="sm"
                            onClick={handleParticipate}
                            disabled={isUpdating}
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Загрузка...
                                </>
                            ) : (
                                'Участвовать'
                            )}
                        </Button>
                    )}

                    {event.status === "active" && event.isParticipating && (
                        <Button 
                            variant="destructive" 
                            className="flex-1" 
                            size="sm"
                            onClick={handleCancel}
                            disabled={isUpdating}
                        >
                            {isUpdating ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Загрузка...
                                </>
                            ) : (
                                'Отменить'
                            )}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default EventCard;
