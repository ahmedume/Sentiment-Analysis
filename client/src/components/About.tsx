import { useRef } from 'react'
import { useInView } from 'framer-motion'
import WordsPullUpMultiStyle from './WordsPullUpMultiStyle'

export default function About() {
  const ref = useRef<HTMLDivElement>(null)
  useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="about" className="bg-black py-20 sm:py-28 md:py-36 px-4 sm:px-6">
      <div ref={ref} className="bg-[#101010] rounded-2xl sm:rounded-3xl max-w-6xl mx-auto p-6 sm:p-10 md:p-16 lg:p-20 text-center">
        <p className="text-primary text-[10px] sm:text-xs tracking-widest uppercase mb-4 sm:mb-6 md:mb-8">
          Machine Learning
        </p>

        <div
          className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl max-w-3xl mx-auto"
          style={{ lineHeight: '0.95' }}
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
          <div className="text-primary text-xs sm:text-sm md:text-base leading-relaxed">
            Built with scikit-learn and FastAPI, SentimentSense classifies text into Positive, Negative, or Neutral classes. Two models, Linear SVM and Logistic Regression, are trained on Twitter data and compared side by side, with the best model served through a RESTful API.
          </div>
        </div>
      </div>
    </section>
  )
}
