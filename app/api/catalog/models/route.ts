import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const brand = searchParams.get('brand')

    let query = supabase
      .from('catalog_models')
      .select('name, catalog_brands!inner(name)')
      .order('name', { ascending: true })

    if (brand) {
      query = query.eq('catalog_brands.name', brand.toUpperCase())
    }

    const { data, error } = await query

    if (error) {
      console.error('[GET /api/catalog/models] Database error:', error)
      return NextResponse.json({ success: false, error: 'Error al obtener modelos' }, { status: 500 })
    }

    // Extraer nombres únicos
    const modelNames = Array.from(new Set(data.map(item => item.name)))

    return NextResponse.json({
      success: true,
      data: modelNames
    })

  } catch (err) {
    console.error('[GET /api/catalog/models] Unexpected error:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
