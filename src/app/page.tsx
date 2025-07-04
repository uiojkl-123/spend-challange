'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getBudget } from '@/lib/storage';
import { getBudgetStats } from '@/lib/budgetUtils';
import { formatCurrency, formatDate } from '@/lib/dateUtils';
import { Budget, BudgetStats } from '@/types';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [stats, setStats] = useState<BudgetStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      const savedBudget = getBudget();
      setBudget(savedBudget);

      if (savedBudget) {
        const budgetStats = getBudgetStats(savedBudget);
        setStats(budgetStats);
      }

      setLoading(false);
    };

    loadData();

    // LocalStorage 변경 감지를 위한 이벤트 리스너
    const handleStorageChange = () => {
      loadData();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-gray-500">로딩 중...</div>
      </div>
    );
  }

  if (!budget) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            예산을 설정해주세요
          </h2>
          <p className="text-gray-600 mb-8">
            월 예산을 설정하고 시작일을 지정하면 주간 예산이 자동으로
            계산됩니다.
          </p>
          <Link href="/settings">
            <Button size="lg">예산 설정하기</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div>통계를 불러오는 중...</div>;
  }

  const currentWeek = stats.weeklyBudgets.find(
    (w) =>
      new Date() >= new Date(w.startDate) && new Date() <= new Date(w.endDate)
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            대시보드
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            {formatDate(new Date(budget.startDate))} ~{' '}
            {formatDate(
              (() => {
                const end = new Date(budget.startDate);
                end.setMonth(end.getMonth() + 1);
                end.setDate(end.getDate() - 1);
                return end;
              })()
            )}
          </p>
        </div>
        <Link href="/expense/add">
          <Button className="w-full sm:w-auto">지출 추가</Button>
        </Link>
      </div>

      {/* 주요 통계 카드들 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  총 예산
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalBudget)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-red-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  총 지출
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalSpent)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  남은 예산
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.totalRemaining)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  이번 주 예산
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {formatCurrency(stats.currentWeekBudget)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 이번 주 상세 정보 */}
      {currentWeek && (
        <Card>
          <CardHeader>
            <CardTitle>이번 주 예산 현황</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-600">주간 예산</p>
                <p className="text-lg sm:text-2xl font-bold text-blue-600">
                  {formatCurrency(currentWeek.budget)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-600">지출액</p>
                <p className="text-lg sm:text-2xl font-bold text-red-600">
                  {formatCurrency(currentWeek.spent)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-600">남은 금액</p>
                <p
                  className={`text-lg sm:text-2xl font-bold ${
                    currentWeek.remaining >= 0
                      ? 'text-green-600'
                      : 'text-red-600'
                  }`}>
                  {formatCurrency(currentWeek.remaining)}
                </p>
              </div>
            </div>

            {/* 진행률 바 */}
            <div className="mt-4 sm:mt-6">
              <div className="flex justify-between text-xs sm:text-sm text-gray-600 mb-2">
                <span>예산 사용률</span>
                <span>
                  {Math.round((currentWeek.spent / currentWeek.budget) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    currentWeek.spent / currentWeek.budget > 1
                      ? 'bg-red-500'
                      : currentWeek.spent / currentWeek.budget > 0.8
                      ? 'bg-yellow-500'
                      : 'bg-green-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      (currentWeek.spent / currentWeek.budget) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 주간 예산 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>주간 예산 현황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    주차
                  </th>
                  <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    기간
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    예산
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    지출
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    남은 금액
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.weeklyBudgets.map((week) => (
                  <tr
                    key={week.weekNumber}
                    className={
                      currentWeek?.weekNumber === week.weekNumber
                        ? 'bg-blue-50'
                        : ''
                    }>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                      {week.weekNumber}주차
                    </td>
                    <td className="hidden sm:table-cell px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-500">
                      {formatDate(week.startDate)} ~ {formatDate(week.endDate)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {formatCurrency(week.budget)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                      {formatCurrency(week.spent)}
                    </td>
                    <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm">
                      <span
                        className={
                          week.remaining >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }>
                        {formatCurrency(week.remaining)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
