"use client"

import { useState, useEffect } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { CustomCursor } from "@/components/custom-cursor"

interface TrackData {
  Track: string
  Artist: string
  "Spotify Streams": number
  "All Time Rank": number
  "Track Score": number
  "Explicit Track": number
}

export default function CheckPage() {
  const [data, setData] = useState<TrackData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load data from JSON file
    fetch("/data/top50_tracks.json")
      .then((res) => res.json())
      .then((jsonData) => {
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

  // Prepare data for chart (top 20 for readability)
  const chartData = data
    .slice(0, 20)
    .map((item) => ({
      name: item.Track.length > 30 ? item.Track.substring(0, 30) + "..." : item.Track,
      fullName: item.Track,
      artist: item.Artist,
      streams: item["Spotify Streams"] || 0,
      rank: item["All Time Rank"] || 0,
      explicit: item["Explicit Track"] === 1,
    }))
    .sort((a, b) => b.streams - a.streams)

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <CustomCursor />
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-4xl font-bold text-foreground">
          2024 Mega-Hits Leaderboard
        </h1>
        
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
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: "rgba(255,255,255,0.7)" }}
                label={{ value: "Spotify Streams", position: "insideBottom", offset: -5, fill: "rgba(255,255,255,0.7)" }}
              />
              <YAxis 
                type="category" 
                dataKey="name" 
                width={180}
                stroke="rgba(255,255,255,0.7)"
                tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.8)",
                  border: "1px solid rgba(255,255,255,0.2)",
                  borderRadius: "8px",
                  color: "#fff",
                }}
                formatter={(value: any, name: string) => {
                  if (name === "streams") {
                    return [value.toLocaleString(), "Spotify Streams"]
                  }
                  return [value, name]
                }}
                labelFormatter={(label) => {
                  const item = chartData.find((d) => d.name === label)
                  return item ? `${item.fullName} - ${item.artist}` : label
                }}
              />
              <Bar 
                dataKey="streams" 
                fill="#1275d8"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-8 text-sm text-foreground/70">
          <p>Showing top 20 tracks by Spotify Streams from the top 50 dataset.</p>
          <p className="mt-2">Total tracks loaded: {data.length}</p>
        </div>
      </div>
    </div>
  )
}

