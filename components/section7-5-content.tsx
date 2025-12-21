"use client"

import { useState, useEffect } from "react"

interface SummaryData {
  total_entries?: number
  number_one_hits?: number
  top_ten_hits?: number
  total_weeks_on_chart?: number
  yearly_breakdown?: Record<string, unknown>
}

interface DataStructure {
  section_8_summary?: SummaryData
}

interface Section75ContentProps {
  isActive?: boolean
}

export function Section75Content({ isActive = false }: Section75ContentProps) {
  const [data, setData] = useState<DataStructure | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)

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
  const totalEntries = summary?.total_entries || 0
  const numberOneHits = summary?.number_one_hits || 0
  const topTenHits = summary?.top_ten_hits || 0
  const totalWeeks = summary?.total_weeks_on_chart || 0
  const yearsActive = Object.keys(summary?.yearly_breakdown || {}).length || 0

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



      {/* Main content */}
      <div className="relative z-10 w-full h-full flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-6 text-center">

          {/* Main Card */}
          <div className={`p-12 md:p-16 rounded-3xl bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20 transition-all duration-1000 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>

            {/* Title */}
            <h2
              className={`text-4xl md:text-5xl lg:text-6xl text-foreground mb-8 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              The Numbers Don't Lie
            </h2>

            {/* Stats Line */}
            <p
              className={`text-lg md:text-xl text-foreground/70 leading-relaxed mb-6 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              <span className="text-amber-500 font-semibold text-[1.375rem]">{totalEntries}</span> songs.{" "}
              <span className="text-amber-500 font-semibold text-[1.375rem]">{numberOneHits}</span> #1 hits.{" "}
              <span className="text-amber-500 font-semibold text-[1.375rem]">{topTenHits}</span> top 10s.
              <br />
              <span className="text-amber-500 font-semibold text-[1.375rem]">{totalWeeks.toLocaleString()}</span> weeks on the chart.{" "}
              Over <span className="text-amber-500 font-semibold text-[1.375rem]">{yearsActive}</span> years of dominance.
            </p>

            {/* Closing Statement */}
            <p
              className={`text-2xl md:text-3xl transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              <span className="text-amber-500 font-semibold">Drake isn't just an artist — he's the standard.</span>
            </p>
          </div>

        </div>
      </div>
    </section>
  )
}
