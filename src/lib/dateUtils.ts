import Holidays from 'date-holidays';
import {
  format,
  addDays,
  subDays,
  startOfMonth,
  endOfMonth,
  eachWeekOfInterval,
  startOfWeek,
  endOfWeek,
  isWeekend,
  isSameDay,
} from 'date-fns';
import { ko } from 'date-fns/locale';

const hd = new Holidays('KR');

export const getNextWorkday = (date: Date): Date => {
  let currentDate = new Date(date);

  while (isWeekend(currentDate) || hd.isHoliday(currentDate)) {
    currentDate = subDays(currentDate, 1);
  }

  return currentDate;
};

export const getMonthStartDate = (
  year: number,
  month: number,
  startDay: number
): Date => {
  const firstDayOfMonth = new Date(year, month - 1, startDay);

  // 시작일이 주말이나 공휴일인 경우 이전 평일로 조정
  if (isWeekend(firstDayOfMonth) || hd.isHoliday(firstDayOfMonth)) {
    return getNextWorkday(firstDayOfMonth);
  }

  return firstDayOfMonth;
};

export const getMonthEndDate = (startDate: Date): Date => {
  const nextMonth = new Date(startDate);
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  return subDays(nextMonth, 1);
};

export const getWeeklyBudgets = (
  startDate: Date,
  endDate: Date,
  totalBudget: number
): Array<{ startDate: Date; endDate: Date }> => {
  const weeks = eachWeekOfInterval(
    { start: startDate, end: endDate },
    { weekStartsOn: 1 }
  );

  return weeks.map((weekStart) => ({
    startDate: startOfWeek(weekStart, { weekStartsOn: 1 }),
    endDate: endOfWeek(weekStart, { weekStartsOn: 1 }),
  }));
};

export const formatDate = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'yyyy년 MM월 dd일', { locale: ko });
};

export const formatDateShort = (date: Date | string): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return format(dateObj, 'MM/dd', { locale: ko });
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('ko-KR').format(amount);
};

export const getCurrentWeek = (startDate: Date): number => {
  const now = new Date();
  const weeks = getWeeklyBudgets(startDate, getMonthEndDate(startDate), 0);

  for (let i = 0; i < weeks.length; i++) {
    if (now >= weeks[i].startDate && now <= weeks[i].endDate) {
      return i + 1;
    }
  }

  return 1;
};
