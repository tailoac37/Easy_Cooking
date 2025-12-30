import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const find = searchParams.get('find') || ''
  const token = req.headers.get('authorization')

  if (!find.trim()) {
    return NextResponse.json([], { status: 200 })
  }

  try {
    console.log('🔍 Gửi tìm kiếm user:', find)

    const res = await fetch(
      `http://localhost:8081/api/getUser/search?find=${encodeURIComponent(find)}`,
      {
        headers: {
          Authorization: token || '',
        },
      }
    )

    const text = await res.text()
    console.log('📩 Raw backend response:', text)

    let data
    try {
      data = JSON.parse(text)
    } catch {
      data = { message: text }
    }

    return NextResponse.json(data, { status: res.status })
  } catch (err) {
    console.error('❌ Proxy lỗi tìm kiếm user:', err)
    return NextResponse.json({ message: 'Lỗi proxy' }, { status: 500 })
  }
}
