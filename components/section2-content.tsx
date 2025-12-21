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

  // Bar height calculation
  const getBarHeight = (value: number, max: number): number => {
    return (value / max) * 180
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
        <div className="max-w-7xl mx-auto px-6 py-12 w-full">

          {/* Header Row - Title + Stats side by side */}
          <div className={`flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {/* Title */}
            <div>
              <h1
                className="text-4xl md:text-6xl lg:text-7xl leading-[0.9] tracking-tight"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                <span className="text-foreground/90">WHERE IT</span>
                <br />
                <span className="text-amber-500">BEGAN</span>
              </h1>
              <p
                className="text-sm md:text-base text-foreground/50 mt-4 max-w-md leading-relaxed"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                2009-2011: The foundation years. Hover over each bar to explore the breakdown.
              </p>
            </div>

            {/* Stats row - compact */}
            <div className="flex gap-3">
              <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/20">
                <div className="text-[1.625rem] text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  {songCount}
                </div>
                <div className="text-[10px] text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Entries
                </div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                <div className="text-[1.625rem] text-foreground/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  {numberOnes}
                </div>
                <div className="text-[10px] text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  #1 Hit
                </div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                <div className="text-[1.625rem] text-foreground/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  {topTens}
                </div>
                <div className="text-[10px] text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Top 10
                </div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                <div className="text-[1.625rem] text-foreground/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  {totalWeeks}
                </div>
                <div className="text-[10px] text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Weeks
                </div>
              </div>
            </div>
          </div>

          {/* Main Chart Area with Hover Details */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="p-6 rounded-3xl bg-foreground/[0.02] border border-foreground/5">
              <div className="flex flex-col lg:flex-row gap-6">

                {/* Bar Chart */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-[1px] w-8 bg-amber-500/50" />
                    <span
                      className="text-xs tracking-[0.2em] text-amber-500/70 uppercase"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      Year-Over-Year
                    </span>
                  </div>

                  {/* Stacked Bar Chart */}
                  <div className="flex items-end justify-around gap-4 h-[220px] mb-4">
                    {yearStats.map((stat, i) => {
                      const prevStat = i > 0 ? yearStats[i - 1] : null
                      const percentChange = prevStat && prevStat.total > 0
                        ? Math.round(((stat.total - prevStat.total) / prevStat.total) * 100)
                        : null

                      return (
                        <div key={stat.year} className="flex-1 flex items-end">
                          {/* Percentage increase indicator */}
                          {percentChange !== null && (
                            <div className="flex flex-col items-center justify-center px-2 self-center">
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

                            {/* Stacked bars */}
                            <div
                              className={`w-full max-w-[80px] flex flex-col-reverse year-bar rounded-t-lg overflow-hidden transition-all duration-300 ${
                                hoveredYear === stat.year ? "ring-2 ring-amber-500/50" : ""
                              }`}
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
                                className="w-full bg-foreground/20"
                                style={{ height: `${(stat.below40 / stat.total) * 100}%` }}
                              />
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
                <div className="lg:w-72 min-h-[280px]">
                  <div className={`h-full p-5 rounded-2xl border transition-all duration-300 ${
                    hoveredStats
                      ? "bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30"
                      : "bg-foreground/[0.02] border-foreground/10"
                  }`}>
                    {hoveredStats ? (
                      <>
                        {/* Year header */}
                        <div className="flex items-center justify-between mb-4">
                          <div
                            className="text-[2.5rem] text-foreground"
                            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                          >
                            {hoveredStats.year}
                          </div>
                          <div
                            className="px-3 py-1 rounded-full text-sm bg-amber-500 text-black"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                          >
                            {hoveredStats.total} songs
                          </div>
                        </div>

                        {/* Mini stats */}
                        <div className="grid grid-cols-3 gap-2 mb-4">
                          <div className="text-center p-2 rounded-lg bg-black/20">
                            <div className="text-[1.375rem] text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                              {hoveredStats.top10}
                            </div>
                            <div className="text-[10px] text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                              Top 10
                            </div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-black/20">
                            <div className="text-[1.375rem] text-foreground/70" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                              {hoveredStats.top40}
                            </div>
                            <div className="text-[10px] text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                              Top 40
                            </div>
                          </div>
                          <div className="text-center p-2 rounded-lg bg-black/20">
                            <div className="text-[1.375rem] text-foreground/70" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                              {hoveredStats.totalWeeks}
                            </div>
                            <div className="text-[10px] text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                              Weeks
                            </div>
                          </div>
                        </div>

                        {/* Best song */}
                        {hoveredStats.bestSong && (
                          <div className="p-3 rounded-lg bg-black/30">
                            <div className="text-[10px] text-foreground/40 uppercase tracking-wider mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                              Best Performing
                            </div>
                            <div className="flex items-center gap-2">
                              <div
                                className={`w-8 h-8 rounded flex items-center justify-center text-sm ${
                                  hoveredStats.bestSong.peak_pos === 1 ? "bg-amber-500 text-black" : "bg-amber-500/30 text-amber-500"
                                }`}
                                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                              >
                                #{hoveredStats.bestSong.peak_pos}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-foreground truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>
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
                          <svg className="w-10 h-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                          </svg>
                        </div>
                        <div className="text-sm text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
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
          <div className={`mt-6 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="p-5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <div className="text-[10px] text-amber-500/70 uppercase tracking-wider mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    The First #1
                  </div>
                  <div className="text-[1.75rem] md:text-[2.25rem] text-foreground" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                    "What's My Name?"
                  </div>
                  <div className="text-sm text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    with Rihanna • November 2010
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-[2.5rem] text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      #1
                    </div>
                    <div className="text-[10px] text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      Peak
                    </div>
                  </div>
                  <div className="w-[1px] h-10 bg-foreground/10" />
                  <div className="text-center">
                    <div className="text-[2.5rem] text-foreground/80" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                      27
                    </div>
                    <div className="text-[10px] text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      Weeks
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom accent */}
          <div className={`mt-8 flex items-center gap-6 transition-all duration-700 delay-400 ${isVisible ? "opacity-100" : "opacity-0"}`}>
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
