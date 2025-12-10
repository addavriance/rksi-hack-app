import {useState, useEffect} from "react";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from "@/components/ui/table";
import {Button} from "@/components/ui/button";
import {Badge} from "@/components/ui/badge";
import {
    MoreVertical, Edit, Shield, Mail, Trash2, Eye, UserCog,
    Search, Filter, Calendar, User, CheckIcon
} from "lucide-react";
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {api} from "@/api";
import {Card, CardContent} from "@/components/ui/card.tsx";
import {cn, handlePydanticError} from "@/lib/utils.ts";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {Input} from "@/components/ui/input";
import {Label} from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {UserRoleEnum, UserStatusEnum} from "@/types";
import {toast} from "sonner";
import {FormField} from "@/components/auth/FormField.jsx";
import {useAuthForm} from "@/hooks/useAuthForm.js";
import {validators} from "@/utils/validators.js";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {Calendar as CalendarComponent} from "@/components/ui/calendar";
import {format} from "date-fns";
import {ru} from "date-fns/locale";
import {useAuth} from "@/contexts/AuthContext.jsx";

const UserManagement = ({searchQuery}) => {
    const {user: myUser} = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState(null);
    const [editDialogOpen, setEditDialogOpen] = useState(false);
    const [resetPasswordDialogOpen, setResetPasswordDialogOpen] = useState(false);
    const [userToResetPassword, setUserToResetPassword] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const [filters, setFilters] = useState({
        full_name: "",
        role: "",
        status: "",
        created_from: null,
        created_to: null,
        include_deleted: false
    });
    const [showFilters, setShowFilters] = useState(false);

    const {
        formData: { password },
        errors,
        setErrors,
        updateField,
        handleSubmit
    } = useAuthForm(
        { password: "", confirmPassword: "" },
        {
            password: validators.password
        }
    );

    useEffect(() => {
        setErrors({});
        loadUsers();
    }, [searchQuery]);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const params = {
                ...filters,
                created_from: filters.created_from ? format(filters.created_from, 'yyyy-MM-dd') : null,
                created_to: filters.created_to ? format(filters.created_to, 'yyyy-MM-dd') : null,
                include_deleted: true
            };

            Object.keys(params).forEach(key => {
                if (params[key] === "" || params[key] === null) {
                    delete params[key];
                }
            });

            const data = await api.getUsers(params);
            setUsers(data);
        } catch (error) {
            toast.error("Ошибка загрузки пользователей: " + handlePydanticError(error));
            console.error("Ошибка загрузки пользователей:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({...prev, [key]: value}));
    };

    const applyFilters = () => {
        loadUsers();
    };

    const resetFilters = () => {
        setFilters({
            full_name: "",
            role: "",
            status: "",
            created_from: null,
            created_to: null,
            include_deleted: false
        });
        loadUsers();
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch = !searchQuery ||
            user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase());

        if (filters.include_deleted) {
            return user.status === UserStatusEnum.DELETED && matchesSearch;
        }

        const statusFilter = !filters.status || user.status === filters.status;
        return statusFilter && matchesSearch;
    });

    const handleEdit = (user) => {
        setSelectedUser(user);
        setEditDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        try {
            if (!selectedUser) return;

            const updateData = {
                full_name: selectedUser.full_name,
                role: selectedUser.role,
            };

            await api.updateUser(selectedUser.id, updateData);
            await loadUsers();
            setEditDialogOpen(false);
            setSelectedUser(null);
            toast.success("Данные пользователя успешно обновлены!");
        } catch (error) {
            toast.error("Ошибка обновления пользователя: " + handlePydanticError(error));
            console.error("Ошибка обновления пользователя:", error);
        }
    };

    const handleResetPassword = (user) => {
        setUserToResetPassword(user);
        setResetPasswordDialogOpen(true);
    };

    const handleConfirmResetPassword = async () => {
        try {
            if (!userToResetPassword) return;

            await api.resetUserPassword(userToResetPassword.id, {
                password: password,
                send_email: true,
            });

            setResetPasswordDialogOpen(false);
            setUserToResetPassword(null);
            setErrors({});

            toast.success("Пароль пользователя успешно сброшен! Новый пароль отправлен на email пользователя.");
        } catch (error) {
            toast.error("Ошибка сброса пароля: " + handlePydanticError(error));
            console.error("Ошибка сброса пароля:", error);
        }
    };

    const handleRecoveryClick = async (user) => {
        const userData = {
            deleted_at: null,
        }
        await api.updateUser(user.id, userData);
        await loadUsers();

        toast.success("Пользователь успешно восстановлен!");
    };

    const handleDeleteClick = (user) => {
        if (user.email === myUser.email) {
            toast.error("Вы не можете удалить себя.");
            return;
        }

        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            if (!userToDelete) return;

            await api.deleteUser(userToDelete.id);
            await loadUsers();

            setDeleteDialogOpen(false);
            setUserToDelete(null);

            toast.success("Пользователь успешно удален!");
        } catch (error) {
            toast.error("Ошибка удаления пользователя: " + handlePydanticError(error));
            console.error("Ошибка удаления пользователя:", error);
        }
    };

    const roleColors = {
        [UserRoleEnum.ADMINISTRATOR]: "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-500/15 dark:text-red-400 dark:hover:bg-red-500/25",
        [UserRoleEnum.USER]: "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-500/15 dark:text-blue-400 dark:hover:bg-blue-500/25",
    };

    const statusColors = {
        [UserStatusEnum.ACTIVE]: "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-500/20 dark:text-green-400 dark:hover:bg-green-500/30",
        [UserStatusEnum.DELETED]: "bg-red-100 text-red-800 hover:bg-red-200 dark:bg-red-500/20 dark:text-red-400 dark:hover:bg-red-500/30",
    };

    const getRoleLabel = (role) => {
        switch (role) {
            case UserRoleEnum.ADMINISTRATOR:
                return "Администратор";
            case UserRoleEnum.USER:
                return "Пользователь";
            default:
                return role;
        }
    };

    const getStatusLabel = (status) => {
        switch (status) {
            case UserStatusEnum.ACTIVE:
                return "Активен";
            case UserStatusEnum.DELETED:
                return "Удален";
            default:
                return status;
        }
    };

    if (loading) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    Загрузка пользователей...
                </CardContent>
            </Card>
        );
    }

    return (
        <>
            {/* Панель фильтрации */}
            <Card className="mb-4">
                <CardContent className="p-4">
                    <div className="flex flex-col space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold">Фильтры пользователей</h3>
                            <div className="flex items-center space-x-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <Filter className="h-4 w-4 mr-2" />
                                    {showFilters ? "Скрыть фильтры" : "Показать фильтры"}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={resetFilters}
                                >
                                    Сбросить
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={applyFilters}
                                >
                                    Применить
                                </Button>
                            </div>
                        </div>

                        {showFilters && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                {/* Фильтр по ФИО */}
                                <div className="space-y-2">
                                    <Label htmlFor="filter-full_name">ФИО</Label>
                                    <Input
                                        id="filter-full_name"
                                        placeholder="Введите ФИО"
                                        value={filters.full_name}
                                        onChange={(e) => handleFilterChange('full_name', e.target.value)}
                                    />
                                </div>

                                {/* Фильтр по роли */}
                                <div className="space-y-2">
                                    <Label htmlFor="filter-role">Роль</Label>
                                    <Select
                                        value={filters.role}
                                        onValueChange={(value) => handleFilterChange('role', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Все роли" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={null}>Все роли</SelectItem>
                                            <SelectItem value={UserRoleEnum.USER}>Пользователь</SelectItem>
                                            <SelectItem value={UserRoleEnum.ADMINISTRATOR}>Администратор</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Фильтр по статусу */}
                                <div className="space-y-2">
                                    <Label htmlFor="filter-status">Статус</Label>
                                    <Select
                                        value={filters.status}
                                        onValueChange={(value) => handleFilterChange('status', value)}
                                    >
                                        <SelectTrigger>
                                            <SelectValue placeholder="Все статусы" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value={null}>Все статусы</SelectItem>
                                            <SelectItem value={UserStatusEnum.ACTIVE}>Активен</SelectItem>
                                            <SelectItem value={UserStatusEnum.DELETED}>Удален</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Фильтр по дате регистрации */}
                                <div className="space-y-2">
                                    <Label>Дата регистрации</Label>
                                    <div className="grid grid-cols-2 gap-2">
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="justify-start text-left font-normal"
                                                >
                                                    <Calendar className="mr-2 h-4 w-4" />
                                                    {filters.created_from ? format(filters.created_from, 'dd.MM.yyyy') : "От"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <CalendarComponent
                                                    mode="single"
                                                    selected={filters.created_from}
                                                    onSelect={(date) => handleFilterChange('created_from', date)}
                                                    initialFocus
                                                    locale={ru}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    className="justify-start text-left font-normal"
                                                >
                                                    <Calendar className="mr-2 h-4 w-4" />
                                                    {filters.created_to ? format(filters.created_to, 'dd.MM.yyyy') : "До"}
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                                <CalendarComponent
                                                    mode="single"
                                                    selected={filters.created_to}
                                                    onSelect={(date) => handleFilterChange('created_to', date)}
                                                    initialFocus
                                                    locale={ru}
                                                />
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>

                                {/* Фильтр показа удаленных */}
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="include_deleted"
                                        checked={filters.include_deleted}
                                        onChange={(e) => handleFilterChange('include_deleted', e.target.checked)}
                                        className="h-4 w-4 rounded border-gray-300"
                                    />
                                    <Label htmlFor="include_deleted" className="cursor-pointer">
                                        Показать только удаленных
                                    </Label>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Таблица пользователей */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ФИО</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Роль</TableHead>
                                <TableHead>Статус</TableHead>
                                <TableHead>Дата регистрации</TableHead>
                                <TableHead className="text-right">Действия</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                                        Пользователи не найдены
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium">{user.full_name}</TableCell>
                                        <TableCell>{user.email}</TableCell>
                                        <TableCell>
                                            <Badge className={cn(roleColors[user.role], "select-none")}>
                                                {getRoleLabel(user.role)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={cn(statusColors[user.status], "select-none")}>
                                                {getStatusLabel(user.status)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {new Date(user.created_at).toLocaleDateString('ru-RU')}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4"/>
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => handleEdit(user)}
                                                        disabled={user.status === UserStatusEnum.DELETED}
                                                    >
                                                        <Edit className="mr-2 h-4 w-4"/>
                                                        Редактировать
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem
                                                        onClick={() => handleResetPassword(user)}
                                                        disabled={user.status === UserStatusEnum.DELETED}
                                                    >
                                                        <Shield className="mr-2 h-4 w-4"/>
                                                        Сбросить пароль
                                                    </DropdownMenuItem>
                                                    {user.status === UserStatusEnum.DELETED ? (
                                                        <DropdownMenuItem
                                                            onClick={() => handleRecoveryClick(user)}
                                                        >
                                                            <CheckIcon className="mr-2 h-4 w-4"/>
                                                            Восстановить
                                                        </DropdownMenuItem>
                                                    ) : (
                                                        <DropdownMenuItem
                                                            className="text-red-600"
                                                            onClick={() => handleDeleteClick(user)}
                                                        >
                                                            <Trash2 className="mr-2 h-4 w-4"/>
                                                            Удалить
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Диалог редактирования пользователя */}
            <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Редактирование пользователя</DialogTitle>
                        <DialogDescription>
                            Измените данные пользователя.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedUser && (
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="full_name">ФИО</Label>
                                <Input
                                    id="full_name"
                                    value={selectedUser.full_name || ''}
                                    onChange={(e) => setSelectedUser({
                                        ...selectedUser,
                                        full_name: e.target.value
                                    })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={selectedUser.email || ''}
                                    disabled
                                    className="bg-gray-100 dark:bg-gray-800"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Адрес почты не может быть изменен
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="role">Роль</Label>
                                <Select
                                    value={selectedUser.role}
                                    onValueChange={(value) => setSelectedUser({
                                        ...selectedUser,
                                        role: value
                                    })}
                                >
                                    <SelectTrigger>
                                        <SelectValue/>
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={UserRoleEnum.USER}>
                                            Пользователь
                                        </SelectItem>
                                        <SelectItem value={UserRoleEnum.ADMINISTRATOR}>
                                            Администратор
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="pt-2">
                                <p className="text-sm text-muted-foreground">
                                    Дата регистрации: {new Date(selectedUser.created_at).toLocaleDateString('ru-RU')}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                    Статус: {getStatusLabel(selectedUser.status)}
                                </p>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
                            Отмена
                        </Button>
                        <Button onClick={handleSaveEdit}>
                            Сохранить
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Диалог сброса пароля */}
            <Dialog open={resetPasswordDialogOpen} onOpenChange={setResetPasswordDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Сброс пароля</DialogTitle>
                        <DialogDescription>
                            Введите новый пароль для пользователя. Пароль будет автоматически отправлен на email пользователя.
                        </DialogDescription>
                    </DialogHeader>

                    {userToResetPassword && (
                        <>
                            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-lg mb-4">
                                <p className="font-medium">{userToResetPassword.full_name}</p>
                                <p className="text-sm text-muted-foreground">{userToResetPassword.email}</p>
                            </div>
                            <FormField
                                id="password"
                                label="Новый пароль"
                                type="password"
                                placeholder="Введите новый пароль"
                                value={password}
                                onChange={(value) => updateField("password", value)}
                                error={errors.password}
                            />
                            <div className="text-sm text-muted-foreground mt-2">
                                Пароль должен содержать минимум 8 символов, включая заглавные буквы, цифры и специальные символы
                            </div>
                        </>
                    )}

                    <DialogFooter>
                        <Button variant="outline" onClick={() => {
                            setResetPasswordDialogOpen(false);
                            setErrors({});
                        }}>
                            Отмена
                        </Button>
                        <Button onClick={() => handleSubmit(null, handleConfirmResetPassword)}>
                            Сбросить пароль и отправить на email
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Диалог подтверждения удаления */}
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-red-600">Подтверждение удаления</DialogTitle>
                        <DialogDescription>
                            Вы уверены, что хотите удалить этого пользователя?
                        </DialogDescription>
                    </DialogHeader>

                    <DialogFooter className="sm:flex sm:flex-row-reverse">
                        <Button
                            variant="destructive"
                            onClick={handleConfirmDelete}
                            className="sm:ml-2"
                        >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Удалить пользователя
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => setDeleteDialogOpen(false)}
                        >
                            Отмена
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
};

export default UserManagement;
