import { useState } from "react";
import {Link} from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useAuthForm } from "../hooks/useAuthForm";
import { AuthLayout } from "../components/auth/AuthLayout";
import { FormField } from "../components/auth/FormField";
import { SubmitButton } from "../components/auth/SubmitButton";
import { RecoveryForm } from "../components/auth/RecoveryForm";
import { Button } from "../components/ui/button";
import { LogIn, Key } from "lucide-react";
import { validators } from "../utils/validators";

const LoginPage = () => {
    const { login } = useAuth();
    const [showRecovery, setShowRecovery] = useState(false);

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
        } else {
            throw new Error("Неверные учетные данные");
        }
    };

    return (
        <AuthLayout
            title={showRecovery ? "Восстановление пароля" : "Войдите в свой аккаунт"}
            subtitle={showRecovery ? "Мы поможем восстановить доступ" : "Введите свои учетные данные"}
            desc={showRecovery ? "" : "Войдите в свой аккаунт, чтобы продолжить работу"}
            icon={showRecovery ? Key : LogIn}
        >
            {showRecovery ? (
                <RecoveryForm onBackToLogin={() => setShowRecovery(false)} />
            ) : (
                <>
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

                    <div className="space-y-4 mt-6">
                        <div className="text-center">
                            <Button
                                type="button"
                                variant="link"
                                size="sm"
                                className="text-blue-600"
                                onClick={() => setShowRecovery(true)}
                            >
                                <Key className="mr-2 h-4 w-4" />
                                Забыли пароль?
                            </Button>
                        </div>

                        <div className="text-center">
                            <Button type="button" asChild variant="link" size="sm" className="text-blue-600">
                                <Link to="/register">Нет аккаунта? Зарегистрироваться</Link>
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </AuthLayout>
    );
};

export default LoginPage;
