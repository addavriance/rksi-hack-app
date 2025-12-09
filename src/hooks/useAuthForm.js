import { useState } from "react";
import { toast } from "sonner";
import { handlePydanticError } from "@/lib/utils.ts";

export const useAuthForm = (initialState, validators) => {
    const [formData, setFormData] = useState(initialState);
    const [errors, setErrors] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: "" }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        for (const [field, value] of Object.entries(formData)) {
            if (validators[field]) {
                const error = validators[field](value, formData);
                if (error) newErrors[field] = error;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (event, submitFn) => {
        !!event && event.preventDefault();

        if (!validateForm()) {
            toast.error("Пожалуйста, исправьте ошибки в форме");
            return;
        }

        setIsSubmitting(true);

        try {
            await submitFn(formData);
        } catch (error) {
            console.error("Form error:", error);
            toast.error(handlePydanticError(error));
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        formData,
        errors,
        isSubmitting,
        updateField,
        handleSubmit,
        setErrors
    };
};
