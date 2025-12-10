export const validators = {
    email: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email?.trim()) return "Email обязателен";
        if (!emailRegex.test(email)) return "Некорректный формат email";
        return null;
    },

    password: (password) => {
        if (!password || !password.trim()) return "Пароль обязателен";
        if (password.trim().length < 8) return "Минимум 8 символов";
        if (password.trim().length > 64) return "Максимум 64 символа";

        if (!/[A-Za-z]/.test(password)) return "Пароль должен содержать только латиницу"; // все равно не получится, раскладка в форме меняется на английскую

        if (!/[A-Z]/.test(password)) return "Добавьте хотя бы одну заглавную букву";

        if (!/[a-z]/.test(password)) return "Добавьте хотя бы одну строчную букву";

        if (!/\d/.test(password)) return "Добавьте хотя бы одну цифру";

        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~`]/.test(password)) {
            return "Добавьте хотя бы один специальный символ (!@#$%^&* и т.д.)";
        }

        if (/\s/.test(password)) return "Пароль не должен содержать пробелов";

        return null;
    },

    fullName: (fullName) => {
        const fullNameRegex = /[а-яА-ЯёЁ]/;
        if (!fullName?.trim()) return "Полное имя обязательно";
        if (fullName.trim().length < 2) return "Минимум 2 символа";
        if (!fullNameRegex.test(fullName.trim())) return "Имя должно содержать только кириллицу";
        return null;
    },

    confirmPassword: (confirmPassword, { password }) => {
        if (!confirmPassword) return "Подтвердите пароль";
        if (password !== confirmPassword) return "Пароли не совпадают";
        return null;
    },

    verificationCode: (code) => {
        if (!code?.trim()) return "Код верификации обязателен";
        if (!/^\d{6}$/.test(code.trim())) return "Код должен состоять из 6 цифр";
        return null;
    }
};
