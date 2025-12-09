import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, AlertCircle } from "lucide-react";

const NotFoundPage = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <div className="max-w-md w-full text-center">
                <div className="relative mb-8">
                    <div className="relative w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                        <AlertCircle className="h-12 w-12 text-primary" />
                    </div>
                </div>

                {/* Заголовок */}
                <div className="mb-6">
                    <h1 className="text-6xl font-bold text-primary mb-2">404</h1>
                    <div className="w-16 h-1 bg-primary/30 mx-auto mb-4"></div>
                    <h2 className="text-2xl font-semibold mb-2">Потерялись?</h2>
                    <p className="text-muted-foreground">
                        Этой страницы больше нет или она никогда не существовала.
                    </p>
                </div>

                {/* Кнопки */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
                    <Button asChild size="lg" className="sm:flex-1">
                        <Link to="/">
                            <Home className="mr-2 h-5 w-5" />
                            На главную
                        </Link>
                    </Button>

                    <Button asChild variant="outline" size="lg" className="sm:flex-1">
                        <Link to="javascript:history.back()">
                            <ArrowLeft className="mr-2 h-5 w-5" />
                            Вернуться назад
                        </Link>
                    </Button>
                </div>

                {/* Декор */}
                <div className="text-xs text-muted-foreground">
                    <p>ТТК Афиша • Ошибка 404</p>
                    <p className="mt-1">Попробуйте начать с главной страницы</p>
                </div>
            </div>
        </div>
    );
};

export default NotFoundPage;
