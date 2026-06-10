# Supabase 설정 가이드

## 1. 프로젝트 생성

1. [supabase.com](https://supabase.com) → New Project
2. 프로젝트명, 비밀번호 설정 후 생성 (1~2분 소요)

## 2. 환경변수 복사

Settings → API 에서:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

## 3. DB 테이블 생성

Supabase Dashboard → SQL Editor에서 `docs/database.md`의 SQL 실행.

순서:
1. `profiles` 테이블 + 트리거
2. `diet_logs` 테이블
3. `exercise_logs` 테이블
4. 각 테이블 RLS 정책

## 4. Auth 설정

Authentication → Providers:
- **Email** 기본 활성화됨 (이메일/패스워드 로그인)
- 필요 시 Google, Kakao OAuth 추가 가능

Authentication → URL Configuration:
```
Site URL: http://localhost:3000 (개발)
           https://your-app.vercel.app (배포 후 추가)
```

## 5. 클라이언트 vs 서버 사용

| 상황 | 사용 파일 |
|------|-----------|
| Server Component, API Route, layout.tsx | `lib/supabase/server.ts` |
| Client Component (`'use client'`) | `lib/supabase/client.ts` |

```ts
// Server Component 예시
import { createClient } from '@/lib/supabase/server'

const supabase = await createClient()
const { data } = await supabase.from('diet_logs').select('*')

// Client Component 예시
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()  // await 없음
const { data } = await supabase.from('diet_logs').select('*')
```

## 6. Vercel 배포 시

Vercel Dashboard → 프로젝트 Settings → Environment Variables에 동일한 환경변수 추가:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `FOOD_API_KEY`
