"use client"

import { useState, useEffect } from "react"

interface NumberOneSong {
  title: string
  artist: string
}

interface YearData {
  entries: number
  number_ones: number
  top_tens: number
  songs: string[]
}

interface EraData {
  songs: number
  number_ones: number
  top_tens: number
}

interface SummaryData {
  total_entries?: number
  number_one_hits?: number
  top_ten_hits?: number
  total_weeks_on_chart?: number
  average_weeks_per_song?: number
  average_peak_position?: number
  longest_running_song?: {
    title: string
    weeks: number
    peak: number
  }
  first_chart_entry?: {
    title: string
    date: string
    peak: number
  }
  number_one_songs?: NumberOneSong[]
  yearly_breakdown?: Record<string, YearData>
  era_comparison?: {
    origin: EraData
    ascent: EraData
    peak: EraData
    recent: EraData
  }
}

interface DataStructure {
  section_8_summary?: SummaryData
}

export default function Section8Page() {
  const [data, setData] = useState<DataStructure | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    fetch("/data/drake_billboard_data.json")
      .then((res) => res.json())
      .then((jsonData: DataStructure) => {
        setData(jsonData)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error loading data:", err)
        setLoading(false)
      })
  }, [])

  // Extract data
  const summary = data?.section_8_summary
  const totalEntries = summary?.total_entries || 0
  const numberOneHits = summary?.number_one_hits || 0
  const topTenHits = summary?.top_ten_hits || 0
  const totalWeeks = summary?.total_weeks_on_chart || 0
  const avgWeeks = summary?.average_weeks_per_song || 0
  const avgPeak = summary?.average_peak_position || 0
  const longestSong = summary?.longest_running_song
  const firstEntry = summary?.first_chart_entry
  const numberOneSongs = summary?.number_one_songs || []
  const yearlyBreakdown = summary?.yearly_breakdown || {}
  const eraComparison = summary?.era_comparison

  // Calculate years active
  const years = Object.keys(yearlyBreakdown).sort()
  const yearsActive = years.length

  // Era data for visualization
  const eras = [
    { name: "Origin", period: "2009-2011", ...eraComparison?.origin, color: "bg-white/30" },
    { name: "Ascent", period: "2012-2015", ...eraComparison?.ascent, color: "bg-white/50" },
    { name: "Peak", period: "2016-2018", ...eraComparison?.peak, color: "bg-amber-500/70" },
    { name: "Recent", period: "2019-2025", ...eraComparison?.recent, color: "bg-amber-500" },
  ]

  // Animation
  useEffect(() => {
    if (!data) return
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [data])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <p className="text-white">Loading data...</p>
      </div>
    )
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
  }

  // Max for era bar scaling
  const maxEraSongs = Math.max(...eras.map((e) => e.songs || 0), 1)

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap');
      `}</style>

      <style jsx>{`
        .font-display { font-family: 'Bebas Neue', sans-serif; }
        .font-body { font-family: 'Outfit', sans-serif; }
        
        @keyframes glow {
          0%, 100% { 
            text-shadow: 0 0 20px rgba(212, 175, 55, 0.5), 0 0 40px rgba(212, 175, 55, 0.3);
          }
          50% { 
            text-shadow: 0 0 40px rgba(212, 175, 55, 0.8), 0 0 80px rgba(212, 175, 55, 0.5);
          }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        .glow-text {
          animation: glow 3s ease-in-out infinite;
        }
        
        .float-slow {
          animation: float 6s ease-in-out infinite;
        }
        
        .stat-card {
          background: linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(15, 15, 15, 0.95) 100%);
        }
        
        .gold-border {
          border: 2px solid rgba(212, 175, 55, 0.4);
          box-shadow: 0 0 30px rgba(212, 175, 55, 0.2);
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Central glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-amber-500/10 rounded-full blur-3xl" />
        
        {/* Floating elements */}
        <div className="absolute top-20 left-20 text-8xl opacity-10 float-slow">👑</div>
        <div className="absolute bottom-40 right-20 text-6xl opacity-10 float-slow" style={{ animationDelay: "2s" }}>🏆</div>
        
        {/* Large number watermark */}
        <div 
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[35rem] leading-none text-white/[0.015] select-none"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          {totalEntries}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        
        {/* Header */}
        <div className={`mb-16 text-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span 
            className="text-xs tracking-[0.4em] text-amber-500/70 uppercase"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Section 08 — The Legacy
          </span>
          
          <h1 
            className="text-6xl md:text-8xl lg:text-9xl leading-[0.85] tracking-tight mt-4 glow-text"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            <span className="text-amber-500">{totalEntries}</span>
          </h1>
          <p 
            className="text-2xl md:text-3xl text-white/70 mt-2"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            HOT 100 ENTRIES AND COUNTING
          </p>
          
          <p 
            className="text-lg text-white/50 mt-6 max-w-2xl mx-auto leading-relaxed"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            From "Best I Ever Had" in 2009 to the present day — Drake has rewritten 
            every record in Billboard history. This is the complete picture.
          </p>
        </div>

        {/* Hero stats grid */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="stat-card gold-border rounded-2xl p-6 text-center">
            <div className="text-5xl md:text-6xl text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {totalEntries}
            </div>
            <div className="text-sm text-white/50 mt-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Total Entries
            </div>
            <div className="text-xs text-amber-500/70 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              All-time record
            </div>
          </div>
          
          <div className="stat-card gold-border rounded-2xl p-6 text-center">
            <div className="text-5xl md:text-6xl text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {numberOneHits}
            </div>
            <div className="text-sm text-white/50 mt-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
              #1 Hits
            </div>
            <div className="text-xs text-amber-500/70 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Tied for most ever
            </div>
          </div>
          
          <div className="stat-card rounded-2xl p-6 text-center border border-white/10">
            <div className="text-5xl md:text-6xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {topTenHits}
            </div>
            <div className="text-sm text-white/50 mt-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Top 10 Hits
            </div>
            <div className="text-xs text-white/40 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              All-time record
            </div>
          </div>
          
          <div className="stat-card rounded-2xl p-6 text-center border border-white/10">
            <div className="text-5xl md:text-6xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {totalWeeks.toLocaleString()}
            </div>
            <div className="text-sm text-white/50 mt-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Total Weeks
            </div>
            <div className="text-xs text-white/40 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              ~{Math.round(totalWeeks / 52)} years on chart
            </div>
          </div>
        </div>

        {/* Journey summary */}
        <div className={`mb-16 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Start */}
              <div className="text-center md:text-left">
                <div className="text-xs text-amber-500/70 uppercase tracking-wider mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Where It Began
                </div>
                <div className="text-2xl text-white mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  {firstEntry?.title}
                </div>
                <div className="text-sm text-white/50" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {formatDate(firstEntry?.date || "")} • Peak #{firstEntry?.peak}
                </div>
              </div>

              {/* Arrow */}
              <div className="hidden md:flex items-center justify-center">
                <div className="text-4xl text-amber-500/30">→</div>
              </div>

              {/* Now */}
              <div className="text-center md:text-right">
                <div className="text-xs text-amber-500/70 uppercase tracking-wider mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {yearsActive} Years Later
                </div>
                <div className="text-2xl text-white mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  Still Charting
                </div>
                <div className="text-sm text-white/50" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {years[years.length - 1]} and beyond
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Era comparison */}
        <div className={`mb-16 transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span 
              className="text-xs tracking-[0.3em] text-amber-500/70 uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Evolution Across Eras
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {eras.map((era, i) => (
              <div
                key={era.name}
                className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-3 h-3 rounded-full ${era.color}`} />
                  <div>
                    <div 
                      className="text-lg text-white"
                      style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    >
                      {era.name}
                    </div>
                    <div 
                      className="text-xs text-white/40"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {era.period}
                    </div>
                  </div>
                </div>

                {/* Bar */}
                <div className="h-2 bg-white/5 rounded-full overflow-hidden mb-4">
                  <div
                    className={`h-full ${era.color} rounded-full transition-all duration-1000`}
                    style={{ width: `${((era.songs || 0) / maxEraSongs) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <div className="text-2xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      {era.songs}
                    </div>
                    <div className="text-xs text-white/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      Songs
                    </div>
                  </div>
                  <div>
                    <div className={`text-2xl ${(era.number_ones || 0) > 0 ? "text-amber-500" : "text-white/40"}`} style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      {era.number_ones}
                    </div>
                    <div className="text-xs text-white/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      #1s
                    </div>
                  </div>
                  <div>
                    <div className="text-2xl text-white/70" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      {era.top_tens}
                    </div>
                    <div className="text-xs text-white/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      Top 10
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* All #1 hits */}
        {/* <div className={`mb-16 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span 
              className="text-xs tracking-[0.3em] text-amber-500/70 uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              All {numberOneHits} #1 Hits
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {numberOneSongs.map((song, i) => (
              <div
                key={song.title}
                className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20"
              >
                <div 
                  className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-black font-bold shrink-0"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {i + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div 
                    className="text-white truncate"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {song.title}
                  </div>
                  <div 
                    className="text-sm text-white/40 truncate"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {song.artist}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div> */}

        {/* Additional stats */}
        <div className={`mb-16 transition-all duration-700 delay-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <div className="text-3xl text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                {avgWeeks}
              </div>
              <div className="text-xs text-white/50 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Avg. Weeks Per Song
              </div>
            </div>
            
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <div className="text-3xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                #{Math.round(avgPeak)}
              </div>
              <div className="text-xs text-white/50 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Avg. Peak Position
              </div>
            </div>
            
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <div className="text-3xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                {longestSong?.weeks}
              </div>
              <div className="text-xs text-white/50 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Longest Run (Weeks)
              </div>
            </div>
            
            <div className="p-5 rounded-xl bg-white/[0.02] border border-white/5 text-center">
              <div className="text-3xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                {yearsActive}
              </div>
              <div className="text-xs text-white/50 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Years on Hot 100
              </div>
            </div>
          </div>
        </div>

        {/* Yearly sparkline */}
        <div className={`mb-16 transition-all duration-700 delay-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span 
              className="text-xs tracking-[0.3em] text-amber-500/70 uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Entries Per Year
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-end justify-between gap-1 h-40">
              {years.map((year) => {
                const yearData = yearlyBreakdown[year]
                const entries = yearData?.entries || 0
                const maxEntries = Math.max(...Object.values(yearlyBreakdown).map((y) => y?.entries || 0), 1)
                const barHeight = maxEntries > 0 ? (entries / maxEntries) * 120 : 0
                
                return (
                  <div key={year} className="flex-1 flex flex-col items-center justify-end h-full">
                    <div 
                      className={`w-full max-w-[40px] rounded-t transition-all ${
                        (yearData?.number_ones || 0) > 0 ? "bg-amber-500" : "bg-white/30"
                      }`}
                      style={{ 
                        height: `${barHeight}px`, 
                        minHeight: entries > 0 ? '4px' : '0' 
                      }}
                    />
                    <span 
                      className="text-[9px] text-white/30 mt-2"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {year.slice(2)}
                    </span>
                  </div>
                )
              })}
            </div>
            
            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 text-xs text-white/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-amber-500" />
                <span>Year with #1 hit</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded bg-white/30" />
                <span>No #1 hit</span>
              </div>
            </div>
          </div>
        </div>

        {/* Closing statement */}
        <div className={`text-center transition-all duration-700 delay-[800ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="p-12 rounded-3xl bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20">
            <div 
              className="text-4xl md:text-5xl text-white mb-4"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              The Numbers Don't Lie
            </div>
            <p 
              className="text-lg text-white/50 max-w-2xl mx-auto leading-relaxed"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {totalEntries} songs. {numberOneHits} #1 hits. {topTenHits} top 10s. 
              {totalWeeks.toLocaleString()} weeks on the chart. Over {yearsActive} years of dominance.
              <br /><br />
              <span className="text-amber-500">Drake isn't just an artist — he's the standard.</span>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className={`mt-20 text-center transition-all duration-700 delay-[900ms] ${isVisible ? "opacity-100" : "opacity-0"}`}>
          <div className="h-[1px] w-32 mx-auto bg-gradient-to-r from-transparent via-amber-500/50 to-transparent mb-8" />
          <p 
            className="text-xs text-white/30 uppercase tracking-wider"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Data collected from Billboard Hot 100 • 2009-2025
          </p>
        </div>
      </div>
    </div>
  )
}