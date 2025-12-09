import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Users,
    Calendar,
    Clock,
    CheckCircle,
    XCircle,
    Filter,
    Search,
    Download,
    Plus,
    Image as ImageIcon,
    MapPin,
} from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { mockEvents } from "@/data/mockEvents";

const EventManagement = ({ searchQuery }) => {
    const [events, setEvents] = useState(mockEvents);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [eventToDelete, setEventToDelete] = useState(null);
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);

    const filteredEvents = events.filter((event) => {
        if (
            searchQuery &&
            !event.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !event.organizer.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
            return false;
        }

        if (statusFilter !== "all" && event.status !== statusFilter) {
            return false;
        }

        return true;
    });

    const formatDate = (dateString) => {
        return format(new Date(dateString), "dd MMMM yyyy, HH:mm", { locale: ru });
    };

    const handleEdit = (event) => {
        setSelectedEvent(event);
        // заглушка
        console.log("Редактирование события:", event);
    };

    const handleDelete = (event) => {
        setEventToDelete(event);
        setShowDeleteDialog(true);
    };

    const confirmDelete = () => {
        setEvents(events.filter((e) => e.id !== eventToDelete.id));
        setShowDeleteDialog(false);
        setEventToDelete(null);
    };

    const showDetails = (event) => {
        setSelectedEvent(event);
        setShowDetailsDialog(true);
    };

    const changeStatus = (eventId, newStatus) => {
        setEvents(
            events.map((event) =>
                event.id === eventId ? { ...event, status: newStatus } : event
            )
        );
    };

    const statusOptions = [
        { value: "all", label: "Все статусы" },
        { value: "active", label: "Активные", color: "bg-green-100 text-green-800" },
        { value: "past", label: "Прошедшие", color: "bg-gray-100 text-gray-800" },
        { value: "rejected", label: "Отклоненные", color: "bg-red-100 text-red-800" },
    ];

    const getStatusBadge = (status) => {
        switch (status) {
            case "active":
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 select-none">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Активное
                    </Badge>
                );
            case "past":
                return (
                    <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 select-none">
                        <Clock className="h-3 w-3 mr-1" />
                        Прошедшее
                    </Badge>
                );
            case "rejected":
                return (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-200 select-none">
                        <XCircle className="h-3 w-3 mr-1" />
                        Отклонено
                    </Badge>
                );
            default:
                return null;
        }
    };

    const getParticipantsPercentage = (event) => {
        if (!event.maxParticipants) return "∞";
        return Math.round((event.participants / event.maxParticipants) * 100);
    };

    return (
        <div className="space-y-6">
            {/* Панель управления */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Поиск событий..."
                                    className="pl-10 w-full md:w-64"
                                    value={searchQuery}
                                    onChange={(e) => console.log("Search:", e.target.value)}
                                /> {/*заглушка, когда будет апи будем отправлять инфу через debounce()*/}
                            </div>

                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        Статус:{" "}
                                        {statusOptions.find((opt) => opt.value === statusFilter)
                                            ?.label || "Все"}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {statusOptions.map((option) => (
                                        <DropdownMenuItem
                                            key={option.value}
                                            onClick={() => setStatusFilter(option.value)}
                                            className="flex items-center gap-2"
                                        >
                                            {option.value !== "all" && (
                                                <div
                                                    className={`h-2 w-2 rounded-full ${option.color.split(" ")[0]
                                                    }`}
                                                />
                                            )}
                                            {option.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="flex gap-3">
                            <Button variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Экспорт
                            </Button>
                            <Button className="bg-primary hover:bg-primary/90">
                                <Plus className="mr-2 h-4 w-4" />
                                Новое событие
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Статистика */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Всего событий</p>
                                <p className="text-2xl font-bold">{events.length}</p>
                            </div>
                            <Calendar className="h-8 w-8 text-blue-500/30" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Активные</p>
                                <p className="text-2xl font-bold">
                                    {events.filter((e) => e.status === "active").length}
                                </p>
                            </div>
                            <CheckCircle className="h-8 w-8 text-green-500/30" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Всего участников</p>
                                <p className="text-2xl font-bold">
                                    {events.reduce((sum, e) => sum + e.participants, 0)}
                                </p>
                            </div>
                            <Users className="h-8 w-8 text-purple-500/30" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-muted-foreground">Средняя заполняемость</p>
                                <p className="text-2xl font-bold">
                                    {Math.round(
                                        events.reduce((sum, e) => sum + getParticipantsPercentage(e), 0) /
                                        events.length
                                    )}
                                    %
                                </p>
                            </div>
                            <Clock className="h-8 w-8 text-orange-500/30" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Таблица событий */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-12"></TableHead>
                                <TableHead>Событие</TableHead>
                                <TableHead>Даты</TableHead>
                                <TableHead>Участники</TableHead>
                                <TableHead>Статус</TableHead>
                                <TableHead>Организатор</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEvents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} className="text-center py-8">
                                        <div className="flex flex-col items-center">
                                            <Calendar className="h-12 w-12 text-muted-foreground/50 mb-3" />
                                            <p className="text-muted-foreground">
                                                События не найдены
                                            </p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredEvents.map((event) => (
                                    <TableRow key={event.id} className="hover:bg-gray-50/50">
                                        <TableCell>
                                            <div className="h-10 w-10 rounded overflow-hidden">
                                                <img
                                                    src={event.image}
                                                    alt={event.title}
                                                    className="h-full w-full object-cover"
                                                />
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium line-clamp-1">
                                                    {event.title}
                                                </p>
                                                <p className="text-sm text-muted-foreground line-clamp-1">
                                                    {event.category} • {event.location}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="text-sm">
                                                    {formatDate(event.startDate)}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(event.endDate)}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <div className="w-20">
                                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-green-500"
                                                            style={{
                                                                width: `${getParticipantsPercentage(event)}%`,
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                                <span className="text-sm whitespace-nowrap">
                          {event.participants}/
                                                    {event.maxParticipants || "∞"}
                        </span>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(event.status)}</TableCell>
                                        <TableCell>
                                            <p className="text-sm">{event.organizer}</p>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => showDetails(event)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEdit(event)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="sm">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end">
                                                        <DropdownMenuItem
                                                            onClick={() => showDetails(event)}
                                                        >
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Просмотр
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() => handleEdit(event)}
                                                        >
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Редактировать
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            onClick={() =>
                                                                changeStatus(
                                                                    event.id,
                                                                    event.status === "active" ? "rejected" : "active"
                                                                )
                                                            }
                                                        >
                                                            {event.status === "active" ? (
                                                                <>
                                                                    <XCircle className="mr-2 h-4 w-4" />
                                                                    Отклонить
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                                    Активировать
                                                                </>
                                                            )}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => handleDelete(event)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4" />
                                                            Удалить
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Диалог удаления */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Удаление события</DialogTitle>
                        <DialogDescription>
                            Вы уверены, что хотите удалить событие "
                            {eventToDelete?.title}"? Это действие нельзя отменить.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                            <div className="h-12 w-12 rounded overflow-hidden">
                                <img
                                    src={eventToDelete?.image}
                                    alt={eventToDelete?.title}
                                    className="h-full w-full object-cover"
                                />
                            </div>
                            <div>
                                <p className="font-medium">{eventToDelete?.title}</p>
                                <p className="text-sm text-muted-foreground">
                                    {eventToDelete?.participants} участников
                                </p>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDeleteDialog(false)}
                        >
                            Отмена
                        </Button>
                        <Button variant="destructive" onClick={confirmDelete}>
                            Удалить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Диалог деталей события */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Детали события</DialogTitle>
                    </DialogHeader>
                    {selectedEvent && (
                        <div className="space-y-6">
                            {/* Изображение */}
                            <div className="h-48 rounded-lg overflow-hidden">
                                <img
                                    src={selectedEvent.image}
                                    alt={selectedEvent.title}
                                    className="h-full w-full object-cover"
                                />
                            </div>

                            {/* Основная информация */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-2">
                                        {selectedEvent.title}
                                    </h3>
                                    <p className="text-muted-foreground">
                                        {selectedEvent.fullDescription}
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <Calendar className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">Дата начала</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(selectedEvent.startDate)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Clock className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">Дата окончания</p>
                                            <p className="text-sm text-muted-foreground">
                                                {formatDate(selectedEvent.endDate)}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Users className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">Участники</p>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedEvent.participants}/
                                                {selectedEvent.maxParticipants || "∞"} человек
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <MapPin className="h-5 w-5 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">Место проведения</p>
                                            <p className="text-sm text-muted-foreground">
                                                {selectedEvent.location}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Дополнительная информация */}
                            {selectedEvent.paymentInfo && (
                                <div className="bg-blue-50 p-4 rounded-lg">
                                    <h4 className="font-medium mb-2">Информация об оплате</h4>
                                    <p className="text-sm text-muted-foreground">
                                        {selectedEvent.paymentInfo}
                                    </p>
                                </div>
                            )}

                            {/* Статистика */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold">{selectedEvent.rating}</p>
                                    <p className="text-xs text-muted-foreground">Рейтинг</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold">
                                        {selectedEvent.reviews}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Отзывов</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold">
                                        {getParticipantsPercentage(selectedEvent)}%
                                    </p>
                                    <p className="text-xs text-muted-foreground">Заполняемость</p>
                                </div>
                                <div className="text-center p-3 bg-gray-50 rounded-lg">
                                    <p className="text-2xl font-bold">
                                        {selectedEvent.eventsParticipated || 0}
                                    </p>
                                    <p className="text-xs text-muted-foreground">Участий</p>
                                </div>
                            </div>
                        </div>
                    )}
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowDetailsDialog(false)}
                        >
                            Закрыть
                        </Button>
                        <Button onClick={() => handleEdit(selectedEvent)}>
                            Редактировать
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EventManagement;
