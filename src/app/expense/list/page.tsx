'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getExpenses, deleteExpense, getCategories } from '@/lib/storage';
import { formatCurrency, formatDate } from '@/lib/dateUtils';
import { Expense, Category } from '@/types';
import { Plus, Edit, Trash2, Calendar, DollarSign } from 'lucide-react';
import Link from 'next/link';

export default function ExpenseListPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterCategory, setFilterCategory] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'amount'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const savedExpenses = getExpenses();
    const savedCategories = getCategories();

    setExpenses(savedExpenses);
    setCategories(savedCategories);
  };

  const handleDelete = (id: string) => {
    if (confirm('정말로 이 지출을 삭제하시겠습니까?')) {
      deleteExpense(id);
      loadData();
      alert('지출이 삭제되었습니다.');
    }
  };

  const getCategoryIcon = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName);
    return category?.icon || '📝';
  };

  const getCategoryColor = (categoryName: string) => {
    const category = categories.find((c) => c.name === categoryName);
    return category?.color || '#6b7280';
  };

  const filteredAndSortedExpenses = expenses
    .filter((expense) => {
      if (!filterCategory) return true;
      return expense.category === filterCategory;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
      } else {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
    });

  const totalAmount = filteredAndSortedExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* 헤더 */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            지출 목록
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-1">
            총 {filteredAndSortedExpenses.length}건의 지출,{' '}
            {formatCurrency(totalAmount)}
          </p>
        </div>
        <Link href="/expense/add">
          <Button className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            지출 추가
          </Button>
        </Link>
      </div>

      {/* 필터 및 정렬 */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="w-full sm:w-auto">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                카테고리 필터
              </label>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="">전체 카테고리</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.name}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full sm:w-auto">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                정렬 기준
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'amount')}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="date">날짜</option>
                <option value="amount">금액</option>
              </select>
            </div>

            <div className="w-full sm:w-auto">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                정렬 순서
              </label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option value="desc">내림차순</option>
                <option value="asc">오름차순</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 지출 목록 */}
      {filteredAndSortedExpenses.length === 0 ? (
        <Card>
          <CardContent className="p-8 sm:p-12 text-center">
            <div className="text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                지출 내역이 없습니다
              </h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4">
                {filterCategory
                  ? '선택한 카테고리의 지출이 없습니다.'
                  : '아직 등록된 지출이 없습니다.'}
              </p>
              <Link href="/expense/add">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />첫 지출 추가하기
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 sm:space-y-4">
          {filteredAndSortedExpenses.map((expense) => (
            <Card key={expense.id}>
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                    <div
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-xl sm:text-2xl flex-shrink-0"
                      style={{
                        backgroundColor: `${getCategoryColor(
                          expense.category
                        )}20`,
                      }}>
                      {getCategoryIcon(expense.category)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                        {expense.title}
                      </h3>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 text-xs sm:text-sm text-gray-500 mt-1">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDate(new Date(expense.date))}
                        </span>
                        <span className="flex items-center">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {expense.category}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <span className="text-base sm:text-lg font-semibold text-gray-900">
                      {formatCurrency(expense.amount)}
                    </span>
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          alert('편집 기능은 추후 구현 예정입니다.');
                        }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(expense.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* 요약 정보 */}
      {filteredAndSortedExpenses.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>요약</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-600">총 지출 건수</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {filteredAndSortedExpenses.length}건
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-600">총 지출액</p>
                <p className="text-lg sm:text-2xl font-bold text-red-600">
                  {formatCurrency(totalAmount)}
                </p>
              </div>
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-600">평균 지출액</p>
                <p className="text-lg sm:text-2xl font-bold text-gray-900">
                  {formatCurrency(
                    Math.round(totalAmount / filteredAndSortedExpenses.length)
                  )}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
