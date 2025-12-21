"use client"

import { useState, useEffect, useRef } from "react"

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

export default function Section5Page() {
  const [data, setData] = useState<DataStructure | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(false)
  const [selectedCollab, setSelectedCollab] = useState<Collaborator | null>(null)
  const [hoveredCollab, setHoveredCollab] = useState<Collaborator | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

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
  const topCollaborators = [...collaborators].sort((a, b) => b.count - a.count).slice(0, 30)

  // Unique collaborators count
  const uniqueCollaborators = collaborators.length

  // Collaborators with #1 hits
  const collabsWithNumberOne = collaborators.filter((c) => c.best_peak === 1)

  // Network dimensions
  const networkSize = 500
  const centerX = networkSize / 2
  const centerY = networkSize / 2

  // Calculate node positions in concentric rings
  const calculateNodePositions = (): NodePosition[] => {
    const positions: NodePosition[] = []
    
    // Ring 1: Top 6 collaborators (closest to Drake)
    const ring1 = topCollaborators.slice(0, 6)
    const ring1Radius = 120
    ring1.forEach((collab, i) => {
      const angle = (i / ring1.length) * 2 * Math.PI - Math.PI / 2
      positions.push({
        x: centerX + Math.cos(angle) * ring1Radius,
        y: centerY + Math.sin(angle) * ring1Radius,
        collaborator: collab,
        ring: 1,
      })
    })

    // Ring 2: Next 10 collaborators
    const ring2 = topCollaborators.slice(6, 16)
    const ring2Radius = 190
    ring2.forEach((collab, i) => {
      const angle = (i / ring2.length) * 2 * Math.PI - Math.PI / 2 + Math.PI / 10
      positions.push({
        x: centerX + Math.cos(angle) * ring2Radius,
        y: centerY + Math.sin(angle) * ring2Radius,
        collaborator: collab,
        ring: 2,
      })
    })

    // Ring 3: Remaining collaborators
    const ring3 = topCollaborators.slice(16, 30)
    const ring3Radius = 230
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
  }

  const nodePositions = calculateNodePositions()

  // Get node size based on song count
  const getNodeSize = (count: number): number => {
    const maxCount = Math.max(...topCollaborators.map((c) => c.count), 1)
    const minSize = 20
    const maxSize = 50
    return minSize + ((count / maxCount) * (maxSize - minSize))
  }

  // Get node color based on best peak
  const getNodeColor = (peak: number): string => {
    if (peak === 1) return "#D4AF37"
    if (peak <= 5) return "#D4AF37cc"
    if (peak <= 10) return "#D4AF37aa"
    return "#ffffff66"
  }

  // Animation
  useEffect(() => {
    if (!data) return
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [data])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <p className="text-white">Loading data...</p>
      </div>
    )
  }

  const activeCollab = hoveredCollab || selectedCollab

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap');
      `}</style>

      <style jsx>{`
        .font-display { font-family: 'Bebas Neue', sans-serif; }
        .font-body { font-family: 'Outfit', sans-serif; }
        
        @keyframes pulse-node {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        
        @keyframes draw-line {
          from { stroke-dashoffset: 300; }
          to { stroke-dashoffset: 0; }
        }
        
        @keyframes orbit {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        .network-node {
          transition: all 0.3s ease;
          cursor: pointer;
        }
        
        .network-node:hover {
          filter: drop-shadow(0 0 15px rgba(212, 175, 55, 0.8));
        }
        
        .network-node.active {
          animation: pulse-node 1.5s ease-in-out infinite;
        }
        
        .connection-line {
          stroke-dasharray: 300;
          animation: draw-line 1s ease-out forwards;
        }
        
        .orbit-ring {
          animation: orbit 60s linear infinite;
        }
        
        .orbit-ring-reverse {
          animation: orbit 90s linear infinite reverse;
        }
      `}</style>

      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/5 rounded-full blur-3xl" />
      </div>

      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 py-16">
        
        {/* Header */}
        <div className={`mb-8 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <span 
            className="text-xs tracking-[0.4em] text-amber-500/70 uppercase"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Section 05 — The Collaborator
          </span>
          
          <h1 
            className="text-5xl md:text-7xl lg:text-8xl leading-[0.9] tracking-tight mt-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
          >
            <span className="text-white/90">THE</span>
            <br />
            <span className="text-amber-500">NETWORK</span>
          </h1>
          
          <p 
            className="text-lg text-white/50 mt-6 max-w-xl leading-relaxed"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            {uniqueCollaborators} artists. {totalCollabs} collaborative songs. 
            Drake sits at the center of hip-hop's most powerful network.
          </p>
        </div>

        {/* Stats row */}
        <div className={`grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/15 to-transparent border border-amber-500/20">
            <div className="text-3xl md:text-4xl text-amber-500" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {totalCollabs}
            </div>
            <div className="text-xs text-white/50 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Collab Songs
            </div>
          </div>
          
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-3xl md:text-4xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {soloSongs}
            </div>
            <div className="text-xs text-white/50 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Solo Songs
            </div>
          </div>
          
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-3xl md:text-4xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {uniqueCollaborators}
            </div>
            <div className="text-xs text-white/50 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              Unique Artists
            </div>
          </div>
          
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="text-3xl md:text-4xl text-white/90" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
              {collabsWithNumberOne.length}
            </div>
            <div className="text-xs text-white/50 mt-1" style={{ fontFamily: "'Outfit', sans-serif" }}>
              With #1 Hits
            </div>
          </div>
        </div>

        {/* Solo vs Collaborations Bar */}
        <div className={`mb-12 transition-all duration-700 delay-250 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5">
            <div className="flex items-center justify-between mb-3">
              <span 
                className="text-sm text-white/70"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Solo vs. Collaborations
              </span>
              <span 
                className="text-sm text-white/40"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                {totalCollabs + soloSongs} total songs
              </span>
            </div>
            
            {/* Bar */}
            <div className="h-8 rounded-full overflow-hidden flex">
              <div 
                className="bg-amber-500 flex items-center justify-center text-black text-xs font-bold transition-all duration-1000"
                style={{ 
                  width: `${(totalCollabs / (totalCollabs + soloSongs)) * 100}%`,
                  fontFamily: "'Outfit', sans-serif"
                }}
              >
                {Math.round((totalCollabs / (totalCollabs + soloSongs)) * 100)}% Collabs
              </div>
              <div 
                className="bg-white/20 flex items-center justify-center text-white/70 text-xs font-bold transition-all duration-1000"
                style={{ 
                  width: `${(soloSongs / (totalCollabs + soloSongs)) * 100}%`,
                  fontFamily: "'Outfit', sans-serif"
                }}
              >
                {Math.round((soloSongs / (totalCollabs + soloSongs)) * 100)}% Solo
              </div>
            </div>
          </div>
        </div>

        {/* Network Graph Section */}
        <div className={`mb-12 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span 
              className="text-xs tracking-[0.3em] text-amber-500/70 uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Collaboration Network
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Network visualization */}
            <div className="lg:col-span-2 flex items-center justify-center">
              <div 
                ref={containerRef}
                className="relative bg-white/[0.02] rounded-3xl border border-white/5 overflow-hidden"
                style={{ width: networkSize, height: networkSize }}
              >
                <svg width={networkSize} height={networkSize} className="absolute inset-0">
                  {/* Orbit rings */}
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={120}
                    fill="none"
                    stroke="rgba(212, 175, 55, 0.1)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={190}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.05)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />
                  <circle
                    cx={centerX}
                    cy={centerY}
                    r={230}
                    fill="none"
                    stroke="rgba(255, 255, 255, 0.03)"
                    strokeWidth="1"
                    strokeDasharray="4 4"
                  />

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
                        stroke={isActive ? "#D4AF37" : "rgba(255, 255, 255, 0.1)"}
                        strokeWidth={isActive ? 2 : 1}
                        className={isActive ? "connection-line" : ""}
                        style={{
                          opacity: isVisible ? 1 : 0,
                          transition: `opacity 0.5s ease ${0.3 + i * 0.02}s`
                        }}
                      />
                    )
                  })}
                </svg>

                {/* Drake center node */}
                <div
                  className="absolute flex items-center justify-center rounded-full bg-amber-500 text-black font-bold z-20"
                  style={{
                    left: centerX - 35,
                    top: centerY - 35,
                    width: 70,
                    height: 70,
                    fontFamily: "'Bebas Neue', sans-serif",
                    fontSize: "14px",
                    boxShadow: "0 0 30px rgba(212, 175, 55, 0.6)",
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
                      {size > 30 && (
                        <span 
                          className="text-black text-[8px] font-bold text-center leading-tight px-1 truncate"
                          style={{ fontFamily: "'Outfit', sans-serif", maxWidth: size - 4 }}
                        >
                          {node.collaborator.collaborator.split(" ")[0]}
                        </span>
                      )}
                    </div>
                  )
                })}

                {/* Legend */}
                <div 
                  className="absolute bottom-4 left-4 text-xs text-white/50 space-y-1"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                    <span>#1 hit together</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-amber-500/60" />
                    <span>Top 10 hit</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-white/40" />
                    <span>Other collab</span>
                  </div>
                </div>

                {/* Size legend */}
                <div 
                  className="absolute bottom-4 right-4 text-xs text-white/40"
                  style={{ fontFamily: "'Outfit', sans-serif" }}
                >
                  Node size = # of songs
                </div>
              </div>
            </div>

            {/* Selected collaborator details */}
            <div className="lg:col-span-1">
              {activeCollab ? (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div 
                        className="text-2xl text-white"
                        style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                      >
                        {activeCollab.collaborator}
                      </div>
                      <div 
                        className="text-sm text-white/50"
                        style={{ fontFamily: "'Outfit', sans-serif" }}
                      >
                        {activeCollab.count} songs together
                      </div>
                    </div>
                    <div 
                      className={`px-3 py-1 rounded-full text-sm ${
                        activeCollab.best_peak === 1 
                          ? "bg-amber-500 text-black" 
                          : "bg-white/10 text-white/70"
                      }`}
                      style={{ fontFamily: "'Outfit', sans-serif" }}
                    >
                      Best: #{activeCollab.best_peak}
                    </div>
                  </div>

                  <div className="space-y-2 max-h-[350px] overflow-y-auto pr-2">
                    {[...activeCollab.songs]
                      .sort((a, b) => a.peak_pos - b.peak_pos)
                      .map((song, i) => (
                        <div
                          key={`${song.title}-${i}`}
                          className="flex items-center gap-3 p-2 rounded-lg bg-black/30"
                        >
                          <div 
                            className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                              song.peak_pos === 1 
                                ? "bg-amber-500 text-black" 
                                : song.peak_pos <= 10 
                                  ? "bg-amber-500/30 text-amber-500" 
                                  : "bg-white/5 text-white/50"
                            }`}
                            style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                          >
                            #{song.peak_pos}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div 
                              className="text-sm text-white/90 truncate"
                              style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                              {song.title}
                            </div>
                            <div 
                              className="text-xs text-white/40"
                              style={{ fontFamily: "'Outfit', sans-serif" }}
                            >
                              {song.weeks} weeks
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ) : (
                <div className="p-6 rounded-2xl bg-white/[0.02] border border-white/5 h-full flex flex-col items-center justify-center text-center">
                  <div className="text-4xl mb-4 opacity-30">👆</div>
                  <div 
                    className="text-lg text-white/50"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    Hover or click on a node to see collaboration details
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Key partnerships */}
        <div className={`mb-16 transition-all duration-700 delay-500 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span 
              className="text-xs tracking-[0.3em] text-amber-500/70 uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Defining Partnerships
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Lil Wayne */}
            <div 
              className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer group"
              onClick={() => {
                const wayne = collaborators.find(c => c.collaborator === "Lil Wayne")
                if (wayne) setSelectedCollab(wayne)
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-2xl text-white group-hover:text-amber-500 transition-colors" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  Lil Wayne
                </div>
                <div className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-500 text-xs" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  23 songs
                </div>
              </div>
              <div className="text-sm text-white/50 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                The mentor who gave Drake his start. Young Money's foundation. Spanning 2009-2021.
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-amber-500" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Best: "She Will" (#3)
                </div>
                <div className="text-xs text-white/30" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Click to explore →
                </div>
              </div>
            </div>

            {/* Future */}
            <div 
              className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer group"
              onClick={() => {
                const future = collaborators.find(c => c.collaborator === "Future")
                if (future) setSelectedCollab(future)
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-2xl text-white group-hover:text-amber-500 transition-colors" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  Future
                </div>
                <div className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-500 text-xs" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  20 songs
                </div>
              </div>
              <div className="text-sm text-white/50 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                From What A Time To Be Alive to "Wait For U". The trap-melodic fusion. 2 #1 hits.
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-amber-500" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Best: "Way 2 Sexy" & "Wait For U" (#1)
                </div>
                <div className="text-xs text-white/30" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Click to explore →
                </div>
              </div>
            </div>

            {/* 21 Savage */}
            <div 
              className="p-6 rounded-2xl bg-gradient-to-br from-white/[0.04] to-transparent border border-white/10 hover:border-amber-500/40 transition-all cursor-pointer group"
              onClick={() => {
                const savage = collaborators.find(c => c.collaborator === "21 Savage")
                if (savage) setSelectedCollab(savage)
              }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="text-2xl text-white group-hover:text-amber-500 transition-colors" style={{ fontFamily: "'Bebas Neue', sans-serif" }}>
                  21 Savage
                </div>
                <div className="px-2 py-1 rounded-lg bg-amber-500/20 text-amber-500 text-xs" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  17 songs
                </div>
              </div>
              <div className="text-sm text-white/50 mb-4" style={{ fontFamily: "'Outfit', sans-serif" }}>
                Her Loss dominated 2022. 8 top 10 hits together. The cold-blooded duo.
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs text-amber-500" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Best: "Jimmy Cooks" (#1)
                </div>
                <div className="text-xs text-white/30" style={{ fontFamily: "'Outfit', sans-serif" }}>
                  Click to explore →
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* #1 Hit collaborators grid */}
        <div className={`mb-16 transition-all duration-700 delay-600 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] w-12 bg-amber-500/50" />
            <span 
              className="text-xs tracking-[0.3em] text-amber-500/70 uppercase"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              Artists Who Helped Drake Hit #1
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {collabsWithNumberOne.map((collab) => {
              const numberOneSong = collab.songs.find((s) => s.peak_pos === 1)
              return (
                <div
                  key={collab.collaborator}
                  className="p-4 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5 border border-amber-500/30 text-center group hover:scale-105 transition-transform cursor-pointer"
                  onClick={() => setSelectedCollab(collab)}
                >
                  <div 
                    className="text-lg text-white mb-1 truncate"
                    style={{ fontFamily: "'Bebas Neue', sans-serif" }}
                  >
                    {collab.collaborator}
                  </div>
                  <div 
                    className="text-xs text-amber-500/70 truncate"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    {numberOneSong?.title}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Bottom nav */}
        <div className={`mt-20 flex items-center gap-6 transition-all duration-700 delay-700 ${isVisible ? "opacity-100" : "opacity-0"}`}>
          <div className="h-[1px] flex-1 bg-gradient-to-r from-amber-500/30 to-transparent" />
          <span 
            className="text-xs tracking-[0.3em] text-white/30 uppercase"
            style={{ fontFamily: "'Outfit', sans-serif" }}
          >
            Next: Longevity
          </span>
          <svg className="w-4 h-4 text-white/30 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
          </svg>
        </div>
      </div>
    </div>
  )
}