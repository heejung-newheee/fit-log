# Fit Log — 프로젝트 문서

식단과 운동을 기록하는 다이어트 앱.

## 스택

| 역할 | 기술 |
|------|------|
| 프레임워크 | Next.js 16 (App Router) |
| 스타일링 | Tailwind CSS |
| 백엔드/DB | Supabase (PostgreSQL + Auth) |
| 상태 관리 | TanStack Query |
| 폼 | React Hook Form + Zod |
| 차트 | Recharts |
| 배포 | Vercel |

## 문서 목록

- [packages.md](./packages.md) — 패키지 목록 및 사용처
- [database.md](./database.md) — Supabase 테이블 스키마
- [api.md](./api.md) — API 라우트 명세
- [supabase.md](./supabase.md) — Supabase 설정 가이드

## 시작하기

```bash
# 1. 환경변수 설정
cp .env.local.example .env.local
# .env.local 파일에 Supabase URL, Anon Key, 식품 API 키 입력

# 2. 개발 서버 실행
npm run dev
```
