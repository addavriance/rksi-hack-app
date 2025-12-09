import { useState } from "react";
import { toast } from "sonner";
import { useAuthForm } from "@/hooks/useAuthForm.js";
import { FormField } from "../auth/FormField";
import { SubmitButton } from "../auth/SubmitButton";
import { Button } from "../ui/button";
import { Mail, ArrowLeft } from "lucide-react";
import { validators } from "@/utils/validators.js";
import { api } from "@/api.js";

export const RecoveryForm = ({ onBackToLogin }) => {
    const [isEmailSent, setIsEmailSent] = useState(false);

    const {
        formData: { email },
        errors,
        isSubmitting,
        updateField,
        handleSubmit
    } = useAuthForm(
        { email: "" },
        { email: validators.email }
    );

    const onSubmit = async ({ email }) => {
        try {
            await api.recoveryRequest(email);
            setIsEmailSent(true);
            toast.success("Инструкция по восстановлению отправлена на вашу почту!");
        } catch (error) {
            throw error; // Пробрасываем ошибку для handlePydanticError
        }
    };

    if (isEmailSent) {
        return (
            <div className="text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-xl font-semibold">Письмо отправлено!</h3>
                <p className="text-gray-600">
                    Проверьте вашу почту <span className="font-semibold">{email}</span> и следуйте инструкциям для восстановления пароля.
                </p>
                <div className="space-y-2 pt-4">
                    <Button
                        type="button"
                        onClick={onBackToLogin}
                        variant="outline"
                        className="w-full"
                    >
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Вернуться к входу
                    </Button>
                    <p className="text-xs text-gray-500">
                        Не получили письмо? Проверьте папку "Спам" или попробуйте еще раз через 5 минут.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <form onSubmit={(e) => handleSubmit(e, onSubmit)} className="space-y-4">
                <div className="text-center mb-4">
                    <p className="text-gray-600">
                        Введите email, указанный при регистрации. Мы отправим вам ссылку для восстановления пароля.
                    </p>
                </div>

                <FormField
                    id="email"
                    label="Email"
                    type="email"
                    placeholder="Введите ваш email"
                    value={email}
                    onChange={(value) => updateField("email", value)}
                    error={errors.email}
                />

                <SubmitButton
                    isLoading={isSubmitting}
                    loadingText="Отправка..."
                    defaultText="Отправить инструкцию"
                    icon={Mail}
                />
            </form>

            <div className="pt-4 border-t">
                <Button
                    type="button"
                    onClick={onBackToLogin}
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
