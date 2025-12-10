import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerificationPage from "./pages/VerificationPage";
import {useAuth} from "@/contexts/AuthContext";
import {Loader2} from "lucide-react";
import {useEffect, useState} from "react";
import EventsPage from "@/pages/EventsPage.jsx";
import Layout from "@/components/layout/Layout.jsx";
import NotFoundPage from "@/pages/NotFoundPage.jsx";
import DashboardPage from "@/pages/DashboardPage.jsx";
import NotificationsPage from "@/pages/NotificationsPage.jsx";
import './App.css';
import ResetPasswordPage from "@/pages/ResetPasswordPage.jsx";
import AdminPage from "@/pages/AdminPage.jsx";

const GitHubPagesRedirectHandler = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        const isGithubRedirect = sessionStorage.getItem('github_pages_redirect');
        const originalPath = sessionStorage.getItem('original_path');

        if (isGithubRedirect && originalPath) {
            console.log('Processing GitHub Pages redirect to:', originalPath);

            sessionStorage.removeItem('github_pages_redirect');
            sessionStorage.removeItem('original_path');

            if (isAuthenticated) {
                navigate(originalPath, { replace: true });
            }

            else if (originalPath.startsWith('/login') ||
                originalPath.startsWith('/register') ||
                originalPath.startsWith('/verify') ||
                originalPath.startsWith('/recovery') ||
                originalPath.startsWith('/404')) {
                navigate(originalPath, { replace: true });
            }

            else {
                sessionStorage.setItem('redirect_after_login', originalPath);
                navigate('/login', { replace: true });
            }
        }
    }, [navigate, isAuthenticated]);

    return null;
};

function App() {
    const {isAuthenticated, isLoading} = useAuth();
    const [isProcessingRedirect, setIsProcessingRedirect] = useState(false);

    const isProtectedPath = () => {
        const path = window.location.pathname;
        return !(path.includes('/login')
            || path.includes('/register')
            || path.includes('/verify')
            || path.includes('/recovery')
            || path.includes('/404'));
    };

    useEffect(() => {
        if (sessionStorage.getItem('github_pages_redirect')) {
            setIsProcessingRedirect(true);
            return;
        }

        if (!isLoading && !isAuthenticated && isProtectedPath()) {
            const currentPath = window.location.pathname + window.location.search;
            if (!currentPath.includes('/login')) {
                sessionStorage.setItem('redirect_after_login', currentPath);
            }
            window.location.href = '/login';
        }
    }, [isAuthenticated, isLoading]);

    if (isProcessingRedirect) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Загрузка...</span>
            </div>
        );
    }

    return (
        <>
            {((isLoading || !isAuthenticated) && isProtectedPath()) && (
                <div className="text-center py-12 flex justify-center gap-2">
                    <Loader2 className="animate-spin"/>
                </div>
            ) || (
                <BrowserRouter>
                    <GitHubPagesRedirectHandler />

                    <Routes>
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/verify" element={<VerificationPage />} />
                        <Route path="/recovery" element={<ResetPasswordPage />} />
                        <Route path="/404" element={<NotFoundPage />} />

                        <Route path="/" element={<Layout />}>
                            <Route path="" element={<Navigate to="/dashboard" replace/>}/>
                            <Route path="dashboard" element={<DashboardPage/>}/>
                            <Route path="events" element={<EventsPage />} />
                            <Route path="notifications" element={<NotificationsPage />} />
                            <Route path="admin" element={<AdminPage/>}/>
                        </Route>

                        <Route path="*" element={<Navigate to="/404" replace/>} />
                    </Routes>
                </BrowserRouter>
            )}
        </>
    );
}

export default App;
