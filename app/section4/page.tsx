"use client"

import { useState, useEffect } from "react"

interface Song {
  title: string
  artist: string
  peak_pos: number
  weeks_on_chart: number
  first_chart_date: string
  reached_number_one: boolean
  collaborators: string[]
}

interface PeakData {
  name?: string
  song_count?: number
  number_ones?: number
  top_tens?: number
  songs?: Song[]
}

interface DataStructure {
  section_4_peak?: PeakData
}

export default function Section4Page() {
  const [data, setData] = useState<DataStructure | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [activeNumberOne, setActiveNumberOne] = useState<number>(0)

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
  const peakData = data?.section_4_peak || {}
  const songs = peakData.songs || []
  const songCount = peakData.song_count || 0
  const numberOnes = peakData.number_ones || 0
  const topTens = peakData.top_tens || 0

  // Get #1 hits
  const numberOneSongs = songs.filter((s) => s.reached_number_one)
  
  // Calculate stats
  const totalWeeks = songs.reduce((sum, s) => sum + s.weeks_on_chart, 0)
  const weeksAtOne = numberOneSongs.reduce((sum, s) => sum + s.weeks_on_chart, 0)
  
  // Group songs by month for heatmap
  const songsByMonth: Record<string, Song[]> = {}
  songs.forEach((song) => {
    const monthKey = song.first_chart_date?.substring(0, 7) // YYYY-MM
    if (monthKey) {
      if (!songsByMonth[monthKey]) songsByMonth[monthKey] = []
      songsByMonth[monthKey].push(song)
    }
  })

  // Scorpion drop date - July 2018 had massive chart flooding
  const scorpionDate = "2018-07"
  const scorpionSongs = songsByMonth[scorpionDate] || []

  // Auto-rotate #1 songs
  useEffect(() => {
    if (numberOneSongs.length === 0) return
    const timer = setInterval(() => {
      setActiveNumberOne((prev) => (prev + 1) % numberOneSongs.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [numberOneSongs.length])

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
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }

  // Generate months array for heatmap
  const generateMonths = () => {
    const months = []
    const start = new Date("2016-01-01")
    const end = new Date("2018-12-31")
    const current = new Date(start)
    
    while (current <= end) {
      months.push(current.toISOString().substring(0, 7))
      current.setMonth(current.getMonth() + 1)
    }
    return months
  }

  const months = generateMonths()
  const years = ["2016", "2017", "2018"]

  // Get heatmap intensity
  const getHeatmapColor = (count: number): string => {
    if (count === 0) return "bg-white/[0.02]"
    if (count === 1) return "bg-amber-500/20"
    if (count <= 3) return "bg-amber-500/40"
    if (count <= 5) return "bg-amber-500/60"
    if (count <= 10) return "bg-amber-500/80"
    return "bg-amber-500"
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap');
      `}</style>

      <style jsx>{`
        .font-display { font-family: 'Bebas Neue', sans-serif; }
        .font-body { font-family: 'Outfit', sans-serif; }
        
        @keyframes glow-pulse {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(212, 175, 55, 0.5), 0 0 40px rgba(212, 175, 55, 0.3), 0 0 60px rgba(212, 175, 55, 0.1);
          }
          50% { 
            box-shadow: 0 0 30px rgba(212, 175, 55, 0.8), 0 0 60px rgba(212, 175, 55, 0.5), 0 0 90px rgba(212, 175, 55, 0.2);
          }
        }
        
        @keyframes crown-float {
          0%, 100% { transform: translateY(0) rotate(-5deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        
        @keyframes slide-up {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .animate-glow { animation: glow-pulse 3s ease-in-out infinite; }
        .animate-crown { animation: crown-float 4s ease-in-out infinite; }
        .animate-slide-up { animation: slide-up 0.6s ease-out forwards; }
        
        .number-one-card {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%);
          border: 2px solid rgba(212, 175, 55, 0.4);
        }
        
        .crown-icon {
          filter: drop-shadow(0 0 10px rgba(212, 175, 55, 0.5));
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Radial gradient from center */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-amber-500/10 rounded-full blur-3xl" />
        
        {/* Crown watermark */}
        <div 
          className="absolute top-10 right-10 text-[15rem] leading-none text-amber-500/[0.03] select-none animate-crown"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          👑
        </div>
        
        {/* 90 watermark */}
        <div 
          className="absolute bottom-0 left-0 text-[30rem] leading-none text-white/[0.015] select-none"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          90
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        
        {/* Header */}
        <div className={`mb-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span 
            className="text-xs tracking-[0.4em] text-amber-500/70 uppercase"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Section 04 — The Peak
          </span>
          
          <h1 
            className="text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight mt-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            <span className="text-white/90">CHART</span>
            <br />
            <span className="text-amber-500">DOMINATION</span>
          </h1>
          
          <p 
            className="text-lg text-white/50 mt-6 max-w-xl leading-relaxed"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Views. More Life. Scorpion. In three years, Drake didn't just chart — 
            he rewrote what was possible. 90 entries. 5 #1 hits. Total dominance.
          </p>
        </div>

        {/* Big stats */}
        {/* <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-16 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 animate-glow">
            <div className="text-5xl md:text-6xl text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {songCount}
            </div>
            <div className="text-sm text-white/50 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Chart Entries
            </div>
          </div>
          
          <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/20">
            <div className="text-5xl md:text-6xl text-amber-400" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {numberOnes}
            </div>
            <div className="text-sm text-white/50 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              #1 Hits
            </div>
          </div>
          
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-5xl md:text-6xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {topTens}
            </div>
            <div className="text-sm text-white/50 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Top 10 Hits
            </div>
          </div>
          
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-5xl md:text-6xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {totalWeeks}
            </div>
            <div className="text-sm text-white/50 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Total Weeks
            </div>
          </div>
        </div> */}

        {/* #1 Hits showcase */}
        <div className={`mb-16 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span 
              className="text-xs tracking-[0.3em] text-amber-500/70 uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              The #1 Hits
            </span>
          </div>

          {/* Featured #1 */}
          {numberOneSongs.length > 0 && (
            <div className="number-one-card rounded-3xl p-8 md:p-12 mb-6 relative overflow-hidden">
              {/* Crown */}
              <div className="absolute top-4 right-4 text-6xl opacity-20 animate-crown">👑</div>
              
              <div className="flex items-start gap-6">
                <div 
                  className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-amber-500 flex items-center justify-center text-black text-4xl md:text-5xl font-bold shrink-0"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  #1
                </div>
                
                <div className="flex-1 min-w-0">
                  <div 
                    className="text-3xl md:text-5xl text-white mb-2 truncate"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {numberOneSongs[activeNumberOne]?.title}
                  </div>
                  <div 
                    className="text-lg text-white/50 mb-4"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {numberOneSongs[activeNumberOne]?.artist}
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    <span className="text-amber-500">
                      {numberOneSongs[activeNumberOne]?.weeks_on_chart} weeks on chart
                    </span>
                    <span className="text-white/30">•</span>
                    <span className="text-white/50">
                      {formatDate(numberOneSongs[activeNumberOne]?.first_chart_date || "")}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress dots */}
              <div className="flex gap-2 mt-8">
                {numberOneSongs.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveNumberOne(i)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      i === activeNumberOne ? "bg-amber-500 w-8" : "bg-white/20 hover:bg-white/40"
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All #1s grid */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {numberOneSongs.map((song, i) => (
              <div
                key={song.title}
                onClick={() => setActiveNumberOne(i)}
                className={`p-4 rounded-xl cursor-pointer transition-all ${
                  i === activeNumberOne 
                    ? "bg-amber-500/20 border-2 border-amber-500/50" 
                    : "bg-white/[0.02] border border-white/5 hover:border-amber-500/30"
                }`}
              >
                <div 
                  className="text-lg text-white/90 truncate mb-1"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {song.title}
                </div>
                <div 
                  className="text-xs text-white/40"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {formatDate(song.first_chart_date)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity heatmap */}
        <div className={`mb-16 transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span 
              className="text-xs tracking-[0.3em] text-amber-500/70 uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Chart Activity Heatmap
            </span>
          </div>

          <div className="bg-white/[0.02] rounded-2xl border border-white/5 p-6 overflow-x-auto">
            <div className="min-w-[700px]">
              {/* Year labels */}
              <div className="flex mb-2 pl-12">
                {years.map((year) => (
                  <div 
                    key={year} 
                    className="flex-1 text-center text-sm text-white/40"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {year}
                  </div>
                ))}
              </div>

              {/* Month grid */}
              <div className="flex gap-1">
                {/* Month labels */}
                <div className="flex flex-col gap-1 pr-2 text-xs text-white/30" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  {["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"].map((m, i) => (
                    <div key={i} className="h-8 flex items-center justify-end w-8">{m}</div>
                  ))}
                </div>

                {/* Heatmap cells */}
                {years.map((year) => (
                  <div key={year} className="flex-1 flex flex-col gap-1">
                    {Array.from({ length: 12 }, (_, monthIndex) => {
                      const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`
                      const count = songsByMonth[monthKey]?.length || 0
                      const isScorpion = monthKey === scorpionDate
                      
                      return (
                        <div
                          key={monthKey}
                          className={`h-8 rounded ${getHeatmapColor(count)} ${
                            isScorpion ? "ring-2 ring-amber-500" : ""
                          } transition-all hover:scale-105 cursor-pointer group relative`}
                          title={`${monthKey}: ${count} entries`}
                        >
                          {count > 0 && (
                            <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-black/70">
                              {count > 5 ? count : ""}
                            </div>
                          )}
                          
                          {/* Tooltip */}
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black/90 border border-amber-500/30 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            <div className="text-sm text-white" style={{ fontFamily: "'Outfit', sans-serif" }}>
                              {new Date(monthKey + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                            </div>
                            <div className="text-xs text-amber-500">{count} new entries</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                ))}
              </div>

              {/* Legend */}
              <div className="flex items-center gap-4 mt-6 text-xs text-white/50" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <span>Less</span>
                <div className="flex gap-1">
                  {[0, 1, 3, 5, 10, 15].map((n) => (
                    <div key={n} className={`w-4 h-4 rounded ${getHeatmapColor(n)}`} />
                  ))}
                </div>
                <span>More</span>
                <span className="ml-4 text-amber-500">⬤ Scorpion drop (July 2018)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scorpion highlight */}
        <div className={`mb-16 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span 
              className="text-xs tracking-[0.3em] text-amber-500/70 uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Scorpion: Chart Takeover
            </span>
          </div>

          <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="text-center md:text-left">
                <div 
                  className="text-7xl md:text-8xl text-amber-500"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {scorpionSongs.length}
                </div>
                <div 
                  className="text-sm text-white/50"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  songs charted in one week
                </div>
              </div>
              
              <div className="flex-1 text-white/60 text-sm leading-relaxed" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <p className="mb-2">
                  When <span className="text-amber-500 font-semibold">Scorpion</span> dropped in July 2018, 
                  Drake flooded the Hot 100 with {scorpionSongs.length} songs simultaneously — including 
                  "In My Feelings" at #1 and "Nonstop" at #2.
                </p>
                <p>
                  This era included three consecutive solo #1s: "God's Plan" → "Nice For What" → "In My Feelings"
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Top songs of the era */}
        <div className={`mb-16 transition-all duration-700 delay-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span 
              className="text-xs tracking-[0.3em] text-amber-500/70 uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Era Highlights
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...songs]
              .sort((a, b) => a.peak_pos - b.peak_pos)
              .slice(0, 9)
              .map((song, i) => (
                <div
                  key={`${song.title}-${i}`}
                  className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-amber-500/30 transition-all group"
                >
                  <div 
                    className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shrink-0 ${
                      song.peak_pos === 1 
                        ? "bg-amber-500 text-black" 
                        : song.peak_pos <= 5 
                          ? "bg-amber-500/30 text-amber-500" 
                          : "bg-white/5 text-white/60"
                    }`}
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    #{song.peak_pos}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div 
                      className="text-white/90 truncate group-hover:text-amber-500 transition-colors"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {song.title}
                    </div>
                    <div 
                      className="text-sm text-white/40 truncate"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {song.weeks_on_chart} weeks • {formatDate(song.first_chart_date)}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Bottom nav */}
        <div className={`mt-20 flex items-center gap-6 transition-all duration-700 delay-700 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-500/30 to-transparent" />
          <span 
            className="text-xs tracking-[0.3em] text-white/30 uppercase"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Next: Collaborations
          </span>
          <svg className="w-4 h-4 text-white/30 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  )
}