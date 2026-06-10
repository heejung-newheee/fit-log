# 패키지 목록

## 프로덕션 의존성

### @supabase/supabase-js
- **용도**: Supabase 클라이언트 — DB 쿼리, Auth
- **사용 위치**: `lib/supabase/client.ts`, `lib/supabase/server.ts`
- **주요 API**: `supabase.auth`, `supabase.from('table').select()`

### @supabase/ssr
- **용도**: Next.js App Router에서 Supabase 쿠키 기반 인증 처리
- **사용 위치**: `lib/supabase/client.ts`, `lib/supabase/server.ts`
- **주요 API**: `createBrowserClient()`, `createServerClient()`
- **참고**: `@supabase/auth-helpers-nextjs`의 후속 패키지

### @tanstack/react-query
- **용도**: 서버 데이터 페칭, 캐싱, 동기화
- **사용 위치**: `components/providers.tsx` (Provider 설정), 각 페이지 컴포넌트
- **주요 API**: `useQuery()`, `useMutation()`, `QueryClient`
- **설정**: staleTime 5분 (기본값)

### recharts
- **용도**: 칼로리/영양소 추이 차트 시각화
- **사용 위치**: `app/(app)/dashboard/page.tsx`
- **주요 컴포넌트**: `LineChart`, `BarChart`, `PieChart`

### react-hook-form
- **용도**: 식단/운동 기록 폼 상태 관리
- **사용 위치**: 식단 추가 폼, 운동 추가 폼, 로그인/회원가입 폼
- **주요 API**: `useForm()`, `register`, `handleSubmit`, `formState`

### zod
- **용도**: 폼 입력값 타입 검증 스키마
- **사용 위치**: 각 폼 컴포넌트의 schema 정의
- **주요 API**: `z.object()`, `z.string()`, `z.number()`

### @hookform/resolvers
- **용도**: React Hook Form과 Zod를 연결하는 어댑터
- **사용 위치**: `useForm({ resolver: zodResolver(schema) })`
- **주요 API**: `zodResolver()`

### date-fns
- **용도**: 날짜 포맷, 날짜 계산 (오늘/이번주 기록 조회)
- **사용 위치**: 날짜 표시 컴포넌트, DB 쿼리 날짜 범위 계산
- **주요 API**: `format()`, `startOfDay()`, `subDays()`

### lucide-react
- **용도**: UI 아이콘
- **사용 위치**: 네비게이션, 버튼, 카드 등 전반
- **주요 아이콘**: `Plus`, `Trash2`, `ChevronRight`, `Search`

## 개발 의존성

### typescript
- Next.js와 함께 설치. 타입 안전성 보장.

### tailwindcss
- 유틸리티 퍼스트 CSS 프레임워크. `postcss.config.mjs`에서 설정.

### eslint + eslint-config-next
- Next.js 권장 린팅 규칙 포함.
