"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Area, AreaChart } from "recharts"
import { CustomCursor } from "@/components/custom-cursor"

interface TrackData {
  Track: string
  Artist: string
  "All Time Rank": number | null
  "Spotify Streams": number | null
  "Track Score": number | null
}

export default function Check5Page() {
  const [data, setData] = useState<TrackData[]>([])
  const [loading, setLoading] = useState(true)
  const [yAxisMetric, setYAxisMetric] = useState<"Spotify Streams" | "Track Score">("Spotify Streams")

  useEffect(() => {
    // Load data from JSON file
    fetch("/data/most_streamed_2024.json")
      .then((res) => res.json())
      .then((jsonData: TrackData[]) => {
        // Filter out tracks with missing data and ensure numeric values
        const filtered = jsonData
          .filter((item) => {
            const rank = item["All Time Rank"]
            const value = item[yAxisMetric]
            return (
              rank !== null &&
              rank !== undefined &&
              value !== null &&
              value !== undefined &&
              !isNaN(Number(rank)) &&
              !isNaN(Number(value)) &&
              Number(rank) > 0 &&
              Number(value) > 0
            )
          })
          .map((item) => ({
            ...item,
            "All Time Rank": Number(item["All Time Rank"]),
            [yAxisMetric]: Number(item[yAxisMetric]),
          }))
        
        // Sort by rank
        const sorted = filtered.sort((a, b) => (a["All Time Rank"] || 0) - (b["All Time Rank"] || 0))
        
        setData(sorted)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error loading data:", err)
        setLoading(false)
      })
  }, [yAxisMetric])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <CustomCursor />
        <p className="text-foreground">Loading data...</p>
      </div>
    )
  }

  // Prepare data for chart - show power law distribution
  const chartData = data
    .map((item) => {
      const rank = Number(item["All Time Rank"])
      const value = Number(item[yAxisMetric])
      // Ensure we have valid numbers
      if (isNaN(rank) || isNaN(value) || rank <= 0 || value <= 0) {
        return null
      }
      return {
        rank,
        value,
        track: item.Track,
        artist: item.Artist,
      }
    })
    .filter((item): item is { rank: number; value: number; track: string; artist: string } => item !== null)

  // For better visualization, we can show top 1000 or use log scale
  const displayData = chartData.slice(0, 500) // Show top 500 for performance

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <CustomCursor />
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          The Long Tail of Popularity
        </h1>
        <p className="mb-8 text-lg text-foreground/70">
          How does popularity distribute across ranked tracks? A few mega-hits dominate, while most tracks get much less attention.
        </p>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex gap-2">
            <label className="flex items-center gap-2 text-sm text-foreground/70">
              Y-Axis:
            </label>
            <button
              onClick={() => setYAxisMetric("Spotify Streams")}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                yAxisMetric === "Spotify Streams"
                  ? "bg-foreground/20 text-foreground"
                  : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
              }`}
            >
              Spotify Streams
            </button>
            <button
              onClick={() => setYAxisMetric("Track Score")}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                yAxisMetric === "Track Score"
                  ? "bg-foreground/20 text-foreground"
                  : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
              }`}
            >
              Track Score
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-8 rounded-lg border border-foreground/20 bg-foreground/5 p-6 backdrop-blur-sm">
          <ResponsiveContainer width="100%" height={600}>
            <AreaChart
              data={displayData}
              margin={{ top: 20, right: 30, left: 80, bottom: 60 }}
            >
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1275d8" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#1275d8" stopOpacity={0.1} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                dataKey="rank"
                name="Rank"
                type="number"
                label={{
                  value: "All Time Rank",
                  position: "insideBottom",
                  offset: -5,
                  fill: "rgba(255,255,255,0.7)",
                }}
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: "rgba(255,255,255,0.7)" }}
                scale="log"
                domain={[1, "dataMax"]}
                allowDataOverflow={false}
              />
              <YAxis
                dataKey="value"
                name={yAxisMetric}
                type="number"
                label={{
                  value: yAxisMetric,
                  angle: -90,
                  position: "insideLeft",
                  fill: "rgba(255,255,255,0.7)",
                }}
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: "rgba(255,255,255,0.7)" }}
                scale="log"
                domain={["dataMin", "dataMax"]}
                allowDataOverflow={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.9)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: any, name: string, props: any) => {
                  if (name === yAxisMetric.toLowerCase().replace(" ", "")) {
                    return [
                      typeof value === "number" ? value.toLocaleString() : value,
                      yAxisMetric,
                    ]
                  }
                  return [value, name]
                }}
                labelFormatter={(label) => {
                  const item = displayData.find((d) => d.rank === label)
                  return item ? `Rank ${item.rank}: ${item.track} - ${item.artist}` : `Rank ${label}`
                }}
              />
              <Legend wrapperStyle={{ color: "rgba(255,255,255,0.7)" }} />
              <Area
                type="monotone"
                dataKey="value"
                stroke="#1275d8"
                fillOpacity={1}
                fill="url(#colorValue)"
                name={yAxisMetric}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        <div className="mt-8 rounded-lg border border-foreground/20 bg-foreground/5 p-4">
          <h3 className="mb-2 text-lg font-semibold text-foreground">Insights</h3>
          <ul className="space-y-1 text-sm text-foreground/70">
            <li>• X-axis: All Time Rank (log scale, rank 1 is the most popular)</li>
            <li>• Y-axis: {yAxisMetric} (log scale)</li>
            <li>• The steep drop-off shows the "power law" distribution - a few tracks dominate</li>
            <li>• Most tracks (right side) have much lower values than the top hits</li>
            <li>• This demonstrates the "long tail" phenomenon in music streaming</li>
            <li>• Showing top 500 tracks (out of {data.length} total with data)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

