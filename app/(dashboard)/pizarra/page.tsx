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
        {dateStr} · Arequipa, PE
      </div>
    </div>
  )
}

export default function PizarraPage() {
  const [isKioskMode, setIsKioskMode] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const content = (
    <div className={`flex flex-col bg-bg-base font-sans text-text-primary ${isKioskMode ? 'fixed inset-0 z-[9999]' : 'min-h-screen'}`}>
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

        {/* Buscador Pizarra */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative group">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm transition-colors group-focus-within:text-neon-blue">
            🔍
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por FR, cliente, marca, modelo..."
            className="w-full bg-bg-base border border-border-subtle focus:border-neon-blue rounded-lg pl-9 pr-4 py-2 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:shadow-[0_0_10px_rgba(0,229,255,0.1)] transition-all font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-red-400 text-xs transition-colors"
            >
              ✕
            </button>
          )}
        </div>

        {/* Acciones de Pizarra */}
        <div className="flex items-center gap-6">
          <button
            onClick={() => setIsKioskMode(!isKioskMode)}
            className="px-4 py-2 bg-bg-base border border-border-subtle hover:border-neon-blue hover:text-neon-blue rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all shadow-sm"
          >
            {isKioskMode ? '🚪 Salir Pantalla Completa' : '📺 Pantalla Completa'}
          </button>
          
          {/* Reloj Lima */}
          <LimaClock />
        </div>
      </header>

      {/* ─── Indicadores rápidos ─── */}
      <div className="flex items-center gap-3 px-6 py-2 bg-bg-base border-b border-border-subtle/30 text-[10px] uppercase tracking-widest text-text-muted font-mono flex-shrink-0">
        <span className="w-2 h-2 rounded-full bg-neon-blue animate-pulse shadow-neon-blue inline-block" />
        Conexión Realtime Activa
        <span className="ml-auto flex items-center gap-4">
          {searchQuery && (
            <span className="text-neon-blue font-bold">
              🔍 Filtrando: "{searchQuery}"
            </span>
          )}
          <span>Actualización automática • Sin recarga de página</span>
        </span>
      </div>

      {/* ─── Tablero Principal ─── */}
      <main className="flex-1 overflow-hidden px-4 py-4">
        <PizarraBoard searchQuery={searchQuery} />
      </main>

      {/* ─── Footer ─── */}
      <footer className="flex justify-between px-6 py-3 bg-bg-surface/50 border-t border-border-subtle flex-shrink-0 text-[10px] text-text-muted uppercase tracking-wider items-center font-mono">
        <span>Monitor de Taller Activo — Pizarra</span>
        <span>© CABELAB</span>
      </footer>
    </div>
  )

  return content
}
