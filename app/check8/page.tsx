"use client"

import { useState, useEffect } from "react"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { CustomCursor } from "@/components/custom-cursor"

interface TrackData {
  track_name: string
  artists: string
  track_genre: string
  popularity: number | null
  danceability: number | null
  valence: number | null
  energy: number | null
}

const GENRE_COLORS: Record<string, string> = {
  pop: "#ff6b6b",
  rock: "#4ecdc4",
  hip: "#95e1d3",
  electronic: "#f38181",
  rnb: "#aa96da",
  country: "#fcbad3",
  jazz: "#ffe66d",
  classical: "#a8e6cf",
  default: "#1275d8",
}

export default function Check8Page() {
  const [data, setData] = useState<TrackData[]>([])
  const [loading, setLoading] = useState(true)
  const [xAxisFeature, setXAxisFeature] = useState<"danceability" | "valence" | "energy">("danceability")

  useEffect(() => {
    fetch("/data/tracks_sample.json")
      .then((res) => res.json())
      .then((jsonData: TrackData[]) => {
        const filtered = jsonData.filter(
          (item) =>
            item.popularity !== null &&
            item[xAxisFeature] !== null &&
            item.track_genre &&
            !isNaN(Number(item.popularity)) &&
            !isNaN(Number(item[xAxisFeature])) &&
            Number(item.popularity) > 0
        )
        setData(filtered)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error loading data:", err)
        setLoading(false)
      })
  }, [xAxisFeature])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <CustomCursor />
        <p className="text-foreground">Loading data...</p>
      </div>
    )
  }

  const chartData = data.map((item) => ({
    name: item.track_name,
    artist: item.artists,
    genre: item.track_genre,
    xValue: Number(item[xAxisFeature]),
    popularity: Number(item.popularity),
    color: GENRE_COLORS[item.track_genre.toLowerCase()] || GENRE_COLORS.default,
  }))

  // Group by genre for coloring
  const genres = Array.from(new Set(chartData.map((d) => d.genre))).slice(0, 8)
  const genreGroups = genres.reduce((acc, genre) => {
    acc[genre] = chartData.filter((d) => d.genre === genre)
    return acc
  }, {} as Record<string, typeof chartData>)

  const featureLabels: Record<string, string> = {
    danceability: "Danceability (0 = not danceable, 1 = very danceable)",
    valence: "Valence (0 = sad, 1 = happy)",
    energy: "Energy (0 = calm, 1 = intense)",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <CustomCursor />
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          Mood vs Popularity
        </h1>
        <p className="mb-8 text-lg text-foreground/70">
          Is there a "hit recipe"? Do popular songs share certain audio characteristics?
        </p>

        {/* Controls */}
        <div className="mb-6 flex gap-4">
          <div className="flex gap-2">
            <label className="flex items-center gap-2 text-sm text-foreground/70">
              X-Axis:
            </label>
            <button
              onClick={() => setXAxisFeature("danceability")}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                xAxisFeature === "danceability"
                  ? "bg-foreground/20 text-foreground"
                  : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
              }`}
            >
              Danceability
            </button>
            <button
              onClick={() => setXAxisFeature("valence")}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                xAxisFeature === "valence"
                  ? "bg-foreground/20 text-foreground"
                  : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
              }`}
            >
              Valence
            </button>
            <button
              onClick={() => setXAxisFeature("energy")}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                xAxisFeature === "energy"
                  ? "bg-foreground/20 text-foreground"
                  : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
              }`}
            >
              Energy
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-8 rounded-lg border border-foreground/20 bg-foreground/5 p-6 backdrop-blur-sm">
          <ResponsiveContainer width="100%" height={600}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 60, left: 80 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                type="number"
                dataKey="xValue"
                name={xAxisFeature}
                label={{
                  value: featureLabels[xAxisFeature],
                  position: "insideBottom",
                  offset: -5,
                  fill: "rgba(255,255,255,0.7)",
                }}
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: "rgba(255,255,255,0.7)" }}
                domain={[0, 1]}
              />
              <YAxis
                type="number"
                dataKey="popularity"
                name="Popularity"
                label={{
                  value: "Popularity (0-100)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "rgba(255,255,255,0.7)",
                }}
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: "rgba(255,255,255,0.7)" }}
                domain={[0, 100]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.9)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: any, name: string, props: any) => {
                  if (name === xAxisFeature) {
                    return [value.toFixed(3), featureLabels[xAxisFeature]]
                  }
                  return [value, name]
                }}
                labelFormatter={(label) => {
                  const item = chartData.find((d) => d.name === label)
                  return item ? `${item.name} - ${item.artist} (${item.genre})` : label
                }}
              />
              <Legend wrapperStyle={{ color: "rgba(255,255,255,0.7)" }} />
              {Object.entries(genreGroups).map(([genre, genreData]) => (
                <Scatter
                  key={genre}
                  name={genre}
                  data={genreData}
                  fill={GENRE_COLORS[genre.toLowerCase()] || GENRE_COLORS.default}
                  fillOpacity={0.6}
                />
              ))}
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        <div className="mt-8 rounded-lg border border-foreground/20 bg-foreground/5 p-4">
          <h3 className="mb-2 text-lg font-semibold text-foreground">Insights</h3>
          <ul className="space-y-1 text-sm text-foreground/70">
            <li>• X-axis: {featureLabels[xAxisFeature]}</li>
            <li>• Y-axis: Popularity (0-100 scale)</li>
            <li>• Each color represents a different genre</li>
            <li>• Look for clusters of high-popularity tracks to identify "hit formulas"</li>
            <li>• Showing {chartData.length} tracks across {genres.length} genres</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

