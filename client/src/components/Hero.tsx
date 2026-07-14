import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import WordsPullUp from './WordsPullUp'
import { useTilt } from '../lib/useTilt'

export default function Hero() {
  const { ref: tiltRef, handleMouseMove, handleMouseLeave } = useTilt(20)
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
Try it out
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

        <div className="absolute top-16 sm:top-20 left-0 right-0 p-4 sm:p-6 md:p-10 lg:p-16 z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-8 items-start">
            <div className="lg:col-span-8 overflow-hidden">
              <h1 className="relative">
                <div
                  ref={tiltRef}
                  onMouseMove={handleMouseMove}
                  onMouseLeave={handleMouseLeave}
                  className="font-medium leading-[0.88] tracking-[-0.06em] block text-left"
                  style={{ color: '#E1E0CC', transition: 'transform 0.15s ease-out' }}
                >
                  <span className="text-[13vw] sm:text-[11vw] md:text-[9vw] lg:text-[7.5vw] xl:text-[6.5vw] 2xl:text-[6vw] block break-words">
                    <WordsPullUp text="Sentiment Analysis" delay={0.2} showAsterisk />
                  </span>
                </div>
              </h1>
            </div>
            <div className="lg:col-span-4 flex flex-col gap-3 sm:gap-4 pt-2 sm:pt-4">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                className="group cursor-default"
              >
                <div className="overflow-hidden origin-top transition-all duration-500 ease-[0.22,1,0.36,1] group-hover:scale-y-[1.15]">
                  <p className="text-primary/70 text-base sm:text-lg md:text-xl lg:text-2xl leading-relaxed">
                    An end-to-end sentiment analysis system powered by machine learning.
                    Trained on Twitter data, deployed with FastAPI, and wrapped in an
                    immersive experience. Understand emotions in text, instantly.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
