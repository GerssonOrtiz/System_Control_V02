// app/api/stats/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // 1. Verificar sesión
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    // 2. Obtener perfil del usuario
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('role, is_active')
      .eq('id', session.user.id)
      .single()

    const activeProfile = userProfile as any
    if (!activeProfile || !activeProfile.is_active) {
      return NextResponse.json({ success: false, error: 'Cuenta no activa' }, { status: 403 })
    }

    // 3. Validar roles permitidos: superadmin, admin, visualizador
    const allowedRoles = ['superadmin', 'admin', 'visualizador']
    if (!allowedRoles.includes(activeProfile.role)) {
      return NextResponse.json({ success: false, error: 'Acceso denegado. Rol no autorizado para ver estadísticas' }, { status: 403 })
    }

    // 4. Obtener equipos activos (is_terminal = false) de la vista
    const { data: activeEquips, error: activeErr } = await supabase
      .from('equipment_with_status')
      .select('id, fr_number, client_name, status_name, status_color, service_type, days_elapsed')
      .eq('is_terminal', false)

    if (activeErr) {
      console.error('[GET /api/stats] Active equipment error:', activeErr)
      return NextResponse.json({ success: false, error: 'Error al consultar equipos activos de la base de datos' }, { status: 500 })
    }

    const activeList = (activeEquips || []) as any[]
    const total_active = activeList.length

    // Filtrar equipos con days_elapsed > 5
    const delayedList = activeList.filter((e: any) => e.days_elapsed > 5)
    const total_delayed = delayedList.length

    const delayed_equipment = delayedList.map((e: any) => ({
      fr_number: e.fr_number,
      client_name: e.client_name,
      status_name: e.status_name,
      days_elapsed: e.days_elapsed
    }))

    // Agrupar por estado
    const statusCounts: Record<string, { count: number; color: string }> = {}
    for (const e of activeList) {
      if (!statusCounts[e.status_name]) {
        statusCounts[e.status_name] = { count: 0, color: e.status_color || '#6B7280' }
      }
      statusCounts[e.status_name].count++
    }
    const by_status = Object.entries(statusCounts).map(([name, val]) => ({
      status_name: name,
      count: val.count,
      color: val.color
    }))

    // Agrupar por tipo de servicio
    const serviceCounts: Record<string, number> = {}
    for (const e of activeList) {
      serviceCounts[e.service_type] = (serviceCounts[e.service_type] || 0) + 1
    }
    const by_service_type = Object.entries(serviceCounts).map(([type, count]) => ({
      service_type: type,
      count
    }))

    // 5. Equipos entregados este mes
    const now = new Date()
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const { count: deliveredCount, error: delError } = await supabase
      .from('status_history')
      .select('*', { count: 'exact', head: true })
      .eq('new_status', 'Entregado')
      .gte('timestamp', firstDayOfMonth)

    if (delError) {
      console.error('[GET /api/stats] Delivered this month count error:', delError)
      // Continuar sin fallar la petición completa
    }
    const delivered_this_month = deliveredCount || 0

    // 6. Promedio de días para entrega (últimos 30 días)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { data: historyLogs, error: histErr } = await supabase
      .from('status_history')
      .select('equipment_id, timestamp')
      .eq('new_status', 'Entregado')
      .gte('timestamp', thirtyDaysAgo)

    let avg_days_to_delivery = 0

    if (histErr) {
      console.error('[GET /api/stats] History logs error:', histErr)
    } else if (historyLogs && historyLogs.length > 0) {
      const historyLogsList = historyLogs as any[]
      const eqIds = historyLogsList.map((h: any) => h.equipment_id)
      const { data: equips, error: equipsErr } = await supabase
        .from('equipment_records')
        .select('id, date_in')
        .in('id', eqIds)

      if (equipsErr) {
        console.error('[GET /api/stats] Equips fetch error:', equipsErr)
      } else if (equips) {
        const equipMap = new Map(equips.map((e: any) => [e.id, new Date(e.date_in).getTime()]))
        let totalDays = 0
        let countDelivered = 0

        for (const log of historyLogsList) {
          const dateInTime = equipMap.get(log.equipment_id)
          if (dateInTime) {
            const deliveryTime = new Date(log.timestamp).getTime()
            const diffDays = (deliveryTime - dateInTime) / (1000 * 60 * 60 * 24)
            totalDays += diffDays
            countDelivered++
          }
        }
        avg_days_to_delivery = countDelivered > 0 ? Math.round((totalDays / countDelivered) * 10) / 10 : 0
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        total_active,
        total_delayed,
        delivered_this_month,
        avg_days_to_delivery,
        by_status,
        by_service_type,
        delayed_equipment
      }
    })

  } catch (err) {
    console.error('[GET /api/stats] Unexpected error:', err)
    return NextResponse.json({ success: false, error: 'Error interno del servidor' }, { status: 500 })
  }
}
