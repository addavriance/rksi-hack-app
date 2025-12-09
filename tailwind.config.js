/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: ["class"],
    theme: {
        extend: {
            colors: {
                // Основная цветовая схема ТТК
                primary: {
                    50: '#ffebee',
                    100: '#ffcdd2',
                    200: '#ef9a9a',
                    300: '#e57373',
                    400: '#ef5350',
                    500: '#d32f2f', // Основной красный ТТК
                    600: '#c62828',
                    700: '#b71c1c',
                    800: '#8b0000',
                    900: '#5d0000',
                    DEFAULT: '#d32f2f',
                    foreground: '#ffffff',
                },
                ttk: {
                    red: '#d32f2f',
                    white: '#ffffff',
                    gray: {
                        50: '#f8f9fa',
                        100: '#e9ecef',
                        200: '#dee2e6',
                        300: '#ced4da',
                        400: '#adb5bd',
                        500: '#6c757d',
                        600: '#495057',
                        700: '#343a40',
                        800: '#212529',
                        900: '#121416',
                    },
                },
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                card: 'hsl(var(--card))',
                'card-foreground': 'hsl(var(--card-foreground))',
                popover: 'hsl(var(--popover))',
                'popover-foreground': 'hsl(var(--popover-foreground))',
                secondary: 'hsl(var(--secondary))',
                'secondary-foreground': 'hsl(var(--secondary-foreground))',
                muted: 'hsl(var(--muted))',
                'muted-foreground': 'hsl(var(--muted-foreground))',
                accent: 'hsl(var(--accent))',
                'accent-foreground': 'hsl(var(--accent-foreground))',
                destructive: 'hsl(var(--destructive))',
                'destructive-foreground': 'hsl(var(--destructive-foreground))',
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
            },
            fontFamily: {
                sans: [
                    'Inter',
                    'system-ui',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    'Segoe UI',
                    'Roboto',
                    'sans-serif',
                ],
                display: [
                    'Montserrat',
                    'Inter',
                    'system-ui',
                    '-apple-system',
                    'sans-serif',
                ],
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            animation: {
                'fade-in': 'fadeIn 0.5s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'pulse-subtle': 'pulseSubtle 2s infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': {opacity: '0'},
                    '100%': {opacity: '1'},
                },
                slideUp: {
                    '0%': {transform: 'translateY(10px)', opacity: '0'},
                    '100%': {transform: 'translateY(0)', opacity: '1'},
                },
                pulseSubtle: {
                    '0%, 100%': {opacity: '1'},
                    '50%': {opacity: '0.8'},
                },
            },
        },
    },
    plugins: [],
}
