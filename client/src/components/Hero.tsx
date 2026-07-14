import { motion } from 'framer-motion'
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

        <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 md:p-10 lg:p-16 z-10">
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
