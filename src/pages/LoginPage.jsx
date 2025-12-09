// LoginPage.jsx
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { LoaderCircle, LogIn, Check, UserPlus, AlertCircle } from "lucide-react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { api } from "../api"; // Импортируем ваш API клиент

const LoginPage = ({ onLogin, loading }) => {
    const [isLoginMode, setIsLoginMode] = useState(true);
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isAuthenticating, setIsAuthenticating] = useState(false);
    const [errors, setErrors] = useState({});

    const validateForm = () => {
        const newErrors = {};

        if (!username.trim()) {
            newErrors.username = "Имя пользователя обязательно";
        } else if (username.length < 3) {
            newErrors.username = "Минимум 3 символа";
        }

        if (!password) {
            newErrors.password = "Пароль обязателен";
        } else if (password.length < 4) {
            newErrors.password = "Минимум 4 символа";
        }

        if (!isLoginMode && password !== confirmPassword) {
            newErrors.confirmPassword = "Пароли не совпадают";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            toast.error("Пожалуйста, исправьте ошибки в форме");
            return;
        }

        setIsAuthenticating(true);

        try {
            if (isLoginMode) {
                // Логин
                const result = await api.login(username, password);

                if (result && result.login_session_token && result.login_session_uid) {
                    toast.success("Вход выполнен успешно!");
                    // onLogin(result); // Передаем данные авторизации родительскому компоненту
                } else {
                    throw new Error("Неверные учетные данные");
                }
            } else {
                // Регистрация
                const result = await api.register(username, password);

                if (result) {
                    toast.success("Регистрация успешна! Теперь войдите в систему.");

                    // Автоматически переключаемся на логин после регистрации
                    setIsLoginMode(true);
                    setPassword("");
                    setConfirmPassword("");
                    setErrors({});
                }
            }
        } catch (error) {
            console.error("Auth error:", error);
            toast.error(error.response?.data?.detail || "Произошла ошибка при авторизации");
        } finally {
            setIsAuthenticating(false);
        }
    };

    const handleGetActiveLogin = async () => {
        try {
            const result = await api.getActiveLogin();
            if (result && result.username) {
                toast.success(`Текущий пользователь: ${result.username}`);
            }
        } catch (error) {
            toast.error("Нет активной сессии");
        }
    };

    // Выход из системы
    const handleLogout = () => {
        api.logout();
        toast.success("Выход выполнен");
        // Сброс формы
        setUsername("");
        setPassword("");
        setConfirmPassword("");
    };

    const toggleMode = () => {
        setIsLoginMode(!isLoginMode);
        setErrors({});
        setPassword("");
        setConfirmPassword("");
    };

    return loading ? (
        <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
            <div className="flex flex-col items-center gap-3">
                <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-sm text-muted-foreground">
                    {isAuthenticating ? "Выполняется авторизация..." : "Загрузка..."}
                </p>
            </div>
        </div>
    ) : (
        <div className="flex min-h-screen">
            {/* Левая панель - изображение ??? */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden left-panel">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10">
                    <div className="max-w-[27rem] h-full flex flex-col pt-10 pb-32 px-12 justify-between text-gray-100 [text-shadow:0_1px_2px_rgba(0,0,0,0.4),0_0_20px_rgba(255,255,255,0.1)]">
                        <h1 className="text-5xl font-extrabold mb-6 tracking-[0.75rem]">TTK</h1>
                        <p className="text-xl mb-4">
                                Войдите в свой аккаунт, чтобы продолжить работу
                        </p>
                    </div>
                </div>
                <div className="absolute bottom-6 px-12 text-sm flex justify-between w-full text-gray-100 [text-shadow:0_1px_2px_rgba(0,0,0,0.4),0_0_20px_rgba(255,255,255,0.1)]">
                    <p>© 2025 RKSI Hack</p>
                    <p><span className="uppercase text-[0.7rem]">asyncore</span> powered</p>
                </div>
            </div>

            {/* Правая панель - форма */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    <Card className="border-none shadow-xl">
                        <CardHeader className="text-center space-y-1">
                            <div className="flex justify-center mb-2">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center">
                                    {isLoginMode ? (
                                        <LogIn className="h-6 w-6" />
                                    ) : (
                                        <UserPlus className="h-6 w-6" />
                                    )}
                                </div>
                            </div>
                            <CardTitle className="text-2xl">
                                {isLoginMode ? "Вход в систему" : "Создать аккаунт"}
                            </CardTitle>
                            <p className="text-muted-foreground">
                                {isLoginMode
                                    ? "Введите свои учетные данные"
                                    : "Заполните форму для регистрации"
                                }
                            </p>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="username">Имя пользователя</Label>
                                    <Input
                                        size="sm"
                                        id="username"
                                        type="text"
                                        placeholder="Введите имя пользователя"
                                        value={username}
                                        onChange={(e) => {
                                            setUsername(e.target.value);
                                            if (errors.username) setErrors({...errors, username: ""});
                                        }}
                                        className={errors.username ? "border-red-500" : ""}
                                    />
                                    {errors.username && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.username}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="password">Пароль</Label>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Введите пароль"
                                        value={password}
                                        onChange={(e) => {
                                            setPassword(e.target.value);
                                            if (errors.password) setErrors({...errors, password: ""});
                                        }}
                                        className={errors.password ? "border-red-500" : ""}
                                        size="sm"
                                    />
                                    {errors.password && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.password}
                                        </p>
                                    )}
                                </div>

                                {!isLoginMode && (
                                    <div className="space-y-2">
                                        <Label htmlFor="confirmPassword">Подтвердите пароль</Label>
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            placeholder="Повторите пароль"
                                            value={confirmPassword}
                                            onChange={(e) => {
                                                setConfirmPassword(e.target.value);
                                                if (errors.confirmPassword) setErrors({...errors, confirmPassword: ""});
                                            }}
                                            className={errors.confirmPassword ? "border-red-500" : ""}
                                            size="sm"
                                        />
                                        {errors.confirmPassword && (
                                            <p className="text-sm text-red-500 flex items-center gap-1">
                                                <AlertCircle className="h-3 w-3" />
                                                {errors.confirmPassword}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <Button
                                    type="submit"
                                    className="w-full h-11 select-none text-white"
                                    disabled={isAuthenticating}
                                    size="sm"
                                    variant="default"
                                >
                                    {isAuthenticating ? (
                                        <>
                                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                            {isLoginMode ? "Вход..." : "Регистрация..."}
                                        </>
                                    ) : (
                                        <>
                                            {isLoginMode ? (
                                                <>
                                                    <LogIn className="mr-2 h-4 w-4" />
                                                    Войти
                                                </>
                                            ) : (
                                                <>
                                                    <UserPlus className="mr-2 h-4 w-4" />
                                                    Зарегистрироваться
                                                </>
                                            )}
                                        </>
                                    )}
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <Button
                                    type="button"
                                    onClick={toggleMode}
                                    variant="link"
                                    size="sm"
                                    className="text-blue-600"
                                >
                                    {isLoginMode
                                        ? "Нет аккаунта? Зарегистрироваться"
                                        : "Уже есть аккаунт? Войти"
                                    }
                                </Button>
                            </div>

                            <div className="mt-8 pt-6 border-t"> {/*тестовая часть, потом убрать*/}
                                <div className="flex justify-between items-center">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={handleGetActiveLogin}
                                    >
                                        Проверить сессию
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={handleLogout}
                                    >
                                        Выйти
                                    </Button>
                                </div>
                                <p className="text-xs text-muted-foreground mt-4 text-center">
                                    Ваши данные защищены шифрованием и никогда не передаются третьим лицам.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
