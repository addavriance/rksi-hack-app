import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerificationPage from "./pages/VerificationPage";
import {useAuth} from "@/contexts/AuthContext";
import {Loader2} from "lucide-react";
import {useEffect} from "react";
import {isProtectedPath, redirectTo} from "@/lib/utils";
import EventsPage from "@/pages/EventsPage.jsx";
import Layout from "@/components/layout/Layout.jsx";
import NotFoundPage from "@/pages/NotFoundPage.jsx";
import DashboardPage from "@/pages/DashboardPage.jsx";

import './App.css';
import ResetPasswordPage from "@/pages/ResetPasswordPage.jsx";
import AdminPage from "@/pages/AdminPage.jsx";

function App() {
    const {isAuthenticated, isLoading} = useAuth();

    useEffect(() => {
        if (!isLoading && !isAuthenticated && isProtectedPath()) {
            redirectTo('/login');
        }
    }, [isAuthenticated, isLoading]);

    return (
        <>
            {((isLoading || !isAuthenticated) && isProtectedPath()) && (
                <div className="text-center py-12 flex justify-center gap-2">
                    <Loader2 className="animate-spin"/>
                </div>
            ) || (
                <BrowserRouter>
                    <Routes>
                        <Route path="login" element={<LoginPage />} />
                        <Route path="register" element={<RegisterPage />} />
                        <Route path="verify" element={<VerificationPage />} />
                        <Route path="/recovery" element={<ResetPasswordPage />} />
                        <Route path="404" element={<NotFoundPage />} />


                        <Route path="/" element={<Layout />}>
                            <Route path="" element={<Navigate to="/dashboard" replace/>}/>
                            <Route path="dashboard" element={<DashboardPage/>}/>
                            <Route path="events" element={<EventsPage />} />
                            <Route path="admin" element={<AdminPage/>}/>
                        </Route>
                        {/*<Route path="/posts" element={<PostsPage />} />*/}
                        {/*<Route path="/posts/create" element={<CreatePostPage />} />*/}
                        {/*<Route path="/posts/:id" element={<PostDetailPage />} />*/}
                        {/*<Route path="/profile" element={<ProfilePage/>}/>*/}
                        {/*<Route path="/todos" element={<TodoPage/>}/>*/}
                        {/*<Route path="/404" element={<NotFoundPage />} />*/}
                        <Route path="*" element={<Navigate to="/404" replace/>} />
                    </Routes>
                </BrowserRouter>
            )}
        </>

    );
}

export default App;
