// app/(dashboard)/pizarra/page.tsx
'use client'

import React, { useState, useEffect } from 'react'
import PizarraBoard from '@/components/pizarra/PizarraBoard'

function LimaClock() {
  const [timeStr, setTimeStr] = useState('')
  const [dateStr, setDateStr] = useState('')

  useEffect(() => {
    function tick() {
      const now = new Date()
      setTimeStr(
        now.toLocaleTimeString('es-PE', {
          timeZone: 'America/Lima',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        })
      )
      setDateStr(
        now.toLocaleDateString('es-PE', {
          timeZone: 'America/Lima',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        })
      )
    }

    tick()
    const timer = setInterval(tick, 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <div className="text-right font-mono select-none">
      <div className="text-neon-blue text-2xl font-bold tracking-widest leading-none">
        {timeStr}
      </div>
      <div className="text-text-secondary text-[11px] uppercase tracking-wide mt-0.5 capitalize">
        {dateStr} · Lima, PE
      </div>
    </div>
  )
}

export default function PizarraPage() {
  return (
    <div className="flex flex-col min-h-screen bg-bg-base font-sans text-text-primary">
      {/* ─── Header Pizarra ─── */}
      <header className="flex justify-between items-center px-6 py-4 bg-bg-surface border-b border-border-subtle flex-shrink-0">
        {/* Logo + título */}
        <div className="flex items-center gap-4">
          <div className="w-2 h-10 rounded-full bg-neon-blue shadow-neon-blue" />
          <div>
            <h1 className="text-lg font-extrabold tracking-widest uppercase text-neon-blue leading-none">
              🔧 CABELAB
            </h1>
            <p className="text-[11px] text-text-secondary uppercase tracking-widest mt-0.5">
              Pizarra de Taller — Tiempo Real
            </p>
          </div>
        </div>

        {/* Reloj Lima */}
        <LimaClock />
      </header>

      {/* ─── Indicadores rápidos ─── */}
      <div className="flex items-center gap-3 px-6 py-2 bg-bg-base border-b border-border-subtle/30 text-[10px] uppercase tracking-widest text-text-muted font-mono flex-shrink-0">
        <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse shadow-neon-blue inline-block" />
        Conexión Realtime Activa
        <span className="ml-auto">Actualización automática • Sin recarga de página</span>
      </div>

      {/* ─── Tablero Principal ─── */}
      <main className="flex-1 overflow-hidden px-4 py-4">
        <PizarraBoard />
      </main>

      {/* ─── Leyenda ─── */}
      <footer className="flex gap-6 px-6 py-3 bg-bg-surface/50 border-t border-border-subtle flex-shrink-0 text-[10px] text-text-muted uppercase tracking-wider items-center">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded border border-red-500 bg-red-500/20 shadow-neon-red inline-block animate-pulse" />
          Equipo atrasado (+5 días)
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded border border-neon-blue bg-neon-blue/20 inline-block" />
          Equipo en proceso
        </div>
        <span className="ml-auto">© CABELAB v2.0</span>
      </footer>
    </div>
  )
}
