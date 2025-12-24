"use client"

import { useState, useEffect, useMemo } from "react"

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

interface Section6ContentProps {
  isActive?: boolean
}

export function Section6Content({ isActive = false }: Section6ContentProps) {
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

  // Order distribution properly
  const orderedDistribution = useMemo(() => [
    { label: "1-5 weeks", value: distribution?.["1-5 weeks"] ?? 0, color: "bg-foreground/20", range: [1, 5] },
    { label: "6-10 weeks", value: distribution?.["6-10 weeks"] ?? 0, color: "bg-foreground/30", range: [6, 10] },
    { label: "11-20 weeks", value: distribution?.["11-20 weeks"] ?? 0, color: "bg-amber-500/50", range: [11, 20] },
    { label: "21-40 weeks", value: distribution?.["21-40 weeks"] ?? 0, color: "bg-amber-500/70", range: [21, 40] },
    { label: "40+ weeks", value: distribution?.["40+ weeks"] ?? 0, color: "bg-amber-500", range: [40, 100] },
  ], [distribution])

  // Calculate totals
  const totalSongs = orderedDistribution.reduce((sum, d) => sum + d.value, 0)
  const maxDistribution = Math.max(...orderedDistribution.map((d) => d.value), 1)

  // Get songs for hovered range
  const hoveredRangeSongs = useMemo(() => {
    if (!hoveredBar) return null
    const range = orderedDistribution.find(d => d.label === hoveredBar)
    if (!range) return null

    // Filter songs by weeks range
    return longestSongs.filter(s =>
      s.weeks >= range.range[0] && s.weeks <= range.range[1]
    ).slice(0, 6)
  }, [hoveredBar, longestSongs, orderedDistribution])

  // Trigger animation when section becomes active
  useEffect(() => {
    if (!data || !isActive) return
    setIsVisible(true)
  }, [data, isActive])

  // Weeks to time description
  const weeksToMonths = (weeks: number) => {
    const months = Math.round(weeks / 4.33)
    if (months < 12) return `${months}mo`
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    if (remainingMonths === 0) return `${years}y`
    return `${years}y ${remainingMonths}mo`
  }

  if (loading) {
    return (
      <section className="flex h-screen w-screen shrink-0 items-center justify-center">
        <p className="text-foreground/60">Loading data...</p>
      </section>
    )
  }

  // Get the longest song
  const longestSong = longestSongs[0]

  return (
    <section className="relative flex h-screen w-screen shrink-0 overflow-hidden">
      {/* Custom styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap');
      `}</style>

      <style jsx>{`
        .bar-hover {
          transition: all 0.3s ease;
        }

        .bar-hover:hover {
          filter: brightness(1.2);
          transform: scaleY(1.02);
          transform-origin: bottom;
        }
      `}</style>

      
      {/* Main content */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center">
        <div className="w-full px-8 lg:px-16" style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}>

          {/* Header Row */}
          <div className={`flex flex-col lg:flex-row lg:items-end lg:justify-between transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ gap: 'var(--section-gap)', marginBottom: 'var(--section-gap)' }}>
            {/* Title */}
            <div>
              <h1
                className="leading-[0.9] tracking-tight"
                style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-title)' }}
              >
                <span className="text-foreground/90">STAYING</span>{" "}
                <span className="text-amber-500">POWER</span>
              </h1>
              <p
                className="text-foreground/50 max-w-md leading-relaxed"
                style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-body)', marginTop: 'calc(var(--section-gap) / 3)' }}
              >
                Drake's songs don't just debut — they live on the chart for months.
              </p>
            </div>

            {/* Stats */}
            <div className="flex" style={{ gap: 'calc(var(--section-gap) / 2)' }}>
              <div className="rounded-xl bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/20" style={{ padding: 'var(--card-padding)' }}>
                <div className="text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}>{longestSong?.weeks || 0}</div>
                <div className="text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>Longest Run</div>
              </div>
              <div className="rounded-xl bg-foreground/[0.02] border border-foreground/5" style={{ padding: 'var(--card-padding)' }}>
                <div className="text-foreground/90" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}>{totalSongs}</div>
                <div className="text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>Total Songs</div>
              </div>
              <div className="rounded-xl bg-foreground/[0.02] border border-foreground/5" style={{ padding: 'var(--card-padding)' }}>
                <div className="text-foreground/90" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}>
                  {orderedDistribution[2].value + orderedDistribution[3].value + orderedDistribution[4].value}
                </div>
                <div className="text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>11+ Weeks</div>
              </div>
              <div className="rounded-xl bg-foreground/[0.02] border border-foreground/5" style={{ padding: 'var(--card-padding)' }}>
                <div className="text-foreground/90" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}>
                  {longestSongs.filter(s => s.weeks >= 36).length}
                </div>
                <div className="text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>9+ Months</div>
              </div>
            </div>
          </div>

          {/* Main Content - Chart + Details */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="rounded-3xl" style={{ padding: 'var(--card-padding)' }}>
              <div className="flex flex-col lg:flex-row" style={{ gap: 'var(--section-gap)' }}>

                {/* Bar Chart */}
                <div className="flex-1">
                  <div className="flex items-center" style={{ gap: 'calc(var(--section-gap) / 3)', marginBottom: 'var(--section-gap)' }}>
                    <div className="h-[1px] w-8 bg-amber-500/50" />
                    <span
                      className="tracking-[0.2em] text-amber-500/70 uppercase"
                      style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}
                    >
                      Chart Duration Distribution
                    </span>
                  </div>

                  <div className="rounded-xl" style={{ padding: 'var(--card-padding)' }}>
                    {/* Bar chart */}
                    <div className="flex items-end justify-around" style={{ gap: 'calc(var(--section-gap) / 2)', height: 'var(--chart-height-sm)', marginBottom: 'var(--section-gap)' }}>
                      {orderedDistribution.map((item, i) => {
                        const barHeight = maxDistribution > 0 ? (item.value / maxDistribution) * 180 : 0
                        const isHovered = hoveredBar === item.label

                        return (
                          <div
                            key={item.label}
                            className="flex-1 flex flex-col items-center h-full justify-end cursor-pointer"
                            style={{ gap: 'calc(var(--section-gap) / 3)' }}
                            onMouseEnter={() => setHoveredBar(item.label)}
                            onMouseLeave={() => setHoveredBar(null)}
                          >
                            {/* Value label */}
                            <div
                              className={`transition-all ${
                                isHovered ? "text-amber-500 scale-110" : "text-foreground/70"
                              }`}
                              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}
                            >
                              {item.value}
                            </div>

                            {/* Bar */}
                            <div
                              className={`w-full max-w-[60px] bar-hover ${item.color} rounded-t-lg transition-all ${
                                isHovered ? "ring-2 ring-amber-500/50" : ""
                              }`}
                              style={{
                                height: `${barHeight}px`,
                                minHeight: item.value > 0 ? "16px" : "0px",
                                opacity: isVisible ? 1 : 0,
                                transform: isVisible ? "scaleY(1)" : "scaleY(0)",
                                transformOrigin: "bottom",
                                transition: `all 0.6s ease ${0.3 + i * 0.1}s`,
                              }}
                            />

                            {/* Label */}
                            <div
                              className={`text-center transition-all ${
                                isHovered ? "text-foreground" : "text-foreground/50"
                              }`}
                              style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}
                            >
                              {item.label.replace(" weeks", "w")}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Insight bar */}
                    <div className="flex items-center rounded-lg bg-amber-500/10 border border-amber-500/20" style={{ gap: 'var(--section-gap)', padding: 'var(--card-padding)', marginTop: 'var(--section-gap)' }}>
                      <div className="text-amber-500 font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-large)' }}>
                        {Math.round(((orderedDistribution[2].value + orderedDistribution[3].value + orderedDistribution[4].value) / totalSongs) * 100)}%
                      </div>
                      <div className="text-foreground/70" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                        of songs charted for 11+ weeks
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Panel */}
                <div className="lg:w-96">
                  <div className="flex items-center" style={{ gap: 'calc(var(--section-gap) / 3)', marginBottom: 'calc(var(--section-gap) / 2)' }}>
                    <div className="h-[1px] w-8 bg-amber-500/50" />
                    <span
                      className="tracking-[0.2em] text-amber-500/70 uppercase"
                      style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}
                    >
                      {hoveredBar ? hoveredBar : "Longest Runs"}
                    </span>
                  </div>

                  <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${
                    hoveredRangeSongs
                      ? "bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30"
                      : "bg-foreground/[0.02] border-foreground/10"
                  }`} style={{ height: 'var(--chart-height-md)' }}>
                    {hoveredRangeSongs && hoveredRangeSongs.length > 0 ? (
                      <div className="h-full flex flex-col" style={{ padding: 'var(--card-padding)' }}>
                        <div className="text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)', marginBottom: 'calc(var(--section-gap) / 2)' }}>
                          {orderedDistribution.find(d => d.label === hoveredBar)?.value} songs in this range
                        </div>

                        <div className="flex-1 overflow-y-auto pr-1" style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--section-gap) / 3)' }}>
                          {hoveredRangeSongs.map((song, i) => (
                            <div
                              key={song.title}
                              className="flex items-center rounded-lg bg-black/30"
                              style={{ gap: 'calc(var(--section-gap) / 2)', padding: 'calc(var(--card-padding) * 0.75)' }}
                            >
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${
                                  song.peak <= 5 ? "bg-amber-500/30 text-amber-500" : "bg-foreground/10 text-foreground/50"
                                }`}
                                style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-body)' }}
                              >
                                #{song.peak}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-foreground/90 truncate" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                                  {song.title}
                                </div>
                                <div className="text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                                  {song.weeks} weeks ({weeksToMonths(song.weeks)})
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full overflow-y-auto" style={{ padding: 'var(--card-padding)' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 'calc(var(--section-gap) / 3)' }}>
                          {longestSongs.slice(0, 8).map((song, i) => (
                            <div
                              key={song.title}
                              className="flex items-center rounded-lg bg-black/20"
                              style={{ gap: 'calc(var(--section-gap) / 2)', padding: 'calc(var(--card-padding) * 0.75)' }}
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                                  i < 3 ? "bg-amber-500/30 text-amber-500" : "bg-foreground/10 text-foreground/50"
                                }`}
                                style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-small)' }}
                              >
                                {i + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-foreground/80 truncate" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                                  {song.title}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`${i === 0 ? "text-amber-500" : "text-foreground/70"}`} style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-body)' }}>
                                  {song.weeks}w
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="text-center text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)', marginTop: 'var(--section-gap)' }}>
                          Hover bars to filter songs
                        </div>
                      </div>
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
