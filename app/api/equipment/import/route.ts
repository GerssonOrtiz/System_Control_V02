// app/api/equipment/import/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // 1. Verificar sesión
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ success: false, error: 'No autorizado' }, { status: 401 })
    }

    // 2. Verificar que el rol sea superadmin
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('role, is_active, is_superadmin')
      .eq('id', user.id)
      .single() as any

    if (!profile?.is_active) {
      return NextResponse.json({ success: false, error: 'Cuenta no activa' }, { status: 403 })
    }

    if (profile.role !== 'superadmin' || !profile.is_superadmin) {
      return NextResponse.json({ success: false, error: 'Acceso denegado. Solo superadmin puede importar datos' }, { status: 403 })
    }

    // 3. Leer FormData y procesar archivo
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ success: false, error: 'No se envió ningún archivo' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()
    const workbook = XLSX.read(bytes, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    // Convertir a JSON
    const rawRows = XLSX.utils.sheet_to_json<any>(worksheet, { defval: '' })

    if (rawRows.length === 0) {
      return NextResponse.json({ success: false, error: 'El archivo Excel está vacío o no tiene el formato correcto' }, { status: 400 })
    }

    let importedCount = 0
    let skippedCount = 0
    const errorsList: Array<{ row: number; fr: string | null; reason: string }> = []

    // Obtener estado inicial del workflow
    const { data: initialState, error: stateError } = await supabase
      .from('workflow_states')
      .select('id')
      .eq('is_initial', true)
      .single() as any

    if (stateError || !initialState) {
      return NextResponse.json({ success: false, error: 'No se pudo determinar el estado inicial del workflow' }, { status: 500 })
    }

    // Carga masiva de FRs existentes para verificación en memoria
    const { data: allExisting, error: fetchAllError } = await supabase
      .from('equipment_records')
      .select('fr_number')

    if (fetchAllError) {
      return NextResponse.json({ success: false, error: 'Error al consultar registros existentes' }, { status: 500 })
    }

    const existingFrSet = new Set((allExisting || []).map((e: any) => e.fr_number.toUpperCase()))
    const recordsToInsert: any[] = []

    // Helper para leer un campo flexible de la fila con múltiples variantes de nombre
    const readField = (row: any, ...keys: string[]): string => {
      for (const key of keys) {
        const val = row[key]
        if (val !== undefined && val !== null && val.toString().trim() !== '') {
          return val.toString().trim()
        }
      }
      return ''
    }

    // Iterar cada fila del Excel
    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i]
      const rowNumber = i + 2 // Base 1 + cabecera

      // ─── Mapeo de columnas del Excel del usuario ───────────────────────────
      // Formato: FR | No DIAG | CLIENTE | FECHA DE INGRESO | MARCA | MODELO | NUMERO DE SERIE | REPORTE DE CLIENTE | ACCESORIOS | ESTADO | CONDICION
      
      const frValue = readField(row,
        'FR', 'fr', 'fr_number', 'Nro FR', 'NRO FR', 'NRO. FR', 'N° FR'
      ).toUpperCase()

      const reportNumberValue = readField(row,
        'No DIAG', 'NO DIAG', 'no diag', 'N° DIAG', 'NRO DIAG', 'report_number', 'N° Informe', 'N° INFORME'
      )

      const clientNameValue = readField(row,
        'CLIENTE', 'Cliente', 'cliente', 'client_name'
      ).toUpperCase()

      const brandValue = readField(row,
        'MARCA', 'Marca', 'marca', 'brand'
      ).toUpperCase()

      const modelValue = readField(row,
        'MODELO', 'Modelo', 'modelo', 'model'
      ).toUpperCase()

      // Serial: si está vacío → "N/S"
      const serialRaw = readField(row,
        'NUMERO DE SERIE', 'Numero de Serie', 'N° Serie', 'N° SERIE', 'serial_number', 'SERIE', 'Serie'
      )
      const serialValue = serialRaw !== '' ? serialRaw.toUpperCase() : 'N/S'

      const clientReportValue = readField(row,
        'REPORTE DE CLIENTE', 'Reporte de Cliente', 'reporte_cliente', 'client_report', 'REPORTE CLIENTE'
      )

      const accessoriesValue = readField(row,
        'ACCESORIOS', 'Accesorios', 'accesorios', 'accessories'
      )

      const conditionValue = readField(row,
        'CONDICION', 'Condición Ingreso', 'CONDICIÓN', 'condition_in', 'condicion_ingreso', 'CONDICION INGRESO'
      )

      // ESTADO: se ignora — siempre se asigna el estado inicial del workflow
      // FECHA DE INGRESO: se ignora — se usa la fecha actual (default de la BD)

      // ─── Validación mínima ─────────────────────────────────────────────────
      if (!frValue) {
        errorsList.push({ row: rowNumber, fr: null, reason: 'El campo FR está vacío o no se encontró en esta fila' })
        continue
      }

      if (!clientNameValue) {
        errorsList.push({ row: rowNumber, fr: frValue, reason: 'El campo CLIENTE está vacío' })
        continue
      }

      if (!brandValue) {
        errorsList.push({ row: rowNumber, fr: frValue, reason: 'El campo MARCA está vacío' })
        continue
      }

      if (!modelValue) {
        errorsList.push({ row: rowNumber, fr: frValue, reason: 'El campo MODELO está vacío' })
        continue
      }

      // ─── Verificar duplicado en memoria ────────────────────────────────────
      const frUpper = frValue
      if (existingFrSet.has(frUpper)) {
        skippedCount++
        errorsList.push({ row: rowNumber, fr: frUpper, reason: 'Ya existe en el sistema (omitido)' })
        continue
      }

      // Agregar a la lista de inserción
      recordsToInsert.push({
        fr_number:               frUpper,
        client_name:             clientNameValue,
        service_type:            'REVISION_GENERAL', // Tipo por defecto ya que el Excel no lo incluye
        brand:                   brandValue,
        model:                   modelValue,
        serial_number:           serialValue,
        report_number:           reportNumberValue !== '' ? reportNumberValue.toUpperCase() : '--',
        client_report:           clientReportValue  !== '' ? clientReportValue.toUpperCase()  : '--',
        accessories:             accessoriesValue   !== '' ? accessoriesValue.toUpperCase()   : '--',
        condition_in:            conditionValue     !== '' ? conditionValue.toUpperCase()     : '--',
        additional_observations: null,
        current_status_id:       initialState.id,
        created_by:              user.id,
      })

      // Registrar en el set para evitar duplicados internos dentro del mismo Excel
      existingFrSet.add(frUpper)
    }

    // ─── Inserción masiva (bulk insert) ────────────────────────────────────────
    if (recordsToInsert.length > 0) {
      const { error: insertError } = await (supabase
        .from('equipment_records') as any)
        .insert(recordsToInsert)

      if (insertError) {
        console.error('[POST /api/equipment/import] Bulk insert error:', insertError)
        return NextResponse.json({ success: false, error: 'Error al guardar los registros en la base de datos: ' + insertError.message }, { status: 500 })
      }
      importedCount = recordsToInsert.length
    }

    return NextResponse.json({
      success: true,
      data: {
        imported: importedCount,
        skipped: skippedCount,
        errors: errorsList,
      },
    })

  } catch (err: any) {
    console.error('[POST /api/equipment/import] Unexpected error:', err)
    return NextResponse.json({ success: false, error: 'Error interno al importar los datos: ' + (err?.message || '') }, { status: 500 })
  }
}
