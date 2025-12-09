import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useAuthForm } from "../../hooks/useAuthForm";
import { FormField } from "../auth/FormField";
import { SubmitButton } from "../auth/SubmitButton";
import { Button } from "../ui/button";
import { Lock, ArrowLeft } from "lucide-react";
import { validators } from "../../utils/validators";
import { api } from "../../api";

export const ResetPasswordForm = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [token, setToken] = useState(null);
    const [isTokenValid, setIsTokenValid] = useState(true);

    const {
        formData: { password, confirmPassword },
        errors,
        isSubmitting,
        updateField,
        handleSubmit
    } = useAuthForm(
        { password: "", confirmPassword: "" },
        {
            password: validators.password,
            confirmPassword: (value, formData) => validators.confirmPassword(value, formData)
        }
    );

    useEffect(() => {
        const tokenParam = searchParams.get('token');
        if (!tokenParam) {
            setIsTokenValid(false);
            toast.error("Ссылка для восстановления недействительна");
            navigate('/login');
            return;
        }
        setToken(tokenParam);
    }, [searchParams, navigate]);

    const onSubmit = async ({ password }) => {
        if (!token) {
            toast.error("Токен восстановления отсутствует");
            return;
        }

        try {
            await api.resetPassword(token, password);
            toast.success("Пароль успешно изменен! Войдите повторно.");

            setTimeout(() => {
                navigate('/login');
            }, 2000);
        } catch (error) {
            if (error.response?.status === 400) {
                toast.error("Ссылка для восстановления недействительна или истекла");
                setIsTokenValid(false);
            }
            throw error;
        }
    };

    if (!isTokenValid) {
        return (
            <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                    <Lock className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-semibold">Ссылка недействительна</h3>
                <p className="text-gray-600">
                    Ссылка для восстановления пароля недействительна или истекла. Запросите новую ссылку.
                </p>
                <Button
                    type="button"
                    onClick={() => navigate('/login')}
                    variant="outline"
                    className="w-full"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Вернуться к входу
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <form onSubmit={(e) => handleSubmit(e, onSubmit)} className="space-y-4">
                <div className="text-center mb-4">
                    <p className="text-gray-600">
                        Введите новый пароль для вашего аккаунта
                    </p>
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

                <FormField
                    id="confirmPassword"
                    label="Подтвердите пароль"
                    type="password"
                    placeholder="Повторите новый пароль"
                    value={confirmPassword}
                    onChange={(value) => updateField("confirmPassword", value)}
                    error={errors.confirmPassword}
                />

                <SubmitButton
                    isLoading={isSubmitting}
                    loadingText="Изменение..."
                    defaultText="Изменить пароль"
                    icon={Lock}
                />
            </form>

            <div className="pt-4 border-t">
                <Button
                    type="button"
                    onClick={() => navigate('/login')}
                    variant="ghost"
                    size="sm"
                    className="w-full"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Вернуться к входу
                </Button>
            </div>
        </div>
    );
};
