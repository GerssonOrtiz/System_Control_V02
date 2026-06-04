// app/api/users/technicians/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // 1. Verificar sesión
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    // 2. Verificar que el usuario sea activo
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role, is_active')
      .eq('id', session.user.id)
      .single()

    const activeProfile = userProfile as any
    if (!activeProfile || !activeProfile.is_active) {
      return NextResponse.json({ success: false, error: 'Cuenta no activa' }, { status: 403 })
    }

    // 3. Obtener técnicos usando el cliente Admin (para bypass de RLS de perfiles ajenos)
    const adminSupabase = createAdminClient()
    const { data: techs, error } = await adminSupabase
      .from('user_profiles')
      .select('id, username, role')
      .eq('is_active', true)
      .in('role', ['operaciones', 'admin', 'superadmin'])

    if (error) {
      console.error('[GET /api/users/technicians] Database error:', error)
      return NextResponse.json({ success: false, error: 'Error al obtener técnicos' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: techs || []
    })

  } catch (err) {
    console.error('[GET /api/users/technicians] Unexpected error:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
