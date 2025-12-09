// components/layout/Sidebar.jsx
import { Link, useLocation } from "react-router-dom";
import {
    Calendar,
    Users,
    Home,
    Bell,
    LogOut,
    Moon,
    Sun,
    Settings,
    User,
    UserCog,
    BarChart,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";

const Sidebar = () => {
    const location = useLocation();
    const { user, logout } = useAuth();
    const [isDarkMode, setIsDarkMode] = useState(false);

    const isAdmin = user?.role === "admin" || true; // для тестов

    const navItems = [
        { path: "/dashboard", label: "Главная", icon: Home },
        { path: "/events", label: "События", icon: Calendar },
        { path: "/notifications", label: "Уведомления", icon: Bell, badge: 3 },
    ];

    const adminItems = [
        { path: "/admin", label: "Админка", icon: UserCog },
        { path: "/analytics", label: "Аналитика", icon: BarChart },
    ];

    const getInitials = (name) => {
        if (!name) return "U";
        return name
            .split(" ")
            .map((word) => word[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    };

    const handleLogout = () => {
        logout();
    };

    const toggleTheme = () => {
        setIsDarkMode(!isDarkMode);
        // Здесь можно добавить логику переключения темы
        if (!isDarkMode) {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }
    };

    return (
        <>
            {/* Десктопный сайдбар - скрыт на мобильных */}
            <div className="hidden md:flex w-64 bg-white dark:bg-gray-900 border-r dark:border-gray-800 h-screen sticky top-0 flex flex-col">
                {/* Верхняя часть с логотипом */}
                <div className="p-6 border-b dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Calendar className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-900 dark:text-white">TTK Афиша</h2>
                            <p className="text-xs text-muted-foreground dark:text-gray-400">
                                Электронная система мероприятий
                            </p>
                        </div>
                    </div>
                </div>

                {/* Навигация */}
                <nav className="flex-1 p-4 overflow-y-auto">
                    <div className="mb-8">
                        <p className="text-xs text-muted-foreground dark:text-gray-400 uppercase tracking-wider mb-3 px-3">
                            Основное
                        </p>
                        <ul className="space-y-1">
                            {navItems.map((item) => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;

                                return (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                isActive
                                                    ? "bg-primary text-white"
                                                    : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                            }`}
                                        >
                                            <Icon className="h-4 w-4" />
                                            <span>{item.label}</span>
                                            {item.badge && (
                                                <span className="ml-auto bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                                            )}
                                        </Link>
                                    </li>
                                );
                            })}
                        </ul>
                    </div>

                    {isAdmin && (
                        <div className="mb-8">
                            <p className="text-xs text-muted-foreground dark:text-gray-400 uppercase tracking-wider mb-3 px-3">
                                Администрирование
                            </p>
                            <ul className="space-y-1">
                                {adminItems.map((item) => {
                                    const Icon = item.icon;
                                    const isActive = location.pathname === item.path;

                                    return (
                                        <li key={item.path}>
                                            <Link
                                                to={item.path}
                                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                    isActive
                                                        ? "bg-primary text-white"
                                                        : "hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                                                }`}
                                            >
                                                <Icon className="h-4 w-4" />
                                                <span>{item.label}</span>
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    )}
                </nav>

                {/* Нижняя часть с профилем и настройками */}
                <div className="border-t dark:border-gray-800 p-4">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="w-full h-auto p-3 hover:bg-gray-100 dark:hover:bg-gray-800 justify-start"
                            >
                                <div className="flex items-center gap-3 w-full">
                                    {/* Аватар */}
                                    <div className="relative">
                                        <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-primary/70 flex items-center justify-center text-white font-semibold text-sm">
                                            {getInitials(user?.full_name || "Пользователь")}
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-white dark:bg-gray-900 rounded-full border dark:border-gray-700 flex items-center justify-center">
                                            <Settings className="h-3 w-3 text-gray-500" />
                                        </div>
                                    </div>

                                    {/* Информация о пользователе */}
                                    <div className="flex-1 text-left overflow-hidden">
                                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                                            {user?.full_name || "Пользователь"}
                                        </p>
                                        <p className="text-xs text-muted-foreground dark:text-gray-400 truncate">
                                            {isAdmin ? "Администратор" : "Пользователь"}
                                        </p>
                                    </div>
                                </div>
                            </Button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent className="w-72 p-0" align="start" side="top">
                            {/* Заголовок профиля */}
                            <div className="p-4 border-b dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-primary/70 flex items-center justify-center text-white font-semibold">
                                        {getInitials(user?.full_name || "П")}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {user?.full_name || "Пользователь"}
                                        </p>
                                        <p className="text-sm text-muted-foreground dark:text-gray-400">
                                            {user?.email || "user@example.com"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Меню настроек */}
                            <div className="py-2">
                                <DropdownMenuItem
                                    className="px-4 py-3 cursor-pointer"
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        // Переход на страницу профиля
                                    }}
                                >
                                    <User className="h-4 w-4 mr-3" />
                                    <span className="text-gray-700 dark:text-gray-300">Мой профиль</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    className="px-4 py-3 cursor-pointer"
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        // Переход на общие настройки
                                    }}
                                >
                                    <Settings className="h-4 w-4 mr-3" />
                                    <span className="text-gray-700 dark:text-gray-300">
                                        Общие настройки
                                    </span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {/* Переключатель темы */}
                                <div className="px-4 py-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {isDarkMode ? (
                                                <Moon className="h-4 w-4 text-gray-500" />
                                            ) : (
                                                <Sun className="h-4 w-4 text-gray-500" />
                                            )}
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {isDarkMode ? "Темная тема" : "Светлая тема"}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleTheme();
                                            }}
                                            className="h-8 w-8 p-0"
                                        >
                                            <div
                                                className={`h-4 w-4 rounded-full transition-all duration-200 ${
                                                    isDarkMode
                                                        ? "bg-gray-800"
                                                        : "bg-gray-300"
                                                }`}
                                            />
                                        </Button>
                                    </div>
                                </div>

                                <DropdownMenuSeparator />

                                {/* Выход */}
                                <DropdownMenuItem
                                    className="px-4 py-3 cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        handleLogout();
                                    }}
                                >
                                    <LogOut className="h-4 w-4 mr-3" />
                                    <span>Выйти из аккаунта</span>
                                </DropdownMenuItem>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Мобильный заголовок - виден только на мобильных */}
            <div className="md:hidden fixed top-0 left-0 right-0 bg-white dark:bg-gray-900 border-b dark:border-gray-800 z-50">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Calendar className="h-5 w-5 text-primary" />
                        </div>
                        <h2 className="font-bold text-gray-900 dark:text-white text-base">TTK Афиша</h2>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                                <div className="h-9 w-9 rounded-full bg-gradient-to-r from-primary to-primary/70 flex items-center justify-center text-white font-semibold text-xs">
                                    {getInitials(user?.full_name || "П")}
                                </div>
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-screen max-w-sm p-0" align="end" side="bottom">
                            {/* Заголовок профиля */}
                            <div className="p-4 border-b dark:border-gray-700">
                                <div className="flex items-center gap-3">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-r from-primary to-primary/70 flex items-center justify-center text-white font-semibold">
                                        {getInitials(user?.full_name || "П")}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-900 dark:text-white">
                                            {user?.full_name || "Пользователь"}
                                        </p>
                                        <p className="text-sm text-muted-foreground dark:text-gray-400">
                                            {user?.email || "user@example.com"}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Меню настроек */}
                            <div className="py-2">
                                <DropdownMenuItem
                                    className="px-4 py-3 cursor-pointer"
                                    onSelect={(e) => {
                                        e.preventDefault();
                                    }}
                                >
                                    <User className="h-4 w-4 mr-3" />
                                    <span className="text-gray-700 dark:text-gray-300">Мой профиль</span>
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                    className="px-4 py-3 cursor-pointer"
                                    onSelect={(e) => {
                                        e.preventDefault();
                                    }}
                                >
                                    <Settings className="h-4 w-4 mr-3" />
                                    <span className="text-gray-700 dark:text-gray-300">Общие настройки</span>
                                </DropdownMenuItem>

                                <DropdownMenuSeparator />

                                {/* Переключатель темы */}
                                <div className="px-4 py-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            {isDarkMode ? (
                                                <Moon className="h-4 w-4 text-gray-500" />
                                            ) : (
                                                <Sun className="h-4 w-4 text-gray-500" />
                                            )}
                                            <span className="text-sm text-gray-700 dark:text-gray-300">
                                                {isDarkMode ? "Темная тема" : "Светлая тема"}
                                            </span>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleTheme();
                                            }}
                                            className="h-8 w-8 p-0"
                                        >
                                            <div
                                                className={`h-4 w-4 rounded-full transition-all duration-200 ${
                                                    isDarkMode
                                                        ? "bg-gray-800"
                                                        : "bg-gray-300"
                                                }`}
                                            />
                                        </Button>
                                    </div>
                                </div>

                                <DropdownMenuSeparator />

                                {/* Выход */}
                                <DropdownMenuItem
                                    className="px-4 py-3 cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-900/20"
                                    onSelect={(e) => {
                                        e.preventDefault();
                                        handleLogout();
                                    }}
                                >
                                    <LogOut className="h-4 w-4 mr-3" />
                                    <span>Выйти из аккаунта</span>
                                </DropdownMenuItem>
                            </div>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Мобильная нижняя навигация - видна только на мобильных */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t dark:border-gray-800 z-50 safe-area-inset-bottom">
                <nav className="flex items-center justify-around px-2 py-2">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs transition-colors min-w-[60px] ${
                                    isActive
                                        ? "text-primary"
                                        : "text-gray-600 dark:text-gray-400"
                                }`}
                            >
                                <div className="relative">
                                    <Icon className="h-5 w-5" />
                                    {item.badge && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                    {isAdmin && adminItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs transition-colors min-w-[60px] ${
                                    isActive
                                        ? "text-primary"
                                        : "text-gray-600 dark:text-gray-400"
                                }`}
                            >
                                <Icon className="h-5 w-5" />
                                <span className="text-[10px] font-medium">{item.label}</span>
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </>
    );
};

export default Sidebar;
