export interface ExerciseMetData {
  name: string
  met: number
  category: string
}

// MET 값 기준: Compendium of Physical Activities
export const EXERCISES: ExerciseMetData[] = [
  { name: '걷기 (보통 속도)', met: 3.5, category: '유산소' },
  { name: '걷기 (빠른 속도)', met: 4.3, category: '유산소' },
  { name: '달리기 (6km/h)', met: 6.0, category: '유산소' },
  { name: '달리기 (8km/h)', met: 8.0, category: '유산소' },
  { name: '달리기 (10km/h)', met: 10.0, category: '유산소' },
  { name: '자전거 (보통)', met: 6.8, category: '유산소' },
  { name: '수영', met: 6.0, category: '유산소' },
  { name: '줄넘기', met: 11.0, category: '유산소' },
  { name: '등산', met: 7.0, category: '유산소' },
  { name: '헬스 (웨이트 트레이닝)', met: 3.5, category: '근력' },
  { name: '스쿼트', met: 5.0, category: '근력' },
  { name: '플랭크', met: 4.0, category: '근력' },
  { name: '요가', met: 2.5, category: '스트레칭' },
  { name: '필라테스', met: 3.0, category: '스트레칭' },
  { name: '농구', met: 6.5, category: '스포츠' },
  { name: '축구', met: 7.0, category: '스포츠' },
  { name: '배드민턴', met: 5.5, category: '스포츠' },
]

// 소모 칼로리 = MET × 체중(kg) × 시간(h)
export function calculateCaloriesBurned(
  met: number,
  weightKg: number,
  durationMinutes: number
): number {
  return Math.round(met * weightKg * (durationMinutes / 60))
}
