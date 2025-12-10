import {useState} from "react";
import {Card, CardContent} from "@/components/ui/card";
import {Badge} from "@/components/ui/badge";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogTitle, DialogTrigger} from "@/components/ui/dialog";
import {
    HoverCard,
    HoverCardContent,
    HoverCardTrigger,
} from "@/components/ui/hover-card";
import {Calendar, Users, MapPin, Eye, Loader2, Clock, Info} from "lucide-react";
import {format} from "date-fns";
import {ru} from "date-fns/locale";
import {toast} from "sonner";
import {api} from "@/api.js";

const EventCard = ({event, onParticipationChange, onCancelRequest}) => {
    const [isUpdating, setIsUpdating] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const statusColors = {
        active: "bg-green-100 text-green-800 border-green-200 hover:bg-green-200",
        past: "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200",
        rejected: "bg-red-100 text-red-800 border-red-200 hover:bg-red-200",
    };

    const formatDate = (dateString) => {
        return format(new Date(dateString), "dd MMMM, HH:mm", {locale: ru});
    };

    const formatDateRange = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const startFormatted = format(start, "dd MMMM yyyy, HH:mm", {locale: ru});
        const endFormatted = format(end, "HH:mm", {locale: ru});

        if (format(start, "dd.MM.yyyy") === format(end, "dd.MM.yyyy")) {
            return `${startFormatted} - ${endFormatted}`;
        }
        return `${startFormatted} - ${format(end, "dd MMMM yyyy, HH:mm", {locale: ru})}`;
    };

    // Форматирование длительности события
    const formatDuration = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffMs = end - start;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (diffHours === 0) {
            return `${diffMinutes} минут`;
        } else if (diffMinutes === 0) {
            return `${diffHours} часов`;
        }
        return `${diffHours} ч ${diffMinutes} мин`;
    };

    // Обработка участия в событии
    const handleParticipate = async () => {
        if (isUpdating) return;

        if (event.participants === event.maxParticipants) {
            toast.error("Вы не можете присоединиться к этому событию. Достигнут максимальный лимит участников.");
            return;
        }

        const previousStatus = event.participation_status;

        if (onParticipationChange) {
            onParticipationChange(event.id, 'PARTICIPATING');
        }

        setIsUpdating(true);

        try {
            await api.updateParticipation(event.id, {status: 'PARTICIPATING'});
            toast.success('Вы успешно записались на событие!');
        } catch (error) {
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

        if (onCancelRequest) {
            onCancelRequest(event.id);
            return;
        }

        const previousStatus = event.participation_status;

        if (onParticipationChange) {
            onParticipationChange(event.id, 'NONE');
        }

        setIsUpdating(true);

        try {
            await api.updateParticipation(event.id, {status: 'NONE'});
            toast.success('Вы отменили участие в событии');
        } catch (error) {
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
        <HoverCard openDelay={300} closeDelay={200}>
            <HoverCardTrigger asChild>
                <Card
                    onClick={() => setIsDialogOpen(true)}
                    className="overflow-hidden hover:shadow-lg transition-shadow duration-200 group cursor-pointer h-full">
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

                    <CardContent className="p-6" onClick={(e) => e.stopPropagation()}>
                        {/* Заголовок и категория */}
                        <div className="mb-4">
                            <h3 className="text-lg font-semibold line-clamp-1 mb-1">
                                {event.title}
                            </h3>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {event.description}
                            </p>
                        </div>

                        {/* Основная информация */}
                        <div className="space-y-3 mb-6">
                            <div className="flex items-center text-sm">
                                <Calendar className="h-4 w-4 mr-2 text-muted-foreground shrink-0"/>
                                <span className="line-clamp-1">{formatDate(event.startDate)}</span>
                            </div>

                            <div className="flex items-center text-sm">
                                <Users className="h-4 w-4 mr-2 text-muted-foreground shrink-0"/>
                                <span>
                                    {event.participants} / {event.maxParticipants || "∞"} участников
                                    {event.maxParticipants && (
                                        <span className="text-muted-foreground ml-1">
                                            ({Math.round((event.participants / event.maxParticipants) * 100)}%)
                                        </span>
                                    )}
                                </span>
                            </div>

                            {event.location && (
                                <div className="flex items-center text-sm">
                                    <MapPin className="h-4 w-4 mr-2 text-muted-foreground shrink-0"/>
                                    <span className="line-clamp-1">{event.location}</span>
                                </div>
                            )}
                        </div>

                        {/* Действия */}
                        <div className="flex gap-2">
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <DialogTitle className="text-2xl font-semibold">
                                        {event.title}
                                    </DialogTitle>
                                    <div className="space-y-4">
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
                                            ) || (
                                                <Badge className="bg-gray-600 text-white">
                                                    Вы не участвуете
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
                                                <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0"/>
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">Дата и время</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {formatDateRange(event.startDate, event.endDate)}
                                                    </p>
                                                </div>
                                            </div>

                                            {/* Участники */}
                                            <div className="flex items-start gap-2">
                                                <Users className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0"/>
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
                                                    <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0"/>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-medium">Место проведения</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {event.location}
                                                        </p>
                                                    </div>
                                                </div>
                                            )}

                                            {event.paymentInfo && (
                                                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                                                    <h4 className="font-medium mb-2">Информация об оплате</h4>
                                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                                        {event.paymentInfo}
                                                    </p>
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
                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
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
                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
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
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
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
                                            <Loader2 className="h-4 w-4 mr-2 animate-spin"/>
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
            </HoverCardTrigger>

            <HoverCardContent
                className="w-80 p-0"
                align="start"
                side="right"
            >
                <div className="space-y-3 p-4">
                    {/* Заголовок и статус */}
                    <div className="flex justify-between items-start">
                        <h4 className="font-semibold text-base leading-tight">
                            {event.title}
                        </h4>
                    </div>

                    {/* Полное описание */}
                    {(event.description || event.fullDescription) && (
                        <div className="text-sm text-muted-foreground">
                            <p className="line-clamp-3">{event.description || event.fullDescription}</p>
                        </div>
                    )}

                    {/* Подробная информация */}
                    <div className="space-y-2 pt-2 border-t">
                        {/* Даты */}
                        <div className="flex items-start gap-2">
                            <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0"/>
                            <div className="flex-1">
                                <p className="text-xs text-muted-foreground">Дата и время</p>
                                <p className="text-sm">
                                    {formatDateRange(event.startDate, event.endDate)}
                                </p>
                            </div>
                        </div>

                        {/* Длительность */}
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground shrink-0"/>
                            <div>
                                <p className="text-xs text-muted-foreground">Длительность</p>
                                <p className="text-sm">
                                    {formatDuration(event.startDate, event.endDate)}
                                </p>
                            </div>
                        </div>

                        {/* Участники */}
                        <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-muted-foreground shrink-0"/>
                            <div>
                                <p className="text-xs text-muted-foreground">Участники</p>
                                <p className="text-sm">
                                    {event.participants} / {event.maxParticipants || "∞"}
                                    {event.maxParticipants && (
                                        <span className="text-muted-foreground ml-1">
                                            ({Math.round((event.participants / event.maxParticipants) * 100)}%)
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>

                        {/* Локация */}
                        {event.location && (
                            <div className="flex items-start gap-2">
                                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0"/>
                                <div className="flex-1">
                                    <p className="text-xs text-muted-foreground">Место</p>
                                    <p className="text-sm line-clamp-2">{event.location}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Статус участия */}
                    {event.isParticipating && (
                        <div className="pt-2 border-t">
                            <Badge className="bg-primary text-white w-full justify-center">
                                <Info className="h-3 w-3 mr-1"/>
                                Вы участвуете в этом событии
                            </Badge>
                        </div>
                    )}
                </div>
            </HoverCardContent>
        </HoverCard>
    );
};

export default EventCard;
