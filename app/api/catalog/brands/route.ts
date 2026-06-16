import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('catalog_brands')
      .select('name')
      .order('name', { ascending: true })

    if (error) {
      console.error('[GET /api/catalog/brands] Database error:', error)
      return NextResponse.json({ success: false, error: 'Error al obtener marcas' }, { status: 500 })
    }

    const brandNames = data.map(item => item.name)

    return NextResponse.json({
      success: true,
      data: brandNames
    })

  } catch (err) {
    console.error('[GET /api/catalog/brands] Unexpected error:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
