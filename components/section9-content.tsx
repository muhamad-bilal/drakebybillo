"use client"

import { useState, useEffect, useRef } from "react"

interface Section9ContentProps {
  isActive?: boolean
}

export function Section9Content({ isActive = false }: Section9ContentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [countedStreams, setCountedStreams] = useState(0)
  const [hoveredStat, setHoveredStat] = useState<string | null>(null)
  const countStarted = useRef(false)

  // Hardcoded Spotify data
  const totalStreams = 124908087756 // 124.9 billion
  const streams2025 = 17600000000 // 17.6 billion

  // Calculated stats
  const worldPopulation = 8000000000
  const streamsPerPerson = totalStreams / worldPopulation
  const yearsActive = 17
  const avgPerYear = totalStreams / yearsActive
  const streamsPerMinute = Math.round(totalStreams / (yearsActive * 365 * 24 * 60))
  const streamsPerSecond = Math.round(streamsPerMinute / 60)
  const daysIn2025SoFar = 350
  const projectedFullYear2025 = (streams2025 / daysIn2025SoFar) * 365

  // Trigger animation
  useEffect(() => {
    if (!isActive) return
    setIsVisible(true)
  }, [isActive])

  // Counter animation
  useEffect(() => {
    if (!isVisible || countStarted.current) return
    countStarted.current = true

    const duration = 2500
    const steps = 50
    const stepTime = duration / steps

    let currentStep = 0
    const interval = setInterval(() => {
      currentStep++
      const progress = currentStep / steps
      const easedProgress = 1 - Math.pow(1 - progress, 3)
      setCountedStreams(Math.round(totalStreams * easedProgress))

      if (currentStep >= steps) {
        clearInterval(interval)
        setCountedStreams(totalStreams)
      }
    }, stepTime)

    return () => clearInterval(interval)
  }, [isVisible])

  // Reset counter when section becomes inactive
  useEffect(() => {
    if (!isActive) {
      countStarted.current = false
      setCountedStreams(0)
    }
  }, [isActive])

  const formatNumber = (num: number): string => num.toLocaleString()
  const formatBillions = (num: number): string => (num / 1000000000).toFixed(1) + "B"

  const contextStats = [
    { id: "person", value: `~${streamsPerPerson.toFixed(1)}`, label: "Streams per person on Earth", detail: "If every human played Drake equally" },
    { id: "minute", value: formatNumber(streamsPerMinute), label: "Streams per minute (lifetime avg)", detail: "Every single minute since 2008" },
    { id: "second", value: formatNumber(streamsPerSecond), label: "Streams every second", detail: "Right now, someone is pressing play" },
    { id: "year", value: formatBillions(avgPerYear), label: "Average per year", detail: `Over ${yearsActive} years of streaming` },
  ]

  return (
    <section className="relative flex h-screen w-screen shrink-0 overflow-hidden">
      {/* Custom styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap');
      `}</style>

      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% {
            box-shadow: 0 0 20px rgba(245, 158, 11, 0.3),
                        0 0 40px rgba(245, 158, 11, 0.2);
          }
          50% {
            box-shadow: 0 0 30px rgba(245, 158, 11, 0.5),
                        0 0 60px rgba(245, 158, 11, 0.3);
          }
        }

        @keyframes number-glow {
          0%, 100% { text-shadow: 0 0 20px rgba(245, 158, 11, 0.5); }
          50% { text-shadow: 0 0 40px rgba(245, 158, 11, 0.8); }
        }

        .stream-glow {
          animation: pulse-glow 3s ease-in-out infinite;
        }

        .number-glow {
          animation: number-glow 2s ease-in-out infinite;
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
        <div
          className="absolute top-16 right-8 text-[6rem] leading-none text-foreground/[0.02] select-none"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          STREAMS
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-6 py-8 w-full">

          {/* Header Row */}
          <div className={`flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-5 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            {/* Title */}
            <div>
              <h1
                className="text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-tight"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                <span className="text-foreground/90">EVERY</span>{" "}
                <span className="text-amber-500">STREAM</span>
              </h1>
              <p
                className="text-sm text-foreground/50 mt-2 max-w-md leading-relaxed"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Beyond charts. Beyond records. A generation pressing play.
              </p>
            </div>

            {/* 2025 stats */}
            <div className="flex gap-2">
              <div className="px-3 py-2 rounded-lg bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/20">
                <div className="text-[1.375rem] text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{formatBillions(streams2025)}</div>
                <div className="text-[9px] text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif" }}>2025 So Far</div>
              </div>
              <div className="px-3 py-2 rounded-lg bg-foreground/[0.02] border border-foreground/5">
                <div className="text-[1.375rem] text-foreground/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>~{formatBillions(projectedFullYear2025)}</div>
                <div className="text-[9px] text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif" }}>Projected 2025</div>
              </div>
              <div className="px-3 py-2 rounded-lg bg-foreground/[0.02] border border-foreground/5">
                <div className="text-[1.375rem] text-foreground/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>{yearsActive}</div>
                <div className="text-[9px] text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif" }}>Years Active</div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <div className="p-5 rounded-2xl bg-foreground/[0.02] border border-foreground/5">
              <div className="flex flex-col lg:flex-row gap-5">

                {/* Main Counter + Scale */}
                <div className="flex-1">
                  {/* Big Counter */}
                  <div className="stream-glow p-6 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 mb-4">
                    <div className="text-center">
                      <div
                        className="text-xs tracking-[0.2em] text-amber-500/70 uppercase mb-2"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        Total Spotify Streams
                      </div>
                      <div
                        className="text-[2.5rem] md:text-[3.25rem] lg:text-[4rem] text-amber-500 number-glow"
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                      >
                        {formatNumber(countedStreams)}
                      </div>
                      <div
                        className="text-sm text-foreground/50 mt-1"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        One hundred twenty-four billion streams
                      </div>
                    </div>
                  </div>

                  {/* Scale visualization */}
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-[1px] w-6 bg-amber-500/50" />
                    <span
                      className="text-[10px] tracking-[0.2em] text-amber-500/70 uppercase"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      The Scale
                    </span>
                  </div>

                  <div className="bg-black/20 rounded-xl p-4">
                    <div className="text-xs text-foreground/40 mb-2" style={{ fontFamily: "'Outfit', sans-serif" }}>
                      If each stream was 1 second of music...
                    </div>
                    <div className="h-10 bg-amber-500/20 rounded-lg overflow-hidden relative mb-3">
                      <div
                        className="h-full bg-gradient-to-r from-amber-500 to-amber-500/70 rounded-lg transition-all duration-1000"
                        style={{ width: isVisible ? "100%" : "0%" }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span
                          className="text-black font-bold text-sm"
                          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                        >
                          3,960 YEARS OF MUSIC
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        { value: "3,960", label: "Years" },
                        { value: "47,520", label: "Months" },
                        { value: "1.4M", label: "Days" },
                        { value: "34.7M", label: "Hours" },
                      ].map((item) => (
                        <div key={item.label} className="p-2 rounded-lg bg-black/20">
                          <div className="text-[1.25rem] text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                            {item.value}
                          </div>
                          <div className="text-[9px] text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                            {item.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Context Stats Panel */}
                <div className="lg:w-72">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="h-[1px] w-6 bg-amber-500/50" />
                    <span
                      className="text-[10px] tracking-[0.2em] text-amber-500/70 uppercase"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {hoveredStat ? "In Perspective" : "Context Stats"}
                    </span>
                  </div>

                  <div className={`h-[300px] rounded-xl border transition-all duration-300 overflow-hidden ${
                    hoveredStat
                      ? "bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30"
                      : "bg-foreground/[0.02] border-foreground/10"
                  }`}>
                    <div className="p-3 h-full flex flex-col">
                      <div className="space-y-2 flex-1">
                        {contextStats.map((stat, i) => (
                          <div
                            key={stat.id}
                            className={`p-3 rounded-lg cursor-pointer transition-all duration-300 ${
                              hoveredStat === stat.id
                                ? "bg-amber-500/20 border-amber-500/50"
                                : "bg-black/20 border-transparent"
                            } border`}
                            onMouseEnter={() => setHoveredStat(stat.id)}
                            onMouseLeave={() => setHoveredStat(null)}
                          >
                            <div className="flex items-center justify-between">
                              <div
                                className={`text-[1.625rem] ${hoveredStat === stat.id ? "text-amber-500" : i === 0 ? "text-amber-500" : "text-foreground/70"}`}
                                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                              >
                                {stat.value}
                              </div>
                            </div>
                            <div
                              className="text-[10px] text-foreground/50"
                              style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                              {stat.label}
                            </div>
                            {hoveredStat === stat.id && (
                              <div
                                className="text-[9px] text-amber-500/70 mt-1"
                                style={{ fontFamily: "'Outfit', sans-serif" }}
                              >
                                {stat.detail}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 text-center text-[9px] text-foreground/30" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        Hover for context
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom accent */}
          <div className={`mt-5 flex items-center gap-6 transition-all duration-700 delay-300 ${isVisible ? "opacity-100" : "opacity-0"}`}>
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
