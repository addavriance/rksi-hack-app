import {ReactNode} from "react";

export const AuthLayout = ({
                               children,
                               title,
                               desc,
                               subtitle,
                               icon: Icon,
                               showBottomText = true
                           }) => {
    return (
        <div className="flex min-h-screen">
            {/* Левая панель */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden left-panel">
                <div className="absolute inset-0 bg-black/20"></div>
                <div className="relative z-10">
                    <div
                        className="max-w-[27rem] h-full flex flex-col pt-10 pb-32 px-12 justify-between text-gray-100 [text-shadow:0_1px_2px_rgba(0,0,0,0.4),0_0_20px_rgba(255,255,255,0.1)]">
                        <h1 className="text-5xl font-extrabold mb-6 tracking-[0.75rem]">TTK</h1>
                        <p className="text-xl mb-4">{desc}</p>
                    </div>
                </div>
                <div
                    className="absolute bottom-6 px-12 text-sm flex justify-between w-full text-gray-100 [text-shadow:0_1px_2px_rgba(0,0,0,0.4),0_0_20px_rgba(255,255,255,0.1)]">
                    <p>© 2025 RKSI Hack</p>
                    <p><span className="uppercase text-[0.7rem]">asyncore</span> powered</p>
                </div>
            </div>

            {/* Правая панель */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    <div className="border-none shadow-xl bg-white rounded-lg">
                        <div className="p-6 text-center space-y-1">
                            <div className="flex justify-center mb-2">
                                <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-100">
                                    <Icon className="h-6 w-6 text-blue-600"/>
                                </div>
                            </div>
                            <h2 className="text-2xl font-bold">
                                {title}
                            </h2>
                            <p className="text-muted-foreground">
                                {subtitle}
                            </p>
                        </div>

                        <div className="p-6 pt-0">
                            {children}

                            {showBottomText && (
                                <p className="text-xs text-muted-foreground mt-4 text-center">
                                    Ваши данные защищены шифрованием и никогда не передаются третьим лицам.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
