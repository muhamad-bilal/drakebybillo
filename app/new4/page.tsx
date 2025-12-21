"use client"

import { useState, useEffect } from "react"
import { ResponsiveBar } from "@nivo/bar"
import { CustomCursor } from "@/components/custom-cursor"

interface YearEndData {
  yearend_rank: number
  song_title: string
  artist_name: string
  total_rank_score: number
  weeks_in_top_50: number
  best_rank: number
  average_rank: number
}

export default function New4Page() {
  const [data, setData] = useState<YearEndData[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<"rank" | "score" | "weeks" | "best">("rank")
  const [activeTab, setActiveTab] = useState<"charts" | "raw">("charts")

  useEffect(() => {
    fetch("/data/billboard_yearend_top50.json")
      .then((res) => res.json())
      .then((jsonData: YearEndData[]) => {
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

  const sortedData = [...data].sort((a, b) => {
    switch (sortBy) {
      case "rank":
        return a.yearend_rank - b.yearend_rank
      case "score":
        return b.total_rank_score - a.total_rank_score
      case "weeks":
        return b.weeks_in_top_50 - a.weeks_in_top_50
      case "best":
        return a.best_rank - b.best_rank
      default:
        return 0
    }
  })

  const chartData = sortedData.slice(0, 20).map((item) => ({
    song: item.song_title,
    artist: item.artist_name,
    rank: item.yearend_rank,
    score: item.total_rank_score,
    weeks: item.weeks_in_top_50,
    bestRank: item.best_rank,
    avgRank: item.average_rank,
  }))

  // Get the data key based on sortBy
  const dataKey = sortBy === "rank" ? "rank" : sortBy === "score" ? "score" : sortBy === "weeks" ? "weeks" : "bestRank"
  const axisLabel = sortBy === "rank" ? "Year-End Rank" : sortBy === "score" ? "Total Rank Score" : sortBy === "weeks" ? "Weeks in Top 50" : "Best Rank"
  
  // Determine if we need to reverse the axis
  const reverseAxis = sortBy === "rank" || sortBy === "best"

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <CustomCursor />
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-4 text-4xl font-bold text-foreground">
          Derived Year-End Top 50 Leaderboard
        </h1>
        <p className="mb-8 text-lg text-foreground/70">
          Top 50 songs of 2025 ranked by aggregate performance across the year
        </p>

        {/* Tabs */}
        <div className="mb-6 flex gap-2 border-b border-foreground/20">
          <button
            onClick={() => setActiveTab("charts")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "charts"
                ? "border-b-2 border-foreground text-foreground"
                : "text-foreground/60 hover:text-foreground/80"
            }`}
          >
            Charts
          </button>
          <button
            onClick={() => setActiveTab("raw")}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === "raw"
                ? "border-b-2 border-foreground text-foreground"
                : "text-foreground/60 hover:text-foreground/80"
            }`}
          >
            Raw
          </button>
        </div>

        {/* Charts Tab */}
        {activeTab === "charts" && (
          <>
            {/* Sort Controls */}
            <div className="mb-6 flex gap-4">
          <div className="flex gap-2">
            <label className="flex items-center gap-2 text-sm text-foreground/70">
              Sort By:
            </label>
            <button
              onClick={() => setSortBy("rank")}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                sortBy === "rank"
                  ? "bg-foreground/20 text-foreground"
                  : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
              }`}
            >
              Year-End Rank
            </button>
            <button
              onClick={() => setSortBy("score")}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                sortBy === "score"
                  ? "bg-foreground/20 text-foreground"
                  : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
              }`}
            >
              Total Score
            </button>
            <button
              onClick={() => setSortBy("weeks")}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                sortBy === "weeks"
                  ? "bg-foreground/20 text-foreground"
                  : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
              }`}
            >
              Weeks in Top 50
            </button>
            <button
              onClick={() => setSortBy("best")}
              className={`rounded-lg px-4 py-2 text-sm transition-colors ${
                sortBy === "best"
                  ? "bg-foreground/20 text-foreground"
                  : "bg-foreground/10 text-foreground/70 hover:bg-foreground/15"
              }`}
            >
              Best Rank
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="mb-8 rounded-lg border border-foreground/20 bg-foreground/5 p-6 backdrop-blur-sm">
          <div style={{ height: "600px", width: "100%" }}>
            <ResponsiveBar
              data={chartData}
              keys={[dataKey]}
              indexBy="song"
              layout="horizontal"
              margin={{ top: 20, right: 100, bottom: 60, left: 200 }}
              padding={0.3}
              valueScale={{ type: "linear" }}
              indexScale={{ type: "band", round: true }}
              colors="#1275d8"
              borderColor={{ from: "color", modifiers: [["darker", 1.6]] }}
              axisTop={null}
              axisRight={null}
              axisBottom={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: axisLabel,
                legendPosition: "middle",
                legendOffset: 46,
              }}
              axisLeft={{
                tickSize: 5,
                tickPadding: 5,
                tickRotation: 0,
                legend: "Song",
                legendPosition: "middle",
                legendOffset: -120,
              }}
              labelSkipWidth={12}
              labelSkipHeight={12}
              labelTextColor={{ from: "color", modifiers: [["darker", 1.6]] }}
              theme={{
                background: "transparent",
                text: {
                  fontSize: 11,
                  fill: "rgba(255,255,255,0.7)",
                  fontFamily: "inherit",
                },
                axis: {
                  domain: {
                    line: {
                      stroke: "rgba(255,255,255,0.2)",
                      strokeWidth: 1,
                    },
                  },
                  legend: {
                    text: {
                      fontSize: 13,
                      fill: "rgba(255,255,255,0.7)",
                      fontFamily: "inherit",
                    },
                  },
                  ticks: {
                    line: {
                      stroke: "rgba(255,255,255,0.2)",
                      strokeWidth: 1,
                    },
                    text: {
                      fontSize: 11,
                      fill: "rgba(255,255,255,0.7)",
                      fontFamily: "inherit",
                    },
                  },
                },
                grid: {
                  line: {
                    stroke: "rgba(255,255,255,0.1)",
                    strokeWidth: 1,
                  },
                },
                tooltip: {
                  container: {
                    background: "rgba(0,0,0,0.9)",
                    border: "1px solid rgba(255,255,255,0.2)",
                    borderRadius: "8px",
                    color: "#fff",
                    padding: "8px 12px",
                  },
                },
              }}
              tooltip={(bar: any) => {
                const item = chartData.find((d) => d.song === bar.id)
                if (!item) return null
                return (
                  <div
                    style={{
                      background: "rgba(0,0,0,0.9)",
                      border: "1px solid rgba(255,255,255,0.2)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      color: "#fff",
                    }}
                  >
                    <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
                      {item.song}
                    </div>
                    <div style={{ fontSize: "12px", opacity: 0.8, marginBottom: "6px" }}>
                      {item.artist}
                    </div>
                    <div style={{ fontSize: "11px", opacity: 0.7 }}>
                      {axisLabel}: {bar.value ? (dataKey === "score" ? bar.value.toLocaleString() : bar.value) : "N/A"}
                    </div>
                    <div style={{ fontSize: "11px", opacity: 0.7 }}>
                      Year-End Rank: #{item.rank}
                    </div>
                    <div style={{ fontSize: "11px", opacity: 0.7 }}>
                      Weeks: {item.weeks} | Best: #{item.bestRank} | Avg: {item.avgRank.toFixed(2)}
                    </div>
                  </div>
                )
              }}
              animate={true}
              motionConfig="gentle"
            />
          </div>
        </div>
          </>
        )}

        {/* Raw Tab */}
        {activeTab === "raw" && (
          <div className="rounded-lg border border-foreground/20 bg-foreground/5 p-6 backdrop-blur-sm overflow-x-auto">
            <h3 className="mb-4 text-2xl font-semibold text-foreground">Top 20 Year-End Data</h3>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-foreground/20">
                  <th className="p-3 text-left text-foreground/70 font-semibold">Rank</th>
                  <th className="p-3 text-left text-foreground/70 font-semibold">Song</th>
                  <th className="p-3 text-left text-foreground/70 font-semibold">Artist</th>
                  <th className="p-3 text-right text-foreground/70 font-semibold">Total Score</th>
                  <th className="p-3 text-right text-foreground/70 font-semibold">Weeks</th>
                  <th className="p-3 text-right text-foreground/70 font-semibold">Best</th>
                  <th className="p-3 text-right text-foreground/70 font-semibold">Avg Rank</th>
                </tr>
              </thead>
              <tbody>
                {[...data].sort((a, b) => a.yearend_rank - b.yearend_rank).slice(0, 20).map((item) => (
                  <tr key={item.yearend_rank} className="border-b border-foreground/10 hover:bg-foreground/5 transition-colors">
                    <td className="p-3 text-foreground/70 font-medium">{item.yearend_rank}</td>
                    <td className="p-3 text-foreground">{item.song_title}</td>
                    <td className="p-3 text-foreground/70">{item.artist_name}</td>
                    <td className="p-3 text-right text-foreground/70">{item.total_rank_score.toLocaleString()}</td>
                    <td className="p-3 text-right text-foreground/70">{item.weeks_in_top_50}</td>
                    <td className="p-3 text-right text-foreground/70">{item.best_rank}</td>
                    <td className="p-3 text-right text-foreground/70">{item.average_rank.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

