import {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import {Toaster} from "sonner";
import {AuthProvider} from "@/contexts/AuthContext.jsx";
import './index.css';

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <AuthProvider>
            <App/>
        </AuthProvider>
        <Toaster position="top-right" richColors expand={true} closeButton={true}/>
    </StrictMode>,
)
