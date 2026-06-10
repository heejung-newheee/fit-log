# Supabase 데이터베이스 스키마

## 테이블 목록

### profiles
freshbox에서 이미 사용 중인 테이블 — 새로 생성하지 말 것.
테이블과 트리거(on_auth_user_created)는 그대로 두고, fit-log에 필요한 컬럼만 추가.

```sql
-- 이미 없는 경우에만 추가 (기존 데이터 영향 없음)
alter table profiles add column if not exists weight_kg numeric(5,1);
alter table profiles add column if not exists height_cm numeric(5,1);
alter table profiles add column if not exists goal_calories integer default 2000;
```

### diet_logs
식단 기록

```sql
create table diet_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  food_name text not null,
  calories numeric(7,1) not null,
  carbs numeric(6,1) default 0,
  protein numeric(6,1) default 0,
  fat numeric(6,1) default 0,
  amount numeric(6,1) default 100,
  meal_type text check (meal_type in ('breakfast', 'lunch', 'dinner', 'snack')) not null,
  logged_at date default current_date not null,
  created_at timestamptz default now()
);
```

### exercise_logs
운동 기록

```sql
create table exercise_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  exercise_name text not null,
  duration_minutes integer not null,
  calories_burned integer not null,
  met_value numeric(4,1),
  logged_at date default current_date not null,
  created_at timestamptz default now()
);
```

## RLS (Row Level Security) 설정

모든 테이블에 적용. 자신의 데이터만 읽기/쓰기 가능.

```sql
-- diet_logs 예시 (나머지 테이블도 동일하게 적용)
alter table diet_logs enable row level security;

create policy "자신의 기록만 조회"
  on diet_logs for select
  using (auth.uid() = user_id);

create policy "자신의 기록만 추가"
  on diet_logs for insert
  with check (auth.uid() = user_id);

create policy "자신의 기록만 삭제"
  on diet_logs for delete
  using (auth.uid() = user_id);
```
