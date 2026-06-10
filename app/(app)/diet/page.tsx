'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { Search, X } from 'lucide-react'
import type { FoodItem, DietLog, MealType } from '@/types'

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: '아침',
  lunch: '점심',
  dinner: '저녁',
  snack: '간식',
}
const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack']

const today = format(new Date(), 'yyyy-MM-dd')

export default function DietPage() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null)
  const [addMealType, setAddMealType] = useState<MealType>('breakfast')
  const [amount, setAmount] = useState('100')

  // 검색어 디바운스 400ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 400)
    return () => clearTimeout(timer)
  }, [query])

  const { data: searchData, isFetching: isSearching } = useQuery({
    queryKey: ['food-search', debouncedQuery],
    queryFn: async () => {
      const res = await fetch(`/api/food?q=${encodeURIComponent(debouncedQuery)}`)
      if (!res.ok) throw new Error('검색 실패')
      return res.json() as Promise<{ foods: FoodItem[] }>
    },
    enabled: debouncedQuery.length > 0,
  })

  const { data: logs = [] } = useQuery<DietLog[]>({
    queryKey: ['diet-logs', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('diet_logs')
        .select('*')
        .eq('logged_at', today)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
  })

  const addMutation = useMutation({
    mutationFn: async (log: Omit<DietLog, 'id' | 'user_id' | 'logged_at'>) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('diet_logs')
        .insert({ ...log, user_id: user!.id, logged_at: today })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['diet-logs', today] })
      setSelectedFood(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('diet_logs').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['diet-logs', today] }),
  })

  const foods: FoodItem[] = searchData?.foods ?? []
  const totalCalories = Math.round(logs.reduce((s, l) => s + l.calories, 0))

  function openAddModal(food: FoodItem) {
    setSelectedFood(food)
    setAmount(String(food.servingSize))
    setAddMealType('breakfast')
  }

  function submitAdd() {
    if (!selectedFood) return
    const ratio = parseFloat(amount) / selectedFood.servingSize
    addMutation.mutate({
      food_name: selectedFood.name,
      calories: Math.round(selectedFood.calories * ratio * 10) / 10,
      carbs: Math.round(selectedFood.carbs * ratio * 10) / 10,
      protein: Math.round(selectedFood.protein * ratio * 10) / 10,
      fat: Math.round(selectedFood.fat * ratio * 10) / 10,
      amount: parseFloat(amount),
      meal_type: addMealType,
    })
  }

  const amountNum = parseFloat(amount) || 0
  const ratio = selectedFood ? amountNum / selectedFood.servingSize : 0
  const previewKcal = selectedFood ? Math.round(selectedFood.calories * ratio) : 0
  const previewProtein = selectedFood ? Math.round(selectedFood.protein * ratio * 10) / 10 : 0
  const previewCarbs = selectedFood ? Math.round(selectedFood.carbs * ratio * 10) / 10 : 0
  const previewFat = selectedFood ? Math.round(selectedFood.fat * ratio * 10) / 10 : 0

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">식단 기록</h1>
        <span className="text-sm text-gray-400">오늘 {totalCalories} kcal</span>
      </div>

      {/* 검색창 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="음식 검색 (예: 닭가슴살, 현미밥)"
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-9 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setDebouncedQuery('') }}
            className="absolute right-3 top-1/2 -translate-y-1/2"
          >
            <X className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {/* 검색 결과 */}
      {debouncedQuery && (
        <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
          {isSearching ? (
            <p className="p-4 text-center text-sm text-gray-400">검색 중...</p>
          ) : foods.length === 0 ? (
            <p className="p-4 text-center text-sm text-gray-400">검색 결과가 없어요</p>
          ) : (
            foods.map((food) => (
              <div
                key={food.id}
                className="flex items-center justify-between border-b border-gray-50 px-4 py-3 last:border-b-0"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-gray-900">{food.name}</p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {Math.round(food.calories)} kcal · P {food.protein}g · C {food.carbs}g · F{' '}
                    {food.fat}g
                    <span className="ml-1">/ {food.servingSize}{food.servingUnit}</span>
                  </p>
                </div>
                <button
                  onClick={() => openAddModal(food)}
                  className="ml-3 shrink-0 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600"
                >
                  추가
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {/* 식사별 기록 */}
      {MEAL_ORDER.map((meal) => {
        const mealLogs = logs.filter((l) => l.meal_type === meal)
        if (mealLogs.length === 0) return null
        const mealCalories = Math.round(mealLogs.reduce((s, l) => s + l.calories, 0))
        return (
          <div key={meal} className="rounded-xl bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-sm font-semibold text-gray-800">{MEAL_LABELS[meal]}</span>
              <span className="text-xs text-gray-400">{mealCalories} kcal</span>
            </div>
            {mealLogs.map((log) => (
              <div key={log.id} className="flex items-center justify-between py-1.5">
                <div className="min-w-0 flex-1">
                  <span className="text-sm text-gray-800">{log.food_name}</span>
                  <span className="ml-1.5 text-xs text-gray-400">{log.amount}g</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">{Math.round(log.calories)} kcal</span>
                  <button
                    onClick={() => deleteMutation.mutate(log.id)}
                    disabled={deleteMutation.isPending}
                    className="text-gray-300 hover:text-red-400 disabled:opacity-50"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      })}

      {logs.length === 0 && !debouncedQuery && (
        <p className="py-10 text-center text-sm text-gray-400">
          위에서 음식을 검색해 오늘의 식단을 기록해보세요
        </p>
      )}

      {/* 추가 모달 (바텀 시트) */}
      {selectedFood && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40"
          onClick={() => setSelectedFood(null)}
        >
          <div
            className="w-full rounded-t-2xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5">
              <h3 className="font-semibold text-gray-900">{selectedFood.name}</h3>
              <p className="text-xs text-gray-400">
                기준: {selectedFood.calories} kcal / {selectedFood.servingSize}
                {selectedFood.servingUnit}
              </p>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-gray-600">식사 유형</p>
              <div className="flex gap-2">
                {MEAL_ORDER.map((m) => (
                  <button
                    key={m}
                    onClick={() => setAddMealType(m)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                      addMealType === m
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {MEAL_LABELS[m]}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-gray-600">섭취량</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="flex-1 rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500"
                />
                <span className="text-sm text-gray-500">{selectedFood.servingUnit}</span>
              </div>
            </div>

            {amountNum > 0 && (
              <p className="mb-5 text-sm font-medium text-blue-600">
                → {previewKcal} kcal · P {previewProtein}g · C {previewCarbs}g · F {previewFat}g
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedFood(null)}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm text-gray-600"
              >
                취소
              </button>
              <button
                onClick={submitAdd}
                disabled={addMutation.isPending || amountNum <= 0}
                className="flex-1 rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white disabled:opacity-50"
              >
                {addMutation.isPending ? '저장 중...' : '기록 저장'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
