import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import {Toaster} from "sonner";
import {AuthProvider} from "@/contexts/AuthContext.jsx";
import {NotificationsProvider} from "@/contexts/NotificationsContext.jsx";
import './index.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <NotificationsProvider>
                <App/>
            </NotificationsProvider>
        </AuthProvider>
        <Toaster position="top-right" richColors expand={true} closeButton={true}/>
    </StrictMode>,
)
