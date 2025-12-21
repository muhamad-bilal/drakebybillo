"use client"

import { useEffect, useRef } from "react"

export function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const positionRef = useRef({ x: 0, y: 0 })
  const targetPositionRef = useRef({ x: 0, y: 0 })

  useEffect(() => {
    let animationFrameId: number

    const lerp = (start: number, end: number, factor: number) => {
      return start + (end - start) * factor
    }

    const updateCursor = () => {
      positionRef.current.x = lerp(positionRef.current.x, targetPositionRef.current.x, 0.15)
      positionRef.current.y = lerp(positionRef.current.y, targetPositionRef.current.y, 0.15)

      if (cursorRef.current) {
        cursorRef.current.style.transform = `translate3d(${positionRef.current.x}px, ${positionRef.current.y}px, 0) translate(-50%, -50%)`
      }

      animationFrameId = requestAnimationFrame(updateCursor)
    }

    const handleMouseMove = (e: MouseEvent) => {
      targetPositionRef.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener("mousemove", handleMouseMove, { passive: true })
    animationFrameId = requestAnimationFrame(updateCursor)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div
      ref={cursorRef}
      className="pointer-events-none fixed left-0 top-0 z-50 mix-blend-difference will-change-transform"
      style={{ contain: "layout style paint" }}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="220 10 360 420"
        className="h-8 w-8"
      >
        <path
          fill="#ffffff"
          d="M 301.5,28.5 C 304.152,28.5905 306.485,27.9238 308.5,26.5C 329.181,21.6381 349.514,22.9714 369.5,30.5C 377.412,25.9292 385.079,20.9292 392.5,15.5C 414.019,50.834 417.353,87.6673 402.5,126C 446.245,144.599 483.245,172.099 513.5,208.5C 513.427,210.027 514.094,211.027 515.5,211.5C 516.5,211.833 517.167,212.5 517.5,213.5C 517.427,215.027 518.094,216.027 519.5,216.5C 522.185,219.19 524.518,222.19 526.5,225.5C 526.427,227.027 527.094,228.027 528.5,228.5C 531.66,232.148 534.327,236.148 536.5,240.5C 536.427,242.027 537.094,243.027 538.5,243.5C 539.338,243.842 539.672,244.508 539.5,245.5C 539.427,247.027 540.094,248.027 541.5,248.5C 557.784,279.082 570.784,311.082 580.5,344.5C 580.723,348.162 581.723,351.495 583.5,354.5C 584.601,360.443 585.268,366.443 585.5,372.5C 585.478,375.59 584.812,378.257 583.5,380.5C 573.372,376.186 563.539,371.186 554,365.5C 554.157,367.831 554.657,370.164 555.5,372.5C 555.12,374.698 555.787,376.365 557.5,377.5C 558.416,380.655 559.416,383.822 560.5,387C 559.24,390.147 556.907,392.147 553.5,393C 539.361,397.896 525.028,399.396 510.5,397.5C 508.095,396.232 505.428,395.565 502.5,395.5C 497.015,393.193 492.182,389.86 488,385.5C 478.09,371.052 466.757,357.719 454,345.5C 453.259,350.402 452.092,355.068 450.5,359.5C 449.566,360.568 449.232,361.901 449.5,363.5C 446.615,363.194 443.948,363.527 441.5,364.5C 439.5,364.5 437.5,364.5 435.5,364.5C 433.517,364.157 432.183,364.824 431.5,366.5C 425.854,382.469 420.187,398.469 414.5,414.5C 427.227,414.369 440.227,414.536 453.5,415C 455.802,420.74 457.802,426.573 459.5,432.5C 389.833,432.5 320.167,432.5 250.5,432.5C 250.5,431.5 250.5,430.5 250.5,429.5C 252.341,424.484 254.674,419.818 257.5,415.5C 277.264,416.825 296.931,416.825 316.5,415.5C 326.55,397.902 336.217,380.068 345.5,362C 340.771,360.218 336.271,358.051 332,355.5C 331.515,350.075 332.015,344.742 333.5,339.5C 335.934,331.482 337.267,323.149 337.5,314.5C 338.388,303.177 338.555,291.844 338,280.5C 336.587,277.339 334.92,274.339 333,271.5C 310.864,247.924 293.197,221.257 280,191.5C 265.22,159.382 256.22,125.715 253,90.5C 252.129,75.9548 253.296,61.6215 256.5,47.5C 258.074,45.8984 258.741,43.8984 258.5,41.5C 260.414,30.9988 265.414,22.3321 273.5,15.5C 280.303,19.8042 286.97,24.3042 293.5,29C 296.192,29.4298 298.859,29.2631 301.5,28.5 Z"
        />
      </svg>
    </div>
  )
}
