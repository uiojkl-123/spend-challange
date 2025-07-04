'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { getBudget, getExpenses, getCategories } from '@/lib/storage';
import { getBudgetStats, getExpensesByCategory } from '@/lib/budgetUtils';
import { formatCurrency, formatDate } from '@/lib/dateUtils';
import { Budget, BudgetStats, Expense } from '@/types';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Calendar } from 'lucide-react';

const COLORS = [
  '#0088FE',
  '#00C49F',
  '#FFBB28',
  '#FF8042',
  '#8884D8',
  '#82CA9D',
];

export default function StatsPage() {
  const [budget, setBudget] = useState<Budget | null>(null);
  const [stats, setStats] = useState<BudgetStats | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      const savedBudget = getBudget();
      const savedExpenses = getExpenses();
      const savedCategories = getCategories();

      setBudget(savedBudget);
      setExpenses(savedExpenses);
      setCategories(savedCategories);

      if (savedBudget) {
        const budgetStats = getBudgetStats(savedBudget);
        setStats(budgetStats);
      }

      setLoading(false);
    };

    loadData();
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
            통계를 보기 위해 먼저 예산을 설정해야 합니다.
          </p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return <div>통계를 불러오는 중...</div>;
  }

  // 카테고리별 지출 데이터
  const categoryData = getExpensesByCategory(expenses);
  const pieChartData = categoryData.map((item, index) => ({
    name: item.category,
    value: item.amount,
    color: COLORS[index % COLORS.length],
  }));

  // 주간 예산 차트 데이터
  const weeklyChartData = stats.weeklyBudgets.map((week, index) => ({
    week: `${week.weekNumber}주차`,
    budget: week.budget,
    spent: week.spent,
    remaining: week.remaining,
  }));

  // 월별 지출 추이 (최근 6개월)
  const monthlyData = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthExpenses = expenses.filter((expense) => {
      const expenseDate = new Date(expense.date);
      return (
        expenseDate.getFullYear() === month.getFullYear() &&
        expenseDate.getMonth() === month.getMonth()
      );
    });

    const totalAmount = monthExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    monthlyData.push({
      month: `${month.getFullYear()}년 ${month.getMonth() + 1}월`,
      amount: totalAmount,
    });
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 헤더 */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          통계 및 분석
        </h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">
          예산 사용 현황과 지출 패턴을 분석해보세요
        </p>
      </div>

      {/* 주요 통계 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <DollarSign className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600" />
              </div>
              <div className="ml-3 sm:ml-4">
                <p className="text-xs sm:text-sm font-medium text-gray-600">
                  예산 달성률
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {Math.round((stats.totalSpent / stats.totalBudget) * 100)}%
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
                  일평균 지출
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {formatCurrency(Math.round(stats.totalSpent / 30))}
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
                  주평균 지출
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {formatCurrency(Math.round(stats.totalSpent / 4))}
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
                  예산 초과
                </p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {stats.totalRemaining < 0
                    ? formatCurrency(Math.abs(stats.totalRemaining))
                    : '0원'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 카테고리별 지출 파이 차트 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>카테고리별 지출 비율</CardTitle>
          </CardHeader>
          <CardContent>
            {pieChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieChartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value">
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-8 sm:py-12 text-gray-500">
                지출 데이터가 없습니다.
              </div>
            )}
          </CardContent>
        </Card>

        {/* 카테고리별 상세 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>카테고리별 상세</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              {categoryData.map((item, index) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 sm:space-x-3">
                    <div
                      className="w-3 h-3 sm:w-4 sm:h-4 rounded"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-sm sm:text-base font-medium">
                      {item.category}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm sm:text-base font-semibold">
                      {formatCurrency(item.amount)}
                    </div>
                    <div className="text-xs sm:text-sm text-gray-500">
                      {Math.round((item.amount / stats.totalSpent) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 주간 예산 vs 실제 지출 */}
      <Card>
        <CardHeader>
          <CardTitle>주간 예산 vs 실제 지출</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={weeklyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Bar dataKey="budget" fill="#3b82f6" name="예산" />
              <Bar dataKey="spent" fill="#ef4444" name="실제 지출" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 월별 지출 추이 */}
      <Card>
        <CardHeader>
          <CardTitle>월별 지출 추이</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => formatCurrency(Number(value))} />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#3b82f6"
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* 주간 예산 상세 테이블 */}
      <Card>
        <CardHeader>
          <CardTitle>주간 예산 상세</CardTitle>
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
                    달성률
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {stats.weeklyBudgets.map((week) => (
                  <tr key={week.weekNumber}>
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
                        className={`font-medium ${
                          week.spent / week.budget > 1
                            ? 'text-red-600'
                            : week.spent / week.budget > 0.8
                            ? 'text-yellow-600'
                            : 'text-green-600'
                        }`}>
                        {Math.round((week.spent / week.budget) * 100)}%
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
