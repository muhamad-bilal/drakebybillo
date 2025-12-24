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

interface Section7ContentProps {
  isActive?: boolean
}

interface DominationMoment {
  week: string
  count: number
  songs: Song[]
  event: string
  album: string
  year: number
  shortName: string
}

export function Section7Content({ isActive = false }: Section7ContentProps) {
  const [data, setData] = useState<DataStructure | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [selectedMoment, setSelectedMoment] = useState<number>(1) // Default to CLB (the record)
  const [hoveredPosition, setHoveredPosition] = useState<number | null>(null)

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

  // Peak domination moments with short names for the timeline
  const dominationMoments: DominationMoment[] = useMemo(() => {
    const dldtSongs = songs.filter((s) => s.first_chart_date.startsWith("2020-05") && s.peak_pos <= 10)
    const clbSongs = songs.filter((s) => s.first_chart_date.startsWith("2021-09") && s.peak_pos <= 10)
    const hlSongs = songs.filter((s) => s.first_chart_date.startsWith("2022-11") && s.peak_pos <= 10)
    const fatdSongs = songs.filter((s) => s.first_chart_date.startsWith("2023-10") && s.peak_pos <= 10)

    return [
      {
        week: "2020-05-23",
        count: dldtSongs.length,
        songs: dldtSongs,
        event: "Dark Lane Demo Tapes",
        album: "Dark Lane Demo Tapes",
        shortName: "DLDT",
        year: 2020,
      },
      {
        week: "2021-09-18",
        count: clbSongs.length,
        songs: clbSongs,
        event: "Certified Lover Boy",
        album: "Certified Lover Boy",
        shortName: "CLB",
        year: 2021,
      },
      {
        week: "2022-11-12",
        count: hlSongs.length,
        songs: hlSongs,
        event: "Her Loss",
        album: "Her Loss",
        shortName: "HL",
        year: 2022,
      },
      {
        week: "2023-10-21",
        count: fatdSongs.length,
        songs: fatdSongs,
        event: "For All The Dogs",
        album: "For All The Dogs",
        shortName: "FATD",
        year: 2023,
      },
    ]
  }, [songs])

  const currentMoment = dominationMoments[selectedMoment]
  const isRecord = currentMoment?.count === 9

  // Trigger animation when section becomes active
  useEffect(() => {
    if (!data || !isActive) return
    setIsVisible(true)
  }, [data, isActive])

  // Donut chart configuration - larger and more elegant
  const size = 420
  const strokeWidth = 38
  const radius = (size - strokeWidth) / 2 - 20
  const center = size / 2

  // Generate donut segments with proper arc calculations
  const segments = useMemo(() => {
    const total = 10
    const filled = currentMoment?.count || 0
    const segmentAngle = 360 / total
    const gapAngle = 4

    return Array.from({ length: total }, (_, i) => {
      const startAngle = i * segmentAngle - 90
      const endAngle = startAngle + segmentAngle - gapAngle
      const isFilled = i < filled
      const song = currentMoment?.songs.find(s => s.peak_pos === i + 1)

      const startRad = (startAngle * Math.PI) / 180
      const endRad = (endAngle * Math.PI) / 180

      const x1 = center + radius * Math.cos(startRad)
      const y1 = center + radius * Math.sin(startRad)
      const x2 = center + radius * Math.cos(endRad)
      const y2 = center + radius * Math.sin(endRad)

      const midRad = (startRad + endRad) / 2

      return {
        index: i,
        position: i + 1,
        isFilled,
        song,
        path: `M ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2}`,
        labelX: center + (radius + 28) * Math.cos(midRad),
        labelY: center + (radius + 28) * Math.sin(midRad),
      }
    })
  }, [currentMoment, center, radius])

  // Get hovered song info for donut center display
  const hoveredSong = useMemo(() => {
    if (hoveredPosition === null) return null
    return currentMoment?.songs.find(s => s.peak_pos === hoveredPosition + 1) || null
  }, [hoveredPosition, currentMoment])

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
        @keyframes countUp {
          0% {
            opacity: 0;
            transform: scale(0.5);
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        .count-animate {
          animation: countUp 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }

        .segment-path {
          transition: stroke-width 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                      stroke 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                      filter 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
      `}</style>

      {/* Main content */}
      <div className="relative z-10 w-full h-full flex items-center" style={{ paddingTop: 'var(--section-py)', paddingBottom: 'var(--section-py)' }}>
        <div className="max-w-7xl mx-auto w-full" style={{ padding: 'var(--card-padding-lg)' }}>

          <div className="flex items-center" style={{ gap: 'var(--section-gap)' }}>

            {/* Left Side - Donut Visualization */}
            <div className={`flex-1 transition-all duration-700 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-8"}`}>

              {/* Title above donut */}
              <div style={{ marginBottom: 'var(--section-gap)' }}>
                <h1
                  className="leading-[0.9] tracking-tight"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-title)' }}
                >
                  <span className="text-foreground/90">FLOODING</span>{" "}
                  <span className="text-amber-500">THE CHARTS</span>
                </h1>
                <p
                  className="text-foreground/50 max-w-sm leading-relaxed"
                  style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)', marginTop: '0.5rem' }}
                >
                  When Drake drops an album, he doesn't just enter the Top 10 — he takes it over.
                </p>
              </div>

              {/* Donut Chart Container */}
              <div className="relative flex justify-center">
                <div
                  className="relative"
                  style={{ width: size, height: size }}
                >
                  {/* Main donut SVG */}
                  <svg width={size} height={size}>
                    <defs>
                      {/* Gradient for filled segments */}
                      <linearGradient id="segmentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#D4AF37" />
                        <stop offset="100%" stopColor="#B8962E" />
                      </linearGradient>

                      {/* Glow filter */}
                      <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>

                    {/* Background segments (empty slots) */}
                    {segments.map((seg) => (
                      <path
                        key={`bg-${seg.index}`}
                        d={seg.path}
                        fill="none"
                        stroke="rgba(255, 255, 255, 0.04)"
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                      />
                    ))}

                    {/* Filled segments */}
                    {segments.map((seg, i) => {
                      const isHovered = hoveredPosition === seg.index

                      return (
                        <path
                          key={`fill-${seg.index}`}
                          d={seg.path}
                          fill="none"
                          stroke={seg.isFilled
                            ? (isHovered ? "#FFD700" : "url(#segmentGradient)")
                            : "transparent"
                          }
                          strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
                          strokeLinecap="round"
                          className="segment-path"
                          style={{
                            transitionDelay: `${i * 0.05}s`,
                            cursor: seg.isFilled ? "pointer" : "default",
                            opacity: seg.isFilled ? 1 : 0,
                          }}
                          onMouseEnter={() => seg.isFilled && setHoveredPosition(seg.index)}
                          onMouseLeave={() => setHoveredPosition(null)}
                        />
                      )
                    })}

                    {/* Position number labels around the ring */}
                    {segments.map((seg) => (
                      <text
                        key={`label-${seg.index}`}
                        x={seg.labelX}
                        y={seg.labelY}
                        fill={seg.isFilled
                          ? (hoveredPosition === seg.index ? "#FFD700" : "#D4AF37")
                          : "rgba(255, 255, 255, 0.15)"
                        }
                        fontSize="13"
                        fontWeight={seg.isFilled ? "600" : "400"}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        style={{
                          fontFamily: "'Bebas Neue', sans-serif",
                          transition: "fill 0.2s ease",
                        }}
                      >
                        {seg.position}
                      </text>
                    ))}
                  </svg>

                  {/* Center content */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <div
                      className={`${isVisible ? "count-animate" : "opacity-0"}`}
                      style={{ animationDelay: "0.8s" }}
                    >
                      <div
                        className="text-amber-500 leading-none font-bold"
                        style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-large)' }}
                      >
                        {currentMoment?.count}
                      </div>
                    </div>
                    <div
                      className="text-foreground/40 -mt-1"
                      style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 300, fontSize: 'var(--text-body)' }}
                    >
                      of 10
                    </div>

                    {/* Hovered song or album name */}
                    <div className="mt-3 text-center max-w-[160px]" style={{ padding: 'var(--card-padding)' }}>
                      {hoveredSong ? (
                        <div className="transition-all duration-200">
                          <div
                            className="text-amber-500 truncate"
                            style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 'var(--text-small)' }}
                          >
                            {hoveredSong.title}
                          </div>
                          <div
                            className="text-foreground/40 mt-0.5"
                            style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}
                          >
                            Peak #{hoveredSong.peak_pos}
                          </div>
                        </div>
                      ) : (
                        <div
                          className="text-foreground/30"
                          style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}
                        >
                          {currentMoment?.album}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Record indicator - always render but toggle visibility */}
                  <div className={`absolute -bottom-12 left-1/2 -translate-x-1/2 transition-opacity duration-300 ${isRecord ? 'opacity-100' : 'opacity-0'}`}>
                    <div className="flex items-center rounded-full bg-amber-500/10 border border-amber-500/30" style={{ gap: '0.5rem', padding: 'var(--card-padding)' }}>
                      <span className="text-amber-500">★</span>
                      <span
                        className="text-amber-500/90 uppercase tracking-wider"
                        style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500, fontSize: 'var(--text-small)' }}
                      >
                        Billboard Record
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Timeline & Song Details */}
            <div className={`w-[440px] transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"}`}>

              {/* Stats Row */}
              <div className="flex" style={{ gap: '0.75rem', marginBottom: 'var(--section-gap)' }}>
                <div className="flex-1 rounded-xl bg-gradient-to-br from-amber-500/15 to-amber-500/5 border border-amber-500/20" style={{ padding: 'var(--card-padding)' }}>
                  <div className="text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}>9</div>
                  <div className="text-amber-500/70 uppercase tracking-wider" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>Record</div>
                </div>
                <div className="flex-1 rounded-xl bg-foreground/[0.02] border border-foreground/5" style={{ padding: 'var(--card-padding)' }}>
                  <div className="text-foreground/80" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}>{songCount}</div>
                  <div className="text-foreground/40 uppercase tracking-wider" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>Entries</div>
                </div>
                <div className="flex-1 rounded-xl bg-foreground/[0.02] border border-foreground/5" style={{ padding: 'var(--card-padding)' }}>
                  <div className="text-foreground/80" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-stat-medium)' }}>{topTens}</div>
                  <div className="text-foreground/40 uppercase tracking-wider" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>Top 10s</div>
                </div>
              </div>

              {/* Album Timeline */}
              <div style={{ marginBottom: 'var(--section-gap)' }}>
                <div className="flex items-center" style={{ gap: '0.5rem', marginBottom: '1rem' }}>
                  <div className="h-[1px] w-6 bg-amber-500/40" />
                  <span
                    className="tracking-[0.2em] text-amber-500/60 uppercase"
                    style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}
                  >
                    Album Drops
                  </span>
                </div>

                {/* Timeline visualization */}
                <div className="relative">
                  {/* Connecting lines between nodes */}
                  <div className="absolute top-6 left-0 right-0 flex justify-between px-6 pointer-events-none">
                    {dominationMoments.slice(0, -1).map((_, i) => {
                      const isPast = i < selectedMoment
                      return (
                        <div
                          key={`line-${i}`}
                          className="flex-1 h-[2px] mx-1 transition-colors duration-300"
                          style={{
                            background: isPast
                              ? "linear-gradient(90deg, rgba(212, 175, 55, 0.6), rgba(212, 175, 55, 0.4))"
                              : "rgba(255, 255, 255, 0.08)"
                          }}
                        />
                      )
                    })}
                  </div>

                  {/* Timeline nodes */}
                  <div className="relative flex justify-between">
                    {dominationMoments.map((moment, i) => {
                      const isSelected = selectedMoment === i
                      const isRecordMoment = moment.count === 9
                      const isPast = i <= selectedMoment

                      return (
                        <button
                          key={moment.week}
                          onClick={() => setSelectedMoment(i)}
                          className="group flex flex-col items-center z-10"
                        >
                          {/* Node */}
                          <div
                            className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 ${
                              isSelected
                                ? "bg-amber-500 scale-110"
                                : isPast
                                  ? "bg-amber-500/20 border-2 border-amber-500/50"
                                  : "bg-foreground/5 border border-foreground/10 group-hover:border-amber-500/30"
                            }`}
                          >
                            <span
                              className={`text-lg font-bold ${
                                isSelected
                                  ? "text-black"
                                  : isPast
                                    ? "text-amber-500"
                                    : "text-foreground/50 group-hover:text-foreground/70"
                              }`}
                              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                            >
                              {moment.count}
                            </span>

                            {/* Record star */}
                            {isRecordMoment && (
                              <div className={`absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center ${
                                isSelected ? "bg-black/20" : "bg-amber-500"
                              }`}>
                                <span className={`text-[10px] ${isSelected ? "text-amber-500" : "text-black"}`}>★</span>
                              </div>
                            )}
                          </div>

                          {/* Label */}
                          <div className="mt-3 text-center">
                            <div
                              className={`font-medium transition-colors ${isSelected ? "text-amber-500" : isPast ? "text-amber-500/60" : "text-foreground/40"}`}
                              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-small)' }}
                            >
                              {moment.shortName}
                            </div>
                            <div
                              className="text-foreground/30"
                              style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}
                            >
                              {moment.year}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              {/* Song List */}
              <div>
                <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                  <div className="flex items-center" style={{ gap: '0.5rem' }}>
                    <div className="h-[1px] w-6 bg-amber-500/40" />
                    <span
                      className="tracking-[0.2em] text-amber-500/60 uppercase"
                      style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}
                    >
                      Top 3 Songs
                    </span>
                  </div>
                  <span
                    className="text-foreground/30"
                    style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}
                  >
                    {currentMoment?.songs.length} in Top 10
                  </span>
                </div>

                <div className="rounded-2xl bg-gradient-to-b from-foreground/[0.03] to-transparent border border-foreground/5 overflow-hidden">
                  <div className="space-y-1.5" style={{ padding: 'var(--card-padding)' }}>
                    {currentMoment?.songs
                      .sort((a, b) => a.peak_pos - b.peak_pos)
                      .slice(0, 3)
                      .map((song) => {
                        const isNumberOne = song.peak_pos === 1

                        return (
                          <div
                            key={song.title}
                            className="flex items-center rounded-xl transition-all duration-200 bg-black/20 border border-transparent hover:bg-black/30"
                            style={{ gap: '0.75rem', padding: 'var(--card-padding)' }}
                          >
                            {/* Position badge */}
                            <div
                              className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold shrink-0 ${
                                isNumberOne
                                  ? "bg-amber-500 text-black"
                                  : "bg-foreground/5 text-foreground/40"
                              }`}
                              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'var(--text-small)' }}
                            >
                              #{song.peak_pos}
                            </div>

                            {/* Song info */}
                            <div className="flex-1 min-w-0">
                              <div
                                className="truncate text-foreground/70"
                                style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 500, fontSize: 'var(--text-small)' }}
                              >
                                {song.title}
                              </div>
                              {song.collaborators.length > 0 && (
                                <div
                                  className="text-foreground/30 truncate"
                                  style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}
                                >
                                  ft. {song.collaborators.slice(0, 2).join(", ")}
                                  {song.collaborators.length > 2 && ` +${song.collaborators.length - 2}`}
                                </div>
                              )}
                            </div>

                            {/* Weeks indicator */}
                            <div
                              className="text-foreground/30 shrink-0"
                              style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}
                            >
                              {song.weeks_on_chart}w
                            </div>
                          </div>
                        )
                      })}
                  </div>
                </div>
              </div>

              {/* Record callout - always render but toggle visibility to prevent layout shift */}
              <div className={`mt-4 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 transition-opacity duration-300 ${isRecord ? 'opacity-100' : 'opacity-0'}`} style={{ padding: 'var(--card-padding)' }}>
                <div className="text-foreground/60 leading-relaxed" style={{ fontFamily: "'Outfit', sans-serif", fontSize: 'var(--text-small)' }}>
                  <span className="text-amber-500 font-medium">September 2021:</span> Drake became the first artist in Billboard history to debut 9 songs simultaneously in the Top 10.
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}
