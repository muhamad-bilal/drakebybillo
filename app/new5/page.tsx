"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { CustomCursor } from "@/components/custom-cursor"

interface WeeklyData {
  song_title: string
  artist_name: string
  rank: number
}

export default function New5Page() {
  const [data, setData] = useState<WeeklyData[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"total" | "unique" | "top1">("total")

  useEffect(() => {
    fetch("/data/billboard_weekly_top50.json")
      .then((res) => res.json())
      .then((jsonData: WeeklyData[]) => {
        setData(jsonData)
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

  // Calculate artist dominance
  let artistData: Array<{ artist: string; value: number; songs: number }> = []

  if (viewMode === "total") {
    // Total appearances
    const artistCounts = data.reduce((acc, item) => {
      acc[item.artist_name] = (acc[item.artist_name] || 0) + 1
      return acc
    }, {} as Record<string, number>)
    artistData = Object.entries(artistCounts)
      .map(([artist, count]) => ({
        artist,
        value: count,
        songs: 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 20)
  } else if (viewMode === "unique") {
    // Unique songs per artist
    const artistSongs = data.reduce((acc, item) => {
      if (!acc[item.artist_name]) {
        acc[item.artist_name] = new Set()
      }
      acc[item.artist_name].add(item.song_title)
      return acc
    }, {} as Record<string, Set<string>>)
    artistData = Object.entries(artistSongs)
      .map(([artist, songs]) => ({
        artist,
        value: songs.size,
        songs: songs.size,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 20)
  } else {
    // Weeks at #1
    const artistTop1 = data
      .filter((item) => item.rank === 1)
      .reduce((acc, item) => {
        acc[item.artist_name] = (acc[item.artist_name] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    artistData = Object.entries(artistTop1)
      .map(([artist, count]) => ({
        artist,
        value: count,
        songs: 0,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 20)
  }

  const chartData = artistData.map((item) => ({
    artist: item.artist,
    value: item.value,
    songs: item.songs,
  }))

  const yAxisLabel =
    viewMode === "total"
      ? "Total Appearances"
      : viewMode === "unique"
      ? "Unique Songs"
      : "Weeks at #1"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <CustomCursor />
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          Artist Dominance Bar Chart
        </h1>
        <p className="mb-8 text-lg text-foreground/70">
          Which artists dominated the Billboard Hot 100 Top 50 in 2025?
        </p>

        {/* View Mode Toggle */}
        <div className="mb-6 flex gap-4">
          <div className="flex gap-2">
            <label className="flex items-center gap-2 text-sm text-foreground/70">
              View:
            </label>
            <button
              onClick={() => setViewMode("total")}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                viewMode === "total"
                  ? "bg-foreground/20 text-foreground"
                  : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
              }`}
            >
              Total Appearances
            </button>
            <button
              onClick={() => setViewMode("unique")}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                viewMode === "unique"
                  ? "bg-foreground/20 text-foreground"
                  : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
              }`}
            >
              Unique Songs
            </button>
            <button
              onClick={() => setViewMode("top1")}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                viewMode === "top1"
                  ? "bg-foreground/20 text-foreground"
                  : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
              }`}
            >
              Weeks at #1
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-8 rounded-lg border border-foreground/20 bg-foreground/5 p-6 backdrop-blur-sm">
          <ResponsiveContainer width="100%" height={600}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 20, right: 30, left: 200, bottom: 20 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis
                type="number"
                dataKey="value"
                tick={{ fill: "rgba(255,255,255,0.7)" }}
                label={{
                  value: yAxisLabel,
                  position: "insideBottom",
                  offset: -5,
                  fill: "rgba(255,255,255,0.7)",
                }}
                stroke="rgba(255,255,255,0.7)"
              />
              <YAxis
                type="category"
                dataKey="artist"
                width={180}
                tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 11 }}
                stroke="rgba(255,255,255,0.7)"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.9)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: any, name: string, props: any) => {
                  if (viewMode === "unique") {
                    return [value, "Unique Songs"]
                  }
                  return [value, yAxisLabel]
                }}
                labelFormatter={(label) => label}
              />
              <Legend wrapperStyle={{ color: "rgba(255,255,255,0.7)" }} />
              <Bar dataKey="value" fill="#1275d8" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Insights */}
        <div className="mt-8 rounded-lg border border-foreground/20 bg-foreground/5 p-4">
          <h3 className="mb-2 text-lg font-semibold text-foreground">Insights</h3>
          <ul className="space-y-1 text-sm text-foreground/70">
            <li>
              • {viewMode === "total" && "Total appearances = sum of all weeks each artist appeared in Top 50"}
              {viewMode === "unique" && "Unique songs = number of different songs per artist"}
              {viewMode === "top1" && "Weeks at #1 = number of weeks each artist had a song at rank 1"}
            </li>
            <li>• Showing top 20 artists</li>
            <li>• Data from 50 weeks of Billboard Hot 100 Top 50</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

