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

interface Section4ContentProps {
  isActive?: boolean
}

export function Section4Content({ isActive = false }: Section4ContentProps) {
  const [data, setData] = useState<DataStructure | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [activeNumberOne, setActiveNumberOne] = useState<number>(0)
  const [hoveredMonth, setHoveredMonth] = useState<string | null>(null)

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
  const numberOneSongs = useMemo(() => songs.filter((s) => s.reached_number_one), [songs])

  // Calculate stats
  const totalWeeks = songs.reduce((sum, s) => sum + s.weeks_on_chart, 0)

  // Group songs by month for heatmap
  const songsByMonth: Record<string, Song[]> = useMemo(() => {
    const grouped: Record<string, Song[]> = {}
    songs.forEach((song) => {
      const monthKey = song.first_chart_date?.substring(0, 7)
      if (monthKey) {
        if (!grouped[monthKey]) grouped[monthKey] = []
        grouped[monthKey].push(song)
      }
    })
    return grouped
  }, [songs])

  // Scorpion drop date
  const scorpionDate = "2018-07"
  const scorpionSongs = songsByMonth[scorpionDate] || []

  // Auto-rotate #1 songs
  useEffect(() => {
    if (numberOneSongs.length === 0 || !isActive) return
    const timer = setInterval(() => {
      setActiveNumberOne((prev) => (prev + 1) % numberOneSongs.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [numberOneSongs.length, isActive])

  // Trigger animation when section becomes active
  useEffect(() => {
    if (!data || !isActive) return
    setIsVisible(true)
  }, [data, isActive])

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }

  // Generate months for heatmap
  const years = ["2016", "2017", "2018"]
  const monthLabels = ["J", "F", "M", "A", "M", "J", "J", "A", "S", "O", "N", "D"]

  // Get heatmap intensity
  const getHeatmapColor = (count: number): string => {
    if (count === 0) return "bg-foreground/[0.02]"
    if (count === 1) return "bg-amber-500/20"
    if (count <= 3) return "bg-amber-500/40"
    if (count <= 5) return "bg-amber-500/60"
    if (count <= 10) return "bg-amber-500/80"
    return "bg-amber-500"
  }

  // Get hovered month data
  const hoveredMonthData = hoveredMonth ? {
    songs: songsByMonth[hoveredMonth] || [],
    date: new Date(hoveredMonth + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })
  } : null

  if (loading) {
    return (
      <section className="flex h-screen w-screen shrink-0 items-center justify-center">
        <p className="text-foreground/60">Loading data...</p>
      </section>
    )
  }

  return (
    <section className="relative flex h-screen w-screen shrink-0 overflow-hidden">
      {/* Custom styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap');
      `}</style>

      <style jsx>{`
        .number-one-card {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%);
          border: 2px solid rgba(212, 175, 55, 0.4);
        }
      `}</style>


      {/* Main content */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-6 py-8 w-full">

          {/* Header Row */}
          <div className={`flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-6 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {/* Title */}
            <div>
              <h1
                className="text-5xl md:text-6xl lg:text-7xl leading-[0.9] tracking-tight"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                <span className="text-foreground/90">CHART</span>{" "}
                <span className="text-amber-500">DOMINATION</span>
              </h1>
              <p
                className="text-sm md:text-base text-foreground/50 mt-3 max-w-lg leading-relaxed"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                2016-2018: Views. More Life. Scorpion. 90 entries. 5 #1 hits. Total dominance.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-3">
              <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/20">
                <div className="text-[1.625rem] text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{songCount}</div>
                <div className="text-[10px] text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif" }}>Entries</div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/15">
                <div className="text-[1.625rem] text-amber-400" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{numberOnes}</div>
                <div className="text-[10px] text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif" }}>#1 Hits</div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                <div className="text-[1.625rem] text-foreground/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{topTens}</div>
                <div className="text-[10px] text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif" }}>Top 10</div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                <div className="text-[1.625rem] text-foreground/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{totalWeeks}</div>
                <div className="text-[10px] text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif" }}>Weeks</div>
              </div>
            </div>
          </div>

          {/* Main Content - Heatmap + #1 Showcase */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="p-6 rounded-3xl bg-foreground/[0.02] border border-foreground/5">
              <div className="flex flex-col lg:flex-row gap-6">

                {/* Heatmap */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-[1px] w-8 bg-amber-500/50" />
                    <span
                      className="text-xs tracking-[0.2em] text-amber-500/70 uppercase"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      Chart Activity Heatmap
                    </span>
                  </div>

                  <div className="bg-black/20 rounded-xl p-4">
                    {/* Year labels */}
                    <div className="flex mb-2 pl-6">
                      {years.map((year) => (
                        <div
                          key={year}
                          className="flex-1 text-center text-sm text-foreground/50"
                          style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                          {year}
                        </div>
                      ))}
                    </div>

                    {/* Month grid */}
                    <div className="flex gap-1">
                      {/* Month labels */}
                      <div className="flex flex-col gap-1 pr-1 text-xs text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {monthLabels.map((m, i) => (
                          <div key={i} className="h-5 flex items-center justify-end w-5">{m}</div>
                        ))}
                      </div>

                      {/* Heatmap cells */}
                      {years.map((year) => (
                        <div key={year} className="flex-1 flex flex-col gap-1">
                          {Array.from({ length: 12 }, (_, monthIndex) => {
                            const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`
                            const count = songsByMonth[monthKey]?.length || 0
                            const isScorpion = monthKey === scorpionDate
                            const isHovered = hoveredMonth === monthKey

                            return (
                              <div
                                key={monthKey}
                                className={`h-5 rounded-sm ${getHeatmapColor(count)} ${
                                  isScorpion ? "ring-1 ring-amber-500" : ""
                                } ${isHovered ? "ring-2 ring-amber-400 scale-105" : ""} transition-all cursor-pointer`}
                                onMouseEnter={() => setHoveredMonth(monthKey)}
                                onMouseLeave={() => setHoveredMonth(null)}
                              >
                                {count > 5 && (
                                  <div className="h-full flex items-center justify-center text-[10px] font-bold text-black/70">
                                    {count}
                                  </div>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ))}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-3 mt-4 pt-3 border-t border-foreground/5 text-sm text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      <span>Less</span>
                      <div className="flex gap-0.5">
                        {[0, 1, 3, 5, 10, 15].map((n) => (
                          <div key={n} className={`w-3 h-3 rounded-sm ${getHeatmapColor(n)}`} />
                        ))}
                      </div>
                      <span>More</span>
                      <span className="ml-3 text-amber-500 text-xs">● Scorpion ({scorpionSongs.length} songs)</span>
                    </div>
                  </div>

                  {/* Hover Detail / Scorpion Highlight */}
                  <div className={`mt-4 p-4 rounded-xl border transition-all duration-300 ${
                    hoveredMonthData
                      ? "bg-amber-500/10 border-amber-500/40"
                      : "bg-gradient-to-r from-amber-500/15 to-transparent border-amber-500/30"
                  }`}>
                    {hoveredMonthData ? (
                      // Hovered month details
                      <div className="flex items-center gap-5">
                        <div className="text-center min-w-[60px]">
                          <div className="text-[2.5rem] text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                            {hoveredMonthData.songs.length}
                          </div>
                          <div className="text-xs text-foreground/50 uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Entries
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-base text-foreground font-medium mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {hoveredMonthData.date}
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {hoveredMonthData.songs.slice(0, 5).map((song, i) => (
                              <span
                                key={i}
                                className={`text-xs px-2 py-1 rounded-lg ${
                                  song.peak_pos === 1 ? "bg-amber-500 text-black" : "bg-foreground/10 text-foreground/60"
                                }`}
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                              >
                                #{song.peak_pos} {song.title.length > 12 ? song.title.substring(0, 12) + "..." : song.title}
                              </span>
                            ))}
                            {hoveredMonthData.songs.length > 5 && (
                              <span className="text-xs text-foreground/40 px-2">+{hoveredMonthData.songs.length - 5} more</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Default: Scorpion highlight
                      <div className="flex items-center gap-5">
                        <div className="text-center min-w-[60px]">
                          <div className="text-[2.5rem] text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                            {scorpionSongs.length}
                          </div>
                          <div className="text-xs text-foreground/50 uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Songs
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-base text-foreground font-medium" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Scorpion Drop — July 2018
                          </div>
                          <div className="text-sm text-foreground/50 leading-relaxed" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            Three consecutive solo #1s: God's Plan → Nice For What → In My Feelings
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* #1 Hits Showcase */}
                <div className="lg:w-80">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-[1px] w-8 bg-amber-500/50" />
                    <span
                      className="text-xs tracking-[0.2em] text-amber-500/70 uppercase"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      #1 Hits
                    </span>
                  </div>

                  {/* Featured #1 */}
                  {numberOneSongs.length > 0 && (
                    <div className="number-one-card rounded-2xl p-5 mb-4 relative overflow-hidden">

                      <div className="flex items-start gap-4">
                        <div
                          className="w-14 h-14 rounded-xl bg-amber-500 flex items-center justify-center text-black text-2xl font-bold shrink-0"
                          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                        >
                          #1
                        </div>

                        <div className="flex-1 min-w-0">
                          <div
                            className="text-xl text-foreground truncate"
                            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                          >
                            {numberOneSongs[activeNumberOne]?.title}
                          </div>
                          <div
                            className="text-sm text-foreground/50 mt-1"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                          >
                            {numberOneSongs[activeNumberOne]?.weeks_on_chart} weeks • {formatDate(numberOneSongs[activeNumberOne]?.first_chart_date || "")}
                          </div>
                        </div>
                      </div>

                      {/* Progress dots */}
                      <div className="flex gap-2 mt-4">
                        {numberOneSongs.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveNumberOne(i)}
                            className={`h-2 rounded-full transition-all ${
                              i === activeNumberOne ? "bg-amber-500 w-5" : "bg-foreground/20 w-2 hover:bg-foreground/40"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All #1s list */}
                  <div className="space-y-2">
                    {numberOneSongs.map((song, i) => (
                      <div
                        key={song.title}
                        onClick={() => setActiveNumberOne(i)}
                        className={`p-3 rounded-xl cursor-pointer transition-all ${
                          i === activeNumberOne
                            ? "bg-amber-500/20 border border-amber-500/50"
                            : "bg-foreground/[0.02] border border-foreground/5 hover:border-amber-500/30"
                        }`}
                      >
                        <div
                          className="text-base text-foreground/90 truncate"
                          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                        >
                          {song.title}
                        </div>
                        <div
                          className="text-xs text-foreground/40 mt-0.5"
                          style={{ fontFamily: "'Outfit', sans-serif" }}
                        >
                          {formatDate(song.first_chart_date)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom accent */}
          <div className={`mt-6 flex items-center gap-6 transition-all duration-700 delay-300 ${isVisible ? "opacity-100" : "opacity-0"}`}>
            <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-500/30 to-transparent" />
            <span className="text-xs tracking-[0.3em] text-foreground/30 uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Continue scrolling
            </span>
            <svg className="w-4 h-4 text-foreground/30 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  )
}
