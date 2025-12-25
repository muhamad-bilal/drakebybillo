"use client"

import { useState, useEffect } from "react"

interface DashContentProps {
  isActive?: boolean
}

export function DashContent({ isActive = false }: DashContentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredBar, setHoveredBar] = useState<number | null>(null)
  const [hoveredPeak, setHoveredPeak] = useState<number | null>(null)
  const [hoveredWeeks, setHoveredWeeks] = useState(false)

  // Trigger animation
  useEffect(() => {
    if (!isActive) return
    setIsVisible(true)
  }, [isActive])

  // Data
  const yearlyEntries = [7, 10, 10, 17, 14, 15, 15, 28, 31, 31, 24, 36, 32, 24, 23, 22, 10]
  const maxYearly = Math.max(...yearlyEntries)

  const peakDistribution = [
    { label: '#1', value: 13, color: 'bg-amber-500' },
    { label: '#2-10', value: 68, color: 'bg-amber-500/70' },
    { label: '#11-40', value: 116, color: 'bg-foreground/30' },
    { label: '#41-100', value: 128, color: 'bg-foreground/15' },
  ]
  const totalPeaks = peakDistribution.reduce((sum, d) => sum + d.value, 0)

  return (
    <section className="relative flex h-screen w-screen shrink-0 overflow-hidden">
      {/* Custom styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap');
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/3 rounded-full blur-3xl" />
      </div>

      {/* Center Title */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <div className={`text-center transition-all duration-700 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}>
          <div
            className="text-[12px] tracking-[0.5em] text-amber-500/50 uppercase mb-3"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Career Overview
          </div>
          <div
            className="text-7xl md:text-8xl lg:text-9xl text-foreground leading-none"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            DRAKE<span className="text-amber-500">.</span>
          </div>
          <div
            className="text-sm text-foreground/30 mt-3 tracking-wide"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            17 years. Every record. One dashboard.
          </div>
        </div>
      </div>

      {/* Bento Grid */}
      <div className="relative z-10 h-full w-full p-3 grid grid-cols-12 grid-rows-6 gap-2">

        {/* ROW 1 */}

        {/* Total Entries - Gold */}
        <div
          className={`col-span-3 row-span-2 rounded-2xl p-4 flex flex-col justify-between transition-all duration-500 bg-gradient-to-br from-amber-500/15 to-amber-500/5 border border-amber-500/25 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "100ms" }}
        >
          <div className="text-[12px] tracking-[0.2em] text-amber-500/70 uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Billboard Hot 100
          </div>
          <div>
            <div className="text-[2.5rem] lg:text-[3.25rem] text-amber-500 leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              325
            </div>
            <div className="text-foreground/40 text-[12px] mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Chart entries • All-time record
            </div>
          </div>
        </div>

        {/* #1 Hits */}
        <div
          className={`col-span-2 row-span-1 rounded-2xl p-4 flex items-center justify-between transition-all duration-500 bg-gradient-to-br from-amber-500/15 to-amber-500/5 border border-amber-500/25 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "150ms" }}
        >
          <div>
            <div className="text-[2.25rem] text-amber-500 leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>13</div>
            <div className="text-foreground/50 text-[12px]" style={{ fontFamily: "'Outfit', sans-serif" }}>#1 Hits</div>
          </div>
          <div className="flex gap-1">
            {[...Array(13)].map((_, i) => (
              <div key={i} className="w-1.5 h-6 bg-amber-500 rounded-full" />
            ))}
          </div>
        </div>

        {/* CENTER SPACER */}
        <div className="col-span-2 row-span-2" />

        {/* Top 10s */}
        <div
          className={`col-span-2 row-span-1 rounded-2xl p-4 flex items-center justify-between transition-all duration-500 bg-foreground/[0.02] border border-foreground/5 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "200ms" }}
        >
          <div>
            <div className="text-[2.25rem] text-foreground/90 leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>81</div>
            <div className="text-foreground/40 text-[12px]" style={{ fontFamily: "'Outfit', sans-serif" }}>Top 10 Hits</div>
          </div>
          <div className="text-right">
            <div className="text-[1.75rem] text-amber-500/70 leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>25%</div>
            <div className="text-foreground/30 text-[12px]" style={{ fontFamily: "'Outfit', sans-serif" }}>hit rate</div>
          </div>
        </div>

        {/* Spotify Streams */}
        <div
          className={`col-span-3 row-span-2 rounded-2xl p-4 flex flex-col justify-between transition-all duration-500 bg-foreground/[0.02] border border-foreground/5 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "250ms" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            <div className="text-[12px] tracking-[0.2em] text-amber-500/70 uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Spotify Streams
            </div>
          </div>
          <div>
            <div className="text-[3rem] text-foreground/90 leading-none mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              125.1B
            </div>
            {/* Mini line graph */}
            <div className="relative h-16 mb-1">
              <svg viewBox="0 0 100 40" className="w-full h-full" preserveAspectRatio="none">
                {/* Gradient fill under line */}
                <defs>
                  <linearGradient id="streamGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="rgb(245, 158, 11)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="rgb(245, 158, 11)" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {/* Area fill - 8 data points: positions at 0, 14.28, 28.57, 42.85, 57.14, 71.42, 85.71, 100 */}
                <path
                  d="M0,35 L14.28,30 L28.57,24 L42.85,17 L57.14,12 L71.42,14 L85.71,8 L100,10 L100,40 L0,40 Z"
                  fill="url(#streamGradient)"
                />
                {/* Line */}
                <path
                  d="M0,35 L14.28,30 L28.57,24 L42.85,17 L57.14,12 L71.42,14 L85.71,8 L100,10"
                  fill="none"
                  stroke="rgb(245, 158, 11)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>
            <div className="flex justify-between text-[10px] text-foreground/30" style={{ fontFamily: "'Outfit', sans-serif" }}>
              <span>'18</span>
              <span>'19</span>
              <span>'20</span>
              <span>'21</span>
              <span>'22</span>
              <span>'23</span>
              <span>'24</span>
              <span>'25</span>
            </div>
          </div>
          <div className="text-foreground/40 text-[12px]" style={{ fontFamily: "'Outfit', sans-serif" }}>
            ~15.6 streams per person on Earth
          </div>
        </div>

        {/* ROW 2 */}

        {/* Weeks on Chart */}
        <div
          className={`col-span-2 row-span-1 rounded-2xl p-3 flex flex-col justify-between transition-all duration-500 cursor-pointer bg-foreground/[0.02] border border-foreground/5 ${hoveredWeeks ? 'border-amber-500/30' : ''} ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "300ms" }}
          onMouseEnter={() => setHoveredWeeks(true)}
          onMouseLeave={() => setHoveredWeeks(false)}
        >
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[2rem] text-foreground/90 leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>3,268</div>
              <div className="text-foreground/40 text-[11px]" style={{ fontFamily: "'Outfit', sans-serif" }}>weeks on chart</div>
            </div>
            {hoveredWeeks && (
              <div className="text-right">
                <div className="text-amber-500 text-[14px]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>22,876</div>
                <div className="text-foreground/40 text-[10px]" style={{ fontFamily: "'Outfit', sans-serif" }}>days</div>
              </div>
            )}
          </div>
          <div className={`text-[13px] font-medium transition-colors ${hoveredWeeks ? 'text-amber-500' : 'text-amber-500/70'}`} style={{ fontFamily: "'Outfit', sans-serif" }}>
            ≈ 63 years of music
          </div>
        </div>

        {/* Years Active */}
        <div
          className={`col-span-2 row-span-1 rounded-2xl p-4 transition-all duration-500 bg-foreground/[0.02] border border-foreground/5 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "350ms" }}
        >
          <div className="text-[2rem] text-foreground/90 leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>17</div>
          <div className="text-foreground/40 text-[12px] mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>consecutive years</div>
          <div className="text-amber-500/50 text-[14px]" style={{ fontFamily: "'Outfit', sans-serif" }}>2009 — 2025</div>
        </div>

        {/* ROW 3 - MIDDLE */}

        {/* Era Breakdown */}
        <div
          className={`col-span-3 row-span-2 rounded-2xl p-4 flex flex-col justify-between transition-all duration-500 bg-foreground/[0.02] border border-foreground/5 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "400ms" }}
        >
          <div className="text-[12px] tracking-[0.2em] text-foreground/40 uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Era Breakdown
          </div>
          <div className="space-y-2">
            {[
              { era: "'09-11", entries: 27, color: 'bg-foreground/30' },
              { era: "'12-15", entries: 61, color: 'bg-foreground/40' },
              { era: "'16-18", entries: 90, color: 'bg-amber-500/70' },
              { era: "'19-25", entries: 147, color: 'bg-amber-500' },
            ].map((d) => (
              <div key={d.era} className="flex items-center gap-2">
                <span className="text-[12px] text-foreground/50 w-12" style={{ fontFamily: "'Outfit', sans-serif" }}>{d.era}</span>
                <div className="flex-1 h-4 bg-foreground/5 rounded-sm overflow-hidden">
                  <div className={`h-full ${d.color} rounded-sm`} style={{ width: `${(d.entries / 147) * 100}%` }} />
                </div>
                <span className="text-[1rem] text-foreground/70 w-8 text-right" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{d.entries}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER SPACER */}
        <div className="col-span-6 row-span-2" />

        {/* Yearly Bar Chart */}
        <div
          className={`col-span-3 row-span-2 rounded-2xl p-4 flex flex-col justify-between transition-all duration-500 bg-foreground/[0.02] border border-foreground/5 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "450ms" }}
        >
          <div className="text-[12px] tracking-[0.2em] text-foreground/40 uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Entries Per Year
          </div>
          <div className="relative h-24">
            {/* Hover labels */}
            <div className="absolute -top-5 left-0 right-0 flex gap-1">
              {yearlyEntries.map((value, i) => (
                <div key={i} className="flex-1 flex justify-center">
                  {hoveredBar === i && (
                    <div className="text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '14px' }}>
                      {value}
                    </div>
                  )}
                </div>
              ))}
            </div>
            {/* Bars */}
            <div className="flex items-end gap-1 h-full">
              {yearlyEntries.map((value, i) => (
                <div
                  key={i}
                  className={`flex-1 rounded-t transition-all cursor-pointer ${value === maxYearly ? 'bg-amber-500' : 'bg-amber-500/50'} ${hoveredBar === i ? 'ring-1 ring-amber-400' : ''}`}
                  style={{ height: `${(value / maxYearly) * 100}%`, minHeight: 2 }}
                  onMouseEnter={() => setHoveredBar(i)}
                  onMouseLeave={() => setHoveredBar(null)}
                />
              ))}
            </div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[12px] text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif" }}>'09</span>
            <span className="text-[12px] text-amber-500/70" style={{ fontFamily: "'Outfit', sans-serif" }}>Peak: 36 (2020)</span>
            <span className="text-[12px] text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif" }}>'25</span>
          </div>
        </div>

        {/* ROW 5 - BOTTOM */}

        {/* First Entry */}
        <div
          className={`col-span-3 row-span-2 rounded-2xl p-4 flex flex-col justify-between transition-all duration-500 bg-foreground/[0.02] border border-foreground/5 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "500ms" }}
        >
          <div className="text-[12px] tracking-[0.2em] text-foreground/40 uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
            First Chart Entry
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-[1.75rem] text-foreground/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                "Best I Ever Had"
              </div>
              <div className="text-foreground/40 text-[14px]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                May 30, 2009 • 24 weeks
              </div>
            </div>
            <div className="text-[3rem] text-amber-500 leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>#2</div>
          </div>
        </div>

        {/* Peak Distribution */}
        <div
          className={`col-span-2 row-span-1 rounded-2xl p-3 flex flex-col justify-between transition-all duration-500 bg-foreground/[0.02] border border-foreground/5 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "550ms" }}
        >
          <div className="flex items-center justify-between">
            <div className="text-[11px] tracking-[0.2em] text-foreground/40 uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Peak Distribution
            </div>
            {hoveredPeak !== null && (
              <div className="text-amber-500 text-[12px]" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                {peakDistribution[hoveredPeak].label}: {peakDistribution[hoveredPeak].value} entries
              </div>
            )}
          </div>
          <div className="h-6 rounded-lg overflow-hidden flex">
            {peakDistribution.map((d, i) => (
              <div
                key={d.label}
                className={`h-full ${d.color} flex items-center justify-center cursor-pointer transition-all ${hoveredPeak === i ? 'ring-1 ring-amber-400 ring-inset brightness-110' : ''}`}
                style={{ width: `${(d.value / totalPeaks) * 100}%` }}
                onMouseEnter={() => setHoveredPeak(i)}
                onMouseLeave={() => setHoveredPeak(null)}
              >
                {d.value > 30 && <span className="text-[10px] text-black/70 font-medium">{d.value}</span>}
              </div>
            ))}
          </div>
          <div className="flex justify-between">
            {peakDistribution.map((d, i) => (
              <span
                key={d.label}
                className={`text-[10px] transition-colors ${hoveredPeak === i ? 'text-amber-500' : 'text-foreground/40'}`}
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {d.label}
              </span>
            ))}
          </div>
        </div>

        {/* CENTER SPACER */}
        <div className="col-span-2 row-span-2" />

        {/* CLB Record */}
        <div
          className={`col-span-2 row-span-1 rounded-2xl p-4 transition-all duration-500 bg-gradient-to-br from-amber-500/15 to-amber-500/5 border border-amber-500/25 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "600ms" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[12px] tracking-[0.2em] text-amber-500/70 uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>CLB Top 10</div>
              <div className="text-[2.25rem] text-amber-500 leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>9/10</div>
            </div>
            <div className="grid grid-cols-5 gap-1">
              {[...Array(10)].map((_, i) => (
                <div key={i} className={`w-2.5 h-4 rounded-sm ${i < 9 ? 'bg-amber-500' : 'bg-foreground/20'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Collaborators + Longest */}
        <div
          className={`col-span-3 row-span-2 rounded-2xl p-4 transition-all duration-500 bg-foreground/[0.02] border border-foreground/5 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "650ms" }}
        >
          <div className="flex h-full gap-4">
            <div className="flex-1 flex flex-col justify-between">
              <div className="text-[12px] tracking-[0.2em] text-foreground/40 uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>Collaborators</div>
              <div>
                <div className="text-[2.25rem] text-foreground/90 leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>186</div>
                <div className="text-foreground/40 text-[12px]" style={{ fontFamily: "'Outfit', sans-serif" }}>unique artists</div>
              </div>
              <div className="flex items-center gap-2 mt-1">
                <div className="relative w-10 h-10">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="14" fill="none" className="stroke-foreground/10" strokeWidth="3" />
                    <circle cx="18" cy="18" r="14" fill="none" className="stroke-amber-500" strokeWidth="3"
                      strokeDasharray={`${57 * 0.88} ${100 - 57 * 0.88}`} strokeLinecap="round" />
                  </svg>
                </div>
                <div className="text-[14px] text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  <span className="text-amber-500 font-medium">57%</span> collabs
                </div>
              </div>
            </div>
            <div className="w-px bg-foreground/10" />
            <div className="flex-1 flex flex-col justify-between">
              <div className="text-[12px] tracking-[0.2em] text-foreground/40 uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>Longest Run</div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-[2.25rem] text-foreground/90 leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>45</span>
                  <span className="text-foreground/50 text-[14px]" style={{ fontFamily: "'Outfit', sans-serif" }}>wks</span>
                </div>
                <div className="text-amber-500 text-[14px] font-medium" style={{ fontFamily: "'Outfit', sans-serif" }}>"No Guidance"</div>
                <div className="text-foreground/40 text-[12px]" style={{ fontFamily: "'Outfit', sans-serif" }}>w/ Chris Brown</div>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 6 */}

        {/* Averages */}
        <div
          className={`col-span-2 row-span-1 rounded-2xl p-4 transition-all duration-500 bg-foreground/[0.02] border border-foreground/5 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "700ms" }}
        >
          <div className="text-[12px] tracking-[0.2em] text-foreground/40 uppercase mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Averages
          </div>
          <div className="flex justify-between">
            <div className="text-center">
              <div className="text-[1.5rem] text-foreground/80 leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>10.1</div>
              <div className="text-foreground/40 text-[11px]" style={{ fontFamily: "'Outfit', sans-serif" }}>wks/song</div>
            </div>
            <div className="text-center">
              <div className="text-[1.5rem] text-amber-500/70 leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>#33</div>
              <div className="text-foreground/40 text-[11px]" style={{ fontFamily: "'Outfit', sans-serif" }}>avg peak</div>
            </div>
            <div className="text-center">
              <div className="text-[1.5rem] text-foreground/80 leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>19</div>
              <div className="text-foreground/40 text-[11px]" style={{ fontFamily: "'Outfit', sans-serif" }}>per year</div>
            </div>
          </div>
        </div>

        {/* Top Collaborators */}
        <div
          className={`col-span-2 row-span-1 rounded-2xl p-4 transition-all duration-500 bg-foreground/[0.02] border border-foreground/5 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "750ms" }}
        >
          <div className="text-[12px] tracking-[0.2em] text-foreground/40 uppercase mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Top Collaborators
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[
              { name: "Lil Wayne", count: 23 },
              { name: "Future", count: 20 },
              { name: "21 Savage", count: 17 },
            ].map((c) => (
              <span key={c.name} className="px-2 py-1 rounded-full bg-amber-500/20 text-amber-500 text-[12px]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {c.name} <span className="text-amber-500/50 font-medium">{c.count}</span>
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <div
        className={`absolute bottom-2 left-1/2 -translate-x-1/2 z-30 transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}
        style={{ transitionDelay: "800ms" }}
      >
        <span className="text-[10px] tracking-[0.3em] text-foreground/20 uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Billboard Hot 100 • 2009–2025
        </span>
      </div>
    </section>
  )
}
