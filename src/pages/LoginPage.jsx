import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useAuthForm } from "../hooks/useAuthForm";
import { AuthLayout } from "../components/auth/AuthLayout";
import { FormField } from "../components/auth/FormField";
import { SubmitButton } from "../components/auth/SubmitButton";
import { Button } from "../components/ui/button";
import { LogIn } from "lucide-react";
import { validators } from "../utils/validators";

const LoginPage = () => {
    const { login } = useAuth();

    const {
        formData: { email, password },
        errors,
        isSubmitting,
        updateField,
        handleSubmit
    } = useAuthForm(
        { email: "", password: "" },
        { email: validators.email, password: validators.password }
    );

    const onSubmit = async ({ email, password }) => {
        const result = await login(email, password);
        if (result?.success) {
            // Перенаправление будет обработано в App.jsx
        } else {
            throw new Error("Неверные учетные данные");
        }
    };

    return (
        <AuthLayout
            title="Войдите в свой аккаунт"
            subtitle="Введите свои учетные данные"
            desc="Войдите в свой аккаунт, чтобы продолжить работу"
            icon={LogIn}
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
                    id="password"
                    label="Пароль"
                    type="password"
                    placeholder="Введите пароль"
                    value={password}
                    onChange={(value) => updateField("password", value)}
                    error={errors.password}
                />

                <SubmitButton
                    isLoading={isSubmitting}
                    loadingText="Вход..."
                    defaultText="Войти"
                    icon={LogIn}
                />
            </form>

            <div className="mt-6 text-center">
                <Button type="button" asChild variant="link" size="sm" className="text-blue-600">
                    <Link to="/register">Нет аккаунта? Зарегистрироваться</Link>
                </Button>
            </div>
        </AuthLayout>
    );
};

export default LoginPage;
