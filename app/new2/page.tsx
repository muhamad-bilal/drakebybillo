"use client"

import { useState, useEffect } from "react"
import { ResponsiveHeatMap } from "@nivo/heatmap"
import { CustomCursor } from "@/components/custom-cursor"

interface WeeklyData {
  week_date: string | number | null
  rank: number
  song_title: string
  artist_name: string
}

interface YearEndData {
  yearend_rank: number
  song_title: string
  artist_name: string
  total_rank_score: number
  weeks_in_top_50: number
  best_rank: number
  average_rank: number
}

export default function New2Page() {
  const [data, setData] = useState<WeeklyData[]>([])
  const [loading, setLoading] = useState(true)
  const [top20Songs, setTop20Songs] = useState<string[]>([])

  useEffect(() => {
    // First, get top 20 songs from year-end data (same as new4)
    Promise.all([
      fetch("/data/billboard_yearend_top50.json").then((res) => res.json()),
      fetch("/data/billboard_weekly_top50.json").then((res) => res.json()),
    ])
      .then(([yearEndData, weeklyData]: [YearEndData[], WeeklyData[]]) => {
        // Get top 20 by year-end rank (same logic as new4)
        const sortedYearEnd = [...yearEndData].sort((a, b) => a.yearend_rank - b.yearend_rank)
        const top20 = sortedYearEnd.slice(0, 20).map((item) => item.song_title)
        setTop20Songs(top20)

        // Parse weekly data dates
        const processed = weeklyData.map((item) => {
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
        
        // Filter to only top 20 songs
        const filtered = processed.filter((item) => top20.includes(item.song_title))
        setData(filtered)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error loading data:", err)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <CustomCursor />
        <p className="text-foreground">Loading data...</p>
      </div>
    )
  }

  // Group weeks into months and calculate average rank per month
  const monthMap = new Map<string, number[]>() // month key -> array of week timestamps
  
  data.forEach((item) => {
    if (item.week_date && typeof item.week_date === "number") {
      const date = new Date(item.week_date)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`
      if (!monthMap.has(monthKey)) {
        monthMap.set(monthKey, [])
      }
      monthMap.get(monthKey)!.push(item.week_date)
    }
  })
  
  const months = Array.from(monthMap.keys()).sort()
  
  // Prepare data for Nivo heatmap
  const heatmapData = top20Songs.map((song) => {
    const monthData: Record<string, number | null> = {}
    months.forEach((monthKey) => {
      const weekTimestamps = monthMap.get(monthKey) || []
      const songRanksInMonth = weekTimestamps
        .map((week) => {
          const entry = data.find((d) => d.song_title === song && d.week_date === week)
          return entry ? entry.rank : null
        })
        .filter((rank): rank is number => rank !== null)
      
      if (songRanksInMonth.length > 0) {
        monthData[monthKey] = Math.round(songRanksInMonth.reduce((sum, r) => sum + r, 0) / songRanksInMonth.length)
      } else {
        monthData[monthKey] = null
      }
    })
    
    return {
      id: song,
      data: months.map((month) => ({
        x: month,
        y: monthData[month],
      })),
    }
  })

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split("-")
    const date = new Date(parseInt(year), parseInt(month) - 1, 1)
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <CustomCursor />
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          Monthly Heatmap (Song × Time)
        </h1>
        <p className="mb-8 text-lg text-foreground/70">
          Top 20 songs from year-end rankings. Color intensity = average rank per month. Weekly data aggregated to monthly averages.
        </p>

        {/* Heatmap */}
        <div className="mb-8 rounded-lg border border-foreground/20 bg-foreground/5 p-6 backdrop-blur-sm">
          <div style={{ height: "600px", width: "100%" }}>
            <ResponsiveHeatMap
              data={heatmapData as any}
              margin={{ top: 60, right: 90, bottom: 60, left: 200 }}
              valueFormat=">-.0f"
              axisTop={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: "",
                legendOffset: 46,
              }}
              axisRight={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Song",
                legendPosition: "middle",
                legendOffset: 70,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Song",
                legendPosition: "middle",
                legendOffset: -120,
              }}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: -45,
                legend: "Month",
                legendPosition: "middle",
                legendOffset: 46,
              }}
              colors={{
                type: "sequential",
                scheme: "blues",
                minValue: 1,
                maxValue: 50,
              }}
              emptyColor="rgba(255,255,255,0.05)"
              borderColor={{ from: "color", modifiers: [["darker", 0.3]] }}
              labelTextColor={{ from: "color", modifiers: [["darker", 1.8]] }}
              animate={true}
              motionConfig="gentle"
              hoverTarget="cell"
              theme={{
                background: "transparent",
                text: {
                  fontSize: 11,
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
              tooltip={({ cell }: any) => {
                if (!cell || cell.value === null) return null
                return (
                  <div
                    style={{
                      background: "rgba(0,0,0,0.9)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      color: "#fff",
                    }}
                  >
                    <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                      {cell.serieId}
                    </div>
                    <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "6px" }}>
                      {formatMonth(cell.data.x)}
                    </div>
                    <div style={{ fontSize: "11px", opacity: 0.7 }}>
                      Average Rank: {cell.value}
                    </div>
                  </div>
                )
              }}
            />
          </div>
        </div>

        {/* Legend */}
        <div className="mb-8 rounded-lg border border-foreground/20 bg-foreground/5 p-4">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Rank Color Legend</h3>
          <p className="mb-4 text-sm text-foreground/60">
            Color intensity represents average rank (darker blue = better rank, lighter = lower rank). 
            Shows top 20 songs from year-end rankings.
          </p>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded" style={{ backgroundColor: "rgba(255,255,255,0.05)" }} />
              <span className="text-sm text-foreground/70">Not in Top 50</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded" style={{ backgroundColor: "#1e3a8a" }} />
              <span className="text-sm text-foreground/70">Rank 1-10 (Best)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded" style={{ backgroundColor: "#3b82f6" }} />
              <span className="text-sm text-foreground/70">Rank 11-20</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded" style={{ backgroundColor: "#60a5fa" }} />
              <span className="text-sm text-foreground/70">Rank 21-30</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded" style={{ backgroundColor: "#93c5fd" }} />
              <span className="text-sm text-foreground/70">Rank 31-50</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

