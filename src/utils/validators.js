export const validators = {
    email: (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email?.trim()) return "Email обязателен";
        if (!emailRegex.test(email)) return "Некорректный формат email";
        return null;
    },

    password: (password) => {
        if (!password) return "Пароль обязателен";
        if (password.length < 8) return "Минимум 8 символов";
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
