"use client"

import { useState, useEffect, useRef } from "react"

interface Section9ContentProps {
  isActive?: boolean
}

export function Section9Content({ isActive = false }: Section9ContentProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [countedStreams, setCountedStreams] = useState(0)
  const countStarted = useRef(false)

  // Hardcoded Spotify data
  const totalStreams = 125080905707 // 125.08 billion

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

  // Reset counter flag when section becomes inactive (but keep the displayed value)
  useEffect(() => {
    if (!isActive) {
      countStarted.current = false
    }
  }, [isActive])

  const formatNumber = (num: number): string => num.toLocaleString()

  return (
    <section className="relative flex h-screen w-screen shrink-0 overflow-hidden">
      {/* Custom styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap');
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 w-full h-full flex flex-col justify-center">
        <div className="max-w-7xl mx-auto px-6 w-full">

          {/* Title - Centered */}
          <div className={`text-center transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ marginBottom: 'var(--section-gap)' }}>
            <h1
              className="leading-[0.9] tracking-tight"
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-title)' }}
            >
              <span className="text-foreground/90">EVERY</span>{" "}
              <span className="text-amber-500">STREAM</span>
            </h1>
            <p
              className="text-foreground/50 max-w-xl mx-auto"
              style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-body)', marginTop: 'var(--section-gap)' }}
            >
              Beyond the charts. Beyond the records. This is the sound of an entire generation pressing play.
            </p>
          </div>

          {/* Main Layout - Two columns */}
          <div className={`flex flex-col lg:flex-row transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`} style={{ gap: 'var(--section-gap)' }}>

            {/* Left Column - Counter + Scale */}
            <div className="flex-1">
              {/* Big Counter */}
              <div className="rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-500/5 border border-amber-500/30" style={{ padding: 'var(--card-padding)', marginBottom: 'var(--section-gap)' }}>
                <div className="text-center">
                  <div
                    className="tracking-[0.3em] text-amber-500/70 uppercase"
                    style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)', marginBottom: 'var(--section-gap)' }}
                  >
                    Total Spotify Streams
                  </div>
                  <div
                    className="text-amber-500 leading-none"
                    style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-large)' }}
                  >
                    {formatNumber(countedStreams)}
                  </div>
                </div>
              </div>

              {/* Scale Visualization */}
              <div className="rounded-xl bg-foreground/[0.02] border border-foreground/5" style={{ padding: 'var(--card-padding)' }}>
                <div className="text-center text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)', marginBottom: 'var(--section-gap)' }}>
                  If each stream was 1 second of music...
                </div>

                {/* Years bar */}
                <div className="relative bg-black/20 rounded-lg overflow-hidden" style={{ height: 'var(--chart-height-sm)', marginBottom: 'var(--section-gap)' }}>
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-amber-400 rounded-lg transition-all duration-1500 ease-out"
                    style={{ width: isVisible ? "100%" : "0%" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-black font-bold"
                      style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-body)' }}
                    >
                      3,966 YEARS OF MUSIC
                    </span>
                  </div>
                </div>

                {/* Time breakdown */}
                <div className="grid grid-cols-4" style={{ gap: 'var(--section-gap)' }}>
                  {[
                    { value: "3,966", label: "Years" },
                    { value: "47,592", label: "Months" },
                    { value: "1.4M", label: "Days" },
                    { value: "34.7M", label: "Hours" },
                  ].map((item, i) => (
                    <div
                      key={item.label}
                      className="rounded-lg bg-black/20 text-center"
                      style={{
                        padding: 'var(--card-padding)',
                        opacity: isVisible ? 1 : 0,
                        transition: `opacity 0.5s ease ${0.5 + i * 0.1}s`,
                      }}
                    >
                      <div className="text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}>
                        {item.value}
                      </div>
                      <div className="text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="text-center text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)', marginTop: 'var(--section-gap)' }}>
                  Longer than the Roman Empire lasted
                </div>
              </div>
            </div>

            {/* Right Column - Emotional Quote */}
            <div className="lg:w-[420px]">
              <div className="h-full rounded-xl bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20 flex flex-col justify-center" style={{ padding: 'var(--card-padding-lg)' }}>
                <h3
                  className="text-foreground leading-tight"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-title)', marginBottom: 'var(--section-gap)' }}
                >
                  They're not just listening.
                  <br />
                  <span className="text-amber-500">They're living with it.</span>
                </h3>
                <p
                  className="text-foreground/60 leading-relaxed"
                  style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}
                >
                  125 billion streams isn't just number — it's a generation's soundtrack.
                  Morning commutes, late night drives, heartbreaks, celebrations.
                  <span className="text-foreground/80"> Drake isn't just played. He's present.</span>
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
