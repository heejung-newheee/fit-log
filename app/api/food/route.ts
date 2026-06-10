import { NextRequest } from 'next/server'

const BASE_URL = 'https://apis.data.go.kr/1471000/FoodNtrIrdntInfoService1/getFoodNtrItdntList1'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const query = searchParams.get('q')

  if (!query) {
    return Response.json({ error: '검색어를 입력해주세요' }, { status: 400 })
  }

  const apiKey = process.env.FOOD_API_KEY
  if (!apiKey) {
    return Response.json({ error: 'API 키가 설정되지 않았습니다' }, { status: 500 })
  }

  const params = new URLSearchParams({
    serviceKey: apiKey,
    pageNo: '1',
    numOfRows: '20',
    type: 'json',
    FOOD_NM_KR: query,
  })

  const res = await fetch(`${BASE_URL}?${params}`)
  if (!res.ok) {
    return Response.json({ error: '식품 데이터를 가져오는데 실패했습니다' }, { status: 502 })
  }

  const data = await res.json()
  const items = data?.body?.items ?? []

  const foods = items.map((item: Record<string, string>) => ({
    id: item.FOOD_CD,
    name: item.FOOD_NM_KR,
    calories: parseFloat(item.AMT_NUM1) || 0,
    carbs: parseFloat(item.AMT_NUM7) || 0,
    protein: parseFloat(item.AMT_NUM3) || 0,
    fat: parseFloat(item.AMT_NUM4) || 0,
    servingSize: parseFloat(item.SERVING_SIZE) || 100,
    servingUnit: 'g',
  }))

  return Response.json({ foods })
}
