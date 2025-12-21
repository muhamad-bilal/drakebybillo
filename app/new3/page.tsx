"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { CustomCursor } from "@/components/custom-cursor"

interface WeeklyData {
  week_date: string | number | null
  rank: number
  song_title: string
  artist_name: string
  peak_rank: number
}

interface SongLifecycle {
  song: string
  artist: string
  startWeek: number
  endWeek: number
  duration: number
  peakRank: number
  peakRankBand: string
}

export default function New3Page() {
  const [data, setData] = useState<WeeklyData[]>([])
  const [loading, setLoading] = useState(true)
  const [lifecycleData, setLifecycleData] = useState<SongLifecycle[]>([])

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

        // Calculate lifecycle for each song
        const songMap = new Map<string, { weeks: number[]; peakRank: number; artist: string }>()
        processed.forEach((item) => {
          if (item.week_date && typeof item.week_date === "number") {
            const key = item.song_title
            if (!songMap.has(key)) {
              songMap.set(key, { weeks: [], peakRank: 50, artist: item.artist_name })
            }
            const existing = songMap.get(key)!
            existing.weeks.push(item.week_date)
            existing.peakRank = Math.min(existing.peakRank, item.peak_rank)
          }
        })

        const lifecycles: SongLifecycle[] = Array.from(songMap.entries())
          .map(([song, data]) => {
            const sortedWeeks = data.weeks.sort((a, b) => a - b)
            const startWeek = sortedWeeks[0]
            const endWeek = sortedWeeks[sortedWeeks.length - 1]
            const duration = sortedWeeks.length

            let peakRankBand = "31-50"
            if (data.peakRank <= 5) peakRankBand = "1-5"
            else if (data.peakRank <= 10) peakRankBand = "6-10"
            else if (data.peakRank <= 20) peakRankBand = "11-20"
            else if (data.peakRank <= 30) peakRankBand = "21-30"

            return {
              song,
              artist: data.artist,
              startWeek,
              endWeek,
              duration,
              peakRank: data.peakRank,
              peakRankBand,
            }
          })
          .sort((a, b) => a.startWeek - b.startWeek)
          .slice(0, 50) // Show top 50 by start date

        setLifecycleData(lifecycles)
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

  const chartData = lifecycleData.map((item, idx) => ({
    song: item.song,
    artist: item.artist,
    start: item.startWeek,
    duration: item.duration,
    peakRank: item.peakRank,
    peakRankBand: item.peakRankBand,
    index: idx,
  })).filter((item) => item.duration > 0)

  const getColor = (band: string): string => {
    switch (band) {
      case "1-5":
        return "#4ecdc4"
      case "6-10":
        return "#1275d8"
      case "11-20":
        return "#95e1d3"
      case "21-30":
        return "#f38181"
      default:
        return "#ff6b6b"
    }
  }

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", { month: "short", day: "numeric" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <CustomCursor />
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          Entry–Exit Timeline (Lifecycle View)
        </h1>
        <p className="mb-8 text-lg text-foreground/70">
          Each bar represents a song's chart life. Color indicates peak rank band. Shows entry → peak → exit.
        </p>

        {/* Chart */}
        {chartData.length === 0 ? (
          <div className="mb-8 rounded-lg border border-foreground/20 bg-foreground/5 p-6 backdrop-blur-sm">
            <p className="text-center text-foreground/70">No data available. Please check if the JSON file is loaded correctly.</p>
          </div>
        ) : (
          <div className="mb-8 rounded-lg border border-foreground/20 bg-foreground/5 p-6 backdrop-blur-sm">
          <ResponsiveContainer width="100%" height={Math.max(600, chartData.length * 15)}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 250, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                type="number"
                dataKey="duration"
                name="Duration"
                tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 10 }}
                label={{
                  value: "Weeks on Chart",
                  position: "insideBottom",
                  offset: -5,
                  fill: "rgba(255,255,255,0.7)",
                }}
                stroke="rgba(255,255,255,0.7)"
                domain={[0, "dataMax"]}
              />
              <YAxis
                type="category"
                dataKey="song"
                width={240}
                tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 10 }}
                stroke="rgba(255,255,255,0.7)"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.9)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: any, name: string, props: any) => {
                  if (name === "duration") {
                    return [value, "Weeks on Chart"]
                  }
                  if (name === "start") {
                    return [formatDate(value), "Start Week"]
                  }
                  if (name === "peakRank") {
                    return [value, "Peak Rank"]
                  }
                  return [value, name]
                }}
                labelFormatter={(label) => {
                  const item = chartData.find((d) => d.song === label)
                  if (item) {
                    return `${item.song} - ${item.artist} (Started: ${formatDate(item.start)})`
                  }
                  return label
                }}
              />
              <Legend wrapperStyle={{ color: "rgba(255,255,255,0.7)" }} />
              <Bar
                dataKey="duration"
                radius={[0, 4, 4, 0]}
              >
                {chartData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={getColor(entry.peakRankBand)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        )}

        {/* Legend */}
        <div className="mb-8 rounded-lg border border-foreground/20 bg-foreground/5 p-4">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Peak Rank Band</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded" style={{ backgroundColor: "#4ecdc4" }} />
              <span className="text-sm text-foreground/70">Peak Rank 1-5</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded" style={{ backgroundColor: "#1275d8" }} />
              <span className="text-sm text-foreground/70">Peak Rank 6-10</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded" style={{ backgroundColor: "#95e1d3" }} />
              <span className="text-sm text-foreground/70">Peak Rank 11-20</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded" style={{ backgroundColor: "#f38181" }} />
              <span className="text-sm text-foreground/70">Peak Rank 21-30</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded" style={{ backgroundColor: "#ff6b6b" }} />
              <span className="text-sm text-foreground/70">Peak Rank 31-50</span>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-8 rounded-lg border border-foreground/20 bg-foreground/5 p-4">
          <h3 className="mb-2 text-lg font-semibold text-foreground">Insights</h3>
          <ul className="space-y-1 text-sm text-foreground/70">
            <li>• Each bar represents a song's time on the chart</li>
            <li>• Bar length = duration (weeks on chart)</li>
            <li>• Color = peak rank band achieved</li>
            <li>• Songs are sorted by entry date (start week)</li>
            <li>• Showing {lifecycleData.length} songs</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

