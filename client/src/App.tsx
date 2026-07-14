import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Github, Heart } from 'lucide-react'
import Hero from './components/Hero'
import About from './components/About'
import Features from './components/Features'
import Demo from './components/Demo'
import { checkHealth } from './lib/api'

function Footer() {
  return (
    <footer className="bg-black border-t border-white/5 py-8 sm:py-10 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-gray-500 text-xs sm:text-sm">
          Built with <Heart className="w-3.5 h-3.5 text-red-400 fill-red-400" />
          <span className="hidden sm:inline">— SentimentSense v1.0</span>
        </div>
        <a
          href="https://github.com/ahmedume/Sentiment-Analysis"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-primary text-xs sm:text-sm transition-colors duration-300"
        >
          <Github className="w-4 h-4" />
          View on GitHub
        </a>
      </div>
    </footer>
  )
}

function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 400)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 z-50 bg-primary text-black rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300"
        >
          <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
        </motion.button>
      )}
    </AnimatePresence>
  )
}

function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <div className="fixed top-4 right-4 z-50 sm:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="bg-black/80 backdrop-blur-md rounded-full p-2.5 border border-white/10"
      >
        {open ? <X className="w-5 h-5 text-primary" /> : <Menu className="w-5 h-5 text-primary" />}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 bg-black/95 backdrop-blur-xl rounded-2xl border border-white/10 p-4 min-w-[180px]"
          >
            <ul className="space-y-3">
              {['Our story', 'Features', 'Demo', 'Source'].map((item) => (
                <li key={item}>
                  <a
                    href={item === 'Demo' ? '#demo' : '#'}
                    onClick={() => setOpen(false)}
                    className="block text-sm text-gray-400 hover:text-primary transition-colors"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function App() {
  useEffect(() => {
    checkHealth().catch(() => {})
  }, [])

  return (
    <div className="bg-black text-primary min-h-screen">
      <MobileNav />

      <Hero />
      <About />
      <Features />
      <Demo />
      <Footer />
      <BackToTop />
    </div>
  )
}
