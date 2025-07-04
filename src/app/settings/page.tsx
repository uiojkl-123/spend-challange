'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { getBudget, saveBudget, deleteBudget } from '@/lib/storage';
import { getMonthStartDate, formatDate } from '@/lib/dateUtils';
import { Budget } from '@/types';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const router = useRouter();
  const [budget, setBudget] = useState<Budget | null>(null);
  const [amount, setAmount] = useState('');
  const [startDay, setStartDay] = useState('5');
  const [loading, setLoading] = useState(false);
  const [previewDate, setPreviewDate] = useState<string>('');

  useEffect(() => {
    const savedBudget = getBudget();
    if (savedBudget) {
      setBudget(savedBudget);
      setAmount(savedBudget.amount.toString());
      setStartDay(savedBudget.startDay.toString());
    }
  }, []);

  useEffect(() => {
    if (startDay && amount) {
      const now = new Date();
      const startDate = getMonthStartDate(
        now.getFullYear(),
        now.getMonth() + 1,
        parseInt(startDay)
      );
      setPreviewDate(formatDate(startDate));
    }
  }, [startDay, amount]);

  const handleSave = async () => {
    if (!amount || !startDay) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const amountNum = parseInt(amount);
    const startDayNum = parseInt(startDay);

    if (amountNum <= 0) {
      alert('예산은 0보다 커야 합니다.');
      return;
    }

    if (startDayNum < 1 || startDayNum > 31) {
      alert('시작일은 1일부터 31일 사이여야 합니다.');
      return;
    }

    setLoading(true);

    try {
      const now = new Date();
      const startDate = getMonthStartDate(
        now.getFullYear(),
        now.getMonth() + 1,
        startDayNum
      );

      const newBudget: Budget = {
        id: budget?.id || Date.now().toString(),
        amount: amountNum,
        startDay: startDayNum,
        startDate: startDate.toISOString(),
        createdAt: budget?.createdAt || new Date().toISOString(),
      };

      saveBudget(newBudget);
      setBudget(newBudget);

      alert('예산이 저장되었습니다.');
      router.push('/');
    } catch (error) {
      alert('예산 저장 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (confirm('정말로 예산을 삭제하시겠습니까? 모든 데이터가 삭제됩니다.')) {
      deleteBudget();
      setBudget(null);
      setAmount('');
      setStartDay('5');
      alert('예산이 삭제되었습니다.');
    }
  };

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
            예산 설정
          </h1>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>월 예산 설정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6">
          <div>
            <Input
              label="월 예산 (원)"
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="예: 1000000"
              min="0"
            />
          </div>

          <div>
            <Input
              label="월 시작일"
              type="number"
              value={startDay}
              onChange={(e) => setStartDay(e.target.value)}
              placeholder="예: 5"
              min="1"
              max="31"
            />
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              월급날을 기준으로 설정하세요. 주말이나 공휴일인 경우 자동으로 이전
              평일로 조정됩니다.
            </p>
          </div>

          {previewDate && (
            <div className="p-3 sm:p-4 bg-blue-50 rounded-lg">
              <p className="text-xs sm:text-sm text-blue-800">
                <strong>다음 예산 시작일:</strong> {previewDate}
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <Button
              onClick={handleSave}
              disabled={loading || !amount || !startDay}
              className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {budget ? '예산 수정' : '예산 설정'}
            </Button>

            {budget && (
              <Button
                variant="danger"
                onClick={handleDelete}
                disabled={loading}
                className="flex-1 sm:flex-none">
                <Trash2 className="w-4 h-4 mr-2" />
                예산 삭제
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {budget && (
        <Card>
          <CardHeader>
            <CardTitle>현재 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex justify-between">
                <span className="text-sm sm:text-base text-gray-600">
                  월 예산:
                </span>
                <span className="text-sm sm:text-base font-semibold">
                  {new Intl.NumberFormat('ko-KR').format(budget.amount)}원
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
              <div className="flex justify-between">
                <span className="text-sm sm:text-base text-gray-600">
                  현재 예산 시작일:
                </span>
                <span className="text-sm sm:text-base font-semibold">
                  {formatDate(budget.startDate)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
