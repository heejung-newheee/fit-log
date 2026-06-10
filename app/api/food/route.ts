import { NextRequest } from 'next/server'

const BASE_URL = 'https://apis.data.go.kr/1471000/FoodNtrCpntDbInfo02/getFoodNtrCpntDbInq02'

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
    pageNo: '1',
    numOfRows: '20',
    type: 'json',
    FOOD_NM_KR: query,
  })

  // serviceKey는 이중 인코딩 방지를 위해 직접 붙임
  const res = await fetch(`${BASE_URL}?serviceKey=${apiKey}&${params}`)
  if (!res.ok) {
    const text = await res.text()
    return Response.json({ error: `API 오류 ${res.status}`, detail: text }, { status: 502 })
  }

  const data = await res.json()
  const items = data?.body?.items ?? []

  const foods = items.map((item: Record<string, string>) => ({
    id: item.FOOD_CD,
    name: item.FOOD_NM_KR,
    calories: parseFloat(item.AMT_NUM1) || 0,   // 에너지(kcal)
    carbs: parseFloat(item.AMT_NUM6) || 0,      // 탄수화물(g)
    protein: parseFloat(item.AMT_NUM3) || 0,    // 단백질(g)
    fat: parseFloat(item.AMT_NUM4) || 0,        // 지방(g)
    servingSize: parseFloat(item.SERVING_SIZE ?? item.DSG_ONE_SERVING) || 100,
    servingUnit: 'g',
  }))

  return Response.json({ foods })
}
