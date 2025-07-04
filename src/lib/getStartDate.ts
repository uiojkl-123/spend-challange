import { getMonthStartDate } from './dateUtils';

export function getStartDate(
  year: number,
  month: number,
  startDay: number
): Date {
  const date = getMonthStartDate(year, month, startDay);
  return date;
}
