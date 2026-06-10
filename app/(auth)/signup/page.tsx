'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const schema = z.object({
  name: z.string().min(1, { error: '이름을 입력해주세요' }),
  email: z.string().email({ error: '올바른 이메일 형식이 아닙니다' }),
  password: z.string().min(6, { error: '비밀번호는 6자 이상이어야 합니다' }),
  weight_kg: z.number({ error: '체중을 입력해주세요' }).min(1).max(300),
  height_cm: z.number({ error: '신장을 입력해주세요' }).min(1).max(300),
  goal_calories: z.number({ error: '500 이상으로 입력해주세요' }).min(500).max(10000),
})

type FormValues = z.infer<typeof schema>

const inputCls =
  'w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-500 transition-colors'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { goal_calories: 2000 },
  })

  async function onSubmit(values: FormValues) {
    setServerError('')
    const { name, email, password, weight_kg, height_cm, goal_calories } = values

    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setServerError(error.message)
      return
    }

    if (data.user) {
      await supabase
        .from('profiles')
        .update({ name, weight_kg, height_cm, goal_calories })
        .eq('id', data.user.id)
    }

    router.push('/dashboard')
    router.refresh()
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-sm">
        <Link href="/login" className="mb-5 flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
          ← 로그인
        </Link>
        <h1 className="mb-1 text-2xl font-bold text-gray-900">회원가입</h1>
        <p className="mb-7 text-sm text-gray-500">Fit Log를 시작하세요</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Field label="이름" error={errors.name?.message}>
            <input {...register('name')} placeholder="홍길동" className={inputCls} />
          </Field>

          <Field label="이메일" error={errors.email?.message}>
            <input {...register('email')} type="email" placeholder="hello@example.com" className={inputCls} />
          </Field>

          <Field label="비밀번호" error={errors.password?.message}>
            <input
              {...register('password')}
              type="password"
              placeholder="6자 이상"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="체중 (kg)" error={errors.weight_kg?.message}>
              <input {...register('weight_kg', { valueAsNumber: true })} type="number" placeholder="65" className={inputCls} />
            </Field>
            <Field label="신장 (cm)" error={errors.height_cm?.message}>
              <input {...register('height_cm', { valueAsNumber: true })} type="number" placeholder="170" className={inputCls} />
            </Field>
          </div>

          <Field label="목표 칼로리 (kcal)" error={errors.goal_calories?.message}>
            <input {...register('goal_calories', { valueAsNumber: true })} type="number" placeholder="2000" className={inputCls} />
          </Field>

          {serverError && <p className="text-center text-xs text-red-500">{serverError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full rounded-xl bg-blue-500 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
          >
            {isSubmitting ? '처리 중...' : '시작하기'}
          </button>
        </form>
      </div>
    </main>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
      {children}
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
}
