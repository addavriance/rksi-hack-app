// VerificationPage.jsx
import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { LoaderCircle, Mail, AlertCircle, CheckCircle2 } from "lucide-react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toast } from "sonner";
import { api } from "../api";
import { useAuth } from "../contexts/AuthContext";

const VerificationPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [searchParams] = useSearchParams();
    const [verificationCode, setVerificationCode] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [errors, setErrors] = useState({});
    const [token, setToken] = useState(null);

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        if (!tokenParam) {
            toast.error("Токен верификации не найден");
            navigate('/register');
            return;
        }
        setToken(tokenParam);
    }, [searchParams, navigate]);

    const validateForm = () => {
        const newErrors = {};

        if (!verificationCode.trim()) {
            newErrors.code = "Код верификации обязателен";
        } else if (!/^\d{6}$/.test(verificationCode.trim())) {
            newErrors.code = "Код должен состоять из 6 цифр";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            toast.error("Токен верификации отсутствует");
            return;
        }

        if (!validateForm()) {
            toast.error("Пожалуйста, исправьте ошибки в форме");
            return;
        }

        setIsVerifying(true);

        try {
            // Верификация регистрации
            await api.verifyRegistration(token, parseInt(verificationCode.trim(), 10));

            toast.success("Email успешно подтвержден!");

            // Получаем сохраненные email и password из sessionStorage
            const savedEmail = sessionStorage.getItem('pending_email');
            const savedPassword = sessionStorage.getItem('pending_password');

            // Очищаем sessionStorage
            sessionStorage.removeItem('pending_email');
            sessionStorage.removeItem('pending_password');

            if (savedEmail && savedPassword) {
                // Автоматическая авторизация
                const loginResult = await login(savedEmail, savedPassword);
                
                if (loginResult && loginResult.success) {
                    toast.success("Добро пожаловать!");
                    // Перенаправление будет обработано в App.jsx через проверку isAuthenticated
                } else {
                    toast.error("Верификация успешна, но не удалось войти. Пожалуйста, войдите вручную.");
                    navigate('/login');
                }
            } else {
                toast.info("Верификация успешна! Теперь войдите в систему.");
                navigate('/login');
            }
        } catch (error) {
            console.error("Verification error:", error);
            const errorMessage = error.response?.data?.detail || 
                error.message || 
                "Произошла ошибка при верификации";
            toast.error(errorMessage);
        } finally {
            setIsVerifying(false);
        }
    };

    if (!token) {
        return (
            <div className="flex h-screen items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <div className="flex flex-col items-center gap-3">
                    <LoaderCircle className="h-8 w-8 animate-spin text-blue-600" />
                    <p className="text-sm text-muted-foreground">Загрузка...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen">
            {/* Левая панель - изображение */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden left-panel">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10">
                    <div className="max-w-[27rem] h-full flex flex-col pt-10 pb-32 px-12 justify-between text-gray-100 [text-shadow:0_1px_2px_rgba(0,0,0,0.4),0_0_20px_rgba(255,255,255,0.1)]">
                        <h1 className="text-5xl font-extrabold mb-6 tracking-[0.75rem]">TTK</h1>
                        <p className="text-xl mb-4">
                            Подтвердите свой email для завершения регистрации
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
                                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100">
                                    <Mail className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                            <CardTitle className="text-2xl">
                                Подтверждение email
                            </CardTitle>
                            <p className="text-muted-foreground">
                                Введите код верификации, отправленный на ваш email
                            </p>
                        </CardHeader>

                        <CardContent>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="verificationCode">Код верификации</Label>
                                    <Input
                                        size="sm"
                                        id="verificationCode"
                                        type="text"
                                        placeholder="000000"
                                        value={verificationCode}
                                        onChange={(e) => {
                                            // Разрешаем только цифры
                                            const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                                            setVerificationCode(value);
                                            if (errors.code) setErrors({...errors, code: ""});
                                        }}
                                        className={errors.code ? "border-red-500" : ""}
                                        maxLength={6}
                                        inputMode="numeric"
                                    />
                                    {errors.code && (
                                        <p className="text-sm text-red-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" />
                                            {errors.code}
                                        </p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Введите 6-значный код из письма
                                    </p>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-11 select-none text-white"
                                    disabled={isVerifying}
                                    size="sm"
                                    variant="default"
                                >
                                    {isVerifying ? (
                                        <>
                                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                                            Проверка...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            Подтвердить
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
                                        Вернуться к входу
                                    </Link>
                                </Button>
                            </div>

                            <p className="text-xs text-muted-foreground mt-4 text-center">
                                Не получили код? Проверьте папку "Спам" или попробуйте зарегистрироваться снова.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default VerificationPage;

