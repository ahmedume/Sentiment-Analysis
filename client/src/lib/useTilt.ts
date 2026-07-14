import { useRef, useCallback } from 'react'

export function useTilt(maxTilt = 8) {
  const ref = useRef<HTMLSpanElement>(null)

  const handleMouseMove = useCallback(
    (e: React.MouseEvent) => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width
      const y = (e.clientY - rect.top) / rect.height
      const tiltX = (y - 0.5) * -maxTilt
      const tiltY = (x - 0.5) * maxTilt
      el.style.transform = `perspective(600px) rotateX(${tiltX}deg) rotateY(${tiltY}deg)`
    },
    [maxTilt],
  )

  const handleMouseLeave = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg)'
  }, [])

  return { ref, handleMouseMove, handleMouseLeave }
}
