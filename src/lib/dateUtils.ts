import { format, addDays } from 'date-fns';
import { ko } from 'date-fns/locale';
import Holidays from 'date-holidays';

const hd = new Holidays('KR');

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, 'yyyy-MM-dd', { locale: ko });
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ko-KR').format(amount);
}

export function getMonthStartDate(
  year: number,
  month: number,
  startDay: number
): Date {
  // 해당 월의 시작일을 계산
  let startDate = new Date(year, month - 1, startDay);

  // 주말이나 공휴일인 경우 이전 평일로 조정
  while (
    startDate.getDay() === 0 ||
    startDate.getDay() === 6 ||
    hd.isHoliday(startDate)
  ) {
    startDate = addDays(startDate, -1);
  }

  return startDate;
}

export function getMonthEndDate(startDate: Date): Date {
  const endDate = new Date(startDate);
  endDate.setMonth(endDate.getMonth() + 1);
  endDate.setDate(endDate.getDate() - 1);
  return endDate;
}

export function getWeeklyBudgets(
  startDate: Date,
  endDate: Date
): Array<{ startDate: Date; endDate: Date }> {
  const weeks = [];
  const currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    const weekStart = new Date(currentDate);
    const weekEnd = new Date(currentDate);
    weekEnd.setDate(weekEnd.getDate() + 6);

    weeks.push({
      startDate: weekStart,
      endDate: weekEnd,
    });

    currentDate.setDate(currentDate.getDate() + 7);
  }

  return weeks;
}

export function getCurrentWeek(startDate: Date): number {
  const now = new Date();
  const diffTime = now.getTime() - startDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.ceil(diffDays / 7);
}
