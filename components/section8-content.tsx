"use client"

import { useState, useEffect, useMemo } from "react"

interface YearData {
  entries: number
  number_ones: number
  top_tens: number
  songs: string[]
}

interface EraData {
  songs: number
  number_ones: number
  top_tens: number
}

interface SummaryData {
  total_entries?: number
  number_one_hits?: number
  top_ten_hits?: number
  total_weeks_on_chart?: number
  average_weeks_per_song?: number
  average_peak_position?: number
  longest_running_song?: {
    title: string
    weeks: number
    peak: number
  }
  first_chart_entry?: {
    title: string
    date: string
    peak: number
  }
  yearly_breakdown?: Record<string, YearData>
  era_comparison?: {
    origin: EraData
    ascent: EraData
    peak: EraData
    recent: EraData
  }
}

interface DataStructure {
  section_8_summary?: SummaryData
}

interface Section8ContentProps {
  isActive?: boolean
}

interface Era {
  name: string
  period: string
  years: string
  songs: number
  number_ones: number
  top_tens: number
  color: string
  description: string
}

export function Section8Content({ isActive = false }: Section8ContentProps) {
  const [data, setData] = useState<DataStructure | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredEra, setHoveredEra] = useState<string | null>(null)

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
  const eraComparison = summary?.era_comparison

  // Era data with descriptions
  const eras: Era[] = useMemo(() => [
    {
      name: "Origin",
      period: "2009–2011",
      years: "3 years",
      songs: eraComparison?.origin?.songs || 0,
      number_ones: eraComparison?.origin?.number_ones || 0,
      top_tens: eraComparison?.origin?.top_tens || 0,
      color: "bg-foreground/40",
      description: "The breakthrough. From So Far Gone to Take Care."
    },
    {
      name: "Ascent",
      period: "2012–2015",
      years: "4 years",
      songs: eraComparison?.ascent?.songs || 0,
      number_ones: eraComparison?.ascent?.number_ones || 0,
      top_tens: eraComparison?.ascent?.top_tens || 0,
      color: "bg-foreground/60",
      description: "Building momentum. Nothing Was The Same to IYRTITL."
    },
    {
      name: "Peak",
      period: "2016–2018",
      years: "3 years",
      songs: eraComparison?.peak?.songs || 0,
      number_ones: eraComparison?.peak?.number_ones || 0,
      top_tens: eraComparison?.peak?.top_tens || 0,
      color: "bg-amber-500",
      description: "Total domination. Views. More Life. Scorpion."
    },
    {
      name: "Recent",
      period: "2019–2025",
      years: "7 years",
      songs: eraComparison?.recent?.songs || 0,
      number_ones: eraComparison?.recent?.number_ones || 0,
      top_tens: eraComparison?.recent?.top_tens || 0,
      color: "bg-amber-500/70",
      description: "Sustained excellence. CLB to For All The Dogs."
    },
  ], [eraComparison])

  const maxSongs = Math.max(...eras.map(e => e.songs), 1)

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

      {/* Main content - Full screen centered */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <div className="w-full max-w-6xl mx-auto px-8">

          {/* Title */}
          <div className={`text-center mb-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h1
              className="text-5xl md:text-6xl lg:text-7xl leading-[0.9] tracking-tight"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              <span className="text-foreground/90">THE</span>{" "}
              <span className="text-amber-500">EVOLUTION</span>
            </h1>
            <p
              className="text-base text-foreground/50 mt-4 max-w-xl mx-auto"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Four eras. One unstoppable trajectory.
            </p>
          </div>

          {/* Era Columns */}
          <div className="flex gap-4 h-[420px]">
            {eras.map((era, i) => {
              const barHeight = (era.songs / maxSongs) * 280
              const isHovered = hoveredEra === era.name
              const isPeak = era.name === "Peak"

              return (
                <div
                  key={era.name}
                  className={`flex-1 flex flex-col rounded-2xl border transition-all duration-500 cursor-pointer overflow-hidden ${
                    isHovered
                      ? "bg-gradient-to-b from-amber-500/15 to-transparent border-amber-500/40 scale-[1.02]"
                      : isPeak
                      ? "bg-gradient-to-b from-amber-500/10 to-transparent border-amber-500/20"
                      : "bg-foreground/[0.02] border-foreground/10"
                  }`}
                  style={{
                    opacity: isVisible ? 1 : 0,
                    transform: isVisible ? "translateY(0)" : "translateY(40px)",
                    transition: `all 0.7s cubic-bezier(0.4, 0, 0.2, 1) ${0.1 + i * 0.1}s`,
                  }}
                  onMouseEnter={() => setHoveredEra(era.name)}
                  onMouseLeave={() => setHoveredEra(null)}
                >
                  {/* Era Header */}
                  <div className="p-5 pb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${era.color}`} />
                      <span
                        className={`text-2xl transition-colors ${isHovered || isPeak ? "text-amber-500" : "text-foreground/80"}`}
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                      >
                        {era.name}
                      </span>
                    </div>
                    <div
                      className="text-xs text-foreground/40"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {era.period}
                    </div>
                  </div>

                  {/* Bar Visualization */}
                  <div className="flex-1 flex items-end justify-center px-5 pb-4">
                    <div className="w-full flex flex-col items-center">
                      {/* Song count */}
                      <div
                        className={`text-4xl mb-3 transition-all duration-300 ${
                          isHovered || isPeak ? "text-amber-500 scale-110" : "text-foreground/70"
                        }`}
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                      >
                        {era.songs}
                      </div>

                      {/* Bar */}
                      <div
                        className={`w-full max-w-[100px] rounded-t-lg transition-all duration-700 ${era.color} ${
                          isHovered ? "ring-2 ring-amber-500/50" : ""
                        }`}
                        style={{
                          height: isVisible ? `${barHeight}px` : "0px",
                          minHeight: era.songs > 0 ? "20px" : "0",
                          transitionDelay: `${0.3 + i * 0.1}s`,
                        }}
                      />

                      {/* Label */}
                      <div
                        className="text-xs text-foreground/40 mt-2"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        entries
                      </div>
                    </div>
                  </div>

                  {/* Stats Row */}
                  <div className={`px-5 pb-5 pt-3 border-t transition-colors ${
                    isHovered ? "border-amber-500/20" : "border-foreground/5"
                  }`}>
                    <div className="flex justify-between text-center">
                      <div>
                        <div
                          className={`text-xl ${era.number_ones > 0 ? "text-amber-500" : "text-foreground/30"}`}
                          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                        >
                          {era.number_ones}
                        </div>
                        <div className="text-[10px] text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          #1s
                        </div>
                      </div>
                      <div>
                        <div
                          className="text-xl text-foreground/70"
                          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                        >
                          {era.top_tens}
                        </div>
                        <div className="text-[10px] text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                          Top 10
                        </div>
                      </div>
                    </div>

                    {/* Description on hover */}
                    <div
                      className={`mt-3 text-xs text-foreground/50 leading-relaxed transition-all duration-300 overflow-hidden ${
                        isHovered ? "max-h-20 opacity-100" : "max-h-0 opacity-0"
                      }`}
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {era.description}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Bottom hint */}
          <div className={`mt-8 text-center transition-all duration-700 delay-500 ${isVisible ? "opacity-100" : "opacity-0"}`}>
            <p
              className="text-sm text-foreground/40"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Hover each era to explore
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
