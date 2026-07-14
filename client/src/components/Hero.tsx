import { motion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useRef } from 'react'
import { useInView } from 'framer-motion'
import WordsPullUp from './WordsPullUp'

export default function Hero() {
  const ctaRef = useRef<HTMLDivElement>(null)
  const ctaInView = useInView(ctaRef, { once: true })

  const scrollToDemo = () => {
    document.getElementById('demo')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="h-screen p-4 md:p-6">
      <div className="relative h-full w-full overflow-hidden rounded-2xl md:rounded-[2rem]">
        <div
          className="absolute inset-0 bg-gradient-to-br from-black via-black/95 to-[#0a0a0a]"
        />

        <div
          className="absolute inset-0 opacity-30"
          style={{
            background: `radial-gradient(circle at 30% 50%, rgba(222, 219, 200, 0.08) 0%, transparent 60%),
                         radial-gradient(circle at 80% 20%, rgba(222, 219, 200, 0.05) 0%, transparent 50%),
                         radial-gradient(circle at 50% 80%, rgba(100, 100, 80, 0.06) 0%, transparent 50%)`,
          }}
        />

        <div className="noise-overlay" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

        <nav className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-black rounded-b-2xl md:rounded-b-3xl px-4 py-2 md:px-8">
            <ul className="flex items-center gap-3 sm:gap-6 md:gap-12 lg:gap-14">
              {['Our story', 'Features', 'Demo', 'Models', 'Source'].map((item) => (
                <li key={item}>
                  <a
                    href={item === 'Demo' ? '#demo' : '#'}
                    onClick={(e) => {
                      if (item === 'Source') {
                        e.preventDefault()
                        window.open('https://github.com/ahmedume/Sentiment-Analysis', '_blank')
                      }
                    }}
                    className="text-[10px] sm:text-xs md:text-sm transition-colors duration-300"
                    style={{ color: 'rgba(225, 224, 204, 0.8)' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#E1E0CC')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(225, 224, 204, 0.8)')}
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 lg:p-16 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-12 items-end">
            <div className="lg:col-span-8">
              <h1 className="relative inline-block">
                <span
                  className="font-medium leading-[0.85] tracking-[-0.07em] block"
                  style={{
                    fontSize: 'clamp(3rem, 26vw, 19vw)',
                    color: '#E1E0CC',
                  }}
                >
                  <WordsPullUp text="SentimentSense" delay={0.2} showAsterisk />
                </span>
              </h1>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-4 sm:gap-6">
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-primary/70 text-xs sm:text-sm md:text-base leading-tight"
                style={{ lineHeight: 1.2 }}
              >
                An end-to-end sentiment analysis system powered by machine learning.
                Trained on Twitter data, deployed with FastAPI, and wrapped in an
                immersive experience. Understand emotions in text — instantly.
              </motion.p>

              <motion.div
                ref={ctaRef}
                initial={{ y: 20, opacity: 0 }}
                animate={ctaInView ? { y: 0, opacity: 1 } : {}}
                transition={{ delay: 0.7, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
              >
                <button
                  onClick={scrollToDemo}
                  className="group inline-flex items-center gap-2 bg-primary rounded-full px-4 sm:px-5 py-2 sm:py-2.5 text-black font-medium text-sm sm:text-base transition-all duration-300 hover:gap-3"
                >
                  <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  Try the demo
                  <span className="bg-black rounded-full w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  </span>
                </button>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
