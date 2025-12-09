import {AlertCircle} from "lucide-react";
import {Input} from "../ui/input";
import {Label} from "../ui/label";

export const FormField = ({
                              id,
                              label,
                              type = "text",
                              placeholder,
                              value,
                              onChange,
                              error,
                              onClearError,
                              maxLength,
                              inputMode,
                              size = "sm"
                          }) => {
    const handleChange = (e) => {
        onChange(e.target.value);
        if (error && onClearError) onClearError();
    };

    return (
        <div className="space-y-2">
            <Label htmlFor={id}>{label}</Label>
            <Input
                size={size}
                id={id}
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={handleChange}
                className={error ? "border-red-500" : ""}
                maxLength={maxLength}
                inputMode={inputMode}
            />
            {error && (
                <p className="text-sm text-red-500 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3"/>
                    {error}
                </p>
            )}
        </div>
    );
};
