"use client"

import { useState, useEffect } from "react"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { CustomCursor } from "@/components/custom-cursor"

interface WeeklyData {
  song_title: string
  artist_name: string
  weeks_on_chart: number
  peak_rank: number
  total_rank_score?: number
}

export default function New1Page() {
  const [data, setData] = useState<WeeklyData[]>([])
  const [loading, setLoading] = useState(true)
  const [dataSource, setDataSource] = useState<"weekly" | "yearend">("weekly")

  useEffect(() => {
    if (dataSource === "yearend") {
      fetch("/data/billboard_yearend_top50.json")
        .then((res) => res.json())
        .then((jsonData: any[]) => {
          const processed = jsonData.map((item) => ({
            song_title: item.song_title,
            artist_name: item.artist_name,
            weeks_on_chart: item.weeks_in_top_50 || 0,
            peak_rank: item.best_rank || 0,
            total_rank_score: item.total_rank_score || 0,
          }))
          setData(processed)
          setLoading(false)
        })
        .catch((err) => {
          console.error("Error loading data:", err)
          setLoading(false)
        })
    } else {
      fetch("/data/billboard_weekly_top50.json")
        .then((res) => res.json())
        .then((jsonData: any[]) => {
          // Aggregate by song
          const songMap = new Map<string, WeeklyData>()
          jsonData.forEach((item) => {
            const key = item.song_title
            if (!songMap.has(key)) {
              songMap.set(key, {
                song_title: item.song_title,
                artist_name: item.artist_name,
                weeks_on_chart: item.weeks_on_chart || 0,
                peak_rank: item.peak_rank || 50,
                total_rank_score: 0,
              })
            }
            const existing = songMap.get(key)!
            existing.total_rank_score = (existing.total_rank_score || 0) + (50 - (item.rank || 50))
          })
          setData(Array.from(songMap.values()))
          setLoading(false)
        })
        .catch((err) => {
          console.error("Error loading data:", err)
          setLoading(false)
        })
    }
  }, [dataSource])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <CustomCursor />
        <p className="text-foreground">Loading data...</p>
      </div>
    )
  }

  const chartData = data
    .filter((item) => item.weeks_on_chart > 0 && item.peak_rank > 0)
    .map((item) => ({
      song: item.song_title,
      artist: item.artist_name,
      weeks: item.weeks_on_chart,
      peakRank: item.peak_rank,
      totalScore: item.total_rank_score || 0,
      // Bubble size based on total rank score
      size: Math.max(50, Math.min(300, (item.total_rank_score || 0) / 10)),
    }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <CustomCursor />
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          Song Longevity vs Peak Rank
        </h1>
        <p className="mb-8 text-lg text-foreground/70">
          Reveals songs that lasted long vs short-term hits. Which songs had staying power?
        </p>

        {/* Data Source Toggle */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setDataSource("weekly")}
            className={`rounded-lg px-4 py-2 text-sm transition-colors ${
              dataSource === "weekly"
                ? "bg-foreground/20 text-foreground"
                : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
            }`}
          >
            Weekly Data (Aggregated)
          </button>
          <button
            onClick={() => setDataSource("yearend")}
            className={`rounded-lg px-4 py-2 text-sm transition-colors ${
              dataSource === "yearend"
                ? "bg-foreground/20 text-foreground"
                : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
            }`}
          >
            Year-End Top 50
          </button>
        </div>

        {/* Chart */}
        <div className="mb-8 rounded-lg border border-foreground/20 bg-foreground/5 p-6 backdrop-blur-sm">
          <ResponsiveContainer width="100%" height={600}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                type="number"
                dataKey="weeks"
                name="Weeks on Chart"
                label={{
                  value: "Weeks on Chart",
                  position: "insideBottom",
                  offset: -5,
                  fill: "rgba(255,255,255,0.7)",
                }}
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: "rgba(255,255,255,0.7)" }}
                domain={[0, "dataMax"]}
              />
              <YAxis
                type="number"
                dataKey="peakRank"
                name="Peak Rank"
                reversed
                domain={[1, 50]}
                label={{
                  value: "Peak Rank (1 = Best)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "rgba(255,255,255,0.7)",
                }}
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: "rgba(255,255,255,0.7)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.9)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: any, name: string, props: any) => {
                  if (name === "weeks") {
                    return [value, "Weeks on Chart"]
                  }
                  if (name === "peakRank") {
                    return [value, "Peak Rank"]
                  }
                  if (name === "totalScore") {
                    return [value.toLocaleString(), "Total Rank Score"]
                  }
                  return [value, name]
                }}
                labelFormatter={(label) => {
                  const item = chartData.find((d) => d.song === label)
                  return item ? `${item.song} - ${item.artist}` : label
                }}
              />
              <Scatter
                name="Songs"
                data={chartData}
                fill="#1275d8"
                fillOpacity={0.6}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill="#1275d8" />
                ))}
              </Scatter>
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        <div className="mt-8 rounded-lg border border-foreground/20 bg-foreground/5 p-4">
          <h3 className="mb-2 text-lg font-semibold text-foreground">Insights</h3>
          <ul className="space-y-1 text-sm text-foreground/70">
            <li>• X-axis: Weeks on Chart (longevity)</li>
            <li>• Y-axis: Peak Rank (1 = best, 50 = worst) - reversed scale</li>
            <li>• Bubble size represents total rank score (aggregate performance)</li>
            <li>• Top-left = short-lived but high-peaking hits</li>
            <li>• Top-right = long-lasting hits with high peaks</li>
            <li>• Bottom-right = long-lasting but lower-peaking songs</li>
            <li>• Showing {chartData.length} songs</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

