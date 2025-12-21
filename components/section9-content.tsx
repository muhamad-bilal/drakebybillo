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

  // Reset counter when section becomes inactive
  useEffect(() => {
    if (!isActive) {
      countStarted.current = false
      setCountedStreams(0)
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
          <div className={`text-center mb-4 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
            <h1
              className="text-4xl md:text-5xl lg:text-6xl leading-[0.9] tracking-tight"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              <span className="text-foreground/90">EVERY</span>{" "}
              <span className="text-amber-500">STREAM</span>
            </h1>
            <p
              className="text-base md:text-lg text-foreground/50 mt-3 max-w-xl mx-auto"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Beyond the charts. Beyond the records. This is the sound of an entire generation pressing play.
            </p>
          </div>

          {/* Main Layout - Two columns */}
          <div className={`flex flex-col lg:flex-row gap-5 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

            {/* Left Column - Counter + Scale */}
            <div className="flex-1">
              {/* Big Counter */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-500/5 border border-amber-500/30 mb-4">
                <div className="text-center">
                  <div
                    className="text-[10px] tracking-[0.3em] text-amber-500/70 uppercase mb-1"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    Total Spotify Streams
                  </div>
                  <div
                    className="text-[2.5rem] md:text-[3rem] lg:text-[3.5rem] text-amber-500 leading-none"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {formatNumber(countedStreams)}
                  </div>
                </div>
              </div>

              {/* Scale Visualization */}
              <div className="p-4 rounded-xl bg-foreground/[0.02] border border-foreground/5">
                <div className="text-sm text-center text-foreground/50 mb-3" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  If each stream was 1 second of music...
                </div>

                {/* Years bar */}
                <div className="relative h-10 bg-black/20 rounded-lg overflow-hidden mb-3">
                  <div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-500 to-amber-400 rounded-lg transition-all duration-1500 ease-out"
                    style={{ width: isVisible ? "100%" : "0%" }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span
                      className="text-lg text-black font-bold"
                      style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    >
                      3,966 YEARS OF MUSIC
                    </span>
                  </div>
                </div>

                {/* Time breakdown */}
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { value: "3,966", label: "Years" },
                    { value: "47,592", label: "Months" },
                    { value: "1.4M", label: "Days" },
                    { value: "34.7M", label: "Hours" },
                  ].map((item, i) => (
                    <div
                      key={item.label}
                      className="p-2 rounded-lg bg-black/20 text-center"
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transition: `opacity 0.5s ease ${0.5 + i * 0.1}s`,
                      }}
                    >
                      <div className="text-xl text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                        {item.value}
                      </div>
                      <div className="text-xs text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif" }}>
                        {item.label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-3 text-center text-sm text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Longer than the Roman Empire lasted
                </div>
              </div>
            </div>

            {/* Right Column - Emotional Quote */}
            <div className="lg:w-[420px]">
              <div className="h-full p-6 rounded-xl bg-gradient-to-b from-amber-500/10 to-transparent border border-amber-500/20 flex flex-col justify-center">
                <h3
                  className="text-2xl md:text-3xl text-foreground mb-3 leading-tight"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  They're not just listening.
                  <br />
                  <span className="text-amber-500">They're living with it.</span>
                </h3>
                <p
                  className="text-sm text-foreground/60 leading-relaxed"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
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
