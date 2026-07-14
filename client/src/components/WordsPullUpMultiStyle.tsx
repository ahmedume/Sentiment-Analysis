import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface Segment {
  text: string
  className?: string
}

interface WordsPullUpMultiStyleProps {
  segments: Segment[]
  className?: string
}

export default function WordsPullUpMultiStyle({ segments, className = '' }: WordsPullUpMultiStyleProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true })

  const allWords: { word: string; className: string }[] = []
  for (const seg of segments) {
    const segWords = seg.text.split(' ')
    for (const word of segWords) {
      allWords.push({ word, className: seg.className ?? '' })
    }
  }

  return (
    <div ref={ref} className={`inline-flex flex-wrap justify-center ${className}`}>
      {allWords.map(({ word, className: cl }, i) => (
        <motion.span
          key={`${word}-${i}`}
          initial={{ y: 20, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className={`inline-block ${cl}`}
        >
          {word}{i < allWords.length - 1 ? '\u00A0' : ''}
        </motion.span>
      ))}
    </div>
  )
}
