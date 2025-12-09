import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

const Layout = () => {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />

            <div className="flex-1 flex flex-col">
                <main className="flex-1 overflow-auto">
                    <div className="container mx-auto px-6 py-8">
                        <Outlet />
                    </div>
                </main>

                {/* Футер (переделать или убрать) */}
                <footer className="border-t bg-white py-4">
                    <div className="container mx-auto px-6 text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Система электронной афиши
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Layout;
