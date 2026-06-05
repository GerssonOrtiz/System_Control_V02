// app/api/equipment/import/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/supabase/server'
import * as XLSX from 'xlsx'
import { z } from 'zod'

const importRowSchema = z.object({
  fr_number: z.string().min(1, 'El número de FR es requerido'),
  client_name: z.string().min(1, 'El nombre de cliente es requerido'),
  service_type: z.enum(['REVISION_GENERAL', 'GARANTIA_CABELAB', 'GARANTIA_ESAB']),
  brand: z.string().min(1, 'La marca es requerida'),
  model: z.string().min(1, 'El modelo es requerido'),
  serial_number: z.string().min(1, 'El número de serie es requerido'),
  report_number: z.string().optional().nullable(),
  client_report: z.string().optional().nullable(),
  accessories: z.string().optional().nullable(),
  condition_in: z.string().optional().nullable(),
  additional_observations: z.string().optional().nullable(),
})

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

    // Convertir a JSON mapeando columnas
    const rawRows = XLSX.utils.sheet_to_json<any>(worksheet)

    if (rawRows.length === 0) {
      return NextResponse.json({ success: false, error: 'El archivo Excel está vacío o no tiene el formato correcto' }, { status: 400 })
    }

    let importedCount = 0
    let skippedCount = 0
    const errorsList: Array<{ row: number; fr: string | null; reason: string }> = []

    // Obtener estado inicial (is_initial = true)
    const { data: initialState, error: stateError } = await supabase
      .from('workflow_states')
      .select('id')
      .eq('is_initial', true)
      .single() as any

    if (stateError || !initialState) {
      return NextResponse.json({ success: false, error: 'No se pudo determinar el estado inicial del workflow en el sistema' }, { status: 500 })
    }

    // --- OPTIMIZACIÓN CRÍTICA: Búsqueda masiva en una sola query ---
    // Obtener todos los FR existentes para verificar localmente y evitar queries secuenciales (evita timeouts en Vercel)
    const { data: allExisting, error: fetchAllError } = await supabase
      .from('equipment_records')
      .select('fr_number')

    if (fetchAllError) {
      return NextResponse.json({ success: false, error: 'Error al consultar registros existentes' }, { status: 500 })
    }

    const existingFrSet = new Set((allExisting || []).map((e: any) => e.fr_number.toUpperCase()))
    const recordsToInsert: any[] = []

    // Iterar y procesar cada fila en memoria
    for (let i = 0; i < rawRows.length; i++) {
      const row = rawRows[i]
      const rowNumber = i + 2 // Base 1, más cabecera

      // Mapear cabeceras flexibles
      const frValue = (row['FR'] || row['fr'] || row['fr_number'] || '').toString().trim()
      const clientNameValue = (row['Cliente'] || row['cliente'] || row['client_name'] || '').toString().trim()
      
      // Normalizar tipo de servicio a mayúsculas con guiones bajos si es necesario
      let serviceTypeValue = (row['Tipo Servicio'] || row['tipo_servicio'] || row['service_type'] || '').toString().trim().toUpperCase()
      serviceTypeValue = serviceTypeValue.replace(/\s+/g, '_')

      const brandValue = (row['Marca'] || row['marca'] || row['brand'] || '').toString().trim()
      const modelValue = (row['Modelo'] || row['modelo'] || row['model'] || '').toString().trim()
      const serialValue = (row['N° Serie'] || row['n_serie'] || row['serial_number'] || '').toString().trim()
      
      const reportNumberValue = (row['N° Informe'] || row['n_informe'] || row['report_number'] || '').toString().trim()
      const clientReportValue = (row['Reporte Cliente'] || row['reporte_cliente'] || row['client_report'] || '').toString().trim()
      const accessoriesValue = (row['Accesorios'] || row['accesorios'] || '').toString().trim()
      const conditionValue = (row['Condición Ingreso'] || row['condicion_ingreso'] || row['condition_in'] || '').toString().trim()
      const observationsValue = (row['Observaciones'] || row['observaciones'] || row['additional_observations'] || '').toString().trim()

      const parsedPayload = {
        fr_number: frValue,
        client_name: clientNameValue,
        service_type: serviceTypeValue,
        brand: brandValue,
        model: modelValue,
        serial_number: serialValue,
        report_number: reportNumberValue || null,
        client_report: clientReportValue || null,
        accessories: accessoriesValue || null,
        condition_in: conditionValue || null,
        additional_observations: observationsValue || null,
      }

      // Validar con Zod
      const validationResult = importRowSchema.safeParse(parsedPayload)
      if (!validationResult.success) {
        const errorDetails = validationResult.error
        const firstErrorMsg = errorDetails.errors[0]?.message || 'Datos de fila inválidos o tipo de servicio incorrecto'
        errorsList.push({
          row: rowNumber,
          fr: frValue || null,
          reason: firstErrorMsg,
        })
        continue
      }

      const validData = validationResult.data

      // Validar duplicado localmente usando el Set
      const frUpper = validData.fr_number.toUpperCase()
      if (existingFrSet.has(frUpper)) {
        skippedCount++
        errorsList.push({
          row: rowNumber,
          fr: validData.fr_number,
          reason: 'Ya existe en el sistema',
        })
        continue
      }

      // Agregar a la lista para inserción masiva
      recordsToInsert.push({
        fr_number: frUpper,
        client_name: validData.client_name.toUpperCase(),
        service_type: validData.service_type,
        brand: validData.brand.toUpperCase(),
        model: validData.model.toUpperCase(),
        serial_number: validData.serial_number.toUpperCase(),
        report_number: validData.report_number ? validData.report_number.toUpperCase() : null,
        client_report: validData.client_report ? validData.client_report.toUpperCase() : null,
        accessories: validData.accessories ? validData.accessories.toUpperCase() : null,
        condition_in: validData.condition_in ? validData.condition_in.toUpperCase() : null,
        additional_observations: validData.additional_observations ? validData.additional_observations.toUpperCase() : null,
        current_status_id: initialState.id,
        created_by: user.id,
      })

      // Agregar al Set temporal para prevenir duplicados dentro del mismo Excel
      existingFrSet.add(frUpper)
    }

    // Realizar inserción masiva (bulk insert)
    if (recordsToInsert.length > 0) {
      const { error: insertError } = await (supabase
        .from('equipment_records') as any)
        .insert(recordsToInsert)

      if (insertError) {
        console.error('[POST /api/equipment/import] Bulk insert error:', insertError)
        return NextResponse.json({ success: false, error: 'Error al guardar los registros en la base de datos' }, { status: 500 })
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
  } catch (err) {
    console.error('[POST /api/equipment/import] Unexpected error:', err)
    return NextResponse.json({ success: false, error: 'Error interno al importar los datos' }, { status: 500 })
  }
}
