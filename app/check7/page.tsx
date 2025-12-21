"use client"

import { useState, useEffect } from "react"
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from "recharts"
import { CustomCursor } from "@/components/custom-cursor"

interface TrackData {
  track_genre: string
  danceability: number | null
  energy: number | null
  acousticness: number | null
  speechiness: number | null
  valence: number | null
  instrumentalness: number | null
}

const COLORS = ["#1275d8", "#e19136", "#ff6b6b", "#4ecdc4", "#95e1d3", "#f38181", "#aa96da", "#fcbad3"]

export default function Check7Page() {
  const [data, setData] = useState<TrackData[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])

  useEffect(() => {
    fetch("/data/tracks_sample.json")
      .then((res) => res.json())
      .then((jsonData: TrackData[]) => {
        const filtered = jsonData.filter(
          (item) =>
            item.track_genre &&
            item.danceability !== null &&
            item.energy !== null &&
            item.acousticness !== null &&
            item.speechiness !== null &&
            item.valence !== null &&
            item.instrumentalness !== null
        )
        setData(filtered)
        
        const uniqueGenres = Array.from(new Set(filtered.map((item) => item.track_genre))).slice(0, 5)
        setSelectedGenres(uniqueGenres)
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

  const allGenres = Array.from(new Set(data.map((item) => item.track_genre))).sort()

  // Calculate average features per genre
  const genreAverages = selectedGenres.map((genre, idx) => {
    const genreTracks = data.filter((item) => item.track_genre === genre)
    const count = genreTracks.length
    
    if (count === 0) return null

    const avg = {
      genre,
      danceability: genreTracks.reduce((sum, t) => sum + (Number(t.danceability) || 0), 0) / count,
      energy: genreTracks.reduce((sum, t) => sum + (Number(t.energy) || 0), 0) / count,
      acousticness: genreTracks.reduce((sum, t) => sum + (Number(t.acousticness) || 0), 0) / count,
      speechiness: genreTracks.reduce((sum, t) => sum + (Number(t.speechiness) || 0), 0) / count,
      valence: genreTracks.reduce((sum, t) => sum + (Number(t.valence) || 0), 0) / count,
      instrumentalness: genreTracks.reduce((sum, t) => sum + (Number(t.instrumentalness) || 0), 0) / count,
      color: COLORS[idx % COLORS.length],
    }
    return avg
  }).filter((item): item is NonNullable<typeof item> => item !== null)

  // Format data for radar chart
  const radarData = [
    { feature: "Danceability", ...genreAverages.reduce((acc, g) => ({ ...acc, [g.genre]: g.danceability }), {}) },
    { feature: "Energy", ...genreAverages.reduce((acc, g) => ({ ...acc, [g.genre]: g.energy }), {}) },
    { feature: "Acousticness", ...genreAverages.reduce((acc, g) => ({ ...acc, [g.genre]: g.acousticness }), {}) },
    { feature: "Speechiness", ...genreAverages.reduce((acc, g) => ({ ...acc, [g.genre]: g.speechiness }), {}) },
    { feature: "Valence", ...genreAverages.reduce((acc, g) => ({ ...acc, [g.genre]: g.valence }), {}) },
    { feature: "Instrumentalness", ...genreAverages.reduce((acc, g) => ({ ...acc, [g.genre]: g.instrumentalness }), {}) },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <CustomCursor />
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          What Makes Genres Different?
        </h1>
        <p className="mb-8 text-lg text-foreground/70">
          Compare audio feature fingerprints across genres. Each radar shows the average characteristics of a genre.
        </p>

        {/* Genre Selector */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-foreground/70">
            Select Genres to Compare (showing {selectedGenres.length} of {allGenres.length}):
          </label>
          <div className="flex flex-wrap gap-2">
            {allGenres.slice(0, 10).map((genre) => (
              <button
                key={genre}
                onClick={() => {
                  if (selectedGenres.includes(genre)) {
                    setSelectedGenres(selectedGenres.filter((g) => g !== genre))
                  } else if (selectedGenres.length < 5) {
                    setSelectedGenres([...selectedGenres, genre])
                  }
                }}
                className={`rounded-lg px-3 py-1 text-sm transition-colors ${
                  selectedGenres.includes(genre)
                    ? "bg-foreground/20 text-foreground"
                    : selectedGenres.length >= 5
                    ? "bg-foreground/5 text-foreground/40 cursor-not-allowed"
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
          <ResponsiveContainer width="100%" height={600}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.2)" />
              <PolarAngleAxis
                dataKey="feature"
                tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 1]}
                tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.9)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: any) => value.toFixed(3)}
              />
              <Legend wrapperStyle={{ color: "rgba(255,255,255,0.7)" }} />
              {genreAverages.map((genre, idx) => (
                <Radar
                  key={genre.genre}
                  name={genre.genre}
                  dataKey={genre.genre}
                  stroke={genre.color}
                  fill={genre.color}
                  fillOpacity={0.3}
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Feature Breakdown */}
        <div className="mt-8 rounded-lg border border-foreground/20 bg-foreground/5 p-4">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Genre Feature Averages</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {genreAverages.map((genre) => (
              <div key={genre.genre} className="rounded-lg border border-foreground/20 bg-foreground/10 p-4">
                <h4 className="mb-2 font-semibold text-foreground" style={{ color: genre.color }}>
                  {genre.genre}
                </h4>
                <div className="space-y-1 text-sm text-foreground/70">
                  <div>Danceability: {genre.danceability.toFixed(3)}</div>
                  <div>Energy: {genre.energy.toFixed(3)}</div>
                  <div>Acousticness: {genre.acousticness.toFixed(3)}</div>
                  <div>Speechiness: {genre.speechiness.toFixed(3)}</div>
                  <div>Valence: {genre.valence.toFixed(3)}</div>
                  <div>Instrumentalness: {genre.instrumentalness.toFixed(3)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

