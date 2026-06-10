# API 라우트 명세

Next.js API Routes (`app/api/`)를 통해 외부 API 키를 서버에서만 사용.

---

## GET /api/food

공공데이터포털 식품영양성분 DB 검색 프록시.

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `q` | string | O | 식품명 검색어 (예: `김치찌개`) |

**Response**

```json
{
  "foods": [
    {
      "id": "D000006",
      "name": "김치찌개",
      "calories": 46.0,
      "carbs": 2.3,
      "protein": 3.1,
      "fat": 2.4,
      "servingSize": 100,
      "servingUnit": "g"
    }
  ]
}
```

**환경변수**: `FOOD_API_KEY` (서버 전용, 브라우저 노출 없음)

**외부 API**: 식품의약품안전처 식품영양성분 서비스 (data.go.kr)

---

## GET /api/exercise

로컬 운동 목록 조회.

**Query Parameters**

| 파라미터 | 타입 | 필수 | 설명 |
|----------|------|------|------|
| `q` | string | X | 운동명 필터 (없으면 전체 반환) |

**Response**

```json
{
  "exercises": [
    {
      "name": "달리기 (8km/h)",
      "met": 8.0,
      "category": "유산소"
    }
  ]
}
```

---

## POST /api/exercise

운동 소모 칼로리 계산.

**Request Body**

```json
{
  "met": 8.0,
  "weightKg": 65,
  "durationMinutes": 30
}
```

**Response**

```json
{
  "caloriesBurned": 260
}
```

**계산식**: `MET × 체중(kg) × 시간(h)`

---

## 클라이언트에서 호출 예시

```ts
// 식품 검색
const res = await fetch('/api/food?q=김치찌개')
const { foods } = await res.json()

// 운동 칼로리 계산
const res = await fetch('/api/exercise', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ met: 8.0, weightKg: 65, durationMinutes: 30 }),
})
const { caloriesBurned } = await res.json()
```
