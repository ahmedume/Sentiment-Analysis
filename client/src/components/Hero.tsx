import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, Sparkles, ChevronDown } from 'lucide-react'
import { useRef, useState } from 'react'
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
        <video
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
            type="video/mp4"
          />
        </video>

        <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/60 to-black/90" />

        <div className="noise-overlay" />

        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/70" />

        <nav className="absolute top-0 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-black rounded-b-2xl md:rounded-b-3xl px-3 py-1.5 md:px-6">
            <ul className="flex items-center gap-2 sm:gap-4 md:gap-8 lg:gap-10">
              <li>
                <a
                  href="#about"
                  className="text-[9px] sm:text-[10px] md:text-xs transition-colors duration-300"
                  style={{ color: 'rgba(225, 224, 204, 0.8)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#E1E0CC')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(225, 224, 204, 0.8)')}
                >
                  About
                </a>
              </li>
              <li className="relative group">
                <button
                  className="flex items-center gap-1 text-[9px] sm:text-[10px] md:text-xs transition-colors duration-300 cursor-pointer"
                  style={{ color: 'rgba(225, 224, 204, 0.8)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#E1E0CC')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(225, 224, 204, 0.8)')}
                >
                  Features
                  <ChevronDown className="w-2.5 h-2.5 transition-transform duration-200 group-hover:rotate-180" />
                </button>
                <div className="absolute top-full left-1/2 -translate-x-1/2 pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  <div className="bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl p-2 min-w-[160px] flex flex-col gap-1">
                    {[
                      { label: 'Model Comparison', href: '#comparison' },
                      { label: 'Real-Time Inference', href: '#inference' },
                      { label: 'Preprocessing', href: '#preprocessing' },
                      { label: 'Evaluation Suite', href: '#evaluation' },
                    ].map((f) => (
                      <a
                        key={f.href}
                        href={f.href}
                        className="text-[10px] sm:text-[11px] px-3 py-1.5 rounded-lg transition-colors duration-200 hover:bg-white/5"
                        style={{ color: 'rgba(225, 224, 204, 0.8)' }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = '#E1E0CC')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(225, 224, 204, 0.8)')}
                      >
                        {f.label}
                      </a>
                    ))}
                  </div>
                </div>
              </li>
              <li>
                <a
                  href="#demo"
                  className="text-[9px] sm:text-[10px] md:text-xs transition-colors duration-300"
                  style={{ color: 'rgba(225, 224, 204, 0.8)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#E1E0CC')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(225, 224, 204, 0.8)')}
                >
                  Demo
                </a>
              </li>
              <li>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    window.open('https://github.com/ahmedume/Sentiment-Analysis', '_blank')
                  }}
                  className="text-[9px] sm:text-[10px] md:text-xs transition-colors duration-300"
                  style={{ color: 'rgba(225, 224, 204, 0.8)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#E1E0CC')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(225, 224, 204, 0.8)')}
                >
                  GitHub
                </a>
              </li>
            </ul>
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-10 lg:p-16 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-8 items-end">
            <div className="lg:col-span-8 overflow-hidden">
              <h1 className="relative">
                <span
                  className="font-medium leading-[0.88] tracking-[-0.06em] block"
                  style={{ color: '#E1E0CC' }}
                >
                  <span className="text-[13vw] sm:text-[11vw] md:text-[9vw] lg:text-[7.5vw] xl:text-[6.5vw] 2xl:text-[6vw] block break-words">
                    <WordsPullUp text="SentimentSense" delay={0.2} showAsterisk />
                  </span>
                </span>
              </h1>
            </div>

            <div className="lg:col-span-4 flex flex-col gap-3 sm:gap-4">
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="text-primary/70 text-[10px] sm:text-xs md:text-sm lg:text-base leading-snug"
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
                  className="group inline-flex items-center gap-2 bg-primary rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-black font-medium text-[11px] sm:text-xs md:text-sm transition-all duration-300 hover:gap-3"
                >
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Try the demo
                  <span className="bg-black rounded-full w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                    <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 text-primary" />
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
