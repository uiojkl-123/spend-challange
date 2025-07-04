'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { getExpenses, getBudget } from '@/lib/storage';
import { formatCurrency, formatDate } from '@/lib/dateUtils';
import { Expense, Budget } from '@/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TrendingUp, Calendar, DollarSign } from 'lucide-react';

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
];

export default function StatsPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState<Budget | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      const savedExpenses = getExpenses();
      const savedBudget = getBudget();

      setExpenses(savedExpenses);
      setBudget(savedBudget);
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
            예산을 먼저 설정해주세요
          </h2>
          <p className="text-gray-600 mb-8">
            통계를 보려면 먼저 예산을 설정해야 합니다.
          </p>
        </div>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            지출 데이터가 없습니다
          </h2>
          <p className="text-gray-600 mb-8">
            지출을 입력하면 통계를 확인할 수 있습니다.
          </p>
        </div>
      </div>
    );
  }

  // 카테고리별 지출 집계
  const categoryStats = expenses.reduce((acc, expense) => {
    const category = expense.category;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += expense.amount;
    return acc;
  }, {} as Record<string, number>);

  // 일별 지출 집계 (최근 30일)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dailyStats = expenses
    .filter((expense) => new Date(expense.date) >= thirtyDaysAgo)
    .reduce((acc, expense) => {
      const date = formatDate(new Date(expense.date));
      if (!acc[date]) {
        acc[date] = 0;
      }
      acc[date] += expense.amount;
      return acc;
    }, {} as Record<string, number>);

  // 차트 데이터 변환
  const categoryChartData = Object.entries(categoryStats).map(
    ([name, value]) => ({
      name,
      value,
    })
  );

  const dailyChartData = Object.entries(dailyStats)
    .sort((a, b) => new Date(a[0]).getTime() - new Date(b[0]).getTime())
    .map(([date, amount]) => ({
      date,
      amount,
    }));

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);
  const averageDaily = totalSpent / Math.max(dailyChartData.length, 1);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          지출 통계
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          지출 패턴을 분석하고 예산 관리를 개선하세요
        </p>
      </div>

      {/* 주요 통계 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  총 지출
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {formatCurrency(totalSpent)}
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
                  평균 일일 지출
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {formatCurrency(Math.round(averageDaily))}
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
                  지출 건수
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {expenses.length}건
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 카테고리별 지출 파이 차트 */}
      {categoryChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>카테고리별 지출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value">
                    {categoryChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 일별 지출 바 차트 */}
      {dailyChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>최근 30일 일별 지출</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 sm:h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={{ fontSize: 12 }}
                    tickFormatter={(value) => formatCurrency(value)}
                  />
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                    labelFormatter={(label) => `날짜: ${label}`}
                  />
                  <Bar dataKey="amount" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 카테고리별 상세 통계 */}
      <Card>
        <CardHeader>
          <CardTitle>카테고리별 상세 통계</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    카테고리
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    총액
                  </th>
                  <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    비율
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {Object.entries(categoryStats)
                  .sort(([, a], [, b]) => b - a)
                  .map(([category, amount]) => (
                    <tr key={category}>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm font-medium text-gray-900">
                        {category}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {formatCurrency(amount)}
                      </td>
                      <td className="px-3 sm:px-6 py-4 whitespace-nowrap text-xs sm:text-sm text-gray-900">
                        {((amount / totalSpent) * 100).toFixed(1)}%
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
