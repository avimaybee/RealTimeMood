
import { 
    startOfYear, 
    endOfYear, 
    eachDayOfInterval, 
    getDay, 
    format,
    sub,
} from 'date-fns';

/**
 * Generates an array of date objects for the last 365 days,
 * including empty placeholder days to align the first day of the
 * data to the correct day of the week in a grid.
 * 
 * @returns An array of { date: Date | null } objects.
 */
export function getCalendarGridDates(): { date: Date | null }[] {
    const today = new Date();
    const oneYearAgo = sub(today, { years: 1 });
    
    const interval = {
      start: oneYearAgo,
      end: today
    };

    const days = eachDayOfInterval(interval);

    // Get the day of the week for the first day (0=Sun, 1=Mon, ..., 6=Sat)
    const firstDayOfWeek = getDay(days[0]);

    // Create an array of empty placeholders to align the grid
    const placeholders = Array.from({ length: firstDayOfWeek }, () => ({ date: null }));

    const dateObjects = days.map(d => ({ date: d }));

    return [...placeholders, ...dateObjects];
}

/**
 * Formats a Date object into a "YYYY-MM-DD" string.
 * @param date The date to format.
 * @returns A formatted string.
 */
export function formatDateKey(date: Date): string {
    return format(date, 'yyyy-MM-dd');
}
