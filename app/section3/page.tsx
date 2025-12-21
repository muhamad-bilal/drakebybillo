"use client"

import { useState, useEffect, useRef } from "react"

interface Song {
  title: string
  artist: string
  peak_pos: number
  weeks_on_chart: number
  first_chart_date: string
  reached_number_one: boolean
  collaborators: string[]
}

interface AscentData {
  name?: string
  song_count?: number
  number_ones?: number
  top_tens?: number
  songs?: Song[]
}

interface DataStructure {
  section_3_ascent?: AscentData
}

export default function Section3Page() {
  const [data, setData] = useState<DataStructure | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [hoveredSong, setHoveredSong] = useState<Song | null>(null)
  const chartRef = useRef<HTMLDivElement>(null)

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
  const ascentData = data?.section_3_ascent || {}
  const songs = ascentData.songs || []
  const songCount = ascentData.song_count || 0
  const numberOnes = ascentData.number_ones || 0
  const topTens = ascentData.top_tens || 0

  // Calculate stats
  const totalWeeks = songs.reduce((sum, s) => sum + s.weeks_on_chart, 0)

  // Group by year
  const years = ["2012", "2013", "2014", "2015"]
  const songsByYear: Record<string, Song[]> = {}
  years.forEach((y) => (songsByYear[y] = []))
  songs.forEach((song) => {
    const year = song.first_chart_date?.substring(0, 4)
    if (year && songsByYear[year]) {
      songsByYear[year].push(song)
    }
  })

  // Get top songs
  const topSongs = [...songs].sort((a, b) => a.peak_pos - b.peak_pos).slice(0, 10)

  // Notable moments
  const notableMoments = [
    { year: "2013", title: "Started From The Bottom", desc: "Anthem that defined the era", peak: 6 },
    { year: "2013", title: "Hold On, We're Going Home", desc: "32 weeks on chart - longest run", peak: 4 },
    { year: "2015", title: "Hotline Bling", desc: "Cultural phenomenon, peaked at #2", peak: 2 },
    { year: "2015", title: "What A Time To Be Alive", desc: "Collab tape with Future drops", peak: null },
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
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  // Chart dimensions
  const chartHeight = 400
  const maxPos = 100

  // Get Y position for peak position (inverted - #1 at top)
  const getYPos = (peak: number): number => {
    return (peak / maxPos) * chartHeight
  }

  // Get color based on peak
  const getPeakColor = (peak: number): string => {
    if (peak <= 5) return "#D4AF37"
    if (peak <= 10) return "#D4AF37aa"
    if (peak <= 20) return "#ffffff66"
    if (peak <= 40) return "#ffffff44"
    return "#ffffff22"
  }

  // Filter songs by year
  const displaySongs = selectedYear ? songsByYear[selectedYear] || [] : songs

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap');
      `}</style>

      <style jsx>{`
        .font-display { font-family: 'Bebas Neue', sans-serif; }
        .font-body { font-family: 'Outfit', sans-serif; }
        
        @keyframes rise {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        @keyframes pulse-ring {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2); opacity: 0; }
        }
        
        .animate-rise { animation: rise 0.6s ease-out forwards; }
        
        .chart-dot {
          transition: all 0.3s ease;
        }
        
        .chart-dot:hover {
          transform: scale(1.5);
          z-index: 10;
        }
        
        .year-btn {
          transition: all 0.3s ease;
        }
        
        .year-btn.active {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(212, 175, 55, 0.1));
          border-color: rgba(212, 175, 55, 0.5);
        }
        
        .gradient-mask {
          mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
          -webkit-mask-image: linear-gradient(to bottom, black 80%, transparent 100%);
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-3xl" />
        <div 
          className="absolute bottom-0 right-0 text-[25rem] leading-none text-white/[0.02] select-none"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          61
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
            Section 03 — The Ascent
          </span>
          
          <h1 
            className="text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight mt-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            <span className="text-white/90">BUILDING</span>
            <br />
            <span className="text-amber-500">MOMENTUM</span>
          </h1>
          
          <p 
            className="text-lg text-white/50 mt-6 max-w-xl leading-relaxed"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            61 chart entries. Zero #1 hits. But "Hotline Bling" at #2 and countless anthems 
            proved Drake was on the verge of total domination.
          </p>
        </div>

        {/* Stats row
        <div className={`grid grid-cols-2 md:grid-cols-5 gap-4 mb-12 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
            <div className="text-3xl md:text-4xl text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {songCount}
            </div>
            <div className="text-xs text-white/50 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Entries
            </div>
          </div>
          
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-3xl md:text-4xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {topTens}
            </div>
            <div className="text-xs text-white/50 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Top 10s
            </div>
          </div>
          
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-3xl md:text-4xl text-white/40" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {numberOnes}
            </div>
            <div className="text-xs text-white/50 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              #1 Hits
            </div>
          </div>
          
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-3xl md:text-4xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              #2
            </div>
            <div className="text-xs text-white/50 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Best Peak
            </div>
          </div>
          
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-3xl md:text-4xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {totalWeeks}
            </div>
            <div className="text-xs text-white/50 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Total Weeks
            </div>
          </div>
        </div> */}

        {/* Year filter */}
        <div className={`flex flex-wrap items-center gap-3 mb-8 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span className="text-xs text-white/40 uppercase tracking-wider" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Filter:
          </span>
          <button
            onClick={() => setSelectedYear(null)}
            className={`year-btn px-4 py-2 rounded-lg text-sm border transition-all ${
              selectedYear === null 
                ? "active text-amber-500" 
                : "border-white/10 text-white/50 hover:text-white/80"
            }`}
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            All Years
          </button>
          {years.map((year) => (
            <button
              key={year}
              onClick={() => setSelectedYear(year)}
              className={`year-btn px-4 py-2 rounded-lg text-sm border transition-all ${
                selectedYear === year 
                  ? "active text-amber-500" 
                  : "border-white/10 text-white/50 hover:text-white/80"
              }`}
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {year}
              <span className="ml-2 text-xs opacity-50">({songsByYear[year]?.length || 0})</span>
            </button>
          ))}
        </div>

        {/* Scatter chart visualization */}
        <div className={`mb-16 transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span 
              className="text-xs tracking-[0.3em] text-amber-500/70 uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Peak Positions Over Time
            </span>
          </div>

          <div className="relative bg-white/[0.02] rounded-2xl border border-white/5 p-6 overflow-hidden">
            {/* Y-axis labels */}
            <div className="absolute left-2 top-6 bottom-6 flex flex-col justify-between text-xs text-white/30" style={{ fontFamily: "'Outfit', sans-serif" }}>
              <span>#1</span>
              <span>#25</span>
              <span>#50</span>
              <span>#75</span>
              <span>#100</span>
            </div>

            {/* Chart area */}
            <div ref={chartRef} className="ml-10 relative" style={{ height: `${chartHeight}px` }}>
              {/* Grid lines */}
              {[1, 25, 50, 75, 100].map((pos) => (
                <div
                  key={pos}
                  className="absolute left-0 right-0 border-t border-white/5"
                  style={{ top: `${getYPos(pos)}px` }}
                />
              ))}

              {/* Year dividers */}
              {years.map((year, i) => (
                <div
                  key={year}
                  className="absolute top-0 bottom-0 border-l border-white/10"
                  style={{ left: `${(i / years.length) * 100}%` }}
                >
                  <span 
                    className="absolute -bottom-6 left-2 text-xs text-white/30"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {year}
                  </span>
                </div>
              ))}

              {/* Data points */}
              {displaySongs.map((song, i) => {
                const songDate = new Date(song.first_chart_date)
                const startDate = new Date("2012-01-01")
                const endDate = new Date("2015-12-31")
                const totalDays = endDate.getTime() - startDate.getTime()
                const songDays = songDate.getTime() - startDate.getTime()
                const xPercent = Math.max(0, Math.min(100, (songDays / totalDays) * 100))
                
                return (
                  <div
                    key={`${song.title}-${i}`}
                    className="chart-dot absolute cursor-pointer"
                    style={{
                      left: `${xPercent}%`,
                      top: `${getYPos(song.peak_pos)}px`,
                      transform: "translate(-50%, -50%)",
                    }}
                    onMouseEnter={() => setHoveredSong(song)}
                    onMouseLeave={() => setHoveredSong(null)}
                  >
                    <div
                      className="rounded-full"
                      style={{
                        width: `${Math.max(8, Math.min(20, song.weeks_on_chart / 2))}px`,
                        height: `${Math.max(8, Math.min(20, song.weeks_on_chart / 2))}px`,
                        backgroundColor: getPeakColor(song.peak_pos),
                        boxShadow: song.peak_pos <= 10 ? `0 0 10px ${getPeakColor(song.peak_pos)}` : "none",
                      }}
                    />
                  </div>
                )
              })}

              {/* Hotline Bling highlight */}
              {displaySongs.find((s) => s.title === "Hotline Bling") && (
                <div
                  className="absolute pointer-events-none"
                  style={{
                    left: "87%",
                    top: `${getYPos(2)}px`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div className="w-6 h-6 rounded-full border-2 border-amber-500 animate-ping opacity-50" />
                </div>
              )}
            </div>

            {/* Legend */}
            <div className="mt-10 flex flex-wrap items-center gap-6 text-xs text-white/50" style={{ fontFamily: "'Outfit', sans-serif" }}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <span>Top 5</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                <span>Top 10</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white/40" />
                <span>Top 20</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-white/20" />
                <span>Below 20</span>
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-white/30">Dot size = weeks on chart</span>
              </div>
            </div>
          </div>
        </div>

        {/* Top songs list */}
        <div className={`mb-16 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span 
              className="text-xs tracking-[0.3em] text-amber-500/70 uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Top 10 Highest Peaking Songs
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topSongs.map((song, i) => (
              <div
                key={`${song.title}-${i}`}
                className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-amber-500/20 transition-all group"
              >
                <div 
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold ${
                    song.peak_pos <= 5 
                      ? "bg-amber-500/20 text-amber-500" 
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
                    {song.weeks_on_chart} weeks • {song.first_chart_date.substring(0, 4)}
                  </div>
                </div>
                {song.collaborators.length > 0 && (
                  <div className="text-xs text-white/30 hidden lg:block" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    ft. {song.collaborators[0]}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Key moments timeline */}
        <div className={`mb-16 transition-all duration-700 delay-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span 
              className="text-xs tracking-[0.3em] text-amber-500/70 uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Defining Moments
            </span>
          </div>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-[1px] bg-gradient-to-b from-amber-500/50 via-amber-500/20 to-transparent" />

            <div className="space-y-8">
              {notableMoments.map((moment, i) => (
                <div key={i} className="flex items-start gap-6 pl-12 relative">
                  {/* Dot */}
                  <div className="absolute left-4 top-2 w-4 h-4 rounded-full bg-amber-500/30 border-2 border-amber-500" />
                  
                  <div>
                    <div className="text-xs text-amber-500/70 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {moment.year}
                    </div>
                    <div className="text-xl text-white/90 mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      {moment.title}
                    </div>
                    <div className="text-sm text-white/50" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      {moment.desc}
                      {moment.peak && <span className="text-amber-500/70 ml-2">• Peak #{moment.peak}</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <div className={`mt-20 flex items-center gap-6 transition-all duration-700 delay-700 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-500/30 to-transparent" />
          <span 
            className="text-xs tracking-[0.3em] text-white/30 uppercase"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Next: The Peak (2016-2018)
          </span>
          <svg className="w-4 h-4 text-white/30 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>

        {/* Hover tooltip */}
        {hoveredSong && (
          <div 
            className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-4 rounded-2xl bg-black/95 border border-amber-500/30 backdrop-blur-xl z-50 max-w-md"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            <div className="text-lg text-white/90 font-medium">{hoveredSong.title}</div>
            <div className="text-sm text-white/50">{hoveredSong.artist}</div>
            <div className="flex gap-4 mt-2 text-xs text-white/40">
              <span className="text-amber-500">Peak: #{hoveredSong.peak_pos}</span>
              <span>•</span>
              <span>{hoveredSong.weeks_on_chart} weeks</span>
              <span>•</span>
              <span>{formatDate(hoveredSong.first_chart_date)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}