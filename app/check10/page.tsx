"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ComposedChart, Line } from "recharts"
import { CustomCursor } from "@/components/custom-cursor"

interface TrackData {
  track_genre: string
  tempo: number | null
  duration_ms: number | null
  explicit: boolean | number
  duration?: number | null
}

export default function Check10Page() {
  const [data, setData] = useState<TrackData[]>([])
  const [loading, setLoading] = useState(true)
  const [chartType, setChartType] = useState<"tempo" | "duration">("tempo")
  const [groupBy, setGroupBy] = useState<"none" | "genre" | "explicit">("none")

  useEffect(() => {
    fetch("/data/tracks_sample.json")
      .then((res) => res.json())
      .then((jsonData: TrackData[]) => {
        const filtered = jsonData.filter((item) => {
          const value = chartType === "tempo" ? item.tempo : item.duration_ms
          return (
            value !== null &&
            value !== undefined &&
            !isNaN(Number(value)) &&
            Number(value) > 0
          )
        })
        setData(filtered)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error loading data:", err)
        setLoading(false)
      })
  }, [chartType])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <CustomCursor />
        <p className="text-foreground">Loading data...</p>
      </div>
    )
  }

  // Create histogram bins
  const createHistogram = (values: number[], bins: number = 30) => {
    const min = Math.min(...values)
    const max = Math.max(...values)
    const binSize = (max - min) / bins
    const histogram: Record<string, number> = {}

    for (let i = 0; i < bins; i++) {
      const binStart = min + i * binSize
      const binEnd = binStart + binSize
      const binLabel = `${Math.round(binStart)}-${Math.round(binEnd)}`
      histogram[binLabel] = 0
    }

    values.forEach((value) => {
      const binIndex = Math.min(Math.floor((value - min) / binSize), bins - 1)
      const binStart = min + binIndex * binSize
      const binEnd = binStart + binSize
      const binLabel = `${Math.round(binStart)}-${Math.round(binEnd)}`
      histogram[binLabel] = (histogram[binLabel] || 0) + 1
    })

    return Object.entries(histogram).map(([name, value]) => ({
      range: name,
      count: value,
    }))
  }

  let chartData: any[] = []

  const getValue = (item: TrackData): number => {
    return chartType === "tempo" 
      ? Number(item.tempo) 
      : Number(item.duration_ms) / 1000 / 60
  }

  if (groupBy === "none") {
    const values = data.map(getValue)
    chartData = createHistogram(values, 30)
  } else if (groupBy === "genre") {
    const genres = Array.from(new Set(data.map((item) => item.track_genre))).slice(0, 5)
    chartData = genres.map((genre) => {
      const genreTracks = data.filter((item) => item.track_genre === genre)
      const values = genreTracks.map(getValue)
      const avg = values.reduce((a, b) => a + b, 0) / values.length
      return {
        category: genre,
        average: avg,
        count: values.length,
      }
    })
  } else {
    // Group by explicit
    const explicitTracks = data.filter((item) => item.explicit === true || item.explicit === 1)
    const cleanTracks = data.filter((item) => item.explicit === false || item.explicit === 0)

    const explicitValues = explicitTracks.map(getValue)
    const cleanValues = cleanTracks.map(getValue)

    chartData = [
      { category: "Explicit", average: explicitValues.reduce((a, b) => a + b, 0) / explicitValues.length, count: explicitValues.length },
      { category: "Clean", average: cleanValues.reduce((a, b) => a + b, 0) / cleanValues.length, count: cleanValues.length },
    ]
  }

  const yAxisLabel = chartType === "tempo" ? "Tempo (BPM)" : "Duration (minutes)"
  const title = chartType === "tempo" ? "Tempo Distribution" : "Duration Distribution"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <CustomCursor />
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          Tempo & Duration Habits
        </h1>
        <p className="mb-8 text-lg text-foreground/70">
          How long and how fast are songs? Explore the distribution of tempo and duration across tracks.
        </p>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex gap-2">
            <label className="flex items-center gap-2 text-sm text-foreground/70">
              Chart Type:
            </label>
            <button
              onClick={() => setChartType("tempo")}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                chartType === "tempo"
                  ? "bg-foreground/20 text-foreground"
                  : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
              }`}
            >
              Tempo
            </button>
            <button
              onClick={() => setChartType("duration")}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                chartType === "duration"
                  ? "bg-foreground/20 text-foreground"
                  : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
              }`}
            >
              Duration
            </button>
          </div>
          <div className="flex gap-2">
            <label className="flex items-center gap-2 text-sm text-foreground/70">
              Group By:
            </label>
            <button
              onClick={() => setGroupBy("none")}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                groupBy === "none"
                  ? "bg-foreground/20 text-foreground"
                  : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
              }`}
            >
              Histogram
            </button>
            <button
              onClick={() => setGroupBy("genre")}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                groupBy === "genre"
                  ? "bg-foreground/20 text-foreground"
                  : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
              }`}
            >
              By Genre
            </button>
            <button
              onClick={() => setGroupBy("explicit")}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                groupBy === "explicit"
                  ? "bg-foreground/20 text-foreground"
                  : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
              }`}
            >
              By Explicit
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-8 rounded-lg border border-foreground/20 bg-foreground/5 p-6 backdrop-blur-sm">
          <ResponsiveContainer width="100%" height={600}>
            {groupBy === "none" ? (
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 80, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="range"
                  label={{
                    value: yAxisLabel,
                    position: "insideBottom",
                    offset: -5,
                    fill: "rgba(255,255,255,0.7)",
                  }}
                  stroke="rgba(255,255,255,0.7)"
                  tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 10 }}
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis
                  label={{
                    value: "Count",
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
                />
                <Bar dataKey="count" fill="#1275d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            ) : (
              <BarChart data={chartData} margin={{ top: 20, right: 30, left: 80, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis
                  dataKey="category"
                  label={{
                    value: groupBy === "genre" ? "Genre" : "Explicit Flag",
                    position: "insideBottom",
                    offset: -5,
                    fill: "rgba(255,255,255,0.7)",
                  }}
                  stroke="rgba(255,255,255,0.7)"
                  tick={{ fill: "rgba(255,255,255,0.7)" }}
                />
                <YAxis
                  label={{
                    value: `Average ${yAxisLabel}`,
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
                  formatter={(value: any) => [
                    chartType === "tempo" ? `${value.toFixed(1)} BPM` : `${value.toFixed(2)} min`,
                    "Average",
                  ]}
                />
                <Bar dataKey="average" fill="#1275d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        <div className="mt-8 rounded-lg border border-foreground/20 bg-foreground/5 p-4">
          <h3 className="mb-2 text-lg font-semibold text-foreground">Insights</h3>
          <ul className="space-y-1 text-sm text-foreground/70">
            <li>• {title} showing distribution across {data.length} tracks</li>
            <li>• {groupBy === "none" ? "Histogram view shows the frequency distribution" : `Grouped by ${groupBy}`}</li>
            {chartType === "tempo" && <li>• Typical tempo range: 60-180 BPM (most songs fall in this range)</li>}
            {chartType === "duration" && <li>• Typical duration: 2-5 minutes (most popular songs are in this range)</li>}
          </ul>
        </div>
      </div>
    </div>
  )
}

