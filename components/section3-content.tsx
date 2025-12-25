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

interface Section3ContentProps {
  isActive?: boolean
}

export function Section3Content({ isActive = false }: Section3ContentProps) {
  const [data, setData] = useState<DataStructure | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [selectedYear, setSelectedYear] = useState<string | null>(null)
  const [hoveredSong, setHoveredSong] = useState<Song | null>(null)

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
  const topTens = ascentData.top_tens || 0

  // Calculate stats
  const totalWeeks = songs.reduce((sum, s) => sum + s.weeks_on_chart, 0)

  // Group by year
  const years = ["2012", "2013", "2014", "2015"]
  const songsByYear: Record<string, Song[]> = useMemo(() => {
    const grouped: Record<string, Song[]> = {}
    years.forEach((y) => (grouped[y] = []))
    songs.forEach((song) => {
      const year = song.first_chart_date?.substring(0, 4)
      if (year && grouped[year]) {
        grouped[year].push(song)
      }
    })
    return grouped
  }, [songs])

  // Get top 5 songs for quick stats
  const topSongs = useMemo(() => {
    return [...songs].sort((a, b) => a.peak_pos - b.peak_pos).slice(0, 5)
  }, [songs])

  // Trigger animation when section becomes active
  useEffect(() => {
    if (!data || !isActive) return
    setIsVisible(true)
  }, [data, isActive])

  // Chart dimensions - use percentage for responsive height
  const maxPos = 100

  // Get Y position for peak position (inverted - #1 at top) - returns percentage
  const getYPos = (peak: number): string => {
    return `${(peak / maxPos) * 100}%`
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

  // Format date
  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }

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
        .chart-dot {
          transition: all 0.2s ease;
        }

        .chart-dot:hover {
          transform: translate(-50%, -50%) scale(1.8);
          z-index: 10;
        }

        .year-btn {
          transition: all 0.2s ease;
        }

        .year-btn.active {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.3), rgba(212, 175, 55, 0.1));
          border-color: rgba(212, 175, 55, 0.5);
        }
      `}</style>


      {/* Main content */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-6 w-full" style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}>

          {/* Header Row - Title + Stats */}
          <div className={`flex flex-col lg:flex-row lg:items-end lg:justify-between transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ gap: 'var(--section-gap)', marginBottom: 'var(--section-gap)' }}>
            {/* Title */}
            <div>
              <h1
                className="leading-[0.9] tracking-tight"
                style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-title)' }}
              >
                <span className="text-foreground/90">BUILDING</span>{" "}
                <span className="text-amber-500">MOMENTUM</span>
              </h1>
              <p
                className="text-foreground/50 max-w-lg leading-relaxed"
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)', marginTop: 'var(--section-gap)' }}
              >
                2012-2015: 61 entries, zero #1s — but "Hotline Bling" at #2 signaled what was coming.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-2">
              <div className="rounded-xl bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/20" style={{ padding: 'var(--card-padding)' }}>
                <div className="text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}>{songCount}</div>
                <div className="text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>Entries</div>
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

          {/* Main Chart Area */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="rounded-3xl bg-foreground/[0.02] border border-foreground/5" style={{ padding: 'var(--card-padding-lg)' }}>
              <div className="flex flex-col lg:flex-row" style={{ gap: 'var(--section-gap)' }}>

                {/* Scatter Chart */}
                <div className="flex-1">
                  {/* Chart header with filters */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-[1px] w-8 bg-amber-500/50" />
                      <span
                        className="tracking-[0.2em] text-amber-500/70 uppercase"
                        style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}
                      >
                        Peak Positions ({displaySongs.length} songs)
                      </span>
                    </div>

                    {/* Year filter buttons */}
                    <div className="flex gap-1">
                      <button
                        onClick={() => setSelectedYear(null)}
                        className={`year-btn px-2 py-1 rounded-lg border ${
                          selectedYear === null
                            ? "active text-amber-500"
                            : "border-foreground/10 text-foreground/50 hover:text-foreground/80"
                        }`}
                        style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}
                      >
                        All
                      </button>
                      {years.map((year) => (
                        <button
                          key={year}
                          onClick={() => setSelectedYear(year)}
                          className={`year-btn px-2 py-1 rounded-lg border ${
                            selectedYear === year
                              ? "active text-amber-500"
                              : "border-foreground/10 text-foreground/50 hover:text-foreground/80"
                          }`}
                          style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}
                        >
                          {year}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative bg-black/20 rounded-xl overflow-hidden" style={{ padding: 'var(--card-padding)' }}>
                    {/* Chart container with Y-axis */}
                    <div className="flex">
                      {/* Y-axis labels */}
                      <div className="flex flex-col justify-between text-foreground/40 pr-3 shrink-0" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)', height: 'var(--chart-height-md)' }}>
                        <span>#1</span>
                        <span>#25</span>
                        <span>#50</span>
                        <span>#75</span>
                        <span>#100</span>
                      </div>

                      {/* Chart area */}
                      <div className="flex-1 relative" style={{ height: 'var(--chart-height-md)' }}>
                      {/* Grid lines */}
                      {[1, 25, 50, 75, 100].map((pos) => (
                        <div
                          key={pos}
                          className="absolute left-0 right-0 border-t border-foreground/5"
                          style={{ top: getYPos(pos) }}
                        />
                      ))}

                      {/* Year dividers */}
                      {years.map((year, i) => (
                        <div
                          key={year}
                          className="absolute top-0 bottom-0 border-l border-foreground/10"
                          style={{ left: `${(i / years.length) * 100}%` }}
                        >
                          <span
                            className="absolute -bottom-5 left-1 text-foreground/40"
                            style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}
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

                        const isHovered = hoveredSong?.title === song.title

                        return (
                          <div
                            key={`${song.title}-${i}`}
                            className="chart-dot absolute cursor-pointer"
                            style={{
                              left: `${xPercent}%`,
                              top: getYPos(song.peak_pos),
                              transform: "translate(-50%, -50%)",
                              zIndex: isHovered ? 20 : 1,
                            }}
                            onMouseEnter={() => setHoveredSong(song)}
                            onMouseLeave={() => setHoveredSong(null)}
                          >
                            <div
                              className={`rounded-full transition-all ${isHovered ? "ring-2 ring-amber-500" : ""}`}
                              style={{
                                width: `${Math.max(6, Math.min(16, song.weeks_on_chart / 3))}px`,
                                height: `${Math.max(6, Math.min(16, song.weeks_on_chart / 3))}px`,
                                backgroundColor: getPeakColor(song.peak_pos),
                                boxShadow: song.peak_pos <= 10 ? `0 0 8px ${getPeakColor(song.peak_pos)}` : "none",
                              }}
                            />
                          </div>
                        )
                      })}
                      </div>
                    </div>

                    {/* Legend */}
                    <div className="mt-4 pt-3 border-t border-foreground/5 flex flex-wrap items-center justify-center gap-4 text-foreground/60" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                        <span>Top 5</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-500/60" />
                        <span>Top 10</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-foreground/40" />
                        <span>Top 20</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-foreground/20" />
                        <span>Below 20</span>
                      </div>
                      <div className="text-foreground/40 border-l border-foreground/10 pl-4">
                        Size = weeks on chart
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hover Detail Panel */}
                <div className="lg:w-64">
                  <div className={`h-full rounded-2xl border transition-all duration-300 ${
                    hoveredSong
                      ? "bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30"
                      : "bg-foreground/[0.02] border-foreground/10"
                  }`} style={{ padding: 'var(--card-padding)' }}>
                    {hoveredSong ? (
                      <>
                        {/* Song info */}
                        <div className="mb-3">
                          <div
                            className={`inline-block px-2 py-0.5 rounded-lg mb-2 ${
                              hoveredSong.peak_pos <= 5 ? "bg-amber-500 text-black" : "bg-foreground/10 text-foreground/70"
                            }`}
                            style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}
                          >
                            Peak #{hoveredSong.peak_pos}
                          </div>
                          <div className="text-foreground font-medium truncate" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-body)' }}>
                            {hoveredSong.title}
                          </div>
                          <div className="text-foreground/50 mt-1" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                            {hoveredSong.artist}
                          </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-2 gap-2 mb-3">
                          <div className="p-2 rounded-xl bg-black/20 text-center">
                            <div className="text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}>
                              {hoveredSong.weeks_on_chart}
                            </div>
                            <div className="text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                              Weeks
                            </div>
                          </div>
                          <div className="p-2 rounded-xl bg-black/20 text-center">
                            <div className="text-foreground/80" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}>
                              {formatDate(hoveredSong.first_chart_date)}
                            </div>
                            <div className="text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                              Charted
                            </div>
                          </div>
                        </div>

                        {/* Collaborators */}
                        {hoveredSong.collaborators.length > 0 && (
                          <div className="p-2 rounded-xl bg-black/20 text-center">
                            <div className="text-foreground/80" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}>
                              {hoveredSong.collaborators.join(", ")}
                            </div>
                            <div className="text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                              Featuring
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Empty state - show top songs */}
                        <div className="text-foreground/40 uppercase tracking-wider mb-3" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                          Top 5 This Era
                        </div>
                        <div className="space-y-2">
                          {topSongs.map((song, i) => (
                            <div
                              key={i}
                              className="flex items-center gap-2 p-2 rounded-xl bg-black/20 cursor-pointer hover:bg-black/30 transition-colors"
                              onMouseEnter={() => setHoveredSong(song)}
                            >
                              <div
                                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                  song.peak_pos <= 5 ? "bg-amber-500/20 text-amber-500" : "bg-foreground/10 text-foreground/60"
                                }`}
                                style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-small)' }}
                              >
                                #{song.peak_pos}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-foreground/80 truncate" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                                  {song.title}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 text-center text-foreground/30" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                          Hover chart dots for details
                        </div>
                      </>
                    )}
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
