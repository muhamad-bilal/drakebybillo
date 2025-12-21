"use client"

import { useState, useEffect } from "react"

interface LongestSong {
  title: string
  weeks: number
  peak: number
}

interface LongevityData {
  distribution?: Record<string, number>
  longest_songs?: LongestSong[]
}

interface DataStructure {
  section_6_longevity?: LongevityData
}

export default function Section6Page() {
  const [data, setData] = useState<DataStructure | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredBar, setHoveredBar] = useState<string | null>(null)

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
  const longevityData = data?.section_6_longevity
  const distribution = longevityData?.distribution
  const longestSongs = longevityData?.longest_songs || []

  // Order distribution properly - access with bracket notation for keys with special chars
  const orderedDistribution = [
    { label: "1-5 weeks", value: distribution?.["1-5 weeks"] ?? 0, color: "bg-white/20" },
    { label: "6-10 weeks", value: distribution?.["6-10 weeks"] ?? 0, color: "bg-white/30" },
    { label: "11-20 weeks", value: distribution?.["11-20 weeks"] ?? 0, color: "bg-amber-500/50" },
    { label: "21-40 weeks", value: distribution?.["21-40 weeks"] ?? 0, color: "bg-amber-500/70" },
    { label: "40+ weeks", value: distribution?.["40+ weeks"] ?? 0, color: "bg-amber-500" },
  ]

  // Debug log
  useEffect(() => {
    if (data) {
      console.log("Longevity data:", longevityData)
      console.log("Distribution:", distribution)
      console.log("Ordered:", orderedDistribution)
    }
  }, [data])

  // Calculate totals
  const totalSongs = orderedDistribution.reduce((sum, d) => sum + d.value, 0)
  const totalWeeks = longestSongs.reduce((sum, s) => sum + s.weeks, 0)
  const avgWeeks = totalSongs > 0 ? Math.round(totalWeeks / longestSongs.length) : 0

  // Max value for scaling - ensure it's not 0
  const maxDistribution = Math.max(...orderedDistribution.map((d) => d.value), 1)

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

  // Get bar height percentage
  const getBarHeight = (value: number) => `${(value / maxDistribution) * 100}%`

  // Weeks to time description
  const weeksToMonths = (weeks: number) => {
    const months = Math.round(weeks / 4.33)
    if (months < 12) return `${months} months`
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    if (remainingMonths === 0) return `${years} year${years > 1 ? "s" : ""}`
    return `${years}y ${remainingMonths}m`
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap');
      `}</style>

      <style jsx>{`
        .font-display { font-family: 'Bebas Neue', sans-serif; }
        .font-body { font-family: 'Outfit', sans-serif; }
        
        @keyframes grow {
          from { transform: scaleY(0); }
          to { transform: scaleY(1); }
        }
        
        @keyframes width-grow {
          from { width: 0; }
          to { width: var(--target-width); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 20px rgba(212, 175, 55, 0.3); }
          50% { box-shadow: 0 0 40px rgba(212, 175, 55, 0.6); }
        }
        
        .bar-animate {
          animation: grow 1s ease-out forwards;
          transform-origin: bottom;
        }
        
        .pulse-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        
        .song-bar {
          transition: all 0.3s ease;
        }
        
        .song-bar:hover {
          transform: translateX(8px);
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 right-0 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-amber-500/3 rounded-full blur-3xl" />
        
        {/* Weeks watermark */}
        <div 
          className="absolute top-20 right-10 text-[12rem] leading-none text-white/[0.02] select-none"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          WEEKS
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
            Section 06 — The Long Game
          </span>
          
          <h1 
            className="text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight mt-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            <span className="text-white/90">STAYING</span>
            <br />
            <span className="text-amber-500">POWER</span>
          </h1>
          
          <p 
            className="text-lg text-white/50 mt-6 max-w-xl leading-relaxed"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            It's not just about hitting the chart — it's about staying there. 
            Drake's songs don't just debut, they live on the Hot 100 for months.
          </p>
        </div>

        {/* Key stat highlight */}
        <div className={`mb-16 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex flex-col md:flex-row items-center gap-8 p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 pulse-glow">
            <div className="text-center md:text-left">
              <div 
                className="text-8xl md:text-9xl text-amber-500"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                45
              </div>
              <div 
                className="text-lg text-white/50"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                weeks — longest chart run
              </div>
            </div>
            
            <div className="flex-1 text-center md:text-left">
              <div 
                className="text-2xl text-white mb-2"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                "No Guidance" (with Chris Brown)
              </div>
              <div 
                className="text-white/50"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Nearly a full year on the Hot 100. Peaked at #5 and refused to leave, 
                becoming Drake's longest-charting song ever.
              </div>
            </div>
          </div>
        </div>

        {/* Distribution chart */}
        <div className={`mb-16 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span 
              className="text-xs tracking-[0.3em] text-amber-500/70 uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Chart Duration Distribution
            </span>
          </div>

          <div className="bg-white/[0.02] rounded-2xl border border-white/5 p-8">
            {/* Bar chart */}
            <div className="flex items-end justify-around gap-4 h-[300px] mb-8">
              {orderedDistribution.map((item, i) => {
                const barHeight = maxDistribution > 0 ? (item.value / maxDistribution) * 250 : 0
                return (
                  <div
                    key={item.label}
                    className="flex-1 flex flex-col items-center gap-2 h-full justify-end"
                    onMouseEnter={() => setHoveredBar(item.label)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Value label */}
                    <div 
                      className={`text-2xl transition-all ${
                        hoveredBar === item.label ? "text-amber-500" : "text-white/70"
                      }`}
                      style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    >
                      {item.value}
                    </div>
                    
                    {/* Bar */}
                    <div 
                      className={`w-full max-w-[80px] ${item.color} rounded-t-lg transition-all ${
                        hoveredBar === item.label ? "opacity-100" : "opacity-80"
                      }`}
                      style={{
                        height: `${barHeight}px`,
                        minHeight: item.value > 0 ? '20px' : '0px',
                      }}
                    />
                    
                    {/* Label */}
                    <div 
                      className={`text-xs text-center transition-all mt-2 ${
                        hoveredBar === item.label ? "text-white" : "text-white/50"
                      }`}
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {item.label}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Insight */}
            <div className="flex items-center gap-4 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
              <div className="text-3xl">📊</div>
              <div className="text-sm text-white/70" style={{ fontFamily: "'Outfit', sans-serif" }}>
                <span className="text-amber-500 font-semibold">
                  {orderedDistribution[2].value + orderedDistribution[3].value + orderedDistribution[4].value} songs
                </span>{" "}
                ({Math.round(((orderedDistribution[2].value + orderedDistribution[3].value + orderedDistribution[4].value) / totalSongs) * 100)}%) 
                charted for 11+ weeks — showing Drake's unmatched staying power.
              </div>
            </div>
          </div>
        </div>

        {/* Longest running songs */}
        <div className={`mb-16 transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-4 mb-8">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span 
              className="text-xs tracking-[0.3em] text-amber-500/70 uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Longest Running Songs
            </span>
          </div>

          <div className="space-y-3">
            {longestSongs.map((song, i) => (
              <div
                key={song.title}
                className="song-bar relative p-4 rounded-xl bg-white/[0.02] border border-white/5 overflow-hidden group"
              >
                {/* Background bar */}
                <div
                  className={`absolute inset-y-0 left-0 ${
                    i === 0 ? "bg-amber-500/20" : "bg-white/[0.03]"
                  }`}
                  style={{ width: `${(song.weeks / 45) * 100}%` }}
                />
                
                {/* Content */}
                <div className="relative flex items-center gap-4">
                  {/* Rank */}
                  <div 
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${
                      i < 3 ? "bg-amber-500/30 text-amber-500" : "bg-white/5 text-white/40"
                    }`}
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {i + 1}
                  </div>

                  {/* Song info */}
                  <div className="flex-1 min-w-0">
                    <div 
                      className="text-lg text-white/90 truncate group-hover:text-amber-500 transition-colors"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {song.title}
                    </div>
                    <div 
                      className="text-sm text-white/40"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      Peak: #{song.peak}
                    </div>
                  </div>

                  {/* Weeks */}
                  <div className="text-right">
                    <div 
                      className={`text-2xl ${i === 0 ? "text-amber-500" : "text-white/80"}`}
                      style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    >
                      {song.weeks}
                    </div>
                    <div 
                      className="text-xs text-white/40"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      weeks ({weeksToMonths(song.weeks)})
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Time perspective */}
        <div className={`mb-16 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span 
              className="text-xs tracking-[0.3em] text-amber-500/70 uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Putting It In Perspective
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <div 
                className="text-5xl text-amber-500 mb-2"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                {Math.round(45 / 4.33)}
              </div>
              <div 
                className="text-sm text-white/50"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                months "No Guidance" charted
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <div 
                className="text-5xl text-white/90 mb-2"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                {orderedDistribution[3].value + orderedDistribution[4].value}
              </div>
              <div 
                className="text-sm text-white/50"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                songs that charted 21+ weeks
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 text-center">
              <div 
                className="text-5xl text-white/90 mb-2"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                5
              </div>
              <div 
                className="text-sm text-white/50"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                songs with 36+ weeks (9 months)
              </div>
            </div>
          </div>
        </div>

        {/* 36-week club */}
        <div className={`mb-16 transition-all duration-700 delay-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span 
              className="text-xs tracking-[0.3em] text-amber-500/70 uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              The 36-Week Club (9+ Months)
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {longestSongs.filter((s) => s.weeks >= 36).map((song) => (
              <div
                key={song.title}
                className="p-4 rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-500/5 border border-amber-500/30 text-center"
              >
                <div 
                  className="text-lg text-white mb-1"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {song.title}
                </div>
                <div 
                  className="text-sm text-amber-500"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {song.weeks} weeks • #{song.peak} peak
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
            Next: Recent Years
          </span>
          <svg className="w-4 h-4 text-white/30 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  )
}