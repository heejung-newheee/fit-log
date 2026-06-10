import { NextRequest } from 'next/server'
import { EXERCISES, calculateCaloriesBurned } from '@/lib/utils/calories'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const query = searchParams.get('q')

  const exercises = query
    ? EXERCISES.filter((e) => e.name.includes(query))
    : EXERCISES

  return Response.json({ exercises })
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { met, weightKg, durationMinutes } = body

  if (!met || !weightKg || !durationMinutes) {
    return Response.json({ error: '필수 값이 누락되었습니다' }, { status: 400 })
  }

  const caloriesBurned = calculateCaloriesBurned(met, weightKg, durationMinutes)
  return Response.json({ caloriesBurned })
}
