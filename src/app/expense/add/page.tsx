'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  getBudget,
  getCategories,
  saveExpense,
  generateId,
} from '@/lib/storage';
import { formatCurrency } from '@/lib/dateUtils';
import { Budget, Category, Expense } from '@/types';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Plus } from 'lucide-react';
import Link from 'next/link';

export default function AddExpensePage() {
  const router = useRouter();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedBudget = getBudget();
    const savedCategories = getCategories();

    setBudget(savedBudget);
    setCategories(savedCategories);

    // 오늘 날짜를 기본값으로 설정
    const today = new Date().toISOString().split('T')[0];
    setDate(today);

    // 첫 번째 카테고리를 기본값으로 설정
    if (savedCategories.length > 0) {
      setCategory(savedCategories[0].id);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!budget) {
      alert('먼저 예산을 설정해주세요.');
      router.push('/settings');
      return;
    }

    if (!title || !amount || !category || !date) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const amountNum = parseInt(amount);
    if (amountNum <= 0) {
      alert('금액은 0보다 커야 합니다.');
      return;
    }

    setLoading(true);

    try {
      const selectedCategory = categories.find((c) => c.id === category);
      if (!selectedCategory) {
        throw new Error('카테고리를 찾을 수 없습니다.');
      }

      const newExpense: Expense = {
        id: generateId(),
        title: title.trim(),
        amount: amountNum,
        category: selectedCategory.name,
        date: new Date(date).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      saveExpense(newExpense);

      alert('지출이 저장되었습니다.');
      router.push('/expense/list');
    } catch (error) {
      alert('지출 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (!budget) {
    return (
      <div className="text-center py-8 sm:py-12">
        <div className="max-w-md mx-auto px-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            예산을 먼저 설정해주세요
          </h2>
          <p className="text-gray-600 mb-8">
            지출을 입력하기 전에 월 예산을 설정해야 합니다.
          </p>
          <Link href="/settings">
            <Button size="lg">예산 설정하기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4 sm:space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
              <span className="hidden sm:inline">뒤로</span>
            </Button>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            지출 입력
          </h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>새로운 지출 추가</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <Input
                label="지출 항목"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="예: 점심식사"
                required
              />
            </div>

            <div>
              <Input
                label="금액 (원)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="예: 15000"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                카테고리
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required>
                <option value="">카테고리 선택</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.icon} {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Input
                label="날짜"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button
                type="submit"
                disabled={loading || !title || !amount || !category || !date}
                className="flex-1">
                <Save className="w-4 h-4 mr-2" />
                지출 저장
              </Button>

              <Link href="/expense/list">
                <Button
                  variant="secondary"
                  type="button"
                  className="flex-1 sm:flex-none">
                  취소
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* 현재 예산 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>현재 예산 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm sm:text-base text-gray-600">
                월 예산:
              </span>
              <span className="text-sm sm:text-base font-semibold">
                {formatCurrency(budget.amount)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm sm:text-base text-gray-600">
                시작일:
              </span>
              <span className="text-sm sm:text-base font-semibold">
                {budget.startDay}일
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
