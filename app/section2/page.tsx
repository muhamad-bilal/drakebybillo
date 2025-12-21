"use client"

import { useState, useEffect, useMemo } from "react"

interface Song {
  title: string
  artist: string
  peak_pos: number
  weeks_on_chart: number
  first_chart_date: string
  reached_number_one: boolean
  collaborators: string[]
}

interface OriginData {
  name?: string
  song_count?: number
  number_ones?: number
  top_tens?: number
  songs?: Song[]
}

interface DataStructure {
  section_2_origin?: OriginData
}

interface YearStats {
  year: string
  total: number
  top10: number
  top40: number
  below40: number
  songs: Song[]
  totalWeeks: number
  bestSong: Song | null
}

export default function Section2Page() {
  const [data, setData] = useState<DataStructure | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredYear, setHoveredYear] = useState<string | null>(null)

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
  const originData = data?.section_2_origin || {}
  const songs = originData.songs || []
  const songCount = originData.song_count || 0
  const numberOnes = originData.number_ones || 0
  const topTens = originData.top_tens || 0

  // Calculate stats by year
  const yearStats: YearStats[] = useMemo(() => {
    const years = ["2009", "2010", "2011"]
    
    return years.map((year) => {
      const yearSongs = songs.filter((s) => s.first_chart_date?.startsWith(year))
      const top10 = yearSongs.filter((s) => s.peak_pos <= 10).length
      const top40 = yearSongs.filter((s) => s.peak_pos > 10 && s.peak_pos <= 40).length
      const below40 = yearSongs.filter((s) => s.peak_pos > 40).length
      const totalWeeks = yearSongs.reduce((sum, s) => sum + s.weeks_on_chart, 0)
      const bestSong = yearSongs.length > 0 
        ? yearSongs.reduce((best, s) => s.peak_pos < best.peak_pos ? s : best, yearSongs[0])
        : null

      return {
        year,
        total: yearSongs.length,
        top10,
        top40,
        below40,
        songs: yearSongs,
        totalWeeks,
        bestSong,
      }
    })
  }, [songs])

  // Max values for scaling
  const maxTotal = Math.max(...yearStats.map((y) => y.total), 1)
  const maxWeeks = Math.max(...yearStats.map((y) => y.totalWeeks), 1)

  // Calculate total weeks
  const totalWeeks = songs.reduce((sum, s) => sum + s.weeks_on_chart, 0)

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

  // Bar height calculation
  const getBarHeight = (value: number, max: number): number => {
    return (value / max) * 200
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap');
      `}</style>

      <style jsx>{`
        .font-display { font-family: 'Bebas Neue', sans-serif; }
        .font-body { font-family: 'Outfit', sans-serif; }
        
        .year-bar {
          transition: all 0.3s ease;
        }
        
        .year-bar:hover {
          filter: brightness(1.2);
        }
        
        .growth-arrow {
          animation: bounce-right 1s ease-in-out infinite;
        }
        
        @keyframes bounce-right {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-amber-500/3 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        
        {/* Header */}
        <div className={`mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span 
            className="text-xs tracking-[0.4em] text-amber-500/70 uppercase"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Section 02 — The Origin
          </span>
          
          <h1 
            className="text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight mt-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            <span className="text-white/90">WHERE IT</span>
            <br />
            <span className="text-amber-500">BEGAN</span>
          </h1>
          
          <p 
            className="text-lg text-white/50 mt-6 max-w-xl leading-relaxed"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            2009-2011: Watch the rise year by year. From 7 entries to 10 — 
            each year building momentum toward total domination.
          </p>
        </div>

        {/* Stats row */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/20">
            <div className="text-4xl text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {songCount}
            </div>
            <div className="text-xs text-white/50 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Chart Entries
            </div>
          </div>
          
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-4xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {numberOnes}
            </div>
            <div className="text-xs text-white/50 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              #1 Hit
            </div>
          </div>
          
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-4xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {topTens}
            </div>
            <div className="text-xs text-white/50 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Top 10 Hits
            </div>
          </div>
          
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-4xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {totalWeeks}
            </div>
            <div className="text-xs text-white/50 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Total Weeks
            </div>
          </div>
        </div>

        {/* Year over Year Growth Chart */}
        <div className={`mb-12 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span 
              className="text-xs tracking-[0.3em] text-amber-500/70 uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Year-Over-Year Growth
            </span>
          </div>

          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
            {/* Stacked Bar Chart */}
            <div className="flex items-end justify-around gap-8 h-[280px] mb-8">
              {yearStats.map((stat, i) => (
                <div
                  key={stat.year}
                  className="flex-1 flex flex-col items-center"
                  onMouseEnter={() => setHoveredYear(stat.year)}
                  onMouseLeave={() => setHoveredYear(null)}
                >
                  {/* Total count label */}
                  <div 
                    className={`text-3xl mb-2 transition-colors ${
                      hoveredYear === stat.year ? "text-amber-500" : "text-white/70"
                    }`}
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {stat.total}
                  </div>

                  {/* Stacked bars */}
                  <div 
                    className="w-full max-w-[120px] flex flex-col-reverse year-bar rounded-t-lg overflow-hidden"
                    style={{ height: `${getBarHeight(stat.total, maxTotal)}px` }}
                  >
                    {/* Top 10 segment */}
                    <div 
                      className="w-full bg-amber-500"
                      style={{ height: `${(stat.top10 / stat.total) * 100}%` }}
                    />
                    {/* Top 40 segment */}
                    <div 
                      className="w-full bg-amber-500/50"
                      style={{ height: `${(stat.top40 / stat.total) * 100}%` }}
                    />
                    {/* Below 40 segment */}
                    <div 
                      className="w-full bg-white/20"
                      style={{ height: `${(stat.below40 / stat.total) * 100}%` }}
                    />
                  </div>

                  {/* Year label */}
                  <div 
                    className={`text-2xl mt-4 transition-colors ${
                      hoveredYear === stat.year ? "text-amber-500" : "text-white/80"
                    }`}
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {stat.year}
                  </div>
                </div>
              ))}
            </div>

            {/* Growth arrows between years */}
            <div className="flex justify-around items-center mb-6">
              <div className="flex-1" />
              <div className="flex items-center gap-2 text-amber-500/70">
                <span className="text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>+43%</span>
                <span className="growth-arrow">→</span>
              </div>
              <div className="flex-1" />
              <div className="flex items-center gap-2 text-amber-500/70">
                <span className="text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>+0%</span>
                <span className="growth-arrow">→</span>
              </div>
              <div className="flex-1" />
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-sm" style={{ fontFamily: "'Outfit', sans-serif" }}>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-500" />
                <span className="text-white/60">Top 10</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-amber-500/50" />
                <span className="text-white/60">Top 40</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-white/20" />
                <span className="text-white/60">Below 40</span>
              </div>
            </div>
          </div>
        </div>

        {/* Year Detail Cards */}
        <div className={`mb-12 transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span 
              className="text-xs tracking-[0.3em] text-amber-500/70 uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Year Breakdown
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {yearStats.map((stat, i) => (
              <div
                key={stat.year}
                className={`p-6 rounded-2xl border transition-all ${
                  i === 2 
                    ? "bg-gradient-to-br from-amber-500/15 to-transparent border-amber-500/30" 
                    : "bg-white/[0.02] border-white/10"
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div 
                    className="text-4xl text-white"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {stat.year}
                  </div>
                  <div 
                    className={`px-3 py-1 rounded-full text-sm ${
                      i === 2 ? "bg-amber-500 text-black" : "bg-white/10 text-white/70"
                    }`}
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {stat.total} songs
                  </div>
                </div>

                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 rounded-lg bg-black/20">
                    <div className="text-xl text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      {stat.top10}
                    </div>
                    <div className="text-[10px] text-white/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      Top 10
                    </div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-black/20">
                    <div className="text-xl text-white/70" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      {stat.top40}
                    </div>
                    <div className="text-[10px] text-white/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      Top 40
                    </div>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-black/20">
                    <div className="text-xl text-white/70" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      {stat.totalWeeks}
                    </div>
                    <div className="text-[10px] text-white/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      Weeks
                    </div>
                  </div>
                </div>

                {/* Best song */}
                {stat.bestSong && (
                  <div className="p-3 rounded-lg bg-black/30">
                    <div className="text-[10px] text-white/40 uppercase tracking-wider mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      Best Performing
                    </div>
                    <div className="flex items-center gap-2">
                      <div 
                        className={`w-8 h-8 rounded flex items-center justify-center text-sm ${
                          stat.bestSong.peak_pos === 1 ? "bg-amber-500 text-black" : "bg-amber-500/30 text-amber-500"
                        }`}
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                      >
                        #{stat.bestSong.peak_pos}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm text-white truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          {stat.bestSong.title}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* The breakthrough moment */}
        <div className={`mb-12 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="text-center md:text-left">
                <div className="text-xs text-amber-500/70 uppercase tracking-wider mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  The First #1
                </div>
                <div className="text-3xl md:text-4xl text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  "What's My Name?"
                </div>
                <div className="text-white/50" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  with Rihanna • November 2010
                </div>
              </div>
              
              <div className="flex-1 flex justify-center">
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-6xl text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      #1
                    </div>
                    <div className="text-xs text-white/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      Peak Position
                    </div>
                  </div>
                  <div className="w-[1px] h-16 bg-white/10" />
                  <div className="text-center">
                    <div className="text-6xl text-white/80" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      27
                    </div>
                    <div className="text-xs text-white/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      Weeks on Chart
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom nav */}
        <div className={`mt-20 flex items-center gap-6 transition-all duration-700 delay-600 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-500/30 to-transparent" />
          <span 
            className="text-xs tracking-[0.3em] text-white/30 uppercase"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Next: The Ascent
          </span>
          <svg className="w-4 h-4 text-white/30 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  )
}