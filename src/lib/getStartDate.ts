import Holidays from 'date-holidays';

const hd = new Holidays('KR'); // 한국 공휴일

export function getBudgetStartDate(year: number, month: number): Date {
  let date = new Date(year, month - 1, 5);

  while (isWeekend(date) || isHoliday(date)) {
    date.setDate(date.getDate() - 1);
  }

  return date;
}

function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function isHoliday(date: Date): boolean {
  const yyyyMMdd = date.toISOString().split('T')[0];
  return !!hd.isHoliday(date);
}
