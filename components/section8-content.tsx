"use client"

import { useState, useEffect, useMemo } from "react"

interface YearData {
  entries: number
  number_ones: number
  top_tens: number
  songs: string[]
}

interface SummaryData {
  total_entries?: number
  number_one_hits?: number
  top_ten_hits?: number
  total_weeks_on_chart?: number
  first_chart_entry?: {
    title: string
    date: string
    peak: number
  }
  longest_running_song?: {
    title: string
    weeks: number
    peak: number
  }
  yearly_breakdown?: Record<string, YearData>
}

interface DataStructure {
  section_8_summary?: SummaryData
}

interface Section8ContentProps {
  isActive?: boolean
}

interface Milestone {
  year: string
  title: string
  subtitle: string
  stat: string
  statLabel: string
  isHighlight: boolean
}

export function Section8Content({ isActive = false }: Section8ContentProps) {
  const [data, setData] = useState<DataStructure | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredMilestone, setHoveredMilestone] = useState<number | null>(null)
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)

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
  const summary = data?.section_8_summary
  const yearlyBreakdown = summary?.yearly_breakdown || {}
  const years = Object.keys(yearlyBreakdown).sort()

  // Calculate cumulative stats for timeline
  const timelineData = useMemo(() => {
    let cumulativeSongs = 0
    let cumulativeOnes = 0

    return years.map(year => {
      const yearData = yearlyBreakdown[year]
      cumulativeSongs += yearData?.entries || 0
      cumulativeOnes += yearData?.number_ones || 0

      return {
        year,
        entries: yearData?.entries || 0,
        numberOnes: yearData?.number_ones || 0,
        cumulativeSongs,
        cumulativeOnes,
      }
    })
  }, [years, yearlyBreakdown])

  // Key milestones for the journey
  const milestones: Milestone[] = useMemo(() => [
    {
      year: "2009",
      title: "The Beginning",
      subtitle: "Best I Ever Had debuts",
      stat: years.length > 0 ? String(yearlyBreakdown["2009"]?.entries || 0) : "0",
      statLabel: "First entries",
      isHighlight: false,
    },
    {
      year: "2010",
      title: "First #1",
      subtitle: "What's My Name? with Rihanna",
      stat: "1",
      statLabel: "#1 hit",
      isHighlight: false,
    },
    {
      year: "2016",
      title: "Views Era",
      subtitle: "One Dance dominates",
      stat: String(yearlyBreakdown["2016"]?.entries || 0),
      statLabel: "entries",
      isHighlight: false,
    },
    {
      year: "2018",
      title: "Scorpion",
      subtitle: "God's Plan, Nice For What, In My Feelings",
      stat: "3",
      statLabel: "consecutive #1s",
      isHighlight: false,
    },
    {
      year: "2021",
      title: "CLB",
      subtitle: "Way 2 Sexy tops charts",
      stat: String(yearlyBreakdown["2021"]?.entries || 0),
      statLabel: "entries",
      isHighlight: false,
    },
    {
      year: years[years.length - 1] || "2024",
      title: "The Legacy",
      subtitle: `${summary?.total_entries || 0} total chart entries`,
      stat: String(summary?.number_one_hits || 0),
      statLabel: "#1 hits total",
      isHighlight: false,
    },
  ], [years, yearlyBreakdown, summary])

  // Calculate max for scaling
  const maxEntries = Math.max(...timelineData.map(d => d.entries), 1)

  // Trigger animation
  useEffect(() => {
    if (!data || !isActive) return
    setIsVisible(true)
  }, [data, isActive])

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

      {/* Main content - Full screen */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center">
        <div className="w-full max-w-7xl mx-auto px-8">

          {/* Title */}
          <div className={`text-center mb-10 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h1
              className="text-5xl md:text-6xl lg:text-7xl leading-[0.9] tracking-tight"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              <span className="text-foreground/90">THE</span>{" "}
              <span className="text-amber-500">JOURNEY</span>
            </h1>
            <p
              className="text-base text-foreground/50 mt-3"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              {years[0]} to {years[years.length - 1]} — A decade of dominance
            </p>
          </div>

          {/* Timeline visualization */}
          <div className={`relative transition-all duration-700 delay-200 ${isVisible ? "opacity-100" : "opacity-0"}`}>

            {/* Chart label */}
            <div className="flex items-center justify-center gap-2 mb-4">
              <div className="h-[1px] w-8 bg-amber-500/30" />
              <span
                className="text-xs tracking-[0.2em] text-amber-500/70 uppercase"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Chart Entries Per Year
              </span>
              <div className="h-[1px] w-8 bg-amber-500/30" />
            </div>

            {/* Year bars - Activity graph with labels */}
            <div className="flex items-end justify-center gap-[3px] h-[140px] mb-2 px-4">
              {timelineData.map((item, i) => {
                const barHeight = (item.entries / maxEntries) * 110
                const hasNumberOne = item.numberOnes > 0
                const isHovered = hoveredBar === i

                return (
                  <div
                    key={item.year}
                    className="flex-1 max-w-[36px] flex flex-col items-center cursor-pointer"
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transition: `opacity 0.5s ease ${0.3 + i * 0.03}s`,
                    }}
                    onMouseEnter={() => setHoveredBar(i)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Hover tooltip */}
                    {isHovered && (
                      <div
                        className="text-xs text-amber-500 mb-1"
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                      >
                        {item.entries}
                      </div>
                    )}
                    <div
                      className={`w-full rounded-t transition-all duration-500 ${
                        hasNumberOne ? "bg-amber-500" : "bg-foreground/30"
                      } ${isHovered ? "ring-1 ring-amber-400" : ""}`}
                      style={{
                        height: isVisible ? `${Math.max(barHeight, 4)}px` : "0px",
                        transitionDelay: `${0.4 + i * 0.03}s`,
                      }}
                    />
                  </div>
                )
              })}
            </div>

            {/* Timeline line */}
            <div className="relative h-2 mx-4">
              <div className="absolute inset-0 bg-foreground/10 rounded-full" />
              <div
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-foreground/40 via-amber-500 to-amber-500 rounded-full"
                style={{
                  width: isVisible ? "100%" : "0%",
                  transition: "width 1.5s ease-out 0.5s",
                }}
              />
            </div>

            {/* Year labels - aligned with bars */}
            <div className="flex justify-center gap-[3px] px-4 mt-2">
              {timelineData.map((item, i) => (
                <div
                  key={item.year}
                  className="flex-1 max-w-[36px] text-center"
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transition: `opacity 0.5s ease ${0.8 + i * 0.02}s`,
                  }}
                >
                  <span
                    className={`text-xs ${hoveredBar === i ? "text-amber-500" : "text-foreground/40"}`}
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    '{item.year.slice(-2)}
                  </span>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 mt-4 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-amber-500" />
                <span className="text-xs text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Year with #1 hit
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-foreground/30" />
                <span className="text-xs text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  No #1 hit
                </span>
              </div>
            </div>

            {/* Milestone cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mt-6">
              {milestones.map((milestone, i) => {
                const isHovered = hoveredMilestone === i

                return (
                  <div
                    key={milestone.year}
                    className={`p-4 rounded-xl border transition-all duration-300 cursor-pointer ${
                      isHovered
                        ? "bg-gradient-to-b from-amber-500/20 to-transparent border-amber-500/50 scale-105"
                        : milestone.isHighlight
                        ? "bg-gradient-to-b from-amber-500/10 to-transparent border-amber-500/30"
                        : "bg-foreground/[0.03] border-foreground/10"
                    }`}
                    style={{
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? "translateY(0)" : "translateY(20px)",
                      transition: `all 0.5s ease ${0.6 + i * 0.1}s`,
                    }}
                    onMouseEnter={() => setHoveredMilestone(i)}
                    onMouseLeave={() => setHoveredMilestone(null)}
                  >
                    {/* Year badge */}
                    <div
                      className={`inline-block px-2 py-0.5 rounded text-xs mb-2 ${
                        milestone.isHighlight ? "bg-amber-500/20 text-amber-500" : "bg-foreground/10 text-foreground/50"
                      }`}
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {milestone.year}
                    </div>

                    {/* Title */}
                    <div
                      className={`text-lg mb-1 transition-colors ${
                        isHovered || milestone.isHighlight ? "text-amber-500" : "text-foreground/80"
                      }`}
                      style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    >
                      {milestone.title}
                    </div>

                    {/* Subtitle */}
                    <div
                      className="text-xs text-foreground/50 mb-3 line-clamp-2"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {milestone.subtitle}
                    </div>

                    {/* Stat */}
                    <div className="flex items-baseline gap-1">
                      <span
                        className={`text-2xl ${milestone.isHighlight ? "text-amber-500" : "text-foreground/70"}`}
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                      >
                        {milestone.stat}
                      </span>
                      <span
                        className="text-[10px] text-foreground/40"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        {milestone.statLabel}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Bottom summary */}
          <div className={`mt-10 flex items-center justify-center gap-8 transition-all duration-700 delay-1000 ${isVisible ? "opacity-100" : "opacity-0"}`}>
            <div className="text-center">
              <div className="text-3xl text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                {years.length}
              </div>
              <div className="text-xs text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Years
              </div>
            </div>
            <div className="w-px h-8 bg-foreground/10" />
            <div className="text-center">
              <div className="text-3xl text-foreground/80" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                {summary?.total_entries || 0}
              </div>
              <div className="text-xs text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Entries
              </div>
            </div>
            <div className="w-px h-8 bg-foreground/10" />
            <div className="text-center">
              <div className="text-3xl text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                {summary?.number_one_hits || 0}
              </div>
              <div className="text-xs text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                #1 Hits
              </div>
            </div>
            <div className="w-px h-8 bg-foreground/10" />
            <div className="text-center">
              <div className="text-3xl text-foreground/80" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                {summary?.total_weeks_on_chart?.toLocaleString() || 0}
              </div>
              <div className="text-xs text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Total Weeks
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
