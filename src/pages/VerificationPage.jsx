import { useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { useAuthForm } from "../hooks/useAuthForm";
import { AuthLayout } from "../components/auth/AuthLayout";
import { FormField } from "../components/auth/FormField";
import { SubmitButton } from "../components/auth/SubmitButton";
import { Button } from "../components/ui/button";
import { Mail, RefreshCw, LoaderCircle } from "lucide-react";
import { api } from "../api";
import { handlePydanticError } from "@/lib/utils";
import { validators } from "../utils/validators";

const RESEND_COOLDOWN_SECONDS = 60;

const VerificationPage = () => {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [searchParams] = useSearchParams();
    const cooldownIntervalRef = useRef(null);

    const {
        formData: { verificationCode },
        errors,
        isSubmitting,
        updateField,
        handleSubmit,
    } = useAuthForm(
        { verificationCode: "" },
        { verificationCode: validators.verificationCode }
    );

    const [resendCooldown, setResendCooldown] = useState(0);
    const [isResending, setIsResending] = useState(false);
    const [token, setToken] = useState(null);

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        if (!tokenParam) {
            toast.error("Токен верификации не найден");
            navigate('/register');
            return;
        }
        setToken(tokenParam);

        const storageKey = `resend_cooldown_${tokenParam}`;
        const lastResendTime = localStorage.getItem(storageKey);

        if (lastResendTime) {
            const timePassed = Math.floor((Date.now() - parseInt(lastResendTime)) / 1000);
            const remaining = RESEND_COOLDOWN_SECONDS - timePassed;

            if (remaining > 0) {
                setResendCooldown(remaining);
            } else {
                localStorage.removeItem(storageKey);
            }
        }
    }, [searchParams, navigate]);

    useEffect(() => {
        if (resendCooldown > 0) {
            cooldownIntervalRef.current = setInterval(() => {
                setResendCooldown((prev) => {
                    if (prev <= 1) {
                        if (token) localStorage.removeItem(`resend_cooldown_${token}`);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
        };
    }, [resendCooldown, token]);

    const handleResendCode = async () => {
        if (!token || resendCooldown > 0 || isResending) return;

        setIsResending(true);
        try {
            await api.resendVerificationCode(token);
            localStorage.setItem(`resend_cooldown_${token}`, Date.now().toString());
            setResendCooldown(RESEND_COOLDOWN_SECONDS);
            toast.success("Код верификации отправлен повторно!");
        } catch (error) {
            console.error("Resend error:", error);
            toast.error(handlePydanticError(error));
        } finally {
            setIsResending(false);
        }
    };

    const onSubmit = async () => {
        if (!token) {
            toast.error("Токен верификации отсутствует");
            return;
        }

        await api.verifyRegistration(token, parseInt(verificationCode.trim(), 10));
        toast.success("Email успешно подтвержден!");

        if (token) localStorage.removeItem(`resend_cooldown_${token}`);

        const savedEmail = sessionStorage.getItem('pending_email');
        const savedPassword = sessionStorage.getItem('pending_password');
        sessionStorage.removeItem('pending_email');
        sessionStorage.removeItem('pending_password');

        if (savedEmail && savedPassword) {
            const loginResult = await login(savedEmail, savedPassword);
            if (loginResult?.success) {
                toast.success("Добро пожаловать!");
            } else {
                toast.error("Верификация успешна, но не удалось войти. Пожалуйста, войдите вручную.");
                navigate('/login');
            }
        } else {
            toast.info("Верификация успешна! Теперь войдите в систему.");
            navigate('/login');
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
        <AuthLayout
            title="Подтвердите свой email для завершения регистрации"
            subtitle="Введите код верификации, отправленный на ваш email"
            icon={Mail}
            showBottomText={false}
        >
            <form onSubmit={(e) => handleSubmit(e, onSubmit)} className="space-y-4">
                <FormField
                    id="verificationCode"
                    label="Код верификации"
                    placeholder="000000"
                    value={verificationCode}
                    onChange={(value) => {
                        const numericValue = value.replace(/\D/g, '').slice(0, 6);
                        updateField("verificationCode", numericValue);
                    }}
                    error={errors.verificationCode}
                    maxLength={6}
                    inputMode="numeric"
                />
                <p className="text-xs text-muted-foreground">Введите 6-значный код из письма</p>

                <SubmitButton
                    isLoading={isSubmitting}
                    loadingText="Проверка..."
                    defaultText="Подтвердить"
                />
            </form>

            <div className="mt-4">
                <Button
                    type="button"
                    onClick={handleResendCode}
                    disabled={resendCooldown > 0 || isResending || !token}
                    variant="outline"
                    size="sm"
                    className="w-full"
                >
                    {isResending ? (
                        <>
                            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                            Отправка...
                        </>
                    ) : resendCooldown > 0 ? (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Повторить через {resendCooldown} сек
                        </>
                    ) : (
                        <>
                            <RefreshCw className="mr-2 h-4 w-4" />
                            Отправить код повторно
                        </>
                    )}
                </Button>
            </div>

            <div className="mt-6 text-center">
                <Button type="button" asChild variant="link" size="sm" className="text-blue-600">
                    <Link to="/login">Вернуться к входу</Link>
                </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-4 text-center">
                Не получили код? Проверьте папку "Спам".
            </p>
        </AuthLayout>
    );
};

export default VerificationPage;
