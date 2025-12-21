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
        <div className="max-w-7xl mx-auto px-6 py-8 w-full">

          {/* Header Row */}
          <div className={`flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-5 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {/* Title */}
            <div>
              <h1
                className="text-5xl md:text-6xl lg:text-7xl leading-[0.9] tracking-tight"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                <span className="text-foreground/90">STAYING</span>{" "}
                <span className="text-amber-500">POWER</span>
              </h1>
              <p
                className="text-base text-foreground/50 mt-2 max-w-md leading-relaxed"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Drake's songs don't just debut — they live on the chart for months.
              </p>
            </div>

            {/* Stats */}
            <div className="flex gap-3">
              <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/20">
                <div className="text-[1.625rem] text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{longestSong?.weeks || 0}</div>
                <div className="text-xs text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif" }}>Longest Run</div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                <div className="text-[1.625rem] text-foreground/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{totalSongs}</div>
                <div className="text-xs text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif" }}>Total Songs</div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                <div className="text-[1.625rem] text-foreground/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  {orderedDistribution[2].value + orderedDistribution[3].value + orderedDistribution[4].value}
                </div>
                <div className="text-xs text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif" }}>11+ Weeks</div>
              </div>
              <div className="px-4 py-3 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                <div className="text-[1.625rem] text-foreground/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  {longestSongs.filter(s => s.weeks >= 36).length}
                </div>
                <div className="text-xs text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif" }}>9+ Months</div>
              </div>
            </div>
          </div>

          {/* Main Content - Chart + Details */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="p-6 rounded-3xl">
              <div className="flex flex-col lg:flex-row gap-6">

                {/* Bar Chart */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="h-[1px] w-8 bg-amber-500/50" />
                    <span
                      className="text-xs tracking-[0.2em] text-amber-500/70 uppercase"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      Chart Duration Distribution
                    </span>
                  </div>

                  <div className="rounded-xl p-4">
                    {/* Bar chart */}
                    <div className="flex items-end justify-around gap-3 h-[220px] mb-4">
                      {orderedDistribution.map((item, i) => {
                        const barHeight = maxDistribution > 0 ? (item.value / maxDistribution) * 180 : 0
                        const isHovered = hoveredBar === item.label

                        return (
                          <div
                            key={item.label}
                            className="flex-1 flex flex-col items-center gap-2 h-full justify-end cursor-pointer"
                            onMouseEnter={() => setHoveredBar(item.label)}
                            onMouseLeave={() => setHoveredBar(null)}
                          >
                            {/* Value label */}
                            <div
                              className={`text-[1.75rem] transition-all ${
                                isHovered ? "text-amber-500 scale-110" : "text-foreground/70"
                              }`}
                              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
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
                              className={`text-sm text-center transition-all ${
                                isHovered ? "text-foreground" : "text-foreground/50"
                              }`}
                              style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                              {item.label.replace(" weeks", "w")}
                            </div>
                          </div>
                        )
                      })}
                    </div>

                    {/* Insight bar */}
                    <div className="flex items-center gap-4 p-4 mt-6 rounded-lg bg-amber-500/10 border border-amber-500/20">
                      <div className="text-[2.5rem] text-amber-500 font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                        {Math.round(((orderedDistribution[2].value + orderedDistribution[3].value + orderedDistribution[4].value) / totalSongs) * 100)}%
                      </div>
                      <div className="text-sm text-foreground/70" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        of songs charted for 11+ weeks
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details Panel */}
                <div className="lg:w-80">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-[1px] w-8 bg-amber-500/50" />
                    <span
                      className="text-xs tracking-[0.2em] text-amber-500/70 uppercase"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {hoveredBar ? hoveredBar : "Longest Runs"}
                    </span>
                  </div>

                  <div className={`h-[300px] rounded-xl border transition-all duration-300 overflow-hidden ${
                    hoveredRangeSongs
                      ? "bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30"
                      : "bg-foreground/[0.02] border-foreground/10"
                  }`}>
                    {hoveredRangeSongs && hoveredRangeSongs.length > 0 ? (
                      <div className="p-4 h-full flex flex-col">
                        <div className="text-sm text-foreground/50 mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          {orderedDistribution.find(d => d.label === hoveredBar)?.value} songs in this range
                        </div>

                        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                          {hoveredRangeSongs.map((song, i) => (
                            <div
                              key={song.title}
                              className="flex items-center gap-3 p-3 rounded-lg bg-black/30"
                            >
                              <div
                                className={`w-10 h-10 rounded-lg flex items-center justify-center text-base font-bold ${
                                  song.peak <= 5 ? "bg-amber-500/30 text-amber-500" : "bg-foreground/10 text-foreground/50"
                                }`}
                                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                              >
                                #{song.peak}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-foreground/90 truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                  {song.title}
                                </div>
                                <div className="text-xs text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                  {song.weeks} weeks ({weeksToMonths(song.weeks)})
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-4 h-full overflow-y-auto">
                        <div className="space-y-2">
                          {longestSongs.slice(0, 8).map((song, i) => (
                            <div
                              key={song.title}
                              className="flex items-center gap-3 p-3 rounded-lg bg-black/20"
                            >
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                  i < 3 ? "bg-amber-500/30 text-amber-500" : "bg-foreground/10 text-foreground/50"
                                }`}
                                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                              >
                                {i + 1}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm text-foreground/80 truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>
                                  {song.title}
                                </div>
                              </div>
                              <div className="text-right">
                                <div className={`text-base ${i === 0 ? "text-amber-500" : "text-foreground/70"}`} style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                                  {song.weeks}w
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 text-center text-xs text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
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
