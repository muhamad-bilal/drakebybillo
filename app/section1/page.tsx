"use client"

import { useState, useEffect } from "react"
import { CustomCursor } from "@/components/custom-cursor"

interface HookData {
  total_entries?: number
  number_one_hits?: number
  top_ten_hits?: number
  total_weeks_on_chart?: number
  first_chart_entry?: {
    date?: string
    title?: string
    peak?: number
  }
  longest_running_song?: {
    title?: string
    weeks?: number
  }
  number_one_songs?: Array<{
    title: string
    artist: string
  }>
  average_weeks_per_song?: number
  average_peak_position?: number
}

interface DataStructure {
  section_1_hook?: HookData
}

export default function Section1Page() {
  const [data, setData] = useState<DataStructure | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [counters, setCounters] = useState({
    entries: 0,
    numberOnes: 0,
    topTens: 0,
    totalWeeks: 0,
  })

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

  // Extract data from section_1_hook - MUST be before early return
  const hookData = data?.section_1_hook || {}
  
  const finalStats = {
    entries: hookData.total_entries || 0,
    numberOnes: hookData.number_one_hits || 0,
    topTens: hookData.top_ten_hits || 0,
    totalWeeks: hookData.total_weeks_on_chart || 0
  }

  const firstEntry = hookData.first_chart_entry || {}
  const longestSong = hookData.longest_running_song || {}
  const numberOneSongs = hookData.number_one_songs || []
  const avgWeeks = hookData.average_weeks_per_song || 0
  const avgPeak = hookData.average_peak_position || 0

  // Animation useEffect - MUST be before early return
  useEffect(() => {
    if (!data) return // Don't animate if data isn't loaded yet
    
    setIsVisible(true)
    
    // Animate counters
    const duration = 2000
    const steps = 60
    const interval = duration / steps
    
    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps
      const easeOut = 1 - Math.pow(1 - progress, 3)
      
      setCounters({
        entries: Math.floor(finalStats.entries * easeOut),
        numberOnes: Math.floor(finalStats.numberOnes * easeOut),
        topTens: Math.floor(finalStats.topTens * easeOut),
        totalWeeks: Math.floor(finalStats.totalWeeks * easeOut)
      })
      
      if (step >= steps) clearInterval(timer)
    }, interval)
    
    return () => clearInterval(timer)
  }, [data, finalStats.entries, finalStats.numberOnes, finalStats.topTens, finalStats.totalWeeks])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <CustomCursor />
        <p className="text-white">Loading data...</p>
      </div>
    )
  }

  // Format date nicely
  const formatDate = (dateStr: string | undefined): string => {
    if (!dateStr) return ""
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Custom font imports */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap');
      `}</style>
      
      <style jsx>{`
        .font-display { font-family: 'Bebas Neue', sans-serif; }
        .font-body { font-family: 'Outfit', sans-serif; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(1deg); }
        }
        
        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 40px rgba(212, 175, 55, 0.3); }
          50% { box-shadow: 0 0 80px rgba(212, 175, 55, 0.6); }
        }
        
        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        
        @keyframes grain {
          0%, 100% { transform: translate(0, 0); }
          10% { transform: translate(-5%, -10%); }
          30% { transform: translate(3%, -15%); }
          50% { transform: translate(-10%, 5%); }
          70% { transform: translate(10%, 10%); }
          90% { transform: translate(-5%, 15%); }
        }
        
        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
        .animate-scan { animation: scan-line 8s linear infinite; }
        .animate-grain { animation: grain 0.5s steps(10) infinite; }
        
        .stat-card {
          background: linear-gradient(135deg, rgba(30, 30, 30, 0.9) 0%, rgba(15, 15, 15, 0.95) 100%);
          border: 1px solid rgba(212, 175, 55, 0.2);
        }
        
        .gold-gradient {
          background: linear-gradient(135deg, #D4AF37 0%, #FFD700 50%, #D4AF37 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
      `}</style>
      
      {/* Grain overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.03] animate-grain z-50"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat'
        }}
      />
      
      {/* Scan line effect */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-40">
        <div className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent animate-scan" />
      </div>
      
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Large entry count watermark */}
        <div 
          className={`absolute -right-20 top-1/2 -translate-y-1/2 font-display text-[40rem] leading-none text-white/[0.02] select-none transition-all duration-1000 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          {finalStats.entries}
        </div>
        
        {/* Geometric accents */}
        <div className="absolute top-20 left-10 w-40 h-40 border border-amber-500/10 rotate-45 animate-float" />
        <div className="absolute bottom-40 right-20 w-60 h-60 border border-amber-500/5 rotate-12" />
        <div className="absolute top-1/3 left-1/4 w-2 h-2 bg-amber-500/30 rounded-full" />
        <div className="absolute bottom-1/4 right-1/3 w-1 h-1 bg-amber-400/40 rounded-full" />
      </div>
      
      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16 min-h-screen flex flex-col justify-center">
        
        {/* Section label */}
        <div className={`mb-8 transition-all duration-700 delay-100 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <span className="text-xs tracking-[0.4em] text-amber-500/70 uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Section 01 — The Hook
          </span>
        </div>
        
        {/* Main headline */}
        <div className={`mb-12 transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <h1 className="text-6xl md:text-8xl lg:text-9xl leading-[0.85] tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
            <span className="text-white/90">STARTED FROM</span>
            <br />
            <span className="gold-gradient">THE BOTTOM</span>
          </h1>
          <p className="text-lg md:text-xl text-white/50 mt-6 max-w-xl leading-relaxed" style={{ fontFamily: "'Outfit', sans-serif" }}>
            From his first chart entry in 2009 to becoming the most decorated artist 
            in Hot 100 history — this is the story told through data.
          </p>
        </div>
        
        {/* First entry highlight */}
        <div className={`mb-16 transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center gap-4 mb-4">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span className="text-xs tracking-[0.3em] text-amber-500/70 uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>First Chart Entry</span>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
            <span className="text-4xl md:text-5xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {formatDate(firstEntry.date)}
            </span>
            {/* <span className="text-lg text-white/40" style={{ fontFamily: "'Outfit', sans-serif" }}>•</span> */}
            {/* <span className="text-xl text-white/60" style={{ fontFamily: "'Outfit', sans-serif" }}>"{firstEntry.title}"</span> */}
            {/* <span className="text-lg text-white/40" style={{ fontFamily: "'Outfit', sans-serif" }}>•</span> */}
            {/* <span className="text-xl text-amber-500/80" style={{ fontFamily: "'Outfit', sans-serif" }}>Peak: #{firstEntry.peak}</span> */}
          </div>
        </div>
        
        {/* Stats grid */}
        <div className={`grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {/* Total entries */}
          <div className="stat-card rounded-2xl p-6 md:p-8 animate-pulse-glow">
            <div className="text-5xl md:text-7xl gold-gradient mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {counters.entries}
            </div>
            <div className="text-sm md:text-base text-white/50 uppercase tracking-wider" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Hot 100 Entries
            </div>
            <div className="mt-3 text-xs text-amber-500/60" style={{ fontFamily: "'Outfit', sans-serif" }}>
              All-time record holder
            </div>
          </div>
          
          {/* Number ones */}
          <div className="stat-card rounded-2xl p-6 md:p-8">
            <div className="text-5xl md:text-7xl text-white/90 mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {counters.numberOnes}
            </div>
            <div className="text-sm md:text-base text-white/50 uppercase tracking-wider" style={{ fontFamily: "'Outfit', sans-serif" }}>
              #1 Hits
            </div>
            <div className="mt-3 text-xs text-white/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Tied with Michael Jackson
            </div>
          </div>
          
          {/* Top 10s */}
          <div className="stat-card rounded-2xl p-6 md:p-8">
            <div className="text-5xl md:text-7xl text-white/90 mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {counters.topTens}
            </div>
            <div className="text-sm md:text-base text-white/50 uppercase tracking-wider" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Top 10 Hits
            </div>
            <div className="mt-3 text-xs text-amber-500/60" style={{ fontFamily: "'Outfit', sans-serif" }}>
              All-time record
            </div>
          </div>
          
          {/* Total weeks */}
          <div className="stat-card rounded-2xl p-6 md:p-8">
            <div className="text-5xl md:text-7xl text-white/90 mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {counters.totalWeeks.toLocaleString()}
            </div>
            <div className="text-sm md:text-base text-white/50 uppercase tracking-wider" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Total Weeks
            </div>
            <div className="mt-3 text-xs text-white/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
              ~{Math.round(finalStats.totalWeeks / 52)} years of chart presence
            </div>
          </div>
        </div>

        {/* Additional stats row */}
        <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-3xl text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{avgWeeks}</div>
            <div className="text-sm text-white/50" style={{ fontFamily: "'Outfit', sans-serif" }}>Avg. weeks per song</div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-3xl text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>#{Math.round(avgPeak)}</div>
            <div className="text-sm text-white/50" style={{ fontFamily: "'Outfit', sans-serif" }}>Avg. peak position</div>
          </div>
          <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5">
            <div className="text-3xl text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{longestSong.weeks}</div>
            <div className="text-sm text-white/50" style={{ fontFamily: "'Outfit', sans-serif" }}>Longest run: "{longestSong.title}"</div>
          </div>
        </div>
        
        {/* Number one songs list */}
        <div className={`transition-all duration-700 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span className="text-xs tracking-[0.3em] text-amber-500/70 uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
              All {numberOneSongs.length} #1 Hits
            </span>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {numberOneSongs.map((song: { title: string; artist: string }, index: number) => (
              <div 
                key={index}
                className="flex items-center gap-3 group p-3 rounded-lg hover:bg-white/[0.02] transition-colors"
                style={{ 
                  opacity: isVisible ? 1 : 0,
                  transform: isVisible ? 'translateX(0)' : 'translateX(-20px)',
                  transition: `all 0.5s ease ${0.7 + index * 0.05}s`
                }}
              >
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center text-amber-500 text-sm font-bold" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-white/80 truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {song.title}
                  </div>
                  <div className="text-xs text-white/40 truncate" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    {song.artist}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Bottom accent */}
        <div className={`mt-20 flex items-center gap-6 transition-all duration-700 delay-[800ms] ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-500/30 to-transparent" />
          <span className="text-xs tracking-[0.3em] text-white/30 uppercase" style={{ fontFamily: "'Outfit', sans-serif" }}>
            Continue scrolling
          </span>
          <svg className="w-4 h-4 text-white/30 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  )
}
