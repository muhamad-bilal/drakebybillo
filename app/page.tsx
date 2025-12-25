"use client"

import { Shader, ChromaFlow, Swirl } from "shaders/react"
import { CustomCursor } from "@/components/custom-cursor"
import { GrainOverlay } from "@/components/grain-overlay"
import { MobileBlocker } from "@/components/mobile-blocker"
import { Section1Content } from "@/components/section1-content"
import { Section2Content } from "@/components/section2-content"
import { Section3Content } from "@/components/section3-content"
import { Section4Content } from "@/components/section4-content"
import { Section5Content } from "@/components/section5-content"
import { Section6Content } from "@/components/section6-content"
import { Section7Content } from "@/components/section7-content"
import { Section75Content } from "@/components/section7-5-content"
import { Section8Content } from "@/components/section8-content"
import { Section9Content } from "@/components/section9-content"
import { DashContent } from "@/components/dash-content"
import { MagneticButton } from "@/components/magnetic-button"
import { useRef, useEffect, useState } from "react"

export default function Home() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [currentSection, setCurrentSection] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)
  const touchStartY = useRef(0)
  const touchStartX = useRef(0)
  const shaderContainerRef = useRef<HTMLDivElement>(null)
  const scrollThrottleRef = useRef<number>()
  const isSnapping = useRef(false)
  const scrollEndTimeout = useRef<NodeJS.Timeout>()
  const lastScrollTime = useRef(0)
  const scrollStartPosition = useRef(0)
  const accumulatedDelta = useRef(0)

  useEffect(() => {
    const checkShaderReady = () => {
      if (shaderContainerRef.current) {
        const canvas = shaderContainerRef.current.querySelector("canvas")
        if (canvas && canvas.width > 0 && canvas.height > 0) {
          setIsLoaded(true)
          return true
        }
      }
      return false
    }

    if (checkShaderReady()) return

    const intervalId = setInterval(() => {
      if (checkShaderReady()) {
        clearInterval(intervalId)
      }
    }, 100)

    const fallbackTimer = setTimeout(() => {
      setIsLoaded(true)
    }, 1500)

    return () => {
      clearInterval(intervalId)
      clearTimeout(fallbackTimer)
    }
  }, [])

  const scrollToSection = (index: number) => {
    if (scrollContainerRef.current) {
      const sectionWidth = scrollContainerRef.current.offsetWidth
      scrollContainerRef.current.scrollTo({
        left: sectionWidth * index,
        behavior: "smooth",
      })
      setCurrentSection(index)
    }
  }

  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0].clientY
      touchStartX.current = e.touches[0].clientX
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (Math.abs(e.touches[0].clientY - touchStartY.current) > 10) {
        e.preventDefault()
      }
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const touchEndY = e.changedTouches[0].clientY
      const touchEndX = e.changedTouches[0].clientX
      const deltaY = touchStartY.current - touchEndY
      const deltaX = touchStartX.current - touchEndX

      if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
        if (deltaY > 0 && currentSection < 11) {
          scrollToSection(currentSection + 1)
        } else if (deltaY < 0 && currentSection > 0) {
          scrollToSection(currentSection - 1)
        }
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("touchstart", handleTouchStart, { passive: true })
      container.addEventListener("touchmove", handleTouchMove, { passive: false })
      container.addEventListener("touchend", handleTouchEnd, { passive: true })
    }

    return () => {
      if (container) {
        container.removeEventListener("touchstart", handleTouchStart)
        container.removeEventListener("touchmove", handleTouchMove)
        container.removeEventListener("touchend", handleTouchEnd)
      }
    }
  }, [currentSection])

  useEffect(() => {
    const snapToSection = (targetIdx: number) => {
      if (!scrollContainerRef.current || isSnapping.current) return

      isSnapping.current = true
      const sectionWidth = scrollContainerRef.current.offsetWidth
      scrollContainerRef.current.scrollTo({
        left: targetIdx * sectionWidth,
        behavior: "smooth",
      })
      setCurrentSection(targetIdx)

      setTimeout(() => {
        isSnapping.current = false
      }, 500)
    }

    const handleWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault()

        if (!scrollContainerRef.current || isSnapping.current) return

        const now = Date.now()
        const sectionWidth = scrollContainerRef.current.offsetWidth

        // Reset accumulated delta if this is a new scroll gesture (>200ms gap)
        if (now - lastScrollTime.current > 200) {
          accumulatedDelta.current = 0
          scrollStartPosition.current = scrollContainerRef.current.scrollLeft
        }

        lastScrollTime.current = now
        accumulatedDelta.current += e.deltaY

        scrollContainerRef.current.scrollBy({
          left: e.deltaY,
          behavior: "instant",
        })

        // Clear existing timeout
        if (scrollEndTimeout.current) {
          clearTimeout(scrollEndTimeout.current)
        }

        // Set new timeout to detect scroll end and snap
        scrollEndTimeout.current = setTimeout(() => {
          if (!scrollContainerRef.current) return

          const timeSinceLastScroll = Date.now() - lastScrollTime.current
          if (timeSinceLastScroll >= 100) {
            const container = scrollContainerRef.current
            const currentScrollLeft = container.scrollLeft
            const currentProgress = currentScrollLeft / sectionWidth

            // Use accumulated delta to determine scroll direction and intent
            const totalScrolled = accumulatedDelta.current
            const threshold = sectionWidth * 0.3

            // Only snap if user has scrolled significantly in one direction
            if (Math.abs(totalScrolled) < threshold) {
              // Not enough accumulated scroll - don't snap
              accumulatedDelta.current = 0
              return
            }

            // User scrolled enough - snap in the direction they were scrolling
            let targetSection: number
            if (totalScrolled > 0) {
              // Scrolling forward - snap to next section
              targetSection = Math.ceil(currentProgress)
            } else {
              // Scrolling backward - snap to previous section
              targetSection = Math.floor(currentProgress)
            }

            snapToSection(Math.max(0, Math.min(11, targetSection)))
            accumulatedDelta.current = 0
          }
        }, 100)

        const newSection = Math.round(scrollContainerRef.current.scrollLeft / sectionWidth)
        if (newSection !== currentSection) {
          setCurrentSection(newSection)
        }
      }
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("wheel", handleWheel, { passive: false })
    }

    return () => {
      if (container) {
        container.removeEventListener("wheel", handleWheel)
      }
      if (scrollEndTimeout.current) {
        clearTimeout(scrollEndTimeout.current)
      }
    }
  }, [currentSection])

  useEffect(() => {
    const handleScroll = () => {
      if (scrollThrottleRef.current) return

      scrollThrottleRef.current = requestAnimationFrame(() => {
        if (!scrollContainerRef.current) {
          scrollThrottleRef.current = undefined
          return
        }

        const sectionWidth = scrollContainerRef.current.offsetWidth
        const scrollLeft = scrollContainerRef.current.scrollLeft
        const newSection = Math.round(scrollLeft / sectionWidth)

        if (newSection !== currentSection && newSection >= 0 && newSection <= 11) {
          setCurrentSection(newSection)
        }

        scrollThrottleRef.current = undefined
      })
    }

    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener("scroll", handleScroll, { passive: true })
    }

    return () => {
      if (container) {
        container.removeEventListener("scroll", handleScroll)
      }
      if (scrollThrottleRef.current) {
        cancelAnimationFrame(scrollThrottleRef.current)
      }
    }
  }, [currentSection])

  return (
    <main className="relative h-screen w-full overflow-hidden bg-background">
      <MobileBlocker />
      <CustomCursor />
      <GrainOverlay />

      <div
        ref={shaderContainerRef}
        className={`fixed inset-0 z-0 transition-opacity duration-700 ${isLoaded ? "opacity-100" : "opacity-0"}`}
        style={{ contain: "strict" }}
      >
        <Shader className="h-full w-full">
          <Swirl
            colorA="#0d4f5e"
            colorB="#2d1b4e"
            speed={0.8}
            detail={0.8}
            blend={50}
            coarseX={40}
            coarseY={40}
            mediumX={40}
            mediumY={40}
            fineX={40}
            fineY={40}
          />
          <ChromaFlow
            baseColor="#0a3d4a"
            upColor="#1a5a6a"
            downColor="#1a1025"
            leftColor="#3d2a5e"
            rightColor="#0d4f5e"
            intensity={0.9}
            radius={1.8}
            momentum={25}
            maskType="alpha"
            opacity={0.97}
          />
        </Shader>
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <nav
        className={`fixed left-0 right-0 top-0 z-50 flex items-center justify-between px-6 py-6 transition-all duration-500 md:px-12 ${
          isLoaded && currentSection === 0 ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
        }`}
      >
{/* Empty left side spacer */}
        <div className="w-10" />

        <div className="hidden items-center gap-8 md:flex">
          {["Home", "The Bottom", "Come Up", "Momentum", "Domination", "No New Friends", "Forever", "Flood", "Numbers", "Journey", "Streams", "Dashboard"].map((item, index) => (
            <button
              key={item}
              onClick={() => scrollToSection(index)}
              className={`group relative font-sans text-sm font-medium transition-colors ${
                currentSection === index ? "text-foreground" : "text-foreground/80 hover:text-foreground"
              }`}
            >
              {item}
              <span
                className={`absolute -bottom-1 left-0 h-px bg-foreground transition-all duration-300 ${
                  currentSection === index ? "w-full" : "w-0 group-hover:w-full"
                }`}
              />
            </button>
          ))}
        </div>

        <a
          href="https://github.com/muhamad-bilal"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 w-10 items-center justify-center rounded-lg bg-foreground/15 backdrop-blur-md transition-all duration-300 hover:scale-110 hover:bg-foreground/25"
        >
          <svg
            className="h-5 w-5 text-foreground"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
      </nav>

      <div
        ref={scrollContainerRef}
        data-scroll-container
        className={`relative z-10 flex h-screen overflow-x-auto overflow-y-hidden transition-opacity duration-700 ${
          isLoaded ? "opacity-100" : "opacity-0"
        }`}
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {/* Hero Section */}
        <section className="flex min-h-screen w-screen shrink-0 flex-col justify-end px-6 pb-16 pt-24 md:px-12 md:pb-24">
          <div className="max-w-3xl">

            <h1
              className="mb-6 animate-in fade-in slide-in-from-bottom-8 text-6xl leading-[0.9] tracking-tight text-foreground/90 duration-1000 md:text-7xl lg:text-8xl"
              style={{ fontFamily: "'Bebas Neue', sans-serif" }}
            >
              <span className="text-balance">
                <span className="text-foreground/90">DRAKE:</span>{" "}
                <span className="text-amber-500">BY THE NUMBERS</span>
              </span>
            </h1>
            <p
              className="mb-8 max-w-xl animate-in fade-in slide-in-from-bottom-4 text-lg leading-relaxed text-foreground/60 duration-1000 delay-200 md:text-xl"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              <span className="text-pretty">
                A visual exploration of Billboard's most dominant artist
              </span>
            </p>
            {/* <div className="flex animate-in fade-in slide-in-from-bottom-4 flex-col gap-4 duration-1000 delay-300 sm:flex-row sm:items-center">
              <MagneticButton
                size="lg"
                variant="primary"
                onClick={() => window.open("https://v0.app/templates/R3n0gnvYFbO", "_blank")}
              >
                Open in v0
              </MagneticButton>
              <MagneticButton size="lg" variant="secondary" onClick={() => scrollToSection(2)}>
                View Demo
              </MagneticButton>
            </div> */}
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-in fade-in duration-1000 delay-500">
            <div className="flex items-center gap-2">
              <p
                className="text-xs tracking-[0.2em] text-foreground/50 uppercase"
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                Scroll to explore
              </p>
            </div>
          </div>
        </section>

        <Section1Content isActive={currentSection === 1} />
        <Section2Content isActive={currentSection === 2} />
        <Section3Content isActive={currentSection === 3} />
        <Section4Content isActive={currentSection === 4} />
        <Section5Content isActive={currentSection === 5} />
        <Section6Content isActive={currentSection === 6} />
        <Section7Content isActive={currentSection === 7} />
        <Section75Content isActive={currentSection === 8} />
        <Section8Content isActive={currentSection === 9} />
        <Section9Content isActive={currentSection === 10} />
        <DashContent isActive={currentSection === 11} />
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;600;700&display=swap');
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </main>
  )
}
