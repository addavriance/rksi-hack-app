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
import {isProtectedPath} from "@/lib/utils.js";

const GitHubPagesRedirectHandler = () => {
    const navigate = useNavigate();
    const { isAuthenticated, isLoading } = useAuth();

    useEffect(() => {
        console.log('🔍 [GitHubPagesRedirectHandler] useEffect triggered');
        console.log('📊 [GitHubPagesRedirectHandler] Auth state:', { isAuthenticated, isLoading });

        const isGithubRedirect = sessionStorage.getItem('github_pages_redirect');
        const originalPath = sessionStorage.getItem('original_path');

        console.log('📋 [GitHubPagesRedirectHandler] SessionStorage:', {
            github_pages_redirect: isGithubRedirect,
            original_path: originalPath
        });

        if (isGithubRedirect && originalPath) {
            console.log('🎯 [GitHubPagesRedirectHandler] Processing redirect to:', originalPath);

            sessionStorage.removeItem('github_pages_redirect');
            sessionStorage.removeItem('original_path');

            const isPublicPath = !isProtectedPath(originalPath);
            console.log('🔐 [GitHubPagesRedirectHandler] Path check:', {
                originalPath,
                isProtected: isProtectedPath(originalPath),
                isPublicPath,
                isAuthenticated
            });

            if (isAuthenticated) {
                console.log('✅ [GitHubPagesRedirectHandler] User authenticated, navigating to:', originalPath);
                navigate(originalPath, { replace: true });
            }
            else if (isPublicPath) {
                console.log('✅ [GitHubPagesRedirectHandler] Public path, navigating to:', originalPath);
                navigate(originalPath, { replace: true });
            }
            else {
                console.log('🔒 [GitHubPagesRedirectHandler] Protected path, redirecting to login. Saved path:', originalPath);
                sessionStorage.setItem('redirect_after_login', originalPath);
                navigate('/login', { replace: true });
            }
        } else {
            console.log('➡️ [GitHubPagesRedirectHandler] No GitHub redirect detected');
        }
    }, [navigate, isAuthenticated, isLoading]);

    console.log('🔄 [GitHubPagesRedirectHandler] Component rendered');
    return null;
};

function App() {
    const {isAuthenticated, isLoading} = useAuth();
    const [isProcessingRedirect, setIsProcessingRedirect] = useState(false);

    console.log('🚀 [App] Component render', {
        isAuthenticated,
        isLoading,
        isProcessingRedirect,
        currentPath: window.location.pathname + window.location.search,
        sessionStorage: {
            github_pages_redirect: sessionStorage.getItem('github_pages_redirect'),
            original_path: sessionStorage.getItem('original_path'),
            redirect_after_login: sessionStorage.getItem('redirect_after_login')
        }
    });

    useEffect(() => {
        console.log('🔍 [App] Main useEffect triggered');

        const isGithubRedirect = sessionStorage.getItem('github_pages_redirect');
        console.log('📋 [App] Checking GitHub redirect:', isGithubRedirect);

        if (isGithubRedirect) {
            console.log('🎯 [App] GitHub redirect detected, setting isProcessingRedirect to true');
            setIsProcessingRedirect(true);
        }

        console.log('🔐 [App] Checking auth protection...');
        console.log('📊 [App] Auth state:', { isLoading, isAuthenticated });

        if (!isLoading && !isAuthenticated) {
            const currentPath = window.location.pathname + window.location.search;
            const shouldProtect = isProtectedPath(currentPath);

            console.log('🛡️ [App] Protection check:', {
                currentPath,
                shouldProtect,
                isProtectedPath: isProtectedPath(currentPath)
            });

            if (shouldProtect) {
                console.log('🔒 [App] Protected path, redirecting to login');
                console.log('💾 [App] Saving redirect path to sessionStorage:', currentPath);
                sessionStorage.setItem('redirect_after_login', currentPath);
                console.log('🔄 [App] Redirecting to /login');
                window.location.href = '/login';
            } else {
                console.log('✅ [App] Public path, no redirect needed');
            }
        } else {
            console.log('✅ [App] User authenticated or still loading');
        }
    }, [isAuthenticated, isLoading]);

    if (isProcessingRedirect) {
        console.log('⏳ [App] Showing processing redirect loader');
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="ml-2 text-muted-foreground">Загрузка...</span>
            </div>
        );
    }

    const shouldShowAuthLoader = (isLoading || !isAuthenticated) && isProtectedPath();
    console.log('👁️ [App] Should show auth loader:', shouldShowAuthLoader);

    return (
        <>
            {shouldShowAuthLoader && (
                console.log('⏳ [App] Showing auth loader'),
                    <div className="text-center py-12 flex justify-center gap-2">
                        <Loader2 className="animate-spin"/>
                    </div>
            ) || (
                console.log('✅ [App] Rendering main app with Router'),
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
