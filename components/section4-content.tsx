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
        .heatmap-cell,
        .heatmap-cell * {
          cursor: pointer !important;
        }
      `}</style>


      {/* Main content */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-6 w-full" style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}>

          {/* Header Row */}
          <div className={`flex flex-col lg:flex-row lg:items-end lg:justify-between transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ gap: 'var(--section-gap)', marginBottom: 'var(--section-gap)' }}>
            {/* Title */}
            <div>
              <h1
                className="leading-[0.9] tracking-tight"
                style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-title)' }}
              >
                <span className="text-foreground/90">CHART</span>{" "}
                <span className="text-amber-500">DOMINATION</span>
              </h1>
              <p
                className="text-foreground/50 max-w-lg leading-relaxed"
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)', marginTop: 'var(--section-gap)' }}
              >
                Three albums. Three years. The moment Drake stopped competing and started rewriting the rules.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-2">
              <div className="rounded-xl bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/20" style={{ padding: 'var(--card-padding)' }}>
                <div className="text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}>{songCount}</div>
                <div className="text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>Entries</div>
              </div>
              <div className="rounded-xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/15" style={{ padding: 'var(--card-padding)' }}>
                <div className="text-amber-400" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}>{numberOnes}</div>
                <div className="text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>#1 Hits</div>
              </div>
              <div className="rounded-xl bg-foreground/[0.02] border border-foreground/5" style={{ padding: 'var(--card-padding)' }}>
                <div className="text-foreground/90" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}>{topTens}</div>
                <div className="text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>Top 10</div>
              </div>
              <div className="rounded-xl bg-foreground/[0.02] border border-foreground/5" style={{ padding: 'var(--card-padding)' }}>
                <div className="text-foreground/90" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}>{totalWeeks}</div>
                <div className="text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>Weeks</div>
              </div>
            </div>
          </div>

          {/* Main Content - Heatmap + #1 Showcase */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="rounded-3xl bg-foreground/[0.02] border border-foreground/5" style={{ padding: 'var(--card-padding-lg)' }}>
              <div className="flex flex-col lg:flex-row" style={{ gap: 'var(--section-gap)' }}>

                {/* Heatmap */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-[1px] w-8 bg-amber-500/50" />
                    <span
                      className="tracking-[0.2em] text-amber-500/70 uppercase"
                      style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}
                    >
                      Chart Activity Heatmap
                    </span>
                  </div>

                  <div className="bg-black/20 rounded-xl" style={{ padding: 'var(--card-padding)' }}>
                    {/* Year labels */}
                    <div className="flex mb-2 pl-6">
                      {years.map((year) => (
                        <div
                          key={year}
                          className="flex-1 text-center text-foreground/50"
                          style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}
                        >
                          {year}
                        </div>
                      ))}
                    </div>

                    {/* Month grid */}
                    <div className="flex gap-0.5 cursor-pointer">
                      {/* Month labels */}
                      <div className="flex flex-col gap-0.5 pr-1 text-foreground/40 cursor-default" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                        {monthLabels.map((m, i) => (
                          <div key={i} className="h-4 flex items-center justify-end w-4">{m}</div>
                        ))}
                      </div>

                      {/* Heatmap cells */}
                      {years.map((year) => (
                        <div key={year} className="flex-1 flex flex-col gap-0.5 cursor-pointer">
                          {Array.from({ length: 12 }, (_, monthIndex) => {
                            const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`
                            const count = songsByMonth[monthKey]?.length || 0
                            const isScorpion = monthKey === scorpionDate
                            const isHovered = hoveredMonth === monthKey

                            return (
                              <div
                                key={monthKey}
                                className={`heatmap-cell h-4 rounded-sm ${getHeatmapColor(count)} ${
                                  isScorpion ? "ring-1 ring-amber-500" : ""
                                } ${isHovered ? "ring-2 ring-amber-400 scale-105" : ""} transition-all duration-150 select-none`}
                                onMouseEnter={() => setHoveredMonth(monthKey)}
                                onMouseLeave={() => setHoveredMonth(null)}
                              >
                                {count > 5 && (
                                  <div className="h-full flex items-center justify-center font-bold text-black/70 pointer-events-none select-none" style={{ fontSize: 'var(--text-small)' }}>
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
                    <div className="flex items-center gap-2 mt-3 pt-2 border-t border-foreground/5 text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                      <span>Less</span>
                      <div className="flex gap-0.5">
                        {[0, 1, 3, 5, 10, 15].map((n) => (
                          <div key={n} className={`w-2.5 h-2.5 rounded-sm ${getHeatmapColor(n)}`} />
                        ))}
                      </div>
                      <span>More</span>
                      <span className="ml-2 text-amber-500">● Scorpion ({scorpionSongs.length})</span>
                    </div>
                  </div>

                  {/* Hover Detail / Scorpion Highlight */}
                  <div className={`rounded-xl border transition-all duration-300 ${
                    hoveredMonthData
                      ? "bg-amber-500/10 border-amber-500/40"
                      : "bg-gradient-to-r from-amber-500/15 to-transparent border-amber-500/30"
                  }`} style={{ marginTop: 'var(--section-gap)', padding: 'var(--card-padding)' }}>
                    {hoveredMonthData ? (
                      // Hovered month details
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[50px]">
                          <div className="text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-large)' }}>
                            {hoveredMonthData.songs.length}
                          </div>
                          <div className="text-foreground/50 uppercase" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                            Entries
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-foreground font-medium mb-1" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-body)' }}>
                            {hoveredMonthData.date}
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {hoveredMonthData.songs.slice(0, 4).map((song, i) => (
                              <span
                                key={i}
                                className={`px-1.5 py-0.5 rounded-lg ${
                                  song.peak_pos === 1 ? "bg-amber-500 text-black" : "bg-foreground/10 text-foreground/60"
                                }`}
                                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}
                              >
                                #{song.peak_pos} {song.title.length > 10 ? song.title.substring(0, 10) + "..." : song.title}
                              </span>
                            ))}
                            {hoveredMonthData.songs.length > 4 && (
                              <span className="text-foreground/40 px-1" style={{ fontSize: 'var(--text-small)' }}>+{hoveredMonthData.songs.length - 4} more</span>
                            )}
                          </div>
                        </div>
                      </div>
                    ) : (
                      // Default: Scorpion highlight
                      <div className="flex items-center gap-4">
                        <div className="text-center min-w-[50px]">
                          <div className="text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-large)' }}>
                            {scorpionSongs.length}
                          </div>
                          <div className="text-foreground/50 uppercase" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                            Songs
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-foreground font-medium" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-body)' }}>
                            Scorpion Drop — July 2018
                          </div>
                          <div className="text-foreground/50 leading-relaxed" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                            Three consecutive solo #1s: God's Plan → Nice For What → In My Feelings
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* #1 Hits Showcase */}
                <div className="lg:w-72">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-[1px] w-8 bg-amber-500/50" />
                    <span
                      className="tracking-[0.2em] text-amber-500/70 uppercase"
                      style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}
                    >
                      #1 Hits
                    </span>
                  </div>

                  {/* Featured #1 */}
                  {numberOneSongs.length > 0 && (
                    <div className="number-one-card rounded-2xl mb-3 relative overflow-hidden" style={{ padding: 'var(--card-padding)' }}>

                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-black font-bold shrink-0"
                          style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-body)' }}
                        >
                          #1
                        </div>

                        <div className="flex-1 min-w-0">
                          <div
                            className="text-foreground truncate"
                            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-body)' }}
                          >
                            {numberOneSongs[activeNumberOne]?.title}
                          </div>
                          <div
                            className="text-foreground/50 mt-0.5"
                            style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}
                          >
                            {numberOneSongs[activeNumberOne]?.weeks_on_chart} weeks • {formatDate(numberOneSongs[activeNumberOne]?.first_chart_date || "")}
                          </div>
                        </div>
                      </div>

                      {/* Progress dots */}
                      <div className="flex gap-1.5 mt-3">
                        {numberOneSongs.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setActiveNumberOne(i)}
                            className={`h-1.5 rounded-full transition-all ${
                              i === activeNumberOne ? "bg-amber-500 w-4" : "bg-foreground/20 w-1.5 hover:bg-foreground/40"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* All #1s list */}
                  <div className="space-y-1.5">
                    {numberOneSongs.map((song, i) => (
                      <div
                        key={song.title}
                        onClick={() => setActiveNumberOne(i)}
                        className={`p-2 rounded-xl cursor-pointer transition-all ${
                          i === activeNumberOne
                            ? "bg-amber-500/20 border border-amber-500/50"
                            : "bg-foreground/[0.02] border border-foreground/5 hover:border-amber-500/30"
                        }`}
                      >
                        <div
                          className="text-foreground/90 truncate"
                          style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-small)' }}
                        >
                          {song.title}
                        </div>
                        <div
                          className="text-foreground/40 mt-0.5"
                          style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}
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

        </div>
      </div>
    </section>
  )
}
