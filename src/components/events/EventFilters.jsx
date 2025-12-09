import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Filter, X } from "lucide-react";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { cn } from "@/lib/utils";

const categories = [ // могут быть другими, но расчет на корпоративное направление платформы
    "Корпоратив",
    "Тимбилдинг",
    "Обучение",
    "Конференция",
    "Праздник",
    "Волонтерство",
    "Спорт"
];

const EventFilters = ({ filters, onFilterChange }) => {
    const [dateFrom, setDateFrom] = useState(filters.dateFrom ? new Date(filters.dateFrom) : null);
    const [dateTo, setDateTo] = useState(filters.dateTo ? new Date(filters.dateTo) : null);
    const [isOpen, setIsOpen] = useState(false);

    const handleApply = () => {
        const newFilters = {
            ...filters,
            dateFrom: dateFrom ? format(dateFrom, "yyyy-MM-dd") : "",
            dateTo: dateTo ? format(dateTo, "yyyy-MM-dd") : ""
        };

        onFilterChange(newFilters);
        setIsOpen(false);
    };

    const handleClear = () => {
        const clearedFilters = {
            category: null,
            dateFrom: null,
            dateTo: null,
            participants: null,
        };
        setDateFrom(null);
        setDateTo(null);
        onFilterChange(clearedFilters);
    };

    const hasActiveFilters = Object.values(filters).some(value => !!value);

    return (
        <div className="border rounded-lg bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <Filter className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">Фильтры событий</h3>
                </div>

                {hasActiveFilters && (
                    <Button variant="ghost" size="sm" onClick={handleClear}>
                        <X className="h-4 w-4 mr-1" />
                        Сбросить все
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Категория */}
                <div className="space-y-2">
                    <Label htmlFor="category">Категория</Label>
                    <Select
                        value={filters.category}
                        onValueChange={(value) => onFilterChange({...filters, category: value})}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Все категории" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={null}>Все категории</SelectItem>
                            {categories.map(category => (
                                <SelectItem key={category} value={category}>
                                    {category}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Дата начала */}
                <div className="space-y-2">
                    <Label>Дата начала</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !dateFrom && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateFrom ? (
                                    format(dateFrom, "PPP", { locale: ru })
                                ) : (
                                    "Любая дата"
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={dateFrom}
                                onSelect={setDateFrom}
                                autoFocus
                                locale={ru}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Дата окончания */}
                <div className="space-y-2">
                    <Label>Дата окончания</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !dateTo && "text-muted-foreground"
                                )}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateTo ? (
                                    format(dateTo, "PPP", { locale: ru })
                                ) : (
                                    "Любая дата"
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={dateTo}
                                onSelect={setDateTo}
                                autoFocus
                                locale={ru}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Количество участников */}
                <div className="space-y-2">
                    <Label htmlFor="participants">Участников</Label>
                    <Select
                        value={filters.participants}
                        onValueChange={(value) => onFilterChange({...filters, participants: value})}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Любое количество" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={null}>Любое количество</SelectItem>
                            <SelectItem value="10">До 10 человек</SelectItem>
                            <SelectItem value="20">До 20 человек</SelectItem>
                            <SelectItem value="50">До 50 человек</SelectItem>
                            <SelectItem value="100">До 100 человек</SelectItem>
                            <SelectItem value="200">Более 100 человек</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Активные фильтры */}
            {hasActiveFilters && (
                <div className="mt-6 pt-6 border-t">
                    <h4 className="text-sm font-medium mb-3">Активные фильтры:</h4>
                    <div className="flex flex-wrap gap-2">
                        {filters.category && (
                            <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                                Категория: {filters.category}
                                <button
                                    onClick={() => onFilterChange({...filters, category: ""})}
                                    className="ml-1 hover:opacity-70"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}

                        {filters.dateFrom && (
                            <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                                С: {format(new Date(filters.dateFrom), "dd.MM.yyyy")}
                                <button
                                    onClick={() => {
                                        onFilterChange({...filters, dateFrom: ""});
                                        setDateFrom(null);
                                    }}
                                    className="ml-1 hover:opacity-70"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}

                        {filters.dateTo && (
                            <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                                По: {format(new Date(filters.dateTo), "dd.MM.yyyy")}
                                <button
                                    onClick={() => {
                                        onFilterChange({...filters, dateTo: ""});
                                        setDateTo(null);
                                    }}
                                    className="ml-1 hover:opacity-70"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}

                        {filters.participants && (
                            <div className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
                                {filters.participants === "200" ? "Более 100 человек" : `До ${filters.participants} человек`}
                                <button
                                    onClick={() => onFilterChange({...filters, participants: ""})}
                                    className="ml-1 hover:opacity-70"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Кнопки действий */}
            <div className="flex justify-end gap-3 mt-8">
                <Button variant="outline" onClick={handleClear}>
                    Сбросить
                </Button>
                <Button onClick={handleApply}>
                    Применить фильтры
                </Button>
            </div>
        </div>
    );
};

export default EventFilters;
