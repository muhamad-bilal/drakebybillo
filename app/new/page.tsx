"use client"

import { useState, useEffect, useMemo } from "react"
import { ResponsiveBump } from "@nivo/bump"
import { CustomCursor } from "@/components/custom-cursor"

interface WeeklyData {
  week_date: string | number | null
  rank: number
  song_title: string
  artist_name: string
  weeks_on_chart: number
  peak_rank: number
  previous_week_rank: number | null
}

interface BumpDataPoint {
  x: string
  y: number
}

interface BumpSeries {
  id: string
  data: BumpDataPoint[]
  [key: string]: any // Allow index signature for Nivo compatibility
}

type FilterType = "top5" | "top1-10" | "top11-20" | "top21-30" | "top31-40" | "top41-50" | "all" | "custom"

export default function NewPage() {
  const [data, setData] = useState<WeeklyData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSongs, setSelectedSongs] = useState<string[]>([])
  const [filterType, setFilterType] = useState<FilterType>("top5")
  const [customSelectedSong, setCustomSelectedSong] = useState<string>("")

  useEffect(() => {
    fetch("/data/billboard_weekly_top50.json")
      .then((res) => res.json())
      .then((jsonData: WeeklyData[]) => {
        // Parse dates - handle both string and number timestamps
        const processed = jsonData.map((item) => {
          let weekDate: number | null = null
          if (item.week_date) {
            if (typeof item.week_date === "string") {
              const parsed = new Date(item.week_date).getTime()
              weekDate = isNaN(parsed) ? null : parsed
            } else if (typeof item.week_date === "number") {
              weekDate = item.week_date
            }
          }
          return {
            ...item,
            week_date: weekDate,
          }
        }).filter((item) => item.week_date !== null)
        setData(processed)
        
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error loading data:", err)
        setLoading(false)
      })
  }, [])

  // Get unique songs with their peak ranks (memoized) - MUST be before early return
  const sortedSongs = useMemo(() => {
    if (data.length === 0) return []
    
    const songStats = data.reduce((acc, item) => {
      if (!acc[item.song_title]) {
        acc[item.song_title] = {
          song: item.song_title,
          artist: item.artist_name,
          peakRank: item.peak_rank,
          avgRank: item.rank,
          count: 1,
        }
      } else {
        acc[item.song_title].avgRank += item.rank
        acc[item.song_title].count += 1
        if (item.peak_rank < acc[item.song_title].peakRank) {
          acc[item.song_title].peakRank = item.peak_rank
        }
      }
      return acc
    }, {} as Record<string, { song: string; artist: string; peakRank: number; avgRank: number; count: number }>)

    // Calculate average rank for each song
    const songsWithStats = Object.values(songStats).map((stat) => ({
      ...stat,
      avgRank: Math.round(stat.avgRank / stat.count),
    }))

    // Sort by peak rank (best first)
    return songsWithStats.sort((a, b) => a.peakRank - b.peakRank)
  }, [data])

  // Filter songs based on selected filter type - MUST be before early return
  useEffect(() => {
    if (sortedSongs.length === 0) return
    
    if (filterType === "top5") {
      const top5 = sortedSongs
        .filter((s) => s.peakRank >= 1 && s.peakRank <= 5)
        .slice(0, 5)
        .map((s) => s.song)
      setSelectedSongs(top5)
    } else if (filterType === "top1-10") {
      const top10 = sortedSongs
        .filter((s) => s.peakRank >= 1 && s.peakRank <= 10)
        .slice(0, 10)
        .map((s) => s.song)
      setSelectedSongs(top10)
    } else if (filterType === "top11-20") {
      const top11to20 = sortedSongs
        .filter((s) => s.peakRank >= 11 && s.peakRank <= 20)
        .slice(0, 10)
        .map((s) => s.song)
      setSelectedSongs(top11to20)
    } else if (filterType === "top21-30") {
      const top21to30 = sortedSongs
        .filter((s) => s.peakRank >= 21 && s.peakRank <= 30)
        .slice(0, 10)
        .map((s) => s.song)
      setSelectedSongs(top21to30)
    } else if (filterType === "top31-40") {
      const top31to40 = sortedSongs
        .filter((s) => s.peakRank >= 31 && s.peakRank <= 40)
        .slice(0, 10)
        .map((s) => s.song)
      setSelectedSongs(top31to40)
    } else if (filterType === "top41-50") {
      const top41to50 = sortedSongs
        .filter((s) => s.peakRank >= 41 && s.peakRank <= 50)
        .map((s) => s.song)
      setSelectedSongs(top41to50)
    } else if (filterType === "all") {
      // Show all songs
      setSelectedSongs(sortedSongs.map((s) => s.song))
    } else if (filterType === "custom" && customSelectedSong) {
      setSelectedSongs([customSelectedSong])
    } else {
      setSelectedSongs([])
    }
  }, [filterType, customSelectedSong, sortedSongs])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <CustomCursor />
        <p className="text-foreground">Loading data...</p>
      </div>
    )
  }

  // Prepare data for Nivo bump chart
  const weeks = Array.from(new Set(data.map((item) => item.week_date)))
    .filter((w): w is number => typeof w === 'number')
    .sort((a, b) => a - b)
  
  // First, calculate final ranks to detect overlaps
  // Use the last week from the weeks array to get the final rank for each song
  const lastWeek = weeks.length > 0 ? weeks[weeks.length - 1] : null
  const finalRanksMap = new Map<string, number>()
  
  selectedSongs.forEach((song) => {
    if (lastWeek !== null) {
      // Find the entry for this song in the last week
      const lastEntry = data.find((d) => d.song_title === song && d.week_date === lastWeek)
      if (lastEntry) {
        finalRanksMap.set(song, lastEntry.rank)
      } else {
        // If song doesn't appear in last week, find its most recent appearance
        const songEntries = data
          .filter((d) => d.song_title === song && d.week_date !== null)
          .sort((a, b) => {
            const aTime = typeof a.week_date === "number" ? a.week_date : 0
            const bTime = typeof b.week_date === "number" ? b.week_date : 0
            return bTime - aTime // Sort descending to get most recent first
          })
        if (songEntries.length > 0) {
          finalRanksMap.set(song, songEntries[0].rank)
        }
      }
    }
  })

  // Group songs by final rank and create offset map
  const rankGroups = new Map<number, string[]>()
  finalRanksMap.forEach((rank, song) => {
    if (!rankGroups.has(rank)) {
      rankGroups.set(rank, [])
    }
    rankGroups.get(rank)!.push(song)
  })

  // Create offset map for songs with same final rank (add tiny offsets to separate labels)
  const rankOffsets = new Map<string, number>()
  rankGroups.forEach((songs, rank) => {
    if (songs.length > 1) {
      // Multiple songs at same rank - add tiny fractional offsets
      // Use larger offset for better separation (0.2 rank units)
      songs.forEach((song, index) => {
        const offset = (index - (songs.length - 1) / 2) * 0.2
        rankOffsets.set(song, offset)
      })
    }
  })

  const bumpData: BumpSeries[] = selectedSongs.map((song) => {
    const songData: BumpDataPoint[] = weeks
      .map((week) => {
        const entry = data.find((d) => d.song_title === song && d.week_date === week)
        if (!entry) return null
        const baseRank = entry.rank
        // Apply offset only to the last data point if this song has an offset
        const isLastPoint = week === weeks[weeks.length - 1]
        const offset = isLastPoint ? (rankOffsets.get(song) || 0) : 0
        return {
          x: new Date(week).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
          y: baseRank + offset,
        }
      })
      .filter((point): point is BumpDataPoint => point !== null)
    
    return {
      id: song,
      data: songData,
    }
  })


  // Expanded color palette for more songs
  const COLORS = [
    "#1275d8", "#e19136", "#ff6b6b", "#4ecdc4", "#95e1d3", "#f38181", "#aa96da", "#fcbad3",
    "#a8e6cf", "#ffd3a5", "#fd79a8", "#6c5ce7", "#00b894", "#fdcb6e", "#e17055", "#74b9ff",
    "#55efc4", "#81ecec", "#fab1a0", "#ff7675", "#fd79a8", "#fdcb6e", "#e17055", "#a29bfe",
    "#dfe6e9", "#b2bec3", "#636e72", "#2d3436", "#00cec9", "#6c5ce7", "#a29bfe", "#fd79a8"
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <CustomCursor />
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          Interactive Rank Timeline (Bump Chart)
        </h1>
        <p className="mb-8 text-lg text-foreground/70">
          Track how songs move up and down the Billboard Hot 100 Top 50 over time
        </p>

        {/* Filter Dropdown */}
        <div className="mb-6 flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-foreground/70">
              Filter by Rank Range:
            </label>
            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value as FilterType)
                if (e.target.value !== "custom") {
                  setCustomSelectedSong("")
                }
              }}
              className="rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 text-foreground focus:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20"
            >
              <option value="top5">Top 5</option>
              <option value="top1-10">Top 1-10</option>
              <option value="top11-20">Top 11-20</option>
              <option value="top21-30">Top 21-30</option>
              <option value="top31-40">Top 31-40</option>
              <option value="top41-50">Top 41-50</option>
              <option value="all">All Songs</option>
              <option value="custom">Select Individual Song</option>
            </select>
            {filterType === "custom" && (
              <select
                value={customSelectedSong}
                onChange={(e) => setCustomSelectedSong(e.target.value)}
                className="rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 text-foreground focus:border-foreground/40 focus:outline-none focus:ring-2 focus:ring-foreground/20 min-w-[300px]"
              >
                <option value="">-- Select a song --</option>
                {sortedSongs.map((song) => (
                  <option key={song.song} value={song.song}>
                    {song.song} - {song.artist} (Peak: #{song.peakRank})
                  </option>
                ))}
              </select>
            )}
          </div>
          <div className="text-sm text-foreground/60">
            Showing {selectedSongs.length} {selectedSongs.length === 1 ? "song" : "songs"}
            {filterType !== "custom" && filterType !== "all" && (
              <span className="ml-2">
                (based on peak rank{" "}
                {filterType === "top5"
                  ? "1-5"
                  : filterType === "top1-10"
                  ? "1-10"
                  : filterType === "top11-20"
                  ? "11-20"
                  : filterType === "top21-30"
                  ? "21-30"
                  : filterType === "top31-40"
                  ? "31-40"
                  : "41-50"}
                )
              </span>
            )}
          </div>
        </div>

        {/* Chart */}
        <div className="mb-8 rounded-lg border border-foreground/20 bg-foreground/5 p-6 backdrop-blur-sm">
          <div style={{ height: "600px", width: "100%" }}>
            {/* @ts-expect-error - Nivo ResponsiveBump has React 18 type compatibility issues */}
            <ResponsiveBump
              data={bumpData as any}
              colors={COLORS}
              lineWidth={3}
              activeLineWidth={6}
              inactiveLineWidth={2}
              inactiveOpacity={0.15}
              pointSize={8}
              activePointSize={12}
              inactivePointSize={4}
              pointColor={{ theme: "background" }}
              pointBorderWidth={2}
              activePointBorderWidth={3}
              pointBorderColor={{ from: "serie.color" }}
              axisTop={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: "Week",
                legendPosition: "middle",
                legendOffset: 50,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Rank (1 = Best)",
                legendPosition: "middle",
                legendOffset: -60,
              }}
              margin={{ top: 40, right: 100, bottom: 80, left: 80 }}
              axisRight={null}
              endLabel={true}
              endLabelPadding={12}
              endLabelTextColor={{ from: "color", modifiers: [["darker", 1]] }}
              startLabel={false}
              theme={{
                background: "transparent",
                text: {
                  fontSize: 12,
                  fill: "rgba(255,255,255,0.7)",
                  fontFamily: "inherit",
                },
                axis: {
                  domain: {
                    line: {
                      stroke: "rgba(255,255,255,0.2)",
                      strokeWidth: 1,
                    },
                  },
                  legend: {
                    text: {
                      fontSize: 13,
                      fill: "rgba(255,255,255,0.7)",
                      fontFamily: "inherit",
                    },
                  },
                  ticks: {
                    line: {
                      stroke: "rgba(255,255,255,0.2)",
                      strokeWidth: 1,
                    },
                    text: {
                      fontSize: 11,
                      fill: "rgba(255,255,255,0.7)",
                      fontFamily: "inherit",
                    },
                  },
                },
                grid: {
                  line: {
                    stroke: "rgba(255,255,255,0.1)",
                    strokeWidth: 1,
                  },
                },
                tooltip: {
                  container: {
                    background: "rgba(0,0,0,0.9)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    color: "#fff",
                    padding: "8px 12px",
                  },
                },
              }}
            />
          </div>
        </div>

        {/* Insights */}
        <div className="mt-8 rounded-lg border border-foreground/20 bg-foreground/5 p-4">
          <h3 className="mb-2 text-lg font-semibold text-foreground">Insights</h3>
          <ul className="space-y-1 text-sm text-foreground/70">
            <li>• Y-axis shows rank (1 at top, 50 at bottom)</li>
            <li>• Each line represents a song's rank over time</li>
            <li>• Lines that cross indicate rank changes between songs</li>
            <li>• Steep curves = rapid chart movement, flat lines = stable position</li>
            <li>• Hover over lines to highlight individual songs</li>
            <li>• Showing {weeks.length} weeks of data</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

