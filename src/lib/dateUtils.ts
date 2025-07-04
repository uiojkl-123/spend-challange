import { format, addDays, startOfWeek, endOfWeek, addMonths } from 'date-fns';
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

export function getNextMonthStartDate(startDate: Date): Date {
  // 다음 달의 같은 날짜를 계산
  const nextMonthDate = addMonths(startDate, 1);

  // 다음 달 startDate의 전날을 반환
  const endDate = new Date(nextMonthDate);
  endDate.setDate(endDate.getDate() - 1);

  return endDate;
}

export function getWeeklyBudgets(
  startDate: Date,
  endDate: Date
): Array<{ startDate: Date; endDate: Date }> {
  const weeks = [];

  // 시작일이 속한 주의 월요일부터 시작
  let currentWeekStart = startOfWeek(startDate, { weekStartsOn: 1 }); // 1 = 월요일
  let currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 }); // 일요일

  while (currentWeekStart <= endDate) {
    // 주차가 시작일과 종료일 범위에 포함되는 경우만 추가
    if (currentWeekEnd >= startDate) {
      weeks.push({
        startDate: new Date(currentWeekStart),
        endDate: new Date(currentWeekEnd),
      });
    }

    // 다음 주로 이동 (7일 후)
    currentWeekStart = addDays(currentWeekStart, 7);
    currentWeekEnd = addDays(currentWeekEnd, 7);
  }

  return weeks;
}

export function getCurrentWeek(startDate: Date): number {
  const now = new Date();
  const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 });
  const startOfBudgetWeek = startOfWeek(startDate, { weekStartsOn: 1 });

  const diffTime = startOfCurrentWeek.getTime() - startOfBudgetWeek.getTime();
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));

  return diffWeeks + 1;
}
