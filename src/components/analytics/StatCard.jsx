import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const StatCard = ({ title, value, unit, icon: Icon, loading = false, trend }) => {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
            </CardHeader>
            <CardContent>
                {loading ? (
                    <>
                        <Skeleton className="h-8 w-24 mb-1" />
                        <Skeleton className="h-4 w-16" />
                    </>
                ) : (
                    <>
                        <div className="text-2xl font-bold">
                            {value.toLocaleString('ru-RU')} {unit}
                        </div>
                        {trend && (
                            <div className={`text-xs ${trend.value > 0 ? 'text-green-600' : trend.value < 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
                                {trend.value > 0 ? '+' : ''}{trend.value}% за {trend.period}
                            </div>
                        )}
                    </>
                )}
            </CardContent>
        </Card>
    );
};
