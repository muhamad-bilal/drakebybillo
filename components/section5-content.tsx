"use client"

import { useState, useEffect, useMemo } from "react"

interface CollabSong {
  title: string
  peak_pos: number
  weeks: number
}

interface Collaborator {
  collaborator: string
  count: number
  songs: CollabSong[]
  best_peak: number
}

interface CollabData {
  all_collaborators?: Collaborator[]
  total_collabs?: number
  solo_songs?: number
}

interface DataStructure {
  section_5_collaborations?: CollabData
}

interface NodePosition {
  x: number
  y: number
  collaborator: Collaborator
  ring: number
}

interface Section5ContentProps {
  isActive?: boolean
}

export function Section5Content({ isActive = false }: Section5ContentProps) {
  const [data, setData] = useState<DataStructure | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [selectedCollab, setSelectedCollab] = useState<Collaborator | null>(null)
  const [hoveredCollab, setHoveredCollab] = useState<Collaborator | null>(null)

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
  const collabData = data?.section_5_collaborations || {}
  const collaborators = collabData.all_collaborators || []
  const totalCollabs = collabData.total_collabs || 0
  const soloSongs = collabData.solo_songs || 0

  // Get top collaborators for the network
  const topCollaborators = useMemo(() =>
    [...collaborators].sort((a, b) => b.count - a.count).slice(0, 25),
    [collaborators]
  )

  // Unique collaborators count
  const uniqueCollaborators = collaborators.length

  // Collaborators with #1 hits
  const collabsWithNumberOne = useMemo(() =>
    collaborators.filter((c) => c.best_peak === 1),
    [collaborators]
  )

  // Network dimensions - fill the full viewport height (use 90vh equivalent)
  const networkSize = 800
  const centerX = networkSize / 2
  const centerY = networkSize / 2

  // Calculate node positions in concentric rings
  const nodePositions: NodePosition[] = useMemo(() => {
    const positions: NodePosition[] = []

    // Ring 1: Top 5 collaborators
    const ring1 = topCollaborators.slice(0, 5)
    const ring1Radius = 180
    ring1.forEach((collab, i) => {
      const angle = (i / ring1.length) * 2 * Math.PI - Math.PI / 2
      positions.push({
        x: centerX + Math.cos(angle) * ring1Radius,
        y: centerY + Math.sin(angle) * ring1Radius,
        collaborator: collab,
        ring: 1,
      })
    })

    // Ring 2: Next 8 collaborators
    const ring2 = topCollaborators.slice(5, 13)
    const ring2Radius = 290
    ring2.forEach((collab, i) => {
      const angle = (i / ring2.length) * 2 * Math.PI - Math.PI / 2 + Math.PI / 8
      positions.push({
        x: centerX + Math.cos(angle) * ring2Radius,
        y: centerY + Math.sin(angle) * ring2Radius,
        collaborator: collab,
        ring: 2,
      })
    })

    // Ring 3: Remaining
    const ring3 = topCollaborators.slice(13, 25)
    const ring3Radius = 380
    ring3.forEach((collab, i) => {
      const angle = (i / ring3.length) * 2 * Math.PI - Math.PI / 2
      positions.push({
        x: centerX + Math.cos(angle) * ring3Radius,
        y: centerY + Math.sin(angle) * ring3Radius,
        collaborator: collab,
        ring: 3,
      })
    })

    return positions
  }, [topCollaborators, centerX, centerY])

  // Get node size based on song count
  const getNodeSize = (count: number): number => {
    const maxCount = Math.max(...topCollaborators.map((c) => c.count), 1)
    const minSize = 30
    const maxSize = 66
    return minSize + ((count / maxCount) * (maxSize - minSize))
  }

  // Get node color based on best peak
  const getNodeColor = (peak: number): string => {
    if (peak === 1) return "#D4AF37"
    if (peak <= 5) return "#D4AF37cc"
    if (peak <= 10) return "#D4AF37aa"
    return "#ffffff66"
  }

  // Trigger animation when section becomes active
  useEffect(() => {
    if (!data || !isActive) return
    setIsVisible(true)
  }, [data, isActive])

  if (loading) {
    return (
      <section className="flex h-screen w-screen shrink-0 items-center justify-center">
        <p className="text-foreground/60">Loading data...</p>
      </section>
    )
  }

  const activeCollab = hoveredCollab || selectedCollab

  return (
    <section className="relative flex h-screen w-screen shrink-0 overflow-hidden">
      {/* Custom styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap');
      `}</style>

      <style jsx>{`
        @keyframes pulse-node {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }

        .network-node {
          transition: all 0.3s ease;
          cursor: pointer;
        }

        .network-node:hover {
          filter: drop-shadow(0 0 12px rgba(212, 175, 55, 0.8));
        }

        .network-node.active {
          animation: pulse-node 1.5s ease-in-out infinite;
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main content - Split layout: Left details, Right network */}
      <div className="relative z-10 w-full h-full flex">

        {/* Left Side - Title, Stats, Details */}
        <div
          className="w-1/2 h-full flex flex-col justify-center"
          style={{
            paddingLeft: 'var(--card-padding-lg)',
            paddingRight: 'var(--card-padding-lg)',
            paddingTop: 'var(--section-py)',
            paddingBottom: 'var(--section-py)'
          }}
        >

          {/* Title */}
          <div
            className={`transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ marginBottom: 'var(--section-gap)' }}
          >
            <h1
              className="leading-[0.9] tracking-tight"
              style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 'var(--text-title)'
              }}
            >
              <span className="text-foreground/90">THE</span>{" "}
              <span className="text-amber-500">NETWORK</span>
            </h1>
            <p
              className="text-foreground/50 max-w-md leading-relaxed"
              style={{
                fontFamily: "'Outfit', sans-serif",
                fontSize: 'var(--text-body)',
                marginTop: 'calc(var(--card-padding) / 2)'
              }}
            >
              {uniqueCollaborators} artists. {totalCollabs} collaborative songs. Drake sits at the center.
            </p>
          </div>

          {/* Stats Row */}
          <div
            className={`flex flex-wrap transition-all duration-700 delay-100 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ gap: 'var(--card-padding)', marginBottom: 'var(--section-gap)' }}
          >
            <div
              className="rounded-xl bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/20"
              style={{ padding: 'var(--card-padding)' }}
            >
              <div
                className="text-amber-500"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 'var(--text-stat-large)'
                }}
              >
                {totalCollabs}
              </div>
              <div
                className="text-foreground/50"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 'var(--text-small)'
                }}
              >
                Collabs
              </div>
            </div>
            <div
              className="rounded-xl bg-foreground/[0.02] border border-foreground/5"
              style={{ padding: 'var(--card-padding)' }}
            >
              <div
                className="text-foreground/90"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 'var(--text-stat-large)'
                }}
              >
                {soloSongs}
              </div>
              <div
                className="text-foreground/50"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 'var(--text-small)'
                }}
              >
                Solo
              </div>
            </div>
            <div
              className="rounded-xl bg-foreground/[0.02] border border-foreground/5"
              style={{ padding: 'var(--card-padding)' }}
            >
              <div
                className="text-foreground/90"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 'var(--text-stat-large)'
                }}
              >
                {uniqueCollaborators}
              </div>
              <div
                className="text-foreground/50"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 'var(--text-small)'
                }}
              >
                Artists
              </div>
            </div>
            <div
              className="rounded-xl bg-foreground/[0.02] border border-foreground/5"
              style={{ padding: 'var(--card-padding)' }}
            >
              <div
                className="text-foreground/90"
                style={{
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: 'var(--text-stat-large)'
                }}
              >
                {collabsWithNumberOne.length}
              </div>
              <div
                className="text-foreground/50"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 'var(--text-small)'
                }}
              >
                #1 Partners
              </div>
            </div>
          </div>

          {/* Details Panel - Compact */}
          <div
            className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
            style={{ maxHeight: 'var(--chart-height-sm)' }}
          >
            <div
              className="flex items-center"
              style={{ gap: 'calc(var(--card-padding) / 3)', marginBottom: 'calc(var(--card-padding) / 3)' }}
            >
              <div className="h-[1px] w-6 bg-amber-500/50" />
              <span
                className="tracking-[0.2em] text-amber-500/70 uppercase"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 'var(--text-small)'
                }}
              >
                {activeCollab ? "Collaboration" : "Top Partners"}
              </span>
            </div>

            <div
              className={`rounded-lg border transition-all duration-300 overflow-hidden ${
                activeCollab
                  ? "bg-gradient-to-br from-amber-500/10 to-transparent border-amber-500/30"
                  : "bg-foreground/[0.02] border-foreground/10"
              }`}
              style={{ height: 'calc(var(--chart-height-sm) - 2rem)' }}
            >
              {activeCollab ? (
                <div
                  className="h-full flex flex-col"
                  style={{ padding: 'calc(var(--card-padding) / 2)' }}
                >
                  <div
                    className="flex items-start justify-between"
                    style={{ marginBottom: 'calc(var(--card-padding) / 3)' }}
                  >
                    <div>
                      <div
                        className="text-foreground"
                        style={{
                          fontFamily: "'Bebas Neue', sans-serif",
                          fontSize: 'var(--text-stat-medium)'
                        }}
                      >
                        {activeCollab.collaborator}
                      </div>
                      <div
                        className="text-foreground/50"
                        style={{
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: 'var(--text-small)'
                        }}
                      >
                        {activeCollab.count} songs together
                      </div>
                    </div>
                    <div
                      className={`px-2 py-1 rounded-md ${
                        activeCollab.best_peak === 1
                          ? "bg-amber-500 text-black"
                          : "bg-foreground/10 text-foreground/70"
                      }`}
                      style={{
                        fontFamily: "'Outfit', sans-serif",
                        fontSize: 'var(--text-small)'
                      }}
                    >
                      Best: #{activeCollab.best_peak}
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin scrollbar-thumb-amber-500/30 scrollbar-track-transparent">
                    {[...activeCollab.songs]
                      .sort((a, b) => a.peak_pos - b.peak_pos)
                      .map((song, i) => (
                        <div
                          key={`${song.title}-${i}`}
                          className="flex items-center rounded-md bg-black/30"
                          style={{ gap: 'calc(var(--card-padding) / 3)', padding: 'calc(var(--card-padding) / 3)' }}
                        >
                          <div
                            className={`w-6 h-6 rounded flex items-center justify-center font-bold ${
                              song.peak_pos === 1
                                ? "bg-amber-500 text-black"
                                : song.peak_pos <= 10
                                  ? "bg-amber-500/30 text-amber-500"
                                  : "bg-foreground/10 text-foreground/50"
                            }`}
                            style={{
                              fontFamily: "'Bebas Neue', sans-serif",
                              fontSize: 'var(--text-small)'
                            }}
                          >
                            #{song.peak_pos}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div
                              className="text-foreground/90 truncate"
                              style={{
                                fontFamily: "'Outfit', sans-serif",
                                fontSize: 'var(--text-small)'
                              }}
                            >
                              {song.title}
                            </div>
                          </div>
                          <div
                            className="text-foreground/40"
                            style={{
                              fontFamily: "'Outfit', sans-serif",
                              fontSize: 'var(--text-small)'
                            }}
                          >
                            {song.weeks}w
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div
                  className="h-full flex flex-col"
                  style={{ padding: 'calc(var(--card-padding) / 2)' }}
                >
                  {/* Horizontal Bar Chart */}
                  <div className="flex-1 flex flex-col justify-center space-y-1.5">
                    {(() => {
                      const maxCount = Math.max(...topCollaborators.slice(0, 6).map(c => c.count), 1)
                      return topCollaborators.slice(0, 6).map((collab) => {
                        const barWidth = (collab.count / maxCount) * 100
                        return (
                          <div
                            key={collab.collaborator}
                            className="flex items-center"
                            style={{ gap: 'calc(var(--card-padding) / 3)' }}
                          >
                            {/* Name */}
                            <div
                              className="w-16 truncate text-foreground/60"
                              style={{
                                fontFamily: "'Outfit', sans-serif",
                                fontSize: 'var(--text-small)'
                              }}
                              title={collab.collaborator}
                            >
                              {collab.collaborator.split(' ')[0]}
                            </div>

                            {/* Bar container */}
                            <div className="flex-1 h-5 bg-black/20 rounded-sm overflow-hidden">
                              <div
                                className="h-full rounded-sm transition-all duration-300"
                                style={{
                                  width: `${barWidth}%`,
                                  backgroundColor: getNodeColor(collab.best_peak),
                                }}
                              />
                            </div>

                            {/* Count */}
                            <div
                              className="w-5 text-right text-foreground/50"
                              style={{
                                fontFamily: "'Bebas Neue', sans-serif",
                                fontSize: 'var(--text-small)'
                              }}
                            >
                              {collab.count}
                            </div>
                          </div>
                        )
                      })
                    })()}
                  </div>

                  {/* Footer hint */}
                  <div
                    className="text-center text-foreground/40"
                    style={{
                      fontFamily: "'Outfit', sans-serif",
                      fontSize: 'var(--text-small)',
                      marginTop: 'calc(var(--card-padding) / 3)'
                    }}
                  >
                    Hover network nodes for songs
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Solo vs Collaborations Bar */}
          <div
            className={`transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
            style={{ marginTop: 'calc(var(--section-gap) * 1.5)' }}
          >
            <div
              className="flex items-center justify-between"
              style={{ marginBottom: 'calc(var(--card-padding) / 3)' }}
            >
              <span
                className="text-foreground/60"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 'var(--text-body)'
                }}
              >
                Solo vs. Collaborations
              </span>
              <span
                className="text-foreground/40"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 'var(--text-body)'
                }}
              >
                {totalCollabs + soloSongs} total
              </span>
            </div>
            <div className="h-8 rounded-full overflow-hidden flex">
              <div
                className="bg-amber-500 flex items-center justify-center text-black font-bold transition-all duration-1000"
                style={{
                  width: `${(totalCollabs / (totalCollabs + soloSongs)) * 100}%`,
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 'var(--text-small)'
                }}
              >
                {Math.round((totalCollabs / (totalCollabs + soloSongs)) * 100)}% Collabs
              </div>
              <div
                className="bg-foreground/20 flex items-center justify-center text-foreground/70 font-bold transition-all duration-1000"
                style={{
                  width: `${(soloSongs / (totalCollabs + soloSongs)) * 100}%`,
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 'var(--text-small)'
                }}
              >
                {Math.round((soloSongs / (totalCollabs + soloSongs)) * 100)}% Solo
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Network Graph (Full Height) */}
        <div className="w-1/2 h-full flex items-center justify-center">
          <div className={`transition-all duration-700 delay-200 ${isVisible ? "opacity-100 scale-100" : "opacity-0 scale-95"}`}>
            <div
              className="relative rounded-3xl overflow-hidden"
              style={{ width: networkSize, height: networkSize }}
            >
              <svg width={networkSize} height={networkSize} className="absolute inset-0">
                {/* Orbit rings */}
                <circle cx={centerX} cy={centerY} r={180} fill="none" stroke="rgba(212, 175, 55, 0.1)" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx={centerX} cy={centerY} r={290} fill="none" stroke="rgba(255, 255, 255, 0.05)" strokeWidth="1" strokeDasharray="4 4" />
                <circle cx={centerX} cy={centerY} r={380} fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" strokeDasharray="4 4" />

                {/* Connection lines */}
                {nodePositions.map((node, i) => {
                  const isActive = activeCollab?.collaborator === node.collaborator.collaborator
                  return (
                    <line
                      key={`line-${i}`}
                      x1={centerX}
                      y1={centerY}
                      x2={node.x}
                      y2={node.y}
                      stroke={isActive ? "#D4AF37" : "rgba(255, 255, 255, 0.08)"}
                      strokeWidth={isActive ? 2 : 1}
                      style={{
                        opacity: isVisible ? 1 : 0,
                        transition: `all 0.5s ease ${0.3 + i * 0.02}s`
                      }}
                    />
                  )
                })}
              </svg>

              {/* Drake center node */}
              <div
                className="absolute flex items-center justify-center rounded-full bg-amber-500 text-black font-bold z-20"
                style={{
                  left: centerX - 50,
                  top: centerY - 50,
                  width: 100,
                  height: 100,
                  fontFamily: "'Bebas Neue', sans-serif",
                  fontSize: "18px",
                  boxShadow: "0 0 50px rgba(212, 175, 55, 0.6)",
                }}
              >
                DRAKE
              </div>

              {/* Collaborator nodes */}
              {nodePositions.map((node, i) => {
                const size = getNodeSize(node.collaborator.count)
                const color = getNodeColor(node.collaborator.best_peak)
                const isActive = activeCollab?.collaborator === node.collaborator.collaborator

                return (
                  <div
                    key={node.collaborator.collaborator}
                    className={`network-node absolute flex items-center justify-center rounded-full z-10 ${isActive ? "active" : ""}`}
                    style={{
                      left: node.x - size / 2,
                      top: node.y - size / 2,
                      width: size,
                      height: size,
                      backgroundColor: color,
                      opacity: isVisible ? 1 : 0,
                      transform: isVisible ? "scale(1)" : "scale(0)",
                      transition: `all 0.4s ease ${0.4 + i * 0.03}s`,
                      border: isActive ? "2px solid white" : "none",
                      boxShadow: isActive ? `0 0 20px ${color}` : "none",
                    }}
                    onMouseEnter={() => setHoveredCollab(node.collaborator)}
                    onMouseLeave={() => setHoveredCollab(null)}
                    onClick={() => setSelectedCollab(node.collaborator)}
                  >
                    {size > 36 && (
                      <span
                        className="text-black font-bold text-center leading-tight px-1 truncate"
                        style={{
                          fontFamily: "'Outfit', sans-serif",
                          fontSize: 'var(--text-small)',
                          maxWidth: size - 8
                        }}
                      >
                        {node.collaborator.collaborator.split(" ")[0]}
                      </span>
                    )}
                  </div>
                )
              })}

              {/* Legend */}
              <div
                className="absolute text-foreground/50 space-y-2"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 'var(--text-body)',
                  bottom: 'var(--card-padding)',
                  left: 'var(--card-padding)'
                }}
              >
                <div
                  className="flex items-center"
                  style={{ gap: 'calc(var(--card-padding) / 2)' }}
                >
                  <div className="w-4 h-4 rounded-full bg-amber-500" />
                  <span>#1 hit</span>
                </div>
                <div
                  className="flex items-center"
                  style={{ gap: 'calc(var(--card-padding) / 2)' }}
                >
                  <div className="w-4 h-4 rounded-full bg-amber-500/60" />
                  <span>Top 10</span>
                </div>
                <div
                  className="flex items-center"
                  style={{ gap: 'calc(var(--card-padding) / 2)' }}
                >
                  <div className="w-4 h-4 rounded-full bg-foreground/40" />
                  <span>Other</span>
                </div>
              </div>

              <div
                className="absolute text-foreground/40"
                style={{
                  fontFamily: "'Outfit', sans-serif",
                  fontSize: 'var(--text-body)',
                  bottom: 'var(--card-padding)',
                  right: 'var(--card-padding)'
                }}
              >
                Size = # songs
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
