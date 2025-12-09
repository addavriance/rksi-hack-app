import { useState } from "react";
import {
    Table, TableBody, TableCell, TableHead,
    TableHeader, TableRow
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    MoreVertical, Edit, Shield, Mail, Trash2, Eye
} from "lucide-react";
import {
    DropdownMenu, DropdownMenuContent,
    DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { mockUsers } from "@/data/mockUsers";
import {Card, CardContent} from "@/components/ui/card.js";
import {cn} from "@/lib/utils.js";

const UserManagement = ({ searchQuery }) => {
    const [users, setUsers] = useState(mockUsers);

    const filteredUsers = users.filter(user =>
        user.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleEdit = (user) => {
        // заглушка
        console.log("Редактирование:", user);
    };

    const handleResetPassword = (user) => {
        // заглушка
        console.log("Сброс пароля:", user);
    };

    const handleDelete = (userId) => {
        setUsers(users.map(u =>
            u.id === userId ? { ...u, status: "deleted" } : u
        ));
    };

    const roleColors = {
        ADMIN: "bg-red-100 text-red-800 hover:bg-red-200",
        USER: "bg-blue-100 text-blue-800 hover:bg-blue-200",
        MODERATOR: "bg-purple-100 text-purple-800 hover:bg-purple-200", // а будет ли?
    };

    const statusColors = {
        active: "bg-green-100 text-green-800 hover:bg-green-200",
        inactive: "bg-gray-100 text-gray-800 hover:bg-gray-200",
        deleted: "bg-red-100 text-red-800 hover:bg-red-200",
    };

    return (
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
                            <TableHead>Событий</TableHead>
                            <TableHead className="text-right">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map(user => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">{user.full_name}</TableCell>
                                <TableCell>{user.email}</TableCell>
                                <TableCell>
                                    <Badge className={cn(roleColors[user.role], "select-none")}>
                                        {user.role === "ADMIN" ? "Администратор" : "Пользователь"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <Badge className={cn(statusColors[user.status], "select-none")}>
                                        {user.status === "active" ? "Активен" :
                                            user.status === "inactive" ? "Неактивен" : "Удален"}
                                    </Badge>
                                </TableCell>
                                <TableCell>{user.registrationDate}</TableCell>
                                <TableCell>{user.eventsParticipated}</TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="sm">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                                                <Edit className="mr-2 h-4 w-4" />
                                                Редактировать
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleResetPassword(user)}>
                                                <Shield className="mr-2 h-4 w-4" />
                                                Сбросить пароль
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Mail className="mr-2 h-4 w-4" />
                                                Отправить email
                                            </DropdownMenuItem>
                                            <DropdownMenuItem>
                                                <Eye className="mr-2 h-4 w-4" />
                                                Просмотр активности
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600"
                                                onClick={() => handleDelete(user.id)}
                                            >
                                                <Trash2 className="mr-2 h-4 w-4" />
                                                Удалить
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    );
};

export default UserManagement;
