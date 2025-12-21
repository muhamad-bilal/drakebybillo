"use client"

import { useState, useEffect } from "react"
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts"
import { CustomCursor } from "@/components/custom-cursor"

interface TrackData {
  track_name: string
  artists: string
  track_genre: string
  valence: number | null
  energy: number | null
  popularity: number | null
  danceability: number | null
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

export default function Check6Page() {
  const [data, setData] = useState<TrackData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [sizeBy, setSizeBy] = useState<"popularity" | "danceability">("popularity")

  useEffect(() => {
    // Load data from JSON file
    fetch("/data/tracks_sample.json")
      .then((res) => res.json())
      .then((jsonData: TrackData[]) => {
        // Filter out tracks with missing data
        const filtered = jsonData.filter(
          (item) =>
            item.valence !== null &&
            item.energy !== null &&
            item.valence !== undefined &&
            item.energy !== undefined &&
            !isNaN(Number(item.valence)) &&
            !isNaN(Number(item.energy)) &&
            item.track_genre &&
            item[sizeBy] !== null &&
            item[sizeBy] !== undefined &&
            !isNaN(Number(item[sizeBy]))
        )

        setData(filtered)
        
        // Get unique genres for filter
        const uniqueGenres = Array.from(new Set(filtered.map((item) => item.track_genre))).slice(0, 10)
        setSelectedGenres(uniqueGenres)
        
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error loading data:", err)
        setLoading(false)
      })
  }, [sizeBy])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <CustomCursor />
        <p className="text-foreground">Loading data...</p>
      </div>
    )
  }

  // Get unique genres
  const allGenres = Array.from(new Set(data.map((item) => item.track_genre))).sort()

  // Filter data by selected genres
  const filteredData = data.filter((item) => selectedGenres.includes(item.track_genre))

  // Prepare data for scatter chart
  const chartData = filteredData.map((item) => {
    const sizeValue = Number(item[sizeBy]) || 0
    // Normalize size (popularity is 0-100, danceability is 0-1)
    const normalizedSize = sizeBy === "popularity" ? sizeValue * 2 : sizeValue * 200
    
    return {
      name: item.track_name,
      artist: item.artists,
      genre: item.track_genre,
      valence: Number(item.valence),
      energy: Number(item.energy),
      size: Math.max(50, normalizedSize), // Minimum size for visibility
      popularity: Number(item.popularity) || 0,
      danceability: Number(item.danceability) || 0,
      color: GENRE_COLORS[item.track_genre.toLowerCase()] || GENRE_COLORS.default,
    }
  })

  // Group by genre for legend
  const genreGroups = selectedGenres.reduce((acc, genre) => {
    acc[genre] = chartData.filter((d) => d.genre === genre)
    return acc
  }, {} as Record<string, typeof chartData>)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <CustomCursor />
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          Sound Map of Genres
        </h1>
        <p className="mb-8 text-lg text-foreground/70">
          Where do genres sit in terms of mood (valence) and intensity (energy)? Discover the emotional landscape of music.
        </p>

        {/* Controls */}
        <div className="mb-6 flex flex-wrap gap-4">
          <div className="flex gap-2">
            <label className="flex items-center gap-2 text-sm text-foreground/70">
              Bubble Size:
            </label>
            <button
              onClick={() => setSizeBy("popularity")}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                sizeBy === "popularity"
                  ? "bg-foreground/20 text-foreground"
                  : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
              }`}
            >
              Popularity
            </button>
            <button
              onClick={() => setSizeBy("danceability")}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                sizeBy === "danceability"
                  ? "bg-foreground/20 text-foreground"
                  : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
              }`}
            >
              Danceability
            </button>
          </div>
        </div>

        {/* Genre Filter */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-foreground/70">
            Select Genres (showing {selectedGenres.length} of {allGenres.length}):
          </label>
          <div className="flex flex-wrap gap-2">
            {allGenres.slice(0, 15).map((genre) => (
              <button
                key={genre}
                onClick={() => {
                  if (selectedGenres.includes(genre)) {
                    setSelectedGenres(selectedGenres.filter((g) => g !== genre))
                  } else {
                    setSelectedGenres([...selectedGenres, genre])
                  }
                }}
                className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                  selectedGenres.includes(genre)
                    ? "bg-foreground/20 text-foreground"
                    : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
                }`}
              >
                {genre}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="mb-8 rounded-lg border border-foreground/20 bg-foreground/5 p-6 backdrop-blur-sm">
          <ResponsiveContainer width="100%" height={700}>
            <ScatterChart
              margin={{ top: 20, right: 20, bottom: 60, left: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                type="number"
                dataKey="valence"
                name="Valence"
                label={{
                  value: "Valence (Sad ← → Happy)",
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
                dataKey="energy"
                name="Energy"
                label={{
                  value: "Energy (Calm ← → Intense)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "rgba(255,255,255,0.7)",
                }}
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: "rgba(255,255,255,0.7)" }}
                domain={[0, 1]}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.9)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: any, name: string, props: any) => {
                  if (name === "valence") {
                    return [value.toFixed(2), "Valence (0=sad, 1=happy)"]
                  }
                  if (name === "energy") {
                    return [value.toFixed(2), "Energy (0=calm, 1=intense)"]
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
            <li>• X-axis: Valence (0 = sad/melancholic, 1 = happy/euphoric)</li>
            <li>• Y-axis: Energy (0 = calm/relaxed, 1 = intense/aggressive)</li>
            <li>• Bubble size represents {sizeBy}</li>
            <li>• Each color represents a different genre</li>
            <li>• Tracks in top-right = happy & intense (party music)</li>
            <li>• Tracks in bottom-left = sad & calm (ballads)</li>
            <li>• Showing {chartData.length} tracks from {selectedGenres.length} genres</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

