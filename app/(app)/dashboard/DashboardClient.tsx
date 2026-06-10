'use client'

import {
  RadialBarChart,
  RadialBar,
  ResponsiveContainer,
} from 'recharts'
import { format } from 'date-fns'
import { ko } from 'date-fns/locale'
import Link from 'next/link'
import type { DietLog, ExerciseLog, MealType } from '@/types'

const MEAL_LABELS: Record<MealType, string> = {
  breakfast: '아침',
  lunch: '점심',
  dinner: '저녁',
  snack: '간식',
}

export default function DashboardClient({
  dietLogs,
  exerciseLogs,
  goalCalories,
  userName,
  today,
}: {
  dietLogs: DietLog[]
  exerciseLogs: ExerciseLog[]
  goalCalories: number
  userName: string
  today: string
}) {
  const totalIntake = Math.round(dietLogs.reduce((s, l) => s + l.calories, 0))
  const totalBurned = exerciseLogs.reduce((s, l) => s + l.calories_burned, 0)
  const remaining = Math.max(0, goalCalories - totalIntake + totalBurned)
  const progressPct = Math.min(100, (totalIntake / goalCalories) * 100)

  const totalCarbs = Math.round(dietLogs.reduce((s, l) => s + l.carbs, 0))
  const totalProtein = Math.round(dietLogs.reduce((s, l) => s + l.protein, 0))
  const totalFat = Math.round(dietLogs.reduce((s, l) => s + l.fat, 0))

  // 대략적 목표 영양소 (탄수50% 단백20% 지방30%)
  const goalCarbs = Math.round((goalCalories * 0.5) / 4)
  const goalProtein = Math.round((goalCalories * 0.2) / 4)
  const goalFat = Math.round((goalCalories * 0.3) / 9)

  const ringColor = progressPct >= 100 ? '#ef4444' : '#3b82f6'
  const ringData = [{ value: progressPct, fill: ringColor }]

  const dateStr = format(new Date(today + 'T00:00:00'), 'M월 d일 EEEE', { locale: ko })

  return (
    <div className="space-y-4 pb-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">오늘의 현황</h1>
          {userName && <p className="text-sm text-gray-400">{userName}님, 안녕하세요</p>}
        </div>
        <span className="text-sm text-gray-400">{dateStr}</span>
      </div>

      {/* 칼로리 링 */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="relative flex items-center justify-center" style={{ height: 180 }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="58%"
              outerRadius="78%"
              startAngle={90}
              endAngle={-270}
              data={ringData}
            >
              <RadialBar
                dataKey="value"
                cornerRadius={8}
                background={{ fill: '#f3f4f6' }}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute text-center pointer-events-none">
            <p className="text-3xl font-bold text-gray-900">{totalIntake}</p>
            <p className="text-xs text-gray-400">/ {goalCalories} kcal</p>
          </div>
        </div>

        <div className="mt-1 grid grid-cols-3 divide-x divide-gray-100 text-center">
          <div className="py-2">
            <p className="text-xs text-gray-400">섭취</p>
            <p className="mt-0.5 font-semibold text-gray-800">{totalIntake}</p>
          </div>
          <div className="py-2">
            <p className="text-xs text-gray-400">소모</p>
            <p className="mt-0.5 font-semibold text-green-500">{totalBurned}</p>
          </div>
          <div className="py-2">
            <p className="text-xs text-gray-400">잔여</p>
            <p className="mt-0.5 font-semibold text-blue-500">{remaining}</p>
          </div>
        </div>
      </div>

      {/* 영양소 */}
      <div className="rounded-2xl bg-white p-5 shadow-sm space-y-3">
        <p className="text-sm font-semibold text-gray-800">영양소</p>
        <MacroBar label="탄수화물" value={totalCarbs} goal={goalCarbs} color="bg-orange-400" unit="g" />
        <MacroBar label="단백질" value={totalProtein} goal={goalProtein} color="bg-blue-400" unit="g" />
        <MacroBar label="지방" value={totalFat} goal={goalFat} color="bg-yellow-400" unit="g" />
      </div>

      {/* 오늘 식단 요약 */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800">오늘의 식단</p>
          <Link href="/diet" className="text-xs font-medium text-blue-500">
            + 추가
          </Link>
        </div>
        {dietLogs.length === 0 ? (
          <p className="text-sm text-gray-400">아직 기록이 없어요</p>
        ) : (
          <>
            {dietLogs.slice(0, 4).map((log) => (
              <div key={log.id} className="flex items-center justify-between py-1.5">
                <span className="text-sm text-gray-700">
                  <span className="mr-1.5 text-xs text-gray-400">{MEAL_LABELS[log.meal_type]}</span>
                  {log.food_name}
                </span>
                <span className="text-sm text-gray-500">{Math.round(log.calories)} kcal</span>
              </div>
            ))}
            {dietLogs.length > 4 && (
              <Link href="/diet" className="mt-1 block text-center text-xs text-gray-400">
                +{dietLogs.length - 4}개 더보기
              </Link>
            )}
          </>
        )}
      </div>

      {/* 오늘 운동 요약 */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-800">오늘의 운동</p>
          <Link href="/exercise" className="text-xs font-medium text-blue-500">
            + 추가
          </Link>
        </div>
        {exerciseLogs.length === 0 ? (
          <p className="text-sm text-gray-400">아직 기록이 없어요</p>
        ) : (
          exerciseLogs.map((log) => (
            <div key={log.id} className="flex items-center justify-between py-1.5">
              <span className="text-sm text-gray-700">
                {log.exercise_name}
                <span className="ml-1.5 text-xs text-gray-400">{log.duration_minutes}분</span>
              </span>
              <span className="text-sm text-gray-500">{log.calories_burned} kcal</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function MacroBar({
  label,
  value,
  goal,
  color,
  unit,
}: {
  label: string
  value: number
  goal: number
  color: string
  unit: string
}) {
  const pct = goal > 0 ? Math.min(100, (value / goal) * 100) : 0
  return (
    <div>
      <div className="mb-1 flex justify-between text-xs text-gray-600">
        <span>{label}</span>
        <span>
          {value}
          {unit} / {goal}
          {unit}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-2 rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
