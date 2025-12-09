import { Link, useLocation } from "react-router-dom";
import {
    Calendar, Users, Settings, Home,
    UserCog, BarChart, Bell
} from "lucide-react";
import {useAuth} from "@/contexts/AuthContext.jsx";

const Sidebar = () => {
    const location = useLocation();
    const {user} = useAuth();
    const isAdmin = user.role === "ADMIN" || true; // для тестов

    const navItems = [
        { path: "/dashboard", label: "Главная", icon: Home },
        { path: "/events", label: "События", icon: Calendar },
        { path: "/notifications", label: "Уведомления", icon: Bell, badge: 3 },
    ];

    const adminItems = [
        { path: "/admin", label: "Админка", icon: UserCog },
        { path: "/analytics", label: "Аналитика", icon: BarChart },
        { path: "/settings", label: "Настройки", icon: Settings },
    ];

    return (
        <div className="w-64 bg-white border-r h-screen sticky top-0">
            <div className="p-6 border-b">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <h2 className="font-bold">TTK Афиша</h2>
                        <p className="text-xs text-muted-foreground">{user.full_name}</p>
                    </div>
                </div>
            </div>

            <nav className="p-4">
                <div className="mb-8">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 px-3">
                        Основное
                    </p>
                    <ul className="space-y-1">
                        {navItems.map(item => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                            isActive
                                                ? "bg-primary text-white"
                                                : "hover:bg-gray-100 text-gray-700"
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
                    <div>
                        <p className="text-xs text-muted-foreground uppercase tracking-wider mb-3 px-3">
                            Администрирование
                        </p>
                        <ul className="space-y-1">
                            {adminItems.map(item => {
                                const Icon = item.icon;
                                const isActive = location.pathname === item.path;

                                return (
                                    <li key={item.path}>
                                        <Link
                                            to={item.path}
                                            className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                                                isActive
                                                    ? "bg-primary text-white"
                                                    : "hover:bg-gray-100 text-gray-700"
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
        </div>
    );
};

export default Sidebar;
