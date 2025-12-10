import { useState, useEffect } from "react";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription
} from "@/components/ui/dialog";
import {
    MoreVertical, Edit, Eye, Users, Calendar, Clock, CheckCircle, XCircle,
    Filter, MapPin, Plus, Image as ImageIcon, Upload, Trash2
} from "lucide-react";
import { format, parseISO, isPast } from "date-fns";
import { ru } from "date-fns/locale";
import { api } from "@/api";
import {EventStatusEnum, UserStatusEnum} from "@/types";
import { toast } from "sonner";
import { handlePydanticError } from "@/lib/utils.ts";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const EventManagement = ({ searchQuery }) => {
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [statusFilter, setStatusFilter] = useState("all");
    const [showDetailsDialog, setShowDetailsDialog] = useState(false);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [selectedParticipants, setSelectedParticipants] = useState([]);

    useEffect(() => {
        loadEvents();
        loadUsers();
    }, [statusFilter, searchQuery]);

    const loadEvents = async () => {
        try {
            setLoading(true);
            const params = {};
            if (statusFilter !== "all") {
                params.status = statusFilter.toUpperCase();
            }
            const data = await api.getEvents(params);

            const updatedEvents = data.map(event => {
                const endsAt = parseISO(event.ends_at);
                if (event.status === EventStatusEnum.ACTIVE && isPast(endsAt)) {
                    return { ...event, status: EventStatusEnum.PAST };
                }
                return event;
            });

            setEvents(updatedEvents);
        } catch (error) {
            toast.error("Ошибка загрузки событий: " + handlePydanticError(error));
            console.error("Ошибка загрузки событий:", error);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const data = await api.getUsers({ include_deleted: false });
            setUsers(data.filter(user => user.status === UserStatusEnum.ACTIVE));
        } catch (error) {
            console.error("Ошибка загрузки пользователей:", error);
        }
    };

    const filteredEvents = events.filter((event) => {
        if (searchQuery && !event.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }
        return true;
    });

    const formatDate = (dateString) => {
        try {
            return format(new Date(dateString), "dd MMMM yyyy, HH:mm", { locale: ru });
        } catch {
            return dateString;
        }
    };

    const formatDateTimeLocal = (dateString) => {
        if (!dateString) return '';
        try {
            const date = new Date(dateString);
            return date.toISOString().slice(0, 16);
        } catch {
            return '';
        }
    };

    const handleCreateNew = () => {
        setSelectedEvent({
            name: "",
            short_description: "",
            description: "",
            starts_at: "",
            ends_at: "",
            location: "",
            max_participants_count: null,
            payment_info: "",
            image_url: "",
            participants_ids: []
        });
        setSelectedParticipants([]);
        setImageFile(null);
        setImagePreview(null);
        setEditDialogOpen(true);
    };

    const handleEdit = (event) => {
        setSelectedEvent(event);
        setSelectedParticipants(event.participants?.map(p => p.user_id) || []);
        setImagePreview(event.image_url);
        setImageFile(null);
        setEditDialogOpen(true);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImageFile(null);
        setImagePreview(null);
        if (selectedEvent) {
            setSelectedEvent({
                ...selectedEvent,
                image_url: ""
            });
        }
    };

    const validateEventData = () => {
        if (!selectedEvent.name.trim()) {
            toast.error("Название события обязательно");
            return false;
        }

        if (!selectedEvent.description.trim()) {
            toast.error("Полное описание обязательно");
            return false;
        }

        if (!selectedEvent.starts_at) {
            toast.error("Дата начала обязательна");
            return false;
        }

        if (!selectedEvent.ends_at) {
            toast.error("Дата окончания обязательна");
            return false;
        }

        const startsAt = new Date(selectedEvent.starts_at);
        const endsAt = new Date(selectedEvent.ends_at);

        if (startsAt >= endsAt) {
            toast.error("Дата окончания должна быть позже даты начала");
            return false;
        }

        if (!imagePreview && !selectedEvent.image_url) {
            toast.error("Изображение события обязательно");
            return false;
        }

        return true;
    };

    const handleSave = async () => {
        if (!validateEventData()) {
            return;
        }

        try {
            let imageUrl = selectedEvent.image_url;

            if (imageFile) {
                const uploadResponse = await api.uploadFile(imageFile);
                imageUrl = uploadResponse.url;
            }

            const eventData = {
                name: selectedEvent.name,
                description: selectedEvent.description,
                short_description: selectedEvent.short_description || null,
                starts_at: new Date(selectedEvent.starts_at).toISOString(),
                ends_at: new Date(selectedEvent.ends_at).toISOString(),
                location: selectedEvent.location || null,
                max_participants_count: selectedEvent.max_participants_count ?
                    parseInt(selectedEvent.max_participants_count) : null,
                payment_info: selectedEvent.payment_info || null,
                image_url: imageUrl,
                participants_ids: selectedParticipants
            };

            if (selectedEvent.id) {
                await api.updateEvent(selectedEvent.id, eventData);
                toast.success("Событие успешно обновлено!");
            } else {
                await api.createEvent(eventData);
                toast.success("Событие успешно создано! Уведомления отправлены участникам.");
            }

            await loadEvents();
            setEditDialogOpen(false);
            setSelectedEvent(null);
            setSelectedParticipants([]);
            setImageFile(null);
            setImagePreview(null);
        } catch (error) {
            toast.error("Ошибка сохранения события: " + handlePydanticError(error));
            console.error("Ошибка сохранения события:", error);
        }
    };

    const showDetails = (event) => {
        setSelectedEvent(event);
        setShowDetailsDialog(true);
    };

    const changeStatus = async (eventId, newStatus) => {
        try {
            const updateData = {};
            if (newStatus === EventStatusEnum.REJECTED) {
                updateData.rejected_at = new Date().toISOString();
                toast.success("Событие отклонено");
            } else if (newStatus === EventStatusEnum.ACTIVE) {
                updateData.rejected_at = null;
                toast.success("Событие активировано");
            }

            await api.updateEvent(eventId, updateData);
            await loadEvents();
        } catch (error) {
            toast.error("Ошибка изменения статуса: " + handlePydanticError(error));
            console.error("Ошибка изменения статуса:", error);
        }
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case EventStatusEnum.ACTIVE:
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200
                          dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50
                          select-none">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Активное
                    </Badge>
                );
            case EventStatusEnum.PAST:
                return (
                    <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200
                          dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700
                          select-none">
                        <Clock className="h-3 w-3 mr-1" />
                        Прошедшее
                    </Badge>
                );
            case EventStatusEnum.REJECTED:
                return (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-200
                          dark:bg-red-900/30 dark:text-red-300 dark:hover:bg-red-900/50
                          select-none">
                        <XCircle className="h-3 w-3 mr-1" />
                        Отклонено
                    </Badge>
                );
            default:
                return null;
        }
    };

    const getParticipantsCount = (event) => {
        return event.participants?.length || 0;
    };

    const statusOptions = [
        { value: "all", label: "Все статусы" },
        { value: EventStatusEnum.ACTIVE.toLowerCase(), label: "Активные" },
        { value: EventStatusEnum.PAST.toLowerCase(), label: "Прошедшие" },
        { value: EventStatusEnum.REJECTED.toLowerCase(), label: "Отклоненные" },
    ];

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    Загрузка событий...
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Панель управления */}
            <Card>
                <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="outline" className="flex items-center gap-2">
                                        <Filter className="h-4 w-4" />
                                        Статус: {statusOptions.find((opt) => opt.value === statusFilter)?.label || "Все"}
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent>
                                    {statusOptions.map((option) => (
                                        <DropdownMenuItem
                                            key={option.value}
                                            onClick={() => setStatusFilter(option.value)}
                                            className="flex items-center gap-2"
                                        >
                                            {option.label}
                                        </DropdownMenuItem>
                                    ))}
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>

                        <div className="flex gap-3">
                            <Button
                                className="bg-primary hover:bg-primary/90"
                                onClick={handleCreateNew}
                            >
                                <Plus className="mr-2 h-4 w-4" />
                                Новое событие
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Таблица событий */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Событие</TableHead>
                                <TableHead>Даты</TableHead>
                                <TableHead>Участники</TableHead>
                                <TableHead>Статус</TableHead>
                                <TableHead>Место</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredEvents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8">
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
                                    <TableRow key={event.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                {event.image_url && (
                                                    <img
                                                        src={event.image_url}
                                                        alt={event.name}
                                                        className="w-12 h-12 rounded-md object-cover"
                                                    />
                                                )}
                                                <div>
                                                    <p className="font-medium">{event.name}</p>
                                                    <p className="text-sm text-muted-foreground">
                                                        {event.short_description || event.description.substring(0, 50)}...
                                                    </p>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="space-y-1">
                                                <p className="text-sm">{formatDate(event.starts_at)}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatDate(event.ends_at)}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Users className="h-4 w-4" />
                                                <span>{getParticipantsCount(event)}</span>
                                                {event.max_participants_count && (
                                                    <span className="text-xs text-muted-foreground">
                                                        /{event.max_participants_count}
                                                    </span>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell>{getStatusBadge(event.status)}</TableCell>
                                        <TableCell>
                                            <p className="text-sm">{event.location || "Не указано"}</p>
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
                                                        <DropdownMenuItem onClick={() => showDetails(event)}>
                                                            <Eye className="mr-2 h-4 w-4" />
                                                            Просмотр
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem onClick={() => handleEdit(event)}>
                                                            <Edit className="mr-2 h-4 w-4" />
                                                            Редактировать
                                                        </DropdownMenuItem>
                                                        {event.status !== EventStatusEnum.PAST && (
                                                            <DropdownMenuItem
                                                                onClick={() =>
                                                                    changeStatus(
                                                                        event.id,
                                                                        event.status === EventStatusEnum.ACTIVE
                                                                            ? EventStatusEnum.REJECTED
                                                                            : EventStatusEnum.ACTIVE
                                                                    )
                                                                }
                                                            >
                                                                {event.status === EventStatusEnum.ACTIVE ? (
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
                                                        )}
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

            {/* Диалог деталей события */}
            <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Детали события</DialogTitle>
                    </DialogHeader>
                    {selectedEvent && (
                        <div className="space-y-6">
                            {selectedEvent.image_url && (
                                <div className="relative">
                                    <img
                                        src={selectedEvent.image_url}
                                        alt={selectedEvent.name}
                                        className="w-full h-48 object-cover rounded-lg"
                                    />
                                </div>
                            )}

                            <div>
                                <h3 className="text-lg font-semibold mb-2">{selectedEvent.name}</h3>
                                {selectedEvent.short_description && (
                                    <p className="text-muted-foreground mb-3">{selectedEvent.short_description}</p>
                                )}
                                <p className="text-gray-700 dark:text-gray-300">{selectedEvent.description}</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="flex items-center gap-3">
                                    <Calendar className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Дата начала</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(selectedEvent.starts_at)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Clock className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Дата окончания</p>
                                        <p className="text-sm text-muted-foreground">
                                            {formatDate(selectedEvent.ends_at)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Участники</p>
                                        <p className="text-sm text-muted-foreground">
                                            {getParticipantsCount(selectedEvent)} человек
                                            {selectedEvent.max_participants_count &&
                                                ` из ${selectedEvent.max_participants_count}`}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-muted-foreground" />
                                    <div>
                                        <p className="font-medium">Место проведения</p>
                                        <p className="text-sm text-muted-foreground">
                                            {selectedEvent.location || "Не указано"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {selectedEvent.payment_info && (
                                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                                    <h4 className="font-medium mb-2">Информация об оплате</h4>
                                    <p className="text-sm text-gray-700 dark:text-gray-300">
                                        {selectedEvent.payment_info}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                            Закрыть
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Диалог редактирования/создания события */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {selectedEvent?.id ? "Редактирование события" : "Создание нового события"}
                        </DialogTitle>
                        <DialogDescription>
                            {selectedEvent?.id
                                ? "Измените данные события"
                                : "Заполните все обязательные поля для создания нового события"}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Загрузка изображения */}
                        <div className="space-y-2">
                            <Label className="flex items-center gap-2">
                                <ImageIcon className="h-4 w-4" />
                                Изображение события *
                                {selectedEvent?.id && (
                                    <span className="text-xs text-muted-foreground">
                                        (оставьте текущее, если не хотите менять)
                                    </span>
                                )}
                            </Label>

                            <div className="flex flex-col items-center justify-center border-2 border-dashed
                                border-gray-300 dark:border-gray-700 rounded-lg p-6">
                                {imagePreview ? (
                                    <div className="relative">
                                        <img
                                            src={imagePreview}
                                            alt="Превью"
                                            className="w-full max-h-48 object-cover rounded-lg"
                                        />
                                        <Button
                                            type="button"
                                            variant="destructive"
                                            size="sm"
                                            className="absolute top-2 right-2"
                                            onClick={removeImage}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="text-center">
                                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                                            Перетащите изображение или нажмите для выбора
                                        </p>
                                        <Input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                            id="image-upload"
                                        />
                                        <Label
                                            htmlFor="image-upload"
                                            className="cursor-pointer bg-primary text-primary-foreground
                                                hover:bg-primary/90 px-4 py-2 rounded-md text-sm"
                                        >
                                            Выбрать изображение
                                        </Label>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Название *</Label>
                            <Input
                                value={selectedEvent?.name || ''}
                                onChange={(e) => setSelectedEvent({
                                    ...selectedEvent,
                                    name: e.target.value
                                })}
                                placeholder="Введите название события"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Краткое описание</Label>
                            <Input
                                value={selectedEvent?.short_description || ''}
                                onChange={(e) => setSelectedEvent({
                                    ...selectedEvent,
                                    short_description: e.target.value
                                })}
                                placeholder="Краткое описание (до 200 символов)"
                                maxLength={200}
                            />
                            <p className="text-xs text-muted-foreground">
                                {selectedEvent?.short_description?.length || 0}/200 символов
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Полное описание *</Label>
                            <Textarea
                                value={selectedEvent?.description || ''}
                                onChange={(e) => setSelectedEvent({
                                    ...selectedEvent,
                                    description: e.target.value
                                })}
                                placeholder="Полное описание события"
                                className="min-h-[100px]"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Дата начала *</Label>
                                <Input
                                    type="datetime-local"
                                    value={selectedEvent?.starts_at ?
                                        formatDateTimeLocal(selectedEvent.starts_at) : ''}
                                    onChange={(e) => setSelectedEvent({
                                        ...selectedEvent,
                                        starts_at: e.target.value
                                    })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Дата окончания *</Label>
                                <Input
                                    type="datetime-local"
                                    value={selectedEvent?.ends_at ?
                                        formatDateTimeLocal(selectedEvent.ends_at) : ''}
                                    onChange={(e) => setSelectedEvent({
                                        ...selectedEvent,
                                        ends_at: e.target.value
                                    })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Место проведения</Label>
                            <Input
                                value={selectedEvent?.location || ''}
                                onChange={(e) => setSelectedEvent({
                                    ...selectedEvent,
                                    location: e.target.value
                                })}
                                placeholder="Адрес или место проведения"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Максимальное количество участников</Label>
                            <Input
                                type="number"
                                min="1"
                                value={selectedEvent?.max_participants_count || ''}
                                onChange={(e) => setSelectedEvent({
                                    ...selectedEvent,
                                    max_participants_count: e.target.value ? parseInt(e.target.value) : null
                                })}
                                placeholder="Оставьте пустым для неограниченного количества"
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Информация об оплате</Label>
                            <Textarea
                                value={selectedEvent?.payment_info || ''}
                                onChange={(e) => setSelectedEvent({
                                    ...selectedEvent,
                                    payment_info: e.target.value
                                })}
                                placeholder="Опишите процесс оплаты..."
                                className="min-h-[80px]"
                            />
                            <p className="text-xs text-muted-foreground">
                                Например: "Собираем на подарок, можно перевести по номеру..."
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label>Участники события</Label>
                            <Select
                                value=""
                                onValueChange={(userId) => {
                                    if (!selectedParticipants.includes(parseInt(userId))) {
                                        setSelectedParticipants([...selectedParticipants, parseInt(userId)]);
                                    }
                                }}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Выберите участников" />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map(user => (
                                        <SelectItem key={user.id} value={user.id.toString()}>
                                            {user.full_name} ({user.email})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            {selectedParticipants.length > 0 && (
                                <div className="mt-2 space-y-2">
                                    <p className="text-sm font-medium">Выбранные участники:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {selectedParticipants.map(userId => {
                                            const user = users.find(u => u.id === userId);
                                            return user ? (
                                                <Badge key={userId} variant="secondary" className="px-3 py-1">
                                                    {user.full_name}
                                                    <button
                                                        type="button"
                                                        onClick={() => setSelectedParticipants(
                                                            selectedParticipants.filter(id => id !== userId)
                                                        )}
                                                        className="ml-2 text-muted-foreground hover:text-foreground"
                                                    >
                                                        ×
                                                    </button>
                                                </Badge>
                                            ) : null;
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t">
                        <Button variant="outline" onClick={() => {
                            setEditDialogOpen(false);
                            setSelectedEvent(null);
                            setSelectedParticipants([]);
                            setImageFile(null);
                            setImagePreview(null);
                        }}>
                            Отмена
                        </Button>
                        <Button onClick={handleSave}>
                            {selectedEvent?.id ? "Сохранить изменения" : "Создать событие"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default EventManagement;
