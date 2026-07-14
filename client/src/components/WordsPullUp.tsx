import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface WordsPullUpProps {
  text: string
  className?: string
  showAsterisk?: boolean
  delay?: number
}

export default function WordsPullUp({ text, className = '', showAsterisk, delay = 0 }: WordsPullUpProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  const words = text.split(' ')

  return (
    <div ref={ref} className={`inline-flex flex-wrap ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ y: 20, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: delay + i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="inline-block"
        >
          {word}{i < words.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
      {showAsterisk && (
        <span className="relative">
          <span className="absolute top-[0.65em] -right-[0.3em] text-[0.31em]">*</span>
        </span>
      )}
    </div>
  )
}
