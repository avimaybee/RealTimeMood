
"use client";
import React from 'react';
import type { UserDailyMoodSummary } from '@/types';
import { getCalendarGridDates, formatDateKey } from '@/lib/date-utils';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface MoodCalendarProps {
    data: UserDailyMoodSummary[];
}

const WEEK_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const MoodCalendar: React.FC<MoodCalendarProps> = ({ data }) => {
    const calendarDays = getCalendarGridDates();
    
    const dataMap = new Map<string, UserDailyMoodSummary>();
    data.forEach(day => dataMap.set(day.date, day));

    let lastMonth = -1;

    return (
        <TooltipProvider delayDuration={100}>
            <div className="flex justify-center p-4 frosted-glass rounded-2xl">
                <div className="flex gap-1 md:gap-1.5">
                    {/* Day labels on the side */}
                    <div className="flex flex-col gap-1 md:gap-1.5 text-xs text-muted-foreground mt-6">
                        <div className="h-3 w-8" />
                        <div className="h-3 md:h-4 flex items-center">Mon</div>
                        <div className="h-3 w-8" />
                        <div className="h-3 md:h-4 flex items-center">Wed</div>
                        <div className="h-3 w-8" />
                        <div className="h-3 md:h-4 flex items-center">Fri</div>
                        <div className="h-3 w-8" />
                    </div>

                    <div className="flex flex-col">
                        {/* Month labels on top */}
                         <div className="grid grid-cols-53 grid-flow-col gap-1 md:gap-1.5 text-xs text-muted-foreground mb-1">
                            {calendarDays.map(({ date }, index) => {
                                if (!date) return <div key={`placeholder-month-${index}`} />;
                                const month = date.getMonth();
                                const shouldShowMonth = month !== lastMonth;
                                lastMonth = month;
                                if(shouldShowMonth && index > 0) {
                                    return <div key={format(date, 'MMM')} className="col-start-auto">{format(date, 'MMM')}</div>;
                                }
                                return <div key={`empty-month-${index}`}></div>;
                            })}
                        </div>
                        {/* The Grid */}
                        <div className="grid grid-flow-col grid-rows-7 gap-1 md:gap-1.5">
                            {calendarDays.map(({ date }, index) => {
                                if (!date) {
                                    return <div key={`empty-${index}`} className="h-3 w-3 md:h-4 md:w-4 bg-transparent rounded-sm" />;
                                }

                                const dateKey = formatDateKey(date);
                                const dayData = dataMap.get(dateKey);

                                if (!dayData) {
                                    return (
                                        <Tooltip>
                                            <TooltipTrigger asChild>
                                                <div className="h-3 w-3 md:h-4 md:w-4 bg-muted/30 rounded-sm" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                                <p>{format(date, 'MMMM d, yyyy')}</p>
                                                <p className="text-muted-foreground">No moods recorded.</p>
                                            </TooltipContent>
                                        </Tooltip>
                                    );
                                }
                                
                                const opacity = 0.2 + (Math.min(dayData.contributionCount, 5) / 5) * 0.8;

                                return (
                                    <Tooltip key={dateKey}>
                                        <TooltipTrigger asChild>
                                            <div
                                                className="h-3 w-3 md:h-4 md:w-4 rounded-sm"
                                                style={{
                                                    backgroundColor: `hsla(${dayData.averageHue}, 80%, 65%, ${opacity})`,
                                                }}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p className="font-semibold">{format(date, 'MMMM d, yyyy')}</p>
                                            <p>Dominant mood: <span style={{color: `hsl(${dayData.averageHue}, 80%, 65%)`}}>{dayData.dominantAdjective}</span></p>
                                            <p className="text-muted-foreground">{dayData.contributionCount} contribution{dayData.contributionCount > 1 ? 's' : ''}</p>
                                        </TooltipContent>
                                    </Tooltip>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </TooltipProvider>
    );
};

// Add a new definition for grid-cols-53
const style = document.createElement('style');
style.innerHTML = `
    .grid-cols-53 {
        grid-template-columns: repeat(53, minmax(0, 1fr));
    }
`;
if (typeof window !== 'undefined') {
    document.head.appendChild(style);
}


export default MoodCalendar;
