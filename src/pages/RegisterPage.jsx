import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuthForm } from "../hooks/useAuthForm";
import { AuthLayout } from "../components/auth/AuthLayout";
import { FormField } from "../components/auth/FormField";
import { SubmitButton } from "../components/auth/SubmitButton";
import { Button } from "../components/ui/button";
import { UserPlus } from "lucide-react";
import { validators } from "../utils/validators";
import { api } from "../api";

const RegisterPage = () => {
    const navigate = useNavigate();

    const {
        formData: { email, password, fullName, confirmPassword },
        errors,
        isSubmitting,
        updateField,
        handleSubmit
    } = useAuthForm(
        { email: "", password: "", fullName: "", confirmPassword: "" },
        {
            email: validators.email,
            password: validators.password,
            fullName: validators.fullName,
            confirmPassword: (value, formData) => validators.confirmPassword(value, formData)
        }
    );

    const onSubmit = async (formData) => {
        const result = await api.register(formData.email, formData.password, formData.fullName.trim());

        if (result?.token) {
            sessionStorage.setItem('pending_email', formData.email);
            sessionStorage.setItem('pending_password', formData.password);
            navigate(`/verify?token=${result.token}`);
            toast.success("Регистрация успешна! Проверьте email для получения кода верификации.");
        } else {
            throw new Error("Неверный ответ от сервера");
        }
    };

    return (
        <AuthLayout
            title="Создайте аккаунт"
            subtitle="Заполните форму для регистрации"
            desc="Создайте аккаунт, чтобы начать работу"
            icon={UserPlus}
        >
            <form onSubmit={(e) => handleSubmit(e, onSubmit)} className="space-y-4">
                <FormField
                    id="email"
                    label="Email"
                    type="email"
                    placeholder="Введите email"
                    value={email}
                    onChange={(value) => updateField("email", value)}
                    error={errors.email}
                />

                <FormField
                    id="fullName"
                    label="Полное имя"
                    type="text"
                    placeholder="Введите полное имя"
                    value={fullName}
                    onChange={(value) => updateField("fullName", value)}
                    error={errors.fullName}
                />

                <FormField
                    id="password"
                    label="Пароль"
                    type="password"
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(value) => updateField("password", value)}
                    error={errors.password}
                />

                <FormField
                    id="confirmPassword"
                    label="Подтвердите пароль"
                    type="password"
                    placeholder="Повторите пароль"
                    value={confirmPassword}
                    onChange={(value) => updateField("confirmPassword", value)}
                    error={errors.confirmPassword}
                />

                <SubmitButton
                    isLoading={isSubmitting}
                    loadingText="Регистрация..."
                    defaultText="Зарегистрироваться"
                    icon={UserPlus}
                />
            </form>

            <div className="mt-6 text-center">
                <Button type="button" asChild variant="link" size="sm" className="text-blue-600">
                    <Link to="/login">Уже есть аккаунт? Войти</Link>
                </Button>
            </div>
        </AuthLayout>
    );
};

export default RegisterPage;

