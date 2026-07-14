import { useRef, useState } from 'react'
import { useInView } from 'framer-motion'
import WordsPullUpMultiStyle from './WordsPullUpMultiStyle'
import { useTilt } from '../lib/useTilt'

const text = 'Built with scikit-learn and FastAPI, SentimentSense classifies text into Positive, Negative, or Neutral classes. Two models, Linear SVM and Logistic Regression, are trained on Twitter data and compared side by side, with the best model served through a RESTful API.'

const styles = `
.word-highlight {
  transition: color 0.05s ease-out;
  white-space: pre-wrap;
}
.word-highlight.active {
  color: #40E0D0;
}
`

export default function About() {
  const ref = useRef<HTMLDivElement>(null)
  useInView(ref, { once: true, margin: '-100px' })
  const { ref: labelTilt, handleMouseMove: onLabelMove, handleMouseLeave: onLabelLeave } = useTilt(15)
  const { ref: headingTilt, handleMouseMove: onHeadingMove, handleMouseLeave: onHeadingLeave } = useTilt(18)
  const [highlightIdx, setHighlightIdx] = useState(-1)

  const words = text.split(/(\s+)/)

  function handleEnter() {
    setHighlightIdx(0)
  }

  function handleLeave() {
    setHighlightIdx(-1)
  }

  return (
    <section id="about" className="bg-black py-20 sm:py-28 md:py-36 px-4 sm:px-6">
      <style>{styles}</style>
      <div ref={ref} className="bg-[#101010] rounded-2xl sm:rounded-3xl max-w-6xl mx-auto p-6 sm:p-10 md:p-16 lg:p-20 text-center">
        <p
          ref={labelTilt}
          onMouseMove={onLabelMove}
          onMouseLeave={onLabelLeave}
          className="text-primary text-[10px] sm:text-xs tracking-widest uppercase mb-4 sm:mb-6 md:mb-8"
          style={{ transition: 'transform 0.12s ease-out' }}
        >
          Machine Learning
        </p>

        <div
          ref={headingTilt}
          onMouseMove={onHeadingMove}
          onMouseLeave={onHeadingLeave}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl max-w-3xl mx-auto"
          style={{ lineHeight: '0.95', transition: 'transform 0.12s ease-out' }}
        >
          <WordsPullUpMultiStyle
            segments={[
              { text: 'Sentiment analysis', className: 'font-normal' },
              { text: 'decodes emotions', className: 'font-serif italic' },
              { text: 'from text using machine learning models trained on thousands of labeled examples.', className: 'font-normal' },
            ]}
            />
          </div>

        <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 max-w-2xl mx-auto">
          <div
            className="text-primary text-xs sm:text-sm md:text-base leading-relaxed"
            onMouseEnter={handleEnter}
            onMouseLeave={handleLeave}
          >
            {words.map((word, i) =>
              word.trim() === '' ? (
                <span key={i}>{word}</span>
              ) : (
                <span
                  key={i}
                  className={`word-highlight ${i <= highlightIdx ? 'active' : ''}`}
                  onMouseEnter={() => setHighlightIdx(i)}
                >
                  {word}
                </span>
              )
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
