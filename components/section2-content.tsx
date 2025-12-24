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

interface Section2ContentProps {
  isActive?: boolean
}

export function Section2Content({ isActive = false }: Section2ContentProps) {
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

  // Get hovered year stats
  const hoveredStats = hoveredYear ? yearStats.find(s => s.year === hoveredYear) : null

  // Max values for scaling
  const maxTotal = Math.max(...yearStats.map((y) => y.total), 1)

  // Calculate total weeks
  const totalWeeks = songs.reduce((sum, s) => sum + s.weeks_on_chart, 0)

  // Trigger animation when section becomes active
  useEffect(() => {
    if (!data || !isActive) return
    setIsVisible(true)
  }, [data, isActive])

  // Bar height calculation - now returns percentage for responsive scaling
  const getBarHeight = (value: number, max: number): string => {
    return `${(value / max) * 100}%`
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
        .year-bar {
          transition: all 0.3s ease;
        }

        .year-bar:hover {
          filter: brightness(1.2);
        }

      `}</style>


      {/* Main content */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-6 w-full" style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}>

          {/* Header Row - Title + Stats side by side */}
          <div className={`flex flex-col lg:flex-row lg:items-end lg:justify-between transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ gap: 'var(--section-gap)', marginBottom: 'var(--section-gap)' }}>
            {/* Title */}
            <div>
              <h1
                className="leading-[0.9] tracking-tight"
                style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-title)' }}
              >
                <span className="text-foreground/90">WHERE IT</span>
                <br />
                <span className="text-amber-500">BEGAN</span>
              </h1>
              <p
                className="text-foreground/50 max-w-md leading-relaxed"
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)', marginTop: 'var(--section-gap)' }}
              >
                Before the records. Before the empire. This is where the legend started.
              </p>
            </div>

            {/* Stats row - compact */}
            <div className="flex gap-2">
              <div className="rounded-xl bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/20" style={{ padding: 'var(--card-padding)' }}>
                <div className="text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}>
                  {songCount}
                </div>
                <div className="text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                  Entries
                </div>
              </div>
              <div className="rounded-xl bg-foreground/[0.02] border border-foreground/5" style={{ padding: 'var(--card-padding)' }}>
                <div className="text-foreground/90" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}>
                  {numberOnes}
                </div>
                <div className="text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                  #1 Hit
                </div>
              </div>
              <div className="rounded-xl bg-foreground/[0.02] border border-foreground/5" style={{ padding: 'var(--card-padding)' }}>
                <div className="text-foreground/90" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}>
                  {topTens}
                </div>
                <div className="text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                  Top 10
                </div>
              </div>
              <div className="rounded-xl bg-foreground/[0.02] border border-foreground/5" style={{ padding: 'var(--card-padding)' }}>
                <div className="text-foreground/90" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}>
                  {totalWeeks}
                </div>
                <div className="text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                  Weeks
                </div>
              </div>
            </div>
          </div>

          {/* Main Chart Area with Hover Details */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="rounded-3xl bg-foreground/[0.02] border border-foreground/5" style={{ padding: 'var(--card-padding-lg)' }}>
              <div className="flex flex-col lg:flex-row" style={{ gap: 'var(--section-gap)' }}>

                {/* Bar Chart */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-[1px] w-8 bg-amber-500/50" />
                    <span
                      className="tracking-[0.2em] text-amber-500/70 uppercase"
                      style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}
                    >
                      Year-Over-Year
                    </span>
                  </div>

                  {/* Stacked Bar Chart */}
                  <div className="flex items-end justify-around gap-4 mb-3">
                    {yearStats.map((stat, i) => {
                      const prevStat = i > 0 ? yearStats[i - 1] : null
                      const percentChange = prevStat && prevStat.total > 0
                        ? Math.round(((stat.total - prevStat.total) / prevStat.total) * 100)
                        : null

                      // Calculate bar height as percentage of max
                      const barHeightPercent = (stat.total / maxTotal) * 100

                      return (
                        <div key={stat.year} className="flex-1 flex items-end">
                          {/* Percentage increase indicator */}
                          {percentChange !== null && (
                            <div className="flex flex-col items-center justify-center px-2 self-end mb-8">
                              <div
                                className="text-[1rem] text-amber-400"
                                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                              >
                                +{percentChange}%
                              </div>
                              <div className="text-amber-500/50 text-lg">→</div>
                            </div>
                          )}

                          <div
                            className="flex-1 flex flex-col items-center cursor-pointer"
                            onMouseEnter={() => setHoveredYear(stat.year)}
                            onMouseLeave={() => setHoveredYear(null)}
                          >
                            {/* Total count label */}
                            <div
                              className={`text-[1.625rem] mb-2 transition-all duration-300 ${
                                hoveredYear === stat.year ? "text-amber-500 scale-110" : "text-foreground/70"
                              }`}
                              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                            >
                              {stat.total}
                            </div>

                            {/* Bar container with fixed height for percentage calculation */}
                            <div className="w-full flex justify-center" style={{ height: 'var(--chart-height-sm)' }}>
                              {/* Stacked bars - height is percentage of the container */}
                              <div
                                className={`w-full max-w-[80px] flex flex-col-reverse year-bar rounded-t-lg overflow-hidden transition-all duration-300 self-end ${
                                  hoveredYear === stat.year ? "ring-2 ring-amber-500/50" : ""
                                }`}
                                style={{ height: `${barHeightPercent}%`, minHeight: stat.total > 0 ? '20px' : '0px' }}
                              >
                                {/* Top 10 segment */}
                                <div
                                  className="w-full bg-amber-500"
                                  style={{ height: `${stat.total > 0 ? (stat.top10 / stat.total) * 100 : 0}%` }}
                                />
                                {/* Top 40 segment */}
                                <div
                                  className="w-full bg-amber-500/50"
                                  style={{ height: `${stat.total > 0 ? (stat.top40 / stat.total) * 100 : 0}%` }}
                                />
                                {/* Below 40 segment */}
                                <div
                                  className="w-full bg-foreground/20"
                                  style={{ height: `${stat.total > 0 ? (stat.below40 / stat.total) * 100 : 0}%` }}
                                />
                              </div>
                            </div>

                            {/* Year label */}
                            <div
                              className={`text-[1.375rem] mt-3 transition-colors ${
                                hoveredYear === stat.year ? "text-amber-500" : "text-foreground/80"
                              }`}
                              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                            >
                              {stat.year}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-4 text-xs" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-amber-500" />
                      <span className="text-foreground/60">Top 10</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-amber-500/50" />
                      <span className="text-foreground/60">Top 40</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded bg-foreground/20" />
                      <span className="text-foreground/60">Below 40</span>
                    </div>
                  </div>
                </div>

                {/* Hover Detail Panel */}
                <div className="lg:w-64">
                  <div className={`h-full rounded-2xl border transition-all duration-300 ${
                    hoveredStats
                      ? "bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30"
                      : "bg-foreground/[0.02] border-foreground/10"
                  }`} style={{ padding: 'var(--card-padding)' }}>
                    {hoveredStats ? (
                      <>
                        {/* Year header */}
                        <div className="flex items-center justify-between mb-3">
                          <div
                            className="text-foreground"
                            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-subtitle)' }}
                          >
                            {hoveredStats.year}
                          </div>
                          <div
                            className="px-2 py-1 rounded-full bg-amber-500 text-black"
                            style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}
                          >
                            {hoveredStats.total} songs
                          </div>
                        </div>

                        {/* Mini stats */}
                        <div className="grid grid-cols-3 gap-2 mb-3">
                          <div className="text-center p-2 rounded-lg bg-black/20">
                            <div className="text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}>
                              {hoveredStats.top10}
                            </div>
                            <div className="text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                              Top 10
                            </div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-black/20">
                            <div className="text-foreground/70" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}>
                              {hoveredStats.top40}
                            </div>
                            <div className="text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                              Top 40
                            </div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-black/20">
                            <div className="text-foreground/70" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}>
                              {hoveredStats.totalWeeks}
                            </div>
                            <div className="text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                              Weeks
                            </div>
                          </div>
                        </div>

                        {/* Best song */}
                        {hoveredStats.bestSong && (
                          <div className="p-2 rounded-lg bg-black/30">
                            <div className="text-foreground/40 uppercase tracking-wider mb-1" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                              Best Performing
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-7 h-7 rounded flex items-center justify-center ${
                                  hoveredStats.bestSong.peak_pos === 1 ? "bg-amber-500 text-black" : "bg-amber-500/30 text-amber-500"
                                }`}
                                style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-small)' }}
                              >
                                #{hoveredStats.bestSong.peak_pos}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-foreground truncate" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                                  {hoveredStats.bestSong.title}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center">
                        <div className="text-foreground/20 mb-2">
                          <svg className="w-8 h-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                          </svg>
                        </div>
                        <div className="text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                          Hover over a bar<br />to see details
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* The First #1 - Compact */}
          <div className={`transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ marginTop: 'var(--section-gap)' }}>
            <div className="rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20" style={{ padding: 'var(--card-padding)' }}>
              <div className="flex flex-col md:flex-row items-center" style={{ gap: 'var(--section-gap)' }}>
                <div className="flex-1">
                  <div className="text-amber-500/70 uppercase tracking-wider mb-1" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                    The First #1
                  </div>
                  <div className="text-foreground" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-subtitle)' }}>
                    "What's My Name?"
                  </div>
                  <div className="text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                    with Rihanna • November 2010
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <div className="text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-large)' }}>
                      #1
                    </div>
                    <div className="text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                      Peak
                    </div>
                  </div>
                  <div className="w-[1px] h-8 bg-foreground/10" />
                  <div className="text-center">
                    <div className="text-foreground/80" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-large)' }}>
                      27
                    </div>
                    <div className="text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                      Weeks
                    </div>
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
