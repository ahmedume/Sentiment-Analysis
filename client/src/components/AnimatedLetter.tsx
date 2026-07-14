import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'

interface AnimatedLetterProps {
  text: string
  className?: string
}

export default function AnimatedLetter({ text, className = '' }: AnimatedLetterProps) {
  const ref = useRef<HTMLParagraphElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start 0.8', 'end 0.2'],
  })

  const chars = text.split('')

  return (
    <p ref={ref} className={className}>
      {chars.map((char, i) => {
        const charProgress = chars.length > 1 ? i / (chars.length - 1) : 0
        const start = Math.max(0, charProgress - 0.1)
        const end = Math.min(1, charProgress + 0.05)
        const opacity = useTransform(
          scrollYProgress,
          [start, end],
          [0.2, 1],
        )
        return (
          <motion.span key={`${char}-${i}`} style={{ opacity }}>
            {char === ' ' ? '\u00A0' : char}
          </motion.span>
        )
      })}
    </p>
  )
}
