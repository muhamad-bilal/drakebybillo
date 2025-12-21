"use client"

import { useState, useEffect, useMemo } from "react"

interface Song {
  title: string
  artist: string
  peak_pos: number
  weeks_on_chart: number
  first_chart_date: string
  reached_number_one: boolean
  collaborators: string[]
}

interface RecentData {
  name?: string
  song_count?: number
  number_ones?: number
  top_tens?: number
  songs?: Song[]
}

interface DataStructure {
  section_7_recent?: RecentData
}

interface WeekData {
  week: string
  top10Count: number
  top10Songs: Song[]
  top40Count: number
  hasNumberOne: boolean
}

interface DominationMoment {
  week: string
  count: number
  songs: Song[]
  event: string
}

export default function Section7Page() {
  const [data, setData] = useState<DataStructure | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [hoveredWeek, setHoveredWeek] = useState<WeekData | null>(null)
  const [selectedMoment, setSelectedMoment] = useState<DominationMoment | null>(null)

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
  const recentData = data?.section_7_recent
  const songs = recentData?.songs || []
  const songCount = recentData?.song_count || 0
  const numberOnes = recentData?.number_ones || 0
  const topTens = recentData?.top_tens || 0

  // Calculate weekly chart presence
  // For each song, estimate which weeks it was on chart based on first_chart_date and weeks_on_chart
  const weeklyData = useMemo(() => {
    if (!songs.length) return []

    const weekMap: Record<string, { top10Songs: Song[], top40Songs: Song[], allSongs: Song[] }> = {}

    songs.forEach((song) => {
      const startDate = new Date(song.first_chart_date)
      
      // For each week the song was on chart
      for (let w = 0; w < song.weeks_on_chart; w++) {
        const weekDate = new Date(startDate)
        weekDate.setDate(weekDate.getDate() + w * 7)
        const weekKey = weekDate.toISOString().split("T")[0]
        
        if (!weekMap[weekKey]) {
          weekMap[weekKey] = { top10Songs: [], top40Songs: [], allSongs: [] }
        }
        
        weekMap[weekKey].allSongs.push(song)
        
        // Only count as top 10/40 if it was near peak (simplified assumption)
        // In reality we'd need weekly position data, but we'll estimate
        if (w < song.weeks_on_chart * 0.6) { // Assume top positions in first 60% of run
          if (song.peak_pos <= 10) {
            weekMap[weekKey].top10Songs.push(song)
          }
          if (song.peak_pos <= 40) {
            weekMap[weekKey].top40Songs.push(song)
          }
        }
      }
    })

    // Convert to array and sort by date
    const weeks: WeekData[] = Object.entries(weekMap)
      .filter(([week]) => week >= "2019-01-01" && week <= "2025-12-31")
      .map(([week, data]) => ({
        week,
        top10Count: data.top10Songs.length,
        top10Songs: data.top10Songs,
        top40Count: data.top40Songs.length,
        hasNumberOne: data.top10Songs.some((s) => s.reached_number_one),
      }))
      .sort((a, b) => a.week.localeCompare(b.week))

    return weeks
  }, [songs])

  // Find peak domination moments
  const dominationMoments: DominationMoment[] = useMemo(() => {
    const moments: DominationMoment[] = [
      {
        week: "2021-09-18",
        count: 9,
        songs: songs.filter((s) => s.first_chart_date.startsWith("2021-09") && s.peak_pos <= 10),
        event: "Certified Lover Boy drops — 9 songs debut in top 10 simultaneously",
      },
      {
        week: "2022-11-12",
        count: 8,
        songs: songs.filter((s) => s.first_chart_date.startsWith("2022-11") && s.peak_pos <= 10),
        event: "Her Loss with 21 Savage — 8 songs in top 10",
      },
      {
        week: "2023-10-21",
        count: 7,
        songs: songs.filter((s) => s.first_chart_date.startsWith("2023-10") && s.peak_pos <= 10),
        event: "For All The Dogs — 7 songs in top 10",
      },
      {
        week: "2020-05-23",
        count: 3,
        songs: songs.filter((s) => s.first_chart_date.startsWith("2020-05") && s.peak_pos <= 10),
        event: "Dark Lane Demo Tapes — 3 songs in top 10",
      },
    ]
    return moments.sort((a, b) => b.count - a.count)
  }, [songs])

  // Get max for scaling
  const maxTop10 = Math.max(...weeklyData.map((w) => w.top10Count), 1)

  // Calculate total weeks with multiple top 10 songs
  const weeksWithMultipleTop10 = weeklyData.filter((w) => w.top10Count >= 2).length
  const weeksWithTop10 = weeklyData.filter((w) => w.top10Count >= 1).length

  // Animation
  useEffect(() => {
    if (!data) return
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [data])

  // Calculate total weeks
  const totalWeeks = songs.reduce((sum, s) => sum + s.weeks_on_chart, 0)

  // Get #1 hits
  const numberOneSongs = songs.filter((s) => s.reached_number_one)

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <p className="text-white">Loading data...</p>
      </div>
    )
  }

  const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }

  const formatFullDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap');
      `}</style>

      <style jsx>{`
        .font-display { font-family: 'Bebas Neue', sans-serif; }
        .font-body { font-family: 'Outfit', sans-serif; }
        
        .bar-segment {
          transition: all 0.2s ease;
        }
        
        .bar-segment:hover {
          filter: brightness(1.3);
        }
        
        .moment-card {
          transition: all 0.3s ease;
        }
        
        .moment-card:hover {
          transform: translateY(-4px);
          border-color: rgba(212, 175, 55, 0.5);
        }
        
        .domination-bar {
          transition: all 0.3s ease;
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-0 w-[400px] h-[400px] bg-amber-500/3 rounded-full blur-3xl" />
        
        {/* Watermark */}
        <div 
          className="absolute top-1/2 right-10 -translate-y-1/2 text-[15rem] leading-none text-white/[0.02] select-none"
          style={{ fontFamily: "'Bebas Neue', sans-serif" }}
        >
          TOP10
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        
        {/* Header */}
        <div className={`mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span 
            className="text-xs tracking-[0.4em] text-amber-500/70 uppercase"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Section 07 — Chart Domination
          </span>
          
          <h1 
            className="text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight mt-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            <span className="text-white/90">FLOODING</span>
            <br />
            <span className="text-amber-500">THE CHARTS</span>
          </h1>
          
          <p 
            className="text-lg text-white/50 mt-6 max-w-xl leading-relaxed"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            It's not just about having hits — it's about having ALL the hits at once. 
            Drake doesn't just chart, he dominates entire weeks.
          </p>
        </div>

        {/* Big stats */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/20">
            <div className="text-4xl md:text-5xl text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              9
            </div>
            <div className="text-xs text-white/50 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Most Top 10s at Once
            </div>
          </div>
          
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-4xl md:text-5xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {songCount}
            </div>
            <div className="text-xs text-white/50 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Total Entries
            </div>
          </div>
          
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-4xl md:text-5xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {numberOnes}
            </div>
            <div className="text-xs text-white/50 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              #1 Hits
            </div>
          </div>
          
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-4xl md:text-5xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {topTens}
            </div>
            <div className="text-xs text-white/50 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Top 10 Hits
            </div>
          </div>
        </div>

        {/* Peak Domination Moments */}
        <div className={`mb-12 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span 
              className="text-xs tracking-[0.3em] text-amber-500/70 uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Peak Domination Moments
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dominationMoments.map((moment, i) => (
              <div
                key={moment.week}
                className={`moment-card p-6 rounded-2xl border cursor-pointer ${
                  i === 0 
                    ? "bg-gradient-to-br from-amber-500/20 to-amber-500/5 border-amber-500/40" 
                    : "bg-white/[0.02] border-white/10"
                }`}
                onClick={() => setSelectedMoment(selectedMoment?.week === moment.week ? null : moment)}
              >
                <div className="flex items-start gap-4">
                  {/* Count visualization */}
                  <div className="flex flex-col items-center">
                    <div 
                      className={`text-5xl ${i === 0 ? "text-amber-500" : "text-white/80"}`}
                      style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                    >
                      {moment.count}
                    </div>
                    <div 
                      className="text-[10px] text-white/40 uppercase tracking-wider"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      Top 10
                    </div>
                  </div>

                  {/* Visual bar representation */}
                  <div className="flex-1">
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: 10 }, (_, idx) => (
                        <div
                          key={idx}
                          className={`h-8 flex-1 rounded-sm ${
                            idx < moment.count 
                              ? i === 0 ? "bg-amber-500" : "bg-amber-500/70"
                              : "bg-white/10"
                          }`}
                        />
                      ))}
                    </div>
                    
                    <div 
                      className="text-sm text-white/70 mb-1"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {moment.event}
                    </div>
                    <div 
                      className="text-xs text-white/40"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {formatFullDate(moment.week)}
                    </div>
                  </div>
                </div>

                {/* Expanded song list */}
                {selectedMoment?.week === moment.week && moment.songs.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-white/10">
                    <div className="grid grid-cols-2 gap-2">
                      {moment.songs.slice(0, 10).map((song, idx) => (
                        <div 
                          key={`${song.title}-${idx}`}
                          className="flex items-center gap-2 p-2 rounded-lg bg-black/30"
                        >
                          <div 
                            className={`w-6 h-6 rounded flex items-center justify-center text-xs ${
                              song.peak_pos === 1 ? "bg-amber-500 text-black" : "bg-white/10 text-white/50"
                            }`}
                            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                          >
                            {song.peak_pos}
                          </div>
                          <span 
                            className="text-xs text-white/70 truncate"
                            style={{ fontFamily: "'Outfit', sans-serif" }}
                          >
                            {song.title}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CLB Record Visualization */}
        <div className={`mb-12 transition-all duration-700 delay-400 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span 
              className="text-xs tracking-[0.3em] text-amber-500/70 uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              The CLB Record — September 2021
            </span>
          </div>

          <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20">
            <div className="text-center mb-6">
              <div 
                className="text-6xl md:text-8xl text-amber-500 mb-2"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                9 OF 10
              </div>
              <div 
                className="text-lg text-white/50"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Top 10 spots held simultaneously
              </div>
            </div>

            {/* Visual representation of top 10 */}
            <div className="flex justify-center gap-2 mb-6">
              {Array.from({ length: 10 }, (_, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center"
                >
                  <div
                    className={`w-12 h-16 md:w-16 md:h-20 rounded-lg flex items-center justify-center text-xl md:text-2xl font-bold ${
                      i < 9 
                        ? "bg-amber-500 text-black" 
                        : "bg-white/10 text-white/30"
                    }`}
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    #{i + 1}
                  </div>
                  <div 
                    className={`text-[10px] mt-1 ${i < 9 ? "text-amber-500/70" : "text-white/20"}`}
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {i < 9 ? "Drake" : "—"}
                  </div>
                </div>
              ))}
            </div>

            <div 
              className="text-center text-sm text-white/40"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              First artist in history to debut 9 songs in the top 10 simultaneously
            </div>
          </div>
        </div>

     

        {/* Album Drops Impact */}
        <div className={`mb-12 transition-all duration-700 delay-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span 
              className="text-xs tracking-[0.3em] text-amber-500/70 uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Album Drop Impact
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Dark Lane Demo Tapes", year: "2020", entries: 14, top10: 7 },
              { name: "Certified Lover Boy", year: "2021", entries: 21, top10: 9 },
              { name: "Her Loss", year: "2022", entries: 16, top10: 8 },
              { name: "For All The Dogs", year: "2023", entries: 23, top10: 7 },
            ].map((album) => (
              <div
                key={album.name}
                className="p-5 rounded-xl bg-white/[0.02] border border-white/10 hover:border-amber-500/30 transition-all"
              >
                <div 
                  className="text-lg text-white mb-1"
                  style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                >
                  {album.name}
                </div>
                <div 
                  className="text-xs text-white/40 mb-4"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  {album.year}
                </div>
                
                {/* Mini bar chart */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-3 bg-white/30 rounded-full"
                      style={{ width: `${(album.entries / 25) * 100}%` }}
                    />
                    <span 
                      className="text-xs text-white/50"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {album.entries} entries
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div 
                      className="h-3 bg-amber-500 rounded-full"
                      style={{ width: `${(album.top10 / 25) * 100}%` }}
                    />
                    <span 
                      className="text-xs text-amber-500"
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      {album.top10} top 10
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom nav */}
        <div className={`mt-20 flex items-center gap-6 transition-all duration-700 delay-700 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-500/30 to-transparent" />
          <span 
            className="text-xs tracking-[0.3em] text-white/30 uppercase"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Final: The Legacy
          </span>
          <svg className="w-4 h-4 text-white/30 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  )
}