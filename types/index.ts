export interface FoodItem {
  id: string
  name: string
  calories: number
  carbs: number
  protein: number
  fat: number
  servingSize: number
  servingUnit: string
}

export interface DietLog {
  id: string
  user_id: string
  food_name: string
  calories: number
  carbs: number
  protein: number
  fat: number
  amount: number
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack'
  logged_at: string
}

export interface ExerciseLog {
  id: string
  user_id: string
  exercise_name: string
  duration_minutes: number
  calories_burned: number
  met_value: number
  logged_at: string
}

export interface UserProfile {
  id: string
  email: string
  name: string
  weight_kg: number
  height_cm: number
  goal_calories: number
  created_at: string
}

export type MealType = DietLog['meal_type']
