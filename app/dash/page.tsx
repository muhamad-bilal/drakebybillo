"use client"

import { useState, useEffect } from "react"

export default function DashboardPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Data for charts
  const yearlyEntries = [7, 10, 10, 17, 14, 15, 15, 28, 31, 31, 24, 36, 32, 24, 23, 22, 10]
  const maxYearly = Math.max(...yearlyEntries)

  // Peak distribution
  const peakDistribution = [
    { label: '#1', value: 13, color: '#D4AF37' },
    { label: '#2-10', value: 68, color: 'rgba(212,175,55,0.7)' },
    { label: '#11-40', value: 116, color: 'rgba(255,255,255,0.3)' },
    { label: '#41-100', value: 128, color: 'rgba(255,255,255,0.15)' },
  ]
  const totalPeaks = peakDistribution.reduce((sum, d) => sum + d.value, 0)

  return (
    <div className="h-screen w-screen bg-black text-white overflow-hidden relative">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap');
      `}</style>

      <style jsx>{`
        .bento-card {
          background: linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%);
          border: 1px solid rgba(255,255,255,0.06);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .bento-card:hover {
          border-color: rgba(212, 175, 55, 0.3);
        }
        
        .bento-gold {
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.15) 0%, rgba(212, 175, 55, 0.05) 100%);
          border: 1px solid rgba(212, 175, 55, 0.25);
        }
        
        .bento-gold:hover {
          border-color: rgba(212, 175, 55, 0.5);
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-500/3 rounded-full blur-3xl" />
      </div>

      {/* CENTER TITLE - Absolute center */}
      <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">
        <div 
          className={`text-center transition-all duration-700 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"}`}
        >
          <div 
            className="text-[10px] tracking-[0.5em] text-amber-500/50 uppercase mb-3"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Career Overview
          </div>
          <div 
            className="text-7xl md:text-8xl lg:text-9xl text-white leading-none"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            DRAKE<span className="text-amber-500">.</span>
          </div>
          <div 
            className="text-sm text-white/30 mt-3 tracking-wide"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            17 years. Every record. One dashboard.
          </div>
        </div>
      </div>

      {/* CARDS GRID */}
      <div className="relative z-10 h-full w-full p-3 grid grid-cols-12 grid-rows-6 gap-2">
        
        {/* ROW 1 */}
        
        {/* Total Entries */}
        <div 
          className={`col-span-3 row-span-2 bento-gold rounded-2xl p-5 flex flex-col justify-between transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "100ms" }}
        >
          <div className="text-[10px] tracking-[0.2em] text-amber-500/70 uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Billboard Hot 100
          </div>
          <div>
            <div className="text-6xl lg:text-7xl text-amber-500 leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              325
            </div>
            <div className="text-white/40 text-xs mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Chart entries • All-time record
            </div>
          </div>
        </div>

        {/* #1 Hits */}
        <div 
          className={`col-span-2 row-span-1 bento-gold rounded-2xl p-4 flex items-center justify-between transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "150ms" }}
        >
          <div>
            <div className="text-3xl text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>13</div>
            <div className="text-white/50 text-[10px]" style={{ fontFamily: "'Outfit', sans-serif" }}>#1 Hits</div>
          </div>
          <div className="flex gap-0.5">
            {[...Array(13)].map((_, i) => (
              <div key={i} className="w-1 h-5 bg-amber-500 rounded-full" />
            ))}
          </div>
        </div>

        {/* CENTER SPACER */}
        <div className="col-span-2 row-span-2" />

        {/* Top 10s */}
        <div 
          className={`col-span-2 row-span-1 bento-card rounded-2xl p-4 flex items-center justify-between transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "200ms" }}
        >
          <div>
            <div className="text-3xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>81</div>
            <div className="text-white/40 text-[10px]" style={{ fontFamily: "'Outfit', sans-serif" }}>Top 10 Hits</div>
          </div>
          <div className="text-right">
            <div className="text-lg text-amber-500/70" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>25%</div>
            <div className="text-white/30 text-[9px]" style={{ fontFamily: "'Outfit', sans-serif" }}>hit rate</div>
          </div>
        </div>

        {/* Spotify Streams */}
        <div 
          className={`col-span-3 row-span-2 bento-card rounded-2xl p-5 flex flex-col justify-between transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "250ms" }}
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <div className="text-[10px] tracking-[0.2em] text-amber-500/70 uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Spotify Streams
            </div>
          </div>
          <div>
            <div className="text-5xl text-white/90 leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              124.9B
            </div>
            <div className="h-2 bg-white/5 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-amber-500 to-amber-500/50 rounded-full" style={{ width: '100%' }} />
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-amber-500 text-sm" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>17.6B <span className="text-white/30 text-[9px]">in 2025</span></span>
              <span className="text-white/30 text-[9px]" style={{ fontFamily: "'Outfit', sans-serif" }}>~15.6 per person on Earth</span>
            </div>
          </div>
        </div>

        {/* ROW 2 CONTINUES */}
        
        {/* Weeks on Chart */}
        <div 
          className={`col-span-2 row-span-1 bento-card rounded-2xl p-4 transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "300ms" }}
        >
          <div className="text-3xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>3,268</div>
          <div className="text-white/40 text-[10px]" style={{ fontFamily: "'Outfit', sans-serif" }}>weeks on chart</div>
          <div className="text-amber-500/70 text-xs" style={{ fontFamily: "'Outfit', sans-serif" }}>≈ 63 years</div>
        </div>

        {/* Years Active */}
        <div 
          className={`col-span-2 row-span-1 bento-card rounded-2xl p-4 transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "350ms" }}
        >
          <div className="text-3xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>17</div>
          <div className="text-white/40 text-[10px]" style={{ fontFamily: "'Outfit', sans-serif" }}>consecutive years</div>
          <div className="text-white/30 text-[10px]" style={{ fontFamily: "'Outfit', sans-serif" }}>2009 — 2025</div>
        </div>

        {/* ROW 3 - MIDDLE */}
        
        {/* Era Breakdown */}
        <div 
          className={`col-span-3 row-span-2 bento-card rounded-2xl p-5 flex flex-col justify-between transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "400ms" }}
        >
          <div className="text-[10px] tracking-[0.2em] text-white/40 uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Era Breakdown
          </div>
          <div className="space-y-2">
            {[
              { era: "'09-11", entries: 27, ones: 1, tens: 9, color: 'bg-white/30' },
              { era: "'12-15", entries: 61, ones: 0, tens: 5, color: 'bg-white/40' },
              { era: "'16-18", entries: 90, ones: 5, tens: 19, color: 'bg-amber-500/70' },
              { era: "'19-25", entries: 147, ones: 7, tens: 48, color: 'bg-amber-500' },
            ].map((d) => (
              <div key={d.era} className="flex items-center gap-2">
                <span className="text-[10px] text-white/40 w-10" style={{ fontFamily: "'Outfit', sans-serif" }}>{d.era}</span>
                <div className="flex-1 h-4 bg-white/5 rounded-sm overflow-hidden">
                  <div className={`h-full ${d.color} rounded-sm`} style={{ width: `${(d.entries / 147) * 100}%` }} />
                </div>
                <span className="text-xs text-white/60 w-8 text-right" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{d.entries}</span>
                <span className="text-[9px] text-amber-500/60 w-12" style={{ fontFamily: "'Outfit', sans-serif" }}>{d.ones}#1 {d.tens}T10</span>
              </div>
            ))}
          </div>
        </div>

        {/* CENTER SPACER */}
        <div className="col-span-6 row-span-2" />

        {/* Yearly Bar Chart */}
        <div 
          className={`col-span-3 row-span-2 bento-card rounded-2xl p-5 flex flex-col justify-between transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "450ms" }}
        >
          <div className="text-[10px] tracking-[0.2em] text-white/40 uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Entries Per Year (2009-2025)
          </div>
          <div className="flex items-end gap-0.5 h-24">
            {yearlyEntries.map((value, i) => (
              <div 
                key={i}
                className={`flex-1 rounded-t-sm transition-all hover:opacity-100 ${value === maxYearly ? 'bg-amber-500' : 'bg-amber-500/50'}`}
                style={{ height: `${(value / maxYearly) * 100}%`, minHeight: 3 }}
                title={`${2009 + i}: ${value}`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[9px] text-white/30" style={{ fontFamily: "'Outfit', sans-serif" }}>'09</span>
            <span className="text-[9px] text-amber-500/50" style={{ fontFamily: "'Outfit', sans-serif" }}>Peak: 36 (2020)</span>
            <span className="text-[9px] text-white/30" style={{ fontFamily: "'Outfit', sans-serif" }}>'25</span>
          </div>
        </div>

        {/* ROW 5 - BOTTOM */}
        
        {/* First Entry */}
        <div 
          className={`col-span-3 row-span-2 bento-card rounded-2xl p-5 flex flex-col justify-between transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "500ms" }}
        >
          <div className="text-[10px] tracking-[0.2em] text-white/40 uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
            First Chart Entry
          </div>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                "Best I Ever Had"
              </div>
              <div className="text-white/30 text-xs" style={{ fontFamily: "'Outfit', sans-serif" }}>
                May 30, 2009 • 24 weeks
              </div>
            </div>
            <div className="text-4xl text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>#2</div>
          </div>
        </div>

        {/* Peak Distribution */}
        <div 
          className={`col-span-2 row-span-1 bento-card rounded-2xl p-4 transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "550ms" }}
        >
          <div className="text-[9px] tracking-[0.15em] text-white/40 uppercase mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Peak Distribution
          </div>
          <div className="h-5 rounded-lg overflow-hidden flex">
            {peakDistribution.map((d) => (
              <div 
                key={d.label}
                className="h-full"
                style={{ width: `${(d.value / totalPeaks) * 100}%`, backgroundColor: d.color }}
                title={`${d.label}: ${d.value}`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-1">
            {peakDistribution.map((d) => (
              <span key={d.label} className="text-[8px] text-white/30" style={{ fontFamily: "'Outfit', sans-serif" }}>{d.value}</span>
            ))}
          </div>
        </div>

        {/* CENTER SPACER */}
        <div className="col-span-2 row-span-2" />

        {/* CLB Record */}
        <div 
          className={`col-span-2 row-span-1 bento-gold rounded-2xl p-4 transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "600ms" }}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[9px] tracking-[0.15em] text-amber-500/70 uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>CLB Record</div>
              <div className="text-3xl text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>9/10</div>
            </div>
            <div className="grid grid-cols-5 gap-0.5">
              {[...Array(10)].map((_, i) => (
                <div key={i} className={`w-2 h-3 rounded-sm ${i < 9 ? 'bg-amber-500' : 'bg-white/20'}`} />
              ))}
            </div>
          </div>
        </div>

        {/* Longest + Collaborators */}
        <div 
          className={`col-span-3 row-span-2 bento-card rounded-2xl p-5 transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "650ms" }}
        >
          <div className="flex h-full gap-4">
            <div className="flex-1 flex flex-col justify-between">
              <div className="text-[10px] tracking-[0.2em] text-white/40 uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>Collaborators</div>
              <div>
                <div className="text-3xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>186</div>
                <div className="text-white/30 text-[10px]" style={{ fontFamily: "'Outfit', sans-serif" }}>unique artists</div>
              </div>
              {/* Solo vs Collab mini donut */}
              <div className="flex items-center gap-2 mt-2">
                <div className="relative w-10 h-10">
                  <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                    <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                    <circle cx="18" cy="18" r="14" fill="none" stroke="#D4AF37" strokeWidth="3"
                      strokeDasharray={`${57 * 0.88} ${100 - 57 * 0.88}`} strokeLinecap="round" />
                  </svg>
                </div>
                <div className="text-xs text-white/50" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  <span className="text-amber-500">57%</span> collabs
                </div>
              </div>
            </div>
            <div className="w-px bg-white/10" />
            <div className="flex-1 flex flex-col justify-between">
              <div className="text-[10px] tracking-[0.2em] text-white/40 uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>Longest Run</div>
              <div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>45</span>
                  <span className="text-white/40 text-xs" style={{ fontFamily: "'Outfit', sans-serif" }}>wks</span>
                </div>
                <div className="text-amber-500 text-xs" style={{ fontFamily: "'Outfit', sans-serif" }}>"No Guidance"</div>
                <div className="text-white/30 text-[9px]" style={{ fontFamily: "'Outfit', sans-serif" }}>w/ Chris Brown</div>
              </div>
            </div>
          </div>
        </div>

        {/* ROW 6 CONTINUES */}
        
        {/* Averages */}
        <div 
          className={`col-span-2 row-span-1 bento-card rounded-2xl p-4 transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "700ms" }}
        >
          <div className="text-[9px] tracking-[0.15em] text-white/40 uppercase mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Averages
          </div>
          <div className="flex justify-between">
            <div className="text-center">
              <div className="text-lg text-white/80" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>10.1</div>
              <div className="text-white/30 text-[8px]" style={{ fontFamily: "'Outfit', sans-serif" }}>wks/song</div>
            </div>
            <div className="text-center">
              <div className="text-lg text-white/80" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>#33</div>
              <div className="text-white/30 text-[8px]" style={{ fontFamily: "'Outfit', sans-serif" }}>avg peak</div>
            </div>
            <div className="text-center">
              <div className="text-lg text-white/80" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>19</div>
              <div className="text-white/30 text-[8px]" style={{ fontFamily: "'Outfit', sans-serif" }}>per year</div>
            </div>
          </div>
        </div>

        {/* Top Collaborators */}
        <div 
          className={`col-span-2 row-span-1 bento-card rounded-2xl p-4 transition-all duration-500 ${isVisible ? "opacity-100" : "opacity-0"}`}
          style={{ transitionDelay: "750ms" }}
        >
          <div className="text-[9px] tracking-[0.15em] text-white/40 uppercase mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Top Collaborators
          </div>
          <div className="flex flex-wrap gap-1">
            {[
              { name: "Lil Wayne", count: 23 },
              { name: "Future", count: 20 },
              { name: "21 Savage", count: 17 },
            ].map((c, i) => (
              <span key={c.name} className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 text-[9px]" style={{ fontFamily: "'Outfit', sans-serif" }}>
                {c.name} <span className="text-white/30">{c.count}</span>
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
        <span className="text-[9px] tracking-[0.3em] text-white/20 uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
          Billboard Hot 100 • 2009–2025
        </span>
      </div>
    </div>
  )
}