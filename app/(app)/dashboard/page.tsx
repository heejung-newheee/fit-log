import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import type { DietLog, ExerciseLog } from '@/types'
import DashboardClient from './DashboardClient'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const today = format(new Date(), 'yyyy-MM-dd')

  const [{ data: dietLogs }, { data: exerciseLogs }, { data: profile }] = await Promise.all([
    supabase.from('diet_logs').select('*').eq('user_id', user!.id).eq('logged_at', today),
    supabase.from('exercise_logs').select('*').eq('user_id', user!.id).eq('logged_at', today),
    supabase
      .from('profiles')
      .select('name, weight_kg, goal_calories')
      .eq('id', user!.id)
      .single(),
  ])

  return (
    <DashboardClient
      dietLogs={(dietLogs ?? []) as DietLog[]}
      exerciseLogs={(exerciseLogs ?? []) as ExerciseLog[]}
      goalCalories={(profile?.goal_calories as number) ?? 2000}
      userName={(profile?.name as string) ?? ''}
      today={today}
    />
  )
}
