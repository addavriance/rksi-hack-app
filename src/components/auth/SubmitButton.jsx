import {LoaderCircle} from "lucide-react";
import {Button} from "../ui/button";

export const SubmitButton = ({
                                 isLoading, loadingText, defaultText,
                                 icon: Icon, disabled,
                                 className = "", variant = "default"
                             }) => {
    return (
        <Button
            type="submit"
            className={`w-full h-11 select-none ${className}`}
            disabled={isLoading || disabled}
            size="sm"
            variant={variant}
        >
            {isLoading ? (
                <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin"/>
                    {loadingText}
                </>
            ) : (
                <>
                    {Icon && <Icon className="mr-2 h-4 w-4"/>}
                    {defaultText}
                </>
            )}
        </Button>
    );
};
