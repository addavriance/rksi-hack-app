// RegisterPage.jsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { LoaderCircle, UserPlus, AlertCircle } from "lucide-react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { api } from "../api";

const RegisterPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isRegistering, setIsRegistering] = useState(false);
    const [errors, setErrors] = useState({});

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const validateForm = () => {
        const newErrors = {};

        if (!email.trim()) {
            newErrors.email = "Email обязателен";
        } else if (!validateEmail(email)) {
            newErrors.email = "Некорректный формат email";
        }

        if (!fullName.trim()) {
            newErrors.fullName = "Полное имя обязательно";
        } else if (fullName.trim().length < 2) {
            newErrors.fullName = "Минимум 2 символа";
        }

        if (!password) {
            newErrors.password = "Пароль обязателен";
        } else if (password.length < 4) {
            newErrors.password = "Минимум 4 символа";
        }

        if (!confirmPassword) {
            newErrors.confirmPassword = "Подтвердите пароль";
        } else if (password !== confirmPassword) {
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

        setIsRegistering(true);

        try {
            const result = await api.register(email, password, fullName.trim());

            if (result && result.token) {
                // Сохраняем email и password для автоматической авторизации после верификации
                sessionStorage.setItem('pending_email', email);
                sessionStorage.setItem('pending_password', password);

                // Перенаправляем на страницу верификации с токеном
                navigate(`/verify?token=${result.token}`);
                toast.success("Регистрация успешна! Проверьте email для получения кода верификации.");
            } else {
                throw new Error("Неверный ответ от сервера");
            }
        } catch (error) {
            console.error("Registration error:", error);
            const errorMessage = error.response?.data?.detail || 
                error.message || 
                "Произошла ошибка при регистрации";
            toast.error(errorMessage);
        } finally {
            setIsRegistering(false);
        }
    };

    return (
        <div className="flex min-h-screen">
            {/* Левая панель - изображение */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden left-panel">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10">
                    <div className="max-w-[27rem] h-full flex flex-col pt-10 pb-32 px-12 justify-between text-gray-100 [text-shadow:0_1px_2px_rgba(0,0,0,0.4),0_0_20px_rgba(255,255,255,0.1)]">
                        <h1 className="text-5xl font-extrabold mb-6 tracking-[0.75rem]">TTK</h1>
                        <p className="text-xl mb-4">
                            Создайте аккаунт, чтобы начать работу
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
                                    <UserPlus className="h-6 w-6" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl">
                                Создать аккаунт
                            </CardTitle>
                            <p className="text-muted-foreground">
                                Заполните форму для регистрации
                            </p>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input
                                        size="sm"
                                        id="email"
                                        type="email"
                                        placeholder="Введите email"
                                        value={email}
                                        onChange={(e) => {
                                            setEmail(e.target.value);
                                            if (errors.email) setErrors({...errors, email: ""});
                                        }}
                                        className={errors.email ? "border-red-500" : ""}
                                    />
                                    {errors.email && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.email}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fullName">Полное имя</Label>
                                    <Input
                                        size="sm"
                                        id="fullName"
                                        type="text"
                                        placeholder="Введите полное имя"
                                        value={fullName}
                                        onChange={(e) => {
                                            setFullName(e.target.value);
                                            if (errors.fullName) setErrors({...errors, fullName: ""});
                                        }}
                                        className={errors.fullName ? "border-red-500" : ""}
                                    />
                                    {errors.fullName && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.fullName}
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

                                <Button
                                    type="submit"
                                    className="w-full h-11 select-none text-white"
                                    disabled={isRegistering}
                                    size="sm"
                                    variant="default"
                                >
                                    {isRegistering ? (
                                        <>
                                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                            Регистрация...
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="mr-2 h-4 w-4" />
                                            Зарегистрироваться
                                        </>
                                    )}
                                </Button>
                            </form>

                            <div className="mt-6 text-center">
                                <Button
                                    type="button"
                                    asChild
                                    variant="link"
                                    size="sm"
                                    className="text-blue-600"
                                >
                                    <Link to="/login">
                                        Уже есть аккаунт? Войти
                                    </Link>
                                </Button>
                            </div>

                            <p className="text-xs text-muted-foreground mt-4 text-center">
                                Ваши данные защищены шифрованием и никогда не передаются третьим лицам.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;

