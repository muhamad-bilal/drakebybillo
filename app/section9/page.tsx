"use client"

import { useState, useEffect, useRef } from "react"

export default function Section9Page() {
  const [isVisible, setIsVisible] = useState(false)
  const [countedStreams, setCountedStreams] = useState(0)
  const [countedStreams2025, setCountedStreams2025] = useState(0)
  const countStarted = useRef(false)

  // Hardcoded Spotify data
  const totalStreams = 124908087756 // 124.9 billion
  const streams2025 = 17600000000 // 17.6 billion

  // Calculated stats
  const worldPopulation = 8000000000
  const streamsPerPerson = totalStreams / worldPopulation
  const yearsActive = 17 // 2008-2025
  const avgPerYear = totalStreams / yearsActive
  const streamsPerMinute = Math.round(totalStreams / (yearsActive * 365 * 24 * 60))
  const streamsPerSecond = Math.round(streamsPerMinute / 60)
  
  // 2025 projection (mid-December = ~350 days)
  const daysIn2025SoFar = 350
  const projectedFullYear2025 = (streams2025 / daysIn2025SoFar) * 365

  // Animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  // Counter animation
  useEffect(() => {
    if (!isVisible || countStarted.current) return
    countStarted.current = true

    const duration = 3000 // 3 seconds
    const steps = 60
    const stepTime = duration / steps

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      // Ease out cubic for smooth deceleration
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      
      setCountedStreams(Math.round(totalStreams * easedProgress))
      setCountedStreams2025(Math.round(streams2025 * easedProgress))

      if (currentStep >= steps) {
        clearInterval(interval)
        setCountedStreams(totalStreams)
        setCountedStreams2025(streams2025)
      }
    }, stepTime)

    return () => clearInterval(interval)
  }, [isVisible])

  // Format large numbers
  const formatNumber = (num: number): string => {
    return num.toLocaleString()
  }

  const formatBillions = (num: number): string => {
    return (num / 1000000000).toFixed(1) + "B"
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap');
      `}</style>

      <style jsx>{`
        .font-display { font-family: 'Bebas Neue', sans-serif; }
        .font-body { font-family: 'Outfit', sans-serif; }
        
        @keyframes pulse-glow {
          0%, 100% { 
            box-shadow: 0 0 20px rgba(212, 175, 55, 0.3),
                        0 0 40px rgba(212, 175, 55, 0.2),
                        0 0 60px rgba(212, 175, 55, 0.1);
          }
          50% { 
            box-shadow: 0 0 30px rgba(212, 175, 55, 0.5),
                        0 0 60px rgba(212, 175, 55, 0.3),
                        0 0 90px rgba(212, 175, 55, 0.2);
          }
        }
        
        @keyframes number-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(212, 175, 55, 0.5); }
          50% { text-shadow: 0 0 40px rgba(212, 175, 55, 0.8), 0 0 60px rgba(212, 175, 55, 0.4); }
        }
        
        .stream-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }
        
        .number-glow {
          animation: number-glow 2s ease-in-out infinite;
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-amber-500/3 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        
        {/* Header */}
        <div className={`mb-12 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span 
            className="text-xs tracking-[0.4em] text-amber-500/70 uppercase"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Section 09 — Streaming Dominance
          </span>
          
          <h1 
            className="text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight mt-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            <span className="text-white/90">EVERY</span>
            <br />
            <span className="text-amber-500">STREAM</span>
          </h1>
          
          <p 
            className="text-lg text-white/50 mt-6 max-w-xl leading-relaxed"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Beyond the charts. Beyond the records. This is the sound of 
            an entire generation pressing play.
          </p>
        </div>

        {/* Main counter */}
        <div className={`mb-16 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="stream-glow p-8 md:p-12 rounded-3xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30">
            <div className="text-center">
              <div 
                className="text-xs tracking-[0.3em] text-amber-500/70 uppercase mb-4"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Total Spotify Streams
              </div>
              
              <div 
                className="text-5xl md:text-7xl lg:text-8xl text-amber-500 number-glow mb-4"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                {formatNumber(countedStreams)}
              </div>
              
              <div 
                className="text-xl md:text-2xl text-white/60"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                One hundred twenty-four billion streams
              </div>
            </div>
          </div>
        </div>

        {/* 2025 Stats */}
        <div className={`mb-16 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span 
              className="text-xs tracking-[0.3em] text-amber-500/70 uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              2025 So Far
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
              <div 
                className="text-4xl md:text-5xl text-amber-500 mb-2"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                {formatBillions(countedStreams2025)}
              </div>
              <div 
                className="text-sm text-white/50"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Streams in 2025 (through mid-December)
              </div>
              
              {/* Progress bar */}
              <div className="mt-4">
                <div className="flex justify-between text-xs text-white/40 mb-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  <span>Year Progress</span>
                  <span>~96%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-amber-500 rounded-full transition-all duration-1000"
                    style={{ width: isVisible ? "96%" : "0%" }}
                  />
                </div>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10">
              <div 
                className="text-4xl md:text-5xl text-white/90 mb-2"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                ~{formatBillions(projectedFullYear2025)}
              </div>
              <div 
                className="text-sm text-white/50"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Projected full year 2025
              </div>
              
              {/* Comparison to average */}
              <div className="mt-4 flex items-center gap-2">
                <div className="px-2 py-1 rounded bg-amber-500/20 text-amber-500 text-xs" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  +{Math.round(((projectedFullYear2025 / avgPerYear) - 1) * 100)}% vs avg
                </div>
                <span className="text-xs text-white/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Above {yearsActive}-year average
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Context stats */}
        <div className={`mb-16 transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span 
              className="text-xs tracking-[0.3em] text-amber-500/70 uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Putting It In Perspective
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/20 text-center">
              <div 
                className="text-4xl text-amber-500 mb-2"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                ~{streamsPerPerson.toFixed(1)}
              </div>
              <div 
                className="text-sm text-white/50"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Streams per person on Earth
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center">
              <div 
                className="text-4xl text-white/90 mb-2"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                {formatNumber(streamsPerMinute)}
              </div>
              <div 
                className="text-sm text-white/50"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Average streams per minute (lifetime)
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center">
              <div 
                className="text-4xl text-white/90 mb-2"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                {formatNumber(streamsPerSecond)}
              </div>
              <div 
                className="text-sm text-white/50"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Streams every second
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/10 text-center">
              <div 
                className="text-4xl text-white/90 mb-2"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                {formatBillions(avgPerYear)}
              </div>
              <div 
                className="text-sm text-white/50"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Average per year
              </div>
            </div>
          </div>
        </div>

        {/* Visual comparison */}
        <div className={`mb-16 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span 
              className="text-xs tracking-[0.3em] text-amber-500/70 uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              The Scale
            </span>
          </div>

          <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
            <div className="space-y-6">
              {/* Visual bar representation */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-white/70" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    124.9 Billion Streams
                  </span>
                  <span className="text-xs text-white/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    If each stream was 1 second...
                  </span>
                </div>
                <div className="h-12 bg-amber-500/20 rounded-lg overflow-hidden relative">
                  <div 
                    className="h-full bg-gradient-to-r from-amber-500 to-amber-500/70 rounded-lg transition-all duration-1000"
                    style={{ width: isVisible ? "100%" : "0%" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span 
                      className="text-black font-bold text-lg"
                      style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    >
                      3,960 YEARS OF MUSIC
                    </span>
                  </div>
                </div>
              </div>

              {/* Breakdown */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/10">
                <div className="text-center">
                  <div className="text-2xl text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                    3,960
                  </div>
                  <div className="text-xs text-white/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Years
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl text-white/70" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                    47,520
                  </div>
                  <div className="text-xs text-white/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Months
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl text-white/70" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                    1.4M
                  </div>
                  <div className="text-xs text-white/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Days
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl text-white/70" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                    34.7M
                  </div>
                  <div className="text-xs text-white/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                    Hours
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Closing statement */}
        <div className={`mb-12 transition-all duration-700 delay-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="p-8 rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 text-center">
            <div 
              className="text-3xl md:text-4xl text-white mb-4"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              "They're not just listening.
              <br />
              <span className="text-amber-500">They're living with it."</span>
            </div>
            <p 
              className="text-white/50 max-w-2xl mx-auto"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              125 billion streams isn't a number — it's a generation's soundtrack. 
              Morning commutes, late night drives, heartbreaks, celebrations. 
              Drake isn't just played. He's present.
            </p>
          </div>
        </div>

        {/* Bottom nav */}
        <div className={`mt-20 flex items-center gap-6 transition-all duration-700 delay-700 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-500/30 to-transparent" />
          <span 
            className="text-xs tracking-[0.3em] text-white/30 uppercase"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            The Numbers Never Lie
          </span>
          <svg className="w-4 h-4 text-white/30 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  )
}