"use client"

import { useState, useEffect } from "react"
import { CustomCursor } from "@/components/custom-cursor"

interface TrackData {
  danceability: number | null
  energy: number | null
  loudness: number | null
  speechiness: number | null
  acousticness: number | null
  instrumentalness: number | null
  liveness: number | null
  valence: number | null
  tempo: number | null
  popularity: number | null
}

const FEATURES = [
  "danceability",
  "energy",
  "loudness",
  "speechiness",
  "acousticness",
  "instrumentalness",
  "liveness",
  "valence",
  "tempo",
  "popularity",
]

export default function Check9Page() {
  const [data, setData] = useState<TrackData[]>([])
  const [loading, setLoading] = useState(true)
  const [correlationMatrix, setCorrelationMatrix] = useState<number[][]>([])

  useEffect(() => {
    fetch("/data/tracks_sample.json")
      .then((res) => res.json())
      .then((jsonData: TrackData[]) => {
        const filtered = jsonData.filter((item) => {
          return FEATURES.every(
            (feature) =>
              item[feature as keyof TrackData] !== null &&
              item[feature as keyof TrackData] !== undefined &&
              !isNaN(Number(item[feature as keyof TrackData]))
          )
        })
        setData(filtered)

        // Calculate correlation matrix
        const matrix = calculateCorrelationMatrix(filtered)
        setCorrelationMatrix(matrix)
        setLoading(false)
      })
      .catch((err) => {
        console.error("Error loading data:", err)
        setLoading(false)
      })
  }, [])

  const calculateCorrelationMatrix = (tracks: TrackData[]): number[][] => {
    const matrix: number[][] = []

    for (let i = 0; i < FEATURES.length; i++) {
      const row: number[] = []
      for (let j = 0; j < FEATURES.length; j++) {
        if (i === j) {
          row.push(1.0)
        } else {
          const corr = calculateCorrelation(
            tracks.map((t) => Number(t[FEATURES[i] as keyof TrackData])),
            tracks.map((t) => Number(t[FEATURES[j] as keyof TrackData]))
          )
          row.push(corr)
        }
      }
      matrix.push(row)
    }

    return matrix
  }

  const calculateCorrelation = (x: number[], y: number[]): number => {
    const n = x.length
    const sumX = x.reduce((a, b) => a + b, 0)
    const sumY = y.reduce((a, b) => a + b, 0)
    const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0)
    const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0)
    const sumY2 = y.reduce((sum, yi) => sum + yi * yi, 0)

    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

    if (denominator === 0) return 0
    return numerator / denominator
  }

  const getColor = (value: number): string => {
    if (value >= 0.7) return "#4ecdc4" // Strong positive
    if (value >= 0.3) return "#95e1d3" // Moderate positive
    if (value >= -0.3) return "#f38181" // Weak/neutral
    if (value >= -0.7) return "#ff6b6b" // Moderate negative
    return "#e19136" // Strong negative
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <CustomCursor />
        <p className="text-foreground">Loading data...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <CustomCursor />
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          Audio Feature Correlation Heatmap
        </h1>
        <p className="mb-8 text-lg text-foreground/70">
          Which audio features travel together? Discover relationships between musical characteristics.
        </p>

        {/* Heatmap */}
        <div className="mb-8 rounded-lg border border-foreground/20 bg-foreground/5 p-6 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-foreground/20 p-2 text-left text-sm text-foreground/70"></th>
                  {FEATURES.map((feature) => (
                    <th
                      key={feature}
                      className="border border-foreground/20 p-2 text-center text-xs text-foreground/70"
                    >
                      {feature.charAt(0).toUpperCase() + feature.slice(1)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((feature, i) => (
                  <tr key={feature}>
                    <td className="border border-foreground/20 p-2 text-sm font-medium text-foreground/70">
                      {feature.charAt(0).toUpperCase() + feature.slice(1)}
                    </td>
                    {FEATURES.map((_, j) => {
                      const value = correlationMatrix[i]?.[j] || 0
                      const color = getColor(value)
                      return (
                        <td
                          key={j}
                          className="border border-foreground/20 p-2 text-center text-xs"
                          style={{
                            backgroundColor: `${color}40`,
                            color: "rgba(255,255,255,0.9)",
                          }}
                          title={`${FEATURES[i]} vs ${FEATURES[j]}: ${value.toFixed(3)}`}
                        >
                          {value.toFixed(2)}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mb-8 rounded-lg border border-foreground/20 bg-foreground/5 p-4">
          <h3 className="mb-4 text-lg font-semibold text-foreground">Correlation Strength</h3>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded" style={{ backgroundColor: "#4ecdc4" }} />
              <span className="text-sm text-foreground/70">Strong Positive (≥0.7)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded" style={{ backgroundColor: "#95e1d3" }} />
              <span className="text-sm text-foreground/70">Moderate Positive (0.3-0.7)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded" style={{ backgroundColor: "#f38181" }} />
              <span className="text-sm text-foreground/70">Weak/Neutral (-0.3 to 0.3)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded" style={{ backgroundColor: "#ff6b6b" }} />
              <span className="text-sm text-foreground/70">Moderate Negative (-0.7 to -0.3)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded" style={{ backgroundColor: "#e19136" }} />
              <span className="text-sm text-foreground/70">Strong Negative (≤-0.7)</span>
            </div>
          </div>
        </div>

        {/* Insights */}
        <div className="mt-8 rounded-lg border border-foreground/20 bg-foreground/5 p-4">
          <h3 className="mb-2 text-lg font-semibold text-foreground">Insights</h3>
          <ul className="space-y-1 text-sm text-foreground/70">
            <li>• Values range from -1 (perfect negative correlation) to +1 (perfect positive correlation)</li>
            <li>• Diagonal is always 1.0 (each feature correlates perfectly with itself)</li>
            <li>• Strong correlations indicate features that often appear together</li>
            <li>• Based on {data.length} tracks with complete feature data</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

