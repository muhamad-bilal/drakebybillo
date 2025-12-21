"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { CustomCursor } from "@/components/custom-cursor"

interface TrackData {
  Track: string
  Artist: string
  "Spotify Streams": number | null
  "YouTube Views": number | null
  "TikTok Views": number | null
  "Pandora Streams": number | null
  "Soundcloud Streams": number | null
  "Apple Music Playlist Count": number | null
  "Deezer Playlist Reach": number | null
}

const COLORS = ["#1275d8", "#e19136", "#ff6b6b", "#4ecdc4", "#95e1d3", "#f38181", "#aa96da"]

export default function Check3Page() {
  const [data, setData] = useState<TrackData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null)
  const [chartType, setChartType] = useState<"stacked" | "pie">("stacked")

  useEffect(() => {
    // Load data from JSON file
    fetch("/data/most_streamed_2024.json")
      .then((res) => res.json())
      .then((jsonData: TrackData[]) => {
        // Filter to tracks with at least some data across platforms
        const filtered = jsonData.filter(
          (item) =>
            (item["Spotify Streams"] && item["Spotify Streams"] > 0) ||
            (item["YouTube Views"] && item["YouTube Views"] > 0) ||
            (item["TikTok Views"] && item["TikTok Views"] > 0)
        )
        setData(filtered)
        if (filtered.length > 0 && !selectedTrack) {
          setSelectedTrack(filtered[0].Track)
        }
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

  const selectedTrackData = data.find((item) => item.Track === selectedTrack)

  if (!selectedTrackData) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <CustomCursor />
        <p className="text-foreground">No track selected</p>
      </div>
    )
  }

  // Calculate platform mix (normalize to percentages)
  const platformData = [
    {
      name: "Spotify",
      value: selectedTrackData["Spotify Streams"] || 0,
      raw: selectedTrackData["Spotify Streams"] || 0,
    },
    {
      name: "YouTube",
      value: selectedTrackData["YouTube Views"] || 0,
      raw: selectedTrackData["YouTube Views"] || 0,
    },
    {
      name: "TikTok",
      value: selectedTrackData["TikTok Views"] || 0,
      raw: selectedTrackData["TikTok Views"] || 0,
    },
    {
      name: "Pandora",
      value: selectedTrackData["Pandora Streams"] || 0,
      raw: selectedTrackData["Pandora Streams"] || 0,
    },
    {
      name: "Soundcloud",
      value: selectedTrackData["Soundcloud Streams"] || 0,
      raw: selectedTrackData["Soundcloud Streams"] || 0,
    },
  ].filter((item) => item.value > 0)

  // Calculate total for percentage
  const total = platformData.reduce((sum, item) => sum + item.value, 0)

  // Add percentage to each platform
  const platformDataWithPercent = platformData.map((item) => ({
    ...item,
    percentage: total > 0 ? ((item.value / total) * 100).toFixed(1) : "0",
  }))

  // For stacked bar, we'll show absolute values
  const stackedData = [
    {
      platform: "Platform Mix",
      ...platformDataWithPercent.reduce((acc, item, idx) => {
        acc[item.name] = item.value
        return acc
      }, {} as Record<string, number>),
    },
  ]

  // For pie chart
  const pieData = platformDataWithPercent.map((item, idx) => ({
    name: item.name,
    value: item.value,
    percentage: item.percentage,
    color: COLORS[idx % COLORS.length],
  }))

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <CustomCursor />
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          Platform DNA of a Hit
        </h1>
        <p className="mb-8 text-lg text-foreground/70">
          See how a track's success is distributed across different platforms
        </p>

        {/* Track Selector */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-foreground/70">
            Select Track:
          </label>
          <select
            value={selectedTrack || ""}
            onChange={(e) => setSelectedTrack(e.target.value)}
            className="w-full max-w-md rounded-lg border border-foreground/20 bg-foreground/10 px-4 py-2 text-foreground focus:border-foreground/40 focus:outline-none"
          >
            {data.slice(0, 50).map((item, index) => (
              <option key={`${item.Track}-${item.Artist}-${index}`} value={item.Track}>
                {item.Track} - {item.Artist}
              </option>
            ))}
          </select>
        </div>

        {/* Chart Type Toggle */}
        <div className="mb-6 flex gap-4">
          <button
            onClick={() => setChartType("stacked")}
            className={`rounded-lg px-4 py-2 transition-colors ${
              chartType === "stacked"
                ? "bg-foreground/20 text-foreground"
                : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
            }`}
          >
            Stacked Bar
          </button>
          <button
            onClick={() => setChartType("pie")}
            className={`rounded-lg px-4 py-2 transition-colors ${
              chartType === "pie"
                ? "bg-foreground/20 text-foreground"
                : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
            }`}
          >
            Pie Chart
          </button>
        </div>

        {/* Chart */}
        <div className="mb-8 rounded-lg border border-foreground/20 bg-foreground/5 p-6 backdrop-blur-sm">
          {chartType === "stacked" ? (
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={stackedData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis type="number" stroke="rgba(255,255,255,0.7)" tick={{ fill: "rgba(255,255,255,0.7)" }} />
                <YAxis
                  dataKey="platform"
                  type="category"
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
                  formatter={(value: any) => value.toLocaleString()}
                />
                <Legend wrapperStyle={{ color: "rgba(255,255,255,0.7)" }} />
                {platformDataWithPercent.map((item, idx) => (
                  <Bar
                    key={item.name}
                    dataKey={item.name}
                    stackId="a"
                    fill={COLORS[idx % COLORS.length]}
                    radius={idx === platformDataWithPercent.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <ResponsiveContainer width="100%" height={400}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percentage }) => `${name}: ${percentage}%`}
                  outerRadius={120}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.9)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    color: "#fff",
                  }}
                  formatter={(value: any, name: string, props: any) => {
                    return [
                      `${value.toLocaleString()} (${props.payload.percentage}%)`,
                      props.payload.name,
                    ]
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Platform Breakdown */}
        <div className="mt-8 rounded-lg border border-foreground/20 bg-foreground/5 p-4">
          <h3 className="mb-4 text-lg font-semibold text-foreground">
            Platform Breakdown: {selectedTrackData.Track}
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {platformDataWithPercent.map((item, idx) => (
              <div
                key={item.name}
                className="rounded-lg border border-foreground/20 bg-foreground/10 p-3"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="h-4 w-4 rounded"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  />
                  <span className="font-medium text-foreground">{item.name}</span>
                </div>
                <p className="mt-1 text-sm text-foreground/70">
                  {item.raw.toLocaleString()}
                </p>
                <p className="text-xs text-foreground/50">{item.percentage}%</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

