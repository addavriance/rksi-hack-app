import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import VerificationPage from "./pages/VerificationPage";
// import { Header } from "@/components/Header";
import {useAuth} from "@/contexts/AuthContext";
import {Loader2} from "lucide-react";
import {useEffect} from "react";
import {redirectTo} from "@/lib/utils";
import './App.css';
import EventsPage from "@/pages/EventsPage.jsx";


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
                    {/*<Header/>*/}
                    <Routes>
                        <Route path="/" element={<Navigate to="/login" replace/>}/>
                        <Route path="login" element={<LoginPage />} />
                        <Route path="events" element={<EventsPage />} />
                        <Route path="/register" element={<RegisterPage />} />
                        <Route path="/verify" element={<VerificationPage />} />
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
