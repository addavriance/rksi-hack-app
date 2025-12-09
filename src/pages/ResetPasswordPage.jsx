import { AuthLayout } from "../components/auth/AuthLayout";
import { ResetPasswordForm } from "../components/auth/ResetPasswordForm";
import { Lock } from "lucide-react";

const ResetPasswordPage = () => {
    return (
        <AuthLayout
            title="Восстановление пароля"
            subtitle="Создайте новый пароль"
            desc=""
            icon={Lock}
        >
            <ResetPasswordForm />
        </AuthLayout>
    );
};

export default ResetPasswordPage;
