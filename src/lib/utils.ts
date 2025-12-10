import {clsx, type ClassValue} from "clsx"
import {twMerge} from "tailwind-merge"
import {AxiosError} from "axios";

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export const isProtectedPath = (path?: string) => {
    if (path) {
        return !(path.includes('/login')
            || path.includes('/register')
            || path.includes('/verify')
            || path.includes('/recovery')
            || path.includes('/404'))
    }
    return !(document.location.pathname.includes('/login')
        || document.location.pathname.includes('/register')
        || document.location.pathname.includes('/verify')
        || document.location.pathname.includes('/recovery')
        || document.location.pathname.includes('/404'))
}

export const redirectTo = (path: string) => {
    if (!document.location.pathname.includes(path)) {
        document.location.pathname = path
    }
}

// Словарь переводов для типичных Pydantic ошибок на русский
const ERROR_TRANSLATIONS: Record<string, string> = {
    'Field required': 'Обязательное поле',
    'value is not a valid email address': 'Неверный формат email',
    'value is not a valid integer': 'Должно быть целым числом',
    'value is too short': 'Значение слишком короткое',
    'value is too long': 'Значение слишком длинное',
    'ensure this value is greater than or equal to': 'Значение должно быть не меньше',
    'ensure this value is less than or equal to': 'Значение должно быть не больше'
};


export const handlePydanticError = (error: AxiosError<any>) => {
    const detail = error.response?.data?.detail;

    if (typeof detail === 'string') {
        return detail;
    }

    if (Array.isArray(detail) && detail.length > 0) {
        const fieldNames = detail.map(err => {
            const loc = Array.isArray(err.loc) ? err.loc.slice(1).join('.') : 'неизвестное поле';
            return loc.replace(/__/g, '.'); // body__user__email -> body.user.email
        });

        const translatedMsgs = detail.map(err => {
            const msg = err.msg || 'Неизвестная ошибка';
            return ERROR_TRANSLATIONS[msg] || msg;
        });

        if (detail.length === 1) {
            return `Поле "${fieldNames[0]}": ${translatedMsgs[0]}`;
        } else {
            return fieldNames.map((field, i) => `Поле "${field}": ${translatedMsgs[i]}`).join('; ');
        }
    }

    return 'Произошла ошибка при авторизации';
};
