'use client'

import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { format } from 'date-fns'
import { Search, X } from 'lucide-react'
import { EXERCISES, calculateCaloriesBurned, type ExerciseMetData } from '@/lib/utils/calories'
import type { ExerciseLog } from '@/types'

const CATEGORIES = ['전체', '유산소', '근력', '스트레칭', '스포츠'] as const

const today = format(new Date(), 'yyyy-MM-dd')

export default function ExercisePage() {
  const supabase = createClient()
  const queryClient = useQueryClient()

  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('전체')
  const [selectedExercise, setSelectedExercise] = useState<ExerciseMetData | null>(null)
  const [duration, setDuration] = useState('30')
  const [weight, setWeight] = useState('')

  // 프로필에서 체중 불러오기
  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const { data } = await supabase
        .from('profiles')
        .select('weight_kg')
        .eq('id', user!.id)
        .single()
      return data
    },
  })

  useEffect(() => {
    if (profile?.weight_kg && !weight) {
      setWeight(String(profile.weight_kg))
    }
  }, [profile]) // eslint-disable-line react-hooks/exhaustive-deps

  const { data: logs = [] } = useQuery<ExerciseLog[]>({
    queryKey: ['exercise-logs', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercise_logs')
        .select('*')
        .eq('logged_at', today)
        .order('created_at', { ascending: true })
      if (error) throw error
      return data
    },
  })

  const addMutation = useMutation({
    mutationFn: async (log: Omit<ExerciseLog, 'id' | 'user_id' | 'logged_at'>) => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      const { error } = await supabase
        .from('exercise_logs')
        .insert({ ...log, user_id: user!.id, logged_at: today })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['exercise-logs', today] })
      setSelectedExercise(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('exercise_logs').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['exercise-logs', today] }),
  })

  const filtered = EXERCISES.filter((e) => {
    const matchesQuery = !query || e.name.includes(query)
    const matchesCategory = category === '전체' || e.category === category
    return matchesQuery && matchesCategory
  })

  const totalBurned = logs.reduce((s, l) => s + l.calories_burned, 0)

  const durationNum = parseInt(duration) || 0
  const weightNum = parseFloat(weight) || 0
  const previewCalories =
    selectedExercise && durationNum > 0 && weightNum > 0
      ? calculateCaloriesBurned(selectedExercise.met, weightNum, durationNum)
      : 0

  function submitAdd() {
    if (!selectedExercise || durationNum <= 0 || weightNum <= 0) return
    addMutation.mutate({
      exercise_name: selectedExercise.name,
      duration_minutes: durationNum,
      calories_burned: calculateCaloriesBurned(selectedExercise.met, weightNum, durationNum),
      met_value: selectedExercise.met,
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">운동 기록</h1>
        <span className="text-sm text-gray-400">소모 {totalBurned} kcal</span>
      </div>

      {/* 검색창 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="운동 검색..."
          className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-9 pr-4 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors"
        />
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 overflow-x-auto pb-0.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setCategory(cat)}
            className={`shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              category === cat
                ? 'bg-blue-500 text-white'
                : 'border border-gray-200 bg-white text-gray-600'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* 운동 목록 */}
      <div className="overflow-hidden rounded-xl border border-gray-100 bg-white">
        {filtered.length === 0 ? (
          <p className="p-4 text-center text-sm text-gray-400">검색 결과가 없어요</p>
        ) : (
          filtered.map((exercise) => (
            <div
              key={exercise.name}
              className="flex items-center justify-between border-b border-gray-50 px-4 py-3 last:border-b-0"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{exercise.name}</p>
                <p className="mt-0.5 text-xs text-gray-400">
                  MET {exercise.met} · {exercise.category}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedExercise(exercise)
                  setDuration('30')
                }}
                className="ml-3 shrink-0 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600"
              >
                추가
              </button>
            </div>
          ))
        )}
      </div>

      {/* 오늘의 운동 기록 */}
      {logs.length > 0 && (
        <div className="rounded-xl bg-white p-4 shadow-sm">
          <p className="mb-2 text-sm font-semibold text-gray-800">오늘의 운동</p>
          {logs.map((log) => (
            <div key={log.id} className="flex items-center justify-between py-1.5">
              <div>
                <span className="text-sm text-gray-800">{log.exercise_name}</span>
                <span className="ml-1.5 text-xs text-gray-400">{log.duration_minutes}분</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">{log.calories_burned} kcal</span>
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
          <div className="mt-2 border-t border-gray-50 pt-2 text-right">
            <span className="text-xs text-gray-400">총 소모: {totalBurned} kcal</span>
          </div>
        </div>
      )}

      {/* 추가 모달 (바텀 시트) */}
      {selectedExercise && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/40"
          onClick={() => setSelectedExercise(null)}
        >
          <div
            className="w-full rounded-t-2xl bg-white p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-5">
              <h3 className="font-semibold text-gray-900">{selectedExercise.name}</h3>
              <p className="text-xs text-gray-400">MET {selectedExercise.met} · {selectedExercise.category}</p>
            </div>

            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-gray-600">운동 시간 (분)</p>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500"
              />
            </div>

            <div className="mb-4">
              <p className="mb-2 text-xs font-medium text-gray-600">체중 (kg)</p>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-blue-500"
              />
            </div>

            {previewCalories > 0 && (
              <p className="mb-5 text-sm font-medium text-blue-600">
                → 예상 소모: {previewCalories} kcal
              </p>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setSelectedExercise(null)}
                className="flex-1 rounded-xl border border-gray-200 py-3 text-sm text-gray-600"
              >
                취소
              </button>
              <button
                onClick={submitAdd}
                disabled={addMutation.isPending || durationNum <= 0 || weightNum <= 0}
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
