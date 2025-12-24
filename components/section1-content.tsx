"use client"

import { useState, useEffect } from "react"

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

interface Section1ContentProps {
  isActive?: boolean
}

export function Section1Content({ isActive = false }: Section1ContentProps) {
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

  // Extract data from section_1_hook
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

  // Trigger animation when section becomes active
  useEffect(() => {
    if (!data || !isActive) return

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
  }, [data, isActive, finalStats.entries, finalStats.numberOnes, finalStats.topTens, finalStats.totalWeeks])

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

      <style jsx>{`
        .font-display { font-family: 'Bebas Neue', sans-serif; }
        .font-body { font-family: 'Outfit', sans-serif; }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(1deg); }
        }

        @keyframes pulse-glow {
          0%, 100% { box-shadow: 0 0 40px rgba(245, 158, 11, 0.3); }
          50% { box-shadow: 0 0 80px rgba(245, 158, 11, 0.6); }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }
        .animate-pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }
      `}</style>


      {/* Main content - responsive scaling */}
      <div className="relative z-10 w-full h-full flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full" style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}>

          {/* Main headline */}
          <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ marginBottom: 'var(--section-gap)' }}>
            <h1 className="leading-[0.9] tracking-tight" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-hero)' }}>
              <span className="text-foreground/90">STARTED FROM</span>
              <br />
              <span className="text-amber-500">THE BOTTOM</span>
            </h1>
            <p className="text-foreground/50 max-w-xl leading-relaxed" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-body)', marginTop: 'var(--section-gap)' }}>
              From his first chart entry in 2009 to becoming the most decorated artist
              in Hot 100 history — this is the story told through data.
            </p>
          </div>

          {/* First entry highlight */}
          <div className={`transition-all duration-700 delay-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ marginBottom: 'var(--section-gap)' }}>
            <div className="flex items-center gap-4 mb-2">
              <div className="h-[1px] w-12 bg-amber-500/50" />
              <span className="tracking-[0.3em] text-amber-500/70 uppercase" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>First Chart Entry</span>
            </div>
            <div className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
              <span className="text-foreground/90" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-subtitle)' }}>
                {formatDate(firstEntry.date)}
              </span>
            </div>
          </div>

          {/* Stats grid */}
          <div className={`grid grid-cols-2 lg:grid-cols-4 transition-all duration-700 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ gap: 'var(--section-gap)', marginBottom: 'var(--section-gap)' }}>
            {/* Total entries - highlighted as primary stat */}
            <div className="rounded-2xl bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/20" style={{ padding: 'var(--card-padding)' }}>
              <div className="text-amber-500 mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-large)' }}>
                {counters.entries}
              </div>
              <div className="text-foreground/50 uppercase tracking-wider" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                Hot 100 Entries
              </div>
              <div className="mt-1 text-amber-500/60" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                All-time record holder
              </div>
            </div>

            {/* Number ones */}
            <div className="rounded-2xl bg-foreground/[0.02] border border-foreground/5" style={{ padding: 'var(--card-padding)' }}>
              <div className="text-foreground/90 mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-large)' }}>
                {counters.numberOnes}
              </div>
              <div className="text-foreground/50 uppercase tracking-wider" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                #1 Hits
              </div>
              <div className="mt-1 text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                Tied with Michael Jackson
              </div>
            </div>

            {/* Top 10s - highlighted as record */}
            <div className="rounded-2xl bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/20" style={{ padding: 'var(--card-padding)' }}>
              <div className="text-amber-500 mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-large)' }}>
                {counters.topTens}
              </div>
              <div className="text-foreground/50 uppercase tracking-wider" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                Top 10 Hits
              </div>
              <div className="mt-1 text-amber-500/60" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                All-time record
              </div>
            </div>

            {/* Total weeks */}
            <div className="rounded-2xl bg-foreground/[0.02] border border-foreground/5" style={{ padding: 'var(--card-padding)' }}>
              <div className="text-foreground/90 mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-large)' }}>
                {counters.totalWeeks.toLocaleString()}
              </div>
              <div className="text-foreground/50 uppercase tracking-wider" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                Total Weeks
              </div>
              <div className="mt-1 text-foreground/40" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                ~{Math.round(finalStats.totalWeeks / 52)} years of chart presence
              </div>
            </div>
          </div>

          {/* Additional stats row */}
          <div className={`grid grid-cols-1 md:grid-cols-3 transition-all duration-700 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`} style={{ gap: 'var(--section-gap)' }}>
            <div className="flex items-center gap-3 rounded-xl bg-foreground/[0.02] border border-foreground/5" style={{ padding: 'var(--card-padding)' }}>
              <div className="text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}>{avgWeeks}</div>
              <div className="text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>Avg. weeks per song</div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-foreground/[0.02] border border-foreground/5" style={{ padding: 'var(--card-padding)' }}>
              <div className="text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}>#{Math.round(avgPeak)}</div>
              <div className="text-foreground/50" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>Avg. peak position</div>
            </div>
            <div className="flex items-center gap-3 rounded-xl bg-foreground/[0.02] border border-foreground/5" style={{ padding: 'var(--card-padding)' }}>
              <div className="text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}>{longestSong.weeks}w</div>
              <div className="text-foreground/50 truncate" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>Longest charting: "{longestSong.title}"</div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
