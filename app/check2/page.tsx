"use client"

import { useState, useEffect } from "react"
import { ScatterChart, Scatter, XAxis, YAxis, ZAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { CustomCursor } from "@/components/custom-cursor"

interface TrackData {
  Track: string
  Artist: string
  "Spotify Streams": number | null
  "YouTube Views": number | null
  "TikTok Views": number | null
  "TikTok Posts": number | null
  "Explicit Track": number
}

const COLORS = ["#1275d8", "#e19136", "#ff6b6b", "#4ecdc4", "#95e1d3", "#f38181", "#aa96da", "#fcbad3"]

export default function Check2Page() {
  const [data, setData] = useState<TrackData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMetric, setSelectedMetric] = useState<"TikTok Views" | "TikTok Posts">("TikTok Views")

  useEffect(() => {
    // Load data from JSON file
    fetch("/data/most_streamed_2024.json")
      .then((res) => res.json())
      .then((jsonData: TrackData[]) => {
        // Filter out tracks with missing data and take top 100 for performance
        const filtered = jsonData
          .filter(
            (item) =>
              item["Spotify Streams"] &&
              item["YouTube Views"] &&
              item[selectedMetric] &&
              item["Spotify Streams"] > 0 &&
              item["YouTube Views"] > 0 &&
              item[selectedMetric] > 0
          )
          .slice(0, 100)
        
        setData(filtered)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error loading data:", err)
        setLoading(false)
      })
  }, [selectedMetric])

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
    spotify: item["Spotify Streams"] || 0,
    youtube: item["YouTube Views"] || 0,
    tiktokMetric: item[selectedMetric] || 0,
    explicit: item["Explicit Track"] === 1,
    // Normalize TikTok metric for bubble size (scale to reasonable range)
    tiktokSize: Math.log10((item[selectedMetric] || 0) + 1) * 10,
  }))

  // Group by explicit flag for coloring
  const explicitData = chartData.filter((d) => d.explicit)
  const cleanData = chartData.filter((d) => !d.explicit)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <CustomCursor />
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          Cross-Platform Gravity
        </h1>
        <p className="mb-8 text-lg text-foreground/70">
          Spotify Streams vs YouTube Views, with TikTok engagement as bubble size
        </p>

        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setSelectedMetric("TikTok Views")}
            className={`rounded-lg px-4 py-2 transition-colors ${
              selectedMetric === "TikTok Views"
                ? "bg-foreground/20 text-foreground"
                : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
            }`}
          >
            TikTok Views
          </button>
          <button
            onClick={() => setSelectedMetric("TikTok Posts")}
            className={`rounded-lg px-4 py-2 transition-colors ${
              selectedMetric === "TikTok Posts"
                ? "bg-foreground/20 text-foreground"
                : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
            }`}
          >
            TikTok Posts
          </button>
        </div>

        <div className="mb-8 rounded-lg border border-foreground/20 bg-foreground/5 p-6 backdrop-blur-sm">
          <ResponsiveContainer width="100%" height={700}>
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 60, left: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                type="number"
                dataKey="spotify"
                name="Spotify Streams"
                label={{
                  value: "Spotify Streams",
                  position: "insideBottom",
                  offset: -5,
                  fill: "rgba(255,255,255,0.7)",
                }}
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: "rgba(255,255,255,0.7)" }}
                scale="log"
                domain={["auto", "auto"]}
              />
              <YAxis
                type="number"
                dataKey="youtube"
                name="YouTube Views"
                label={{
                  value: "YouTube Views",
                  angle: -90,
                  position: "insideLeft",
                  fill: "rgba(255,255,255,0.7)",
                }}
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: "rgba(255,255,255,0.7)" }}
                scale="log"
                domain={["auto", "auto"]}
              />
              <ZAxis
                type="number"
                dataKey="tiktokSize"
                range={[50, 500]}
                name={selectedMetric}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.9)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: any, name: string, props: any) => {
                  if (name === "spotify") {
                    return [value.toLocaleString(), "Spotify Streams"]
                  }
                  if (name === "youtube") {
                    return [value.toLocaleString(), "YouTube Views"]
                  }
                  if (name === selectedMetric.toLowerCase().replace(" ", "")) {
                    return [props.payload.tiktokMetric.toLocaleString(), selectedMetric]
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
                fill="#1275d8"
                fillOpacity={0.6}
              />
              <Scatter
                name="Explicit"
                data={explicitData}
                fill="#e19136"
                fillOpacity={0.6}
              />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-8 rounded-lg border border-foreground/20 bg-foreground/5 p-4">
          <h3 className="mb-2 text-lg font-semibold text-foreground">Insights</h3>
          <ul className="space-y-1 text-sm text-foreground/70">
            <li>• Bubble size represents {selectedMetric}</li>
            <li>• X-axis (log scale): Spotify Streams</li>
            <li>• Y-axis (log scale): YouTube Views</li>
            <li>• Blue = Clean tracks, Orange = Explicit tracks</li>
            <li>• Showing top 100 tracks with complete data</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

