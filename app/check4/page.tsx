"use client"

import { useState, useEffect } from "react"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { CustomCursor } from "@/components/custom-cursor"

interface TrackData {
  Track: string
  Artist: string
  "Release Date": string | null
  "Track Score": number | null
  "Spotify Streams": number | null
  "Explicit Track": number
  releaseDate?: number | null
}

const COLORS = {
  explicit: "#e19136",
  clean: "#1275d8",
}

export default function Check4Page() {
  const [data, setData] = useState<TrackData[]>([])
  const [loading, setLoading] = useState(true)
  const [yAxisMetric, setYAxisMetric] = useState<"Track Score" | "Spotify Streams">("Track Score")
  const [colorBy, setColorBy] = useState<"explicit" | "artist">("explicit")

  useEffect(() => {
    // Load data from JSON file
    fetch("/data/most_streamed_2024.json")
      .then((res) => res.json())
      .then((jsonData: TrackData[]) => {
        // Filter out tracks with missing data
        const filtered = jsonData.filter(
          (item) =>
            item["Release Date"] &&
            item[yAxisMetric] &&
            item["Release Date"] !== null &&
            item[yAxisMetric] !== null &&
            item[yAxisMetric] > 0
        )
        
        // Parse dates and sort
        const processed = filtered.map((item) => ({
          ...item,
          releaseDate: item["Release Date"] ? new Date(item["Release Date"]).getTime() : undefined,
        }))
        
        setData(processed)
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

  // Prepare data for scatter chart
  const chartData = data.map((item) => ({
    name: item.Track,
    artist: item.Artist,
    releaseDate: item.releaseDate || 0,
    releaseDateStr: item["Release Date"],
    value: item[yAxisMetric] || 0,
    explicit: item["Explicit Track"] === 1,
    color: item["Explicit Track"] === 1 ? COLORS.explicit : COLORS.clean,
  }))

  // Group by explicit/clean for legend
  const explicitData = chartData.filter((d) => d.explicit)
  const cleanData = chartData.filter((d) => !d.explicit)

  // Format date for display
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <CustomCursor />
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          Release Timing vs Impact
        </h1>
        <p className="mb-8 text-lg text-foreground/70">
          How does release date relate to track success? Are newer songs catching up with long-standing hits?
        </p>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex gap-2">
            <label className="flex items-center gap-2 text-sm text-foreground/70">
              Y-Axis:
            </label>
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
          </div>
        </div>

        {/* Chart */}
        <div className="mb-8 rounded-lg border border-foreground/20 bg-foreground/5 p-6 backdrop-blur-sm">
          <ResponsiveContainer width="100%" height={600}>
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 60, left: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                type="number"
                dataKey="releaseDate"
                name="Release Date"
                label={{
                  value: "Release Date",
                  position: "insideBottom",
                  offset: -5,
                  fill: "rgba(255,255,255,0.7)",
                }}
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 11 }}
                tickFormatter={(value) => {
                  const date = new Date(value)
                  return date.getFullYear().toString()
                }}
                domain={["dataMin", "dataMax"]}
              />
              <YAxis
                type="number"
                dataKey="value"
                name={yAxisMetric}
                label={{
                  value: yAxisMetric,
                  angle: -90,
                  position: "insideLeft",
                  fill: "rgba(255,255,255,0.7)",
                }}
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: "rgba(255,255,255,0.7)" }}
                scale="log"
                domain={["auto", "auto"]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.9)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: any, name: string, props: any) => {
                  if (name === "releaseDate") {
                    return [formatDate(props.payload.releaseDate), "Release Date"]
                  }
                  if (name === yAxisMetric.toLowerCase().replace(" ", "")) {
                    return [
                      typeof value === "number" ? value.toLocaleString() : value,
                      yAxisMetric,
                    ]
                  }
                  return [value, name]
                }}
                labelFormatter={(label) => {
                  const item = chartData.find((d) => d.name === label)
                  return item ? `${item.name} - ${item.artist}` : label
                }}
              />
              <Legend
                wrapperStyle={{ color: "rgba(255,255,255,0.7)" }}
              />
              <Scatter
                name="Clean"
                data={cleanData}
                fill={COLORS.clean}
                fillOpacity={0.6}
              />
              <Scatter
                name="Explicit"
                data={explicitData}
                fill={COLORS.explicit}
                fillOpacity={0.6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        <div className="mt-8 rounded-lg border border-foreground/20 bg-foreground/5 p-4">
          <h3 className="mb-2 text-lg font-semibold text-foreground">Insights</h3>
          <ul className="space-y-1 text-sm text-foreground/70">
            <li>• X-axis: Release Date (timeline from left to right)</li>
            <li>• Y-axis: {yAxisMetric} (log scale)</li>
            <li>• Blue = Clean tracks, Orange = Explicit tracks</li>
            <li>• Tracks in the top-right are recent hits with high success</li>
            <li>• Tracks in the top-left are older songs that remain popular</li>
            <li>• Showing {data.length} tracks with complete data</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

