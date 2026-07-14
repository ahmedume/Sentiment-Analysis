import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Send, Activity, Brain, Cpu, Loader2 } from 'lucide-react'
import { predictSentiment, type PredictResponse } from '../lib/api'

type ModelMode = 'svm' | 'lr' | 'both'

interface ResultDisplay {
  model: string
  sentiment: string
  confidence: number
  probabilities: Record<string, number>
  processing_time_ms: number
}

const EXAMPLES = [
  { text: 'I absolutely love this product! It exceeded all my expectations.', label: 'Positive' },
  { text: 'This is the worst experience I have ever had. Terrible service.', label: 'Negative' },
  { text: 'The package arrived on time. Nothing special about it.', label: 'Neutral' },
  { text: 'Not bad for the price, but could be better.', label: 'Mixed' },
  { text: 'Absolutely incredible and mind-blowing quality!', label: 'Positive' },
]

function ProbabilityBar({ label, value, maxValue, color }: { label: string; value: number; maxValue: number; color: string }) {
  const pct = (value / maxValue) * 100
  return (
    <div className="flex items-center gap-2 sm:gap-3">
      <span className="text-[10px] sm:text-xs text-gray-400 w-14 sm:w-16 shrink-0">{label}</span>
      <div className="flex-1 h-2 sm:h-2.5 bg-[#2a2a2a] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="h-full rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>
      <span className="text-[10px] sm:text-xs font-mono w-10 sm:w-12 text-right" style={{ color }}>
        {(value * 100).toFixed(0)}%
      </span>
    </div>
  )
}

function ResultCard({
  result,
  isWinner,
  icon: Icon,
}: {
  result: ResultDisplay
  isWinner: boolean
  icon: typeof Brain
}) {
  const maxProb = Math.max(...Object.values(result.probabilities))
  const colors: Record<string, string> = {
    positive: '#4ade80',
    negative: '#f87171',
    neutral: '#facc15',
  }

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 20 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`bg-[#101010] rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 flex-1 relative overflow-hidden ${isWinner ? 'ring-1 ring-primary/30' : ''}`}
    >
      {isWinner && (
        <div className="absolute top-3 right-3 bg-primary text-black text-[9px] sm:text-[10px] font-bold px-2 py-0.5 rounded-full">
          BEST
        </div>
      )}

      <div className="flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
        <div className="bg-[#2a2a2a] rounded-lg p-1.5 sm:p-2">
          <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
        </div>
        <div>
          <div className="text-primary text-xs sm:text-sm font-medium">
            {result.model === 'svm' ? 'Linear SVM' : 'Logistic Regression'}
          </div>
          <div className="text-gray-500 text-[10px] sm:text-xs">{result.processing_time_ms}ms</div>
        </div>
      </div>

      <div className="mb-3 sm:mb-4">
        <div className="text-[10px] sm:text-xs text-gray-500 mb-1">Prediction</div>
        <motion.div
          key={result.sentiment}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-base sm:text-lg md:text-xl font-bold flex items-center gap-2"
          style={{ color: colors[result.sentiment] ?? '#E1E0CC' }}
        >
          <span className="capitalize">{result.sentiment}</span>
          <span className="text-xs sm:text-sm font-mono opacity-70">
            {(result.confidence * 100).toFixed(1)}%
          </span>
        </motion.div>
      </div>

      <div className="space-y-1.5 sm:space-y-2">
        {Object.entries(result.probabilities).map(([label, value]) => (
          <ProbabilityBar
            key={label}
            label={label}
            value={value}
            maxValue={maxProb}
            color={colors[label] ?? '#E1E0CC'}
          />
        ))}
      </div>
    </motion.div>
  )
}

export default function Demo() {
  const [text, setText] = useState('')
  const [mode, setMode] = useState<ModelMode>('both')
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<PredictResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  const handlePredict = async () => {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const res = await predictSentiment(text, mode)
      if (!res.success && res.error) {
        setError(res.error.message)
      } else {
        setResponse(res)
      }
    } catch {
      setError('Failed to connect to the API. Make sure the server is running.')
    } finally {
      setLoading(false)
    }
  }

  const results: ResultDisplay[] = []
  if (response?.data) {
    if (response.data.comparison && response.data.results) {
      results.push(...response.data.results)
    } else if (response.data.sentiment && response.data.model && response.data.confidence && response.data.probabilities) {
      results.push({
        model: response.data.model,
        sentiment: response.data.sentiment,
        confidence: response.data.confidence,
        probabilities: response.data.probabilities,
        processing_time_ms: response.data.processing_time_ms ?? 0,
      })
    }
  }

  const bestResult = results.length > 1
    ? results.reduce((best, r) => (r.confidence > best.confidence ? r : best))
    : null

  return (
    <section id="demo" className="bg-black py-16 sm:py-20 md:py-28 px-4 sm:px-6">
      <div ref={ref} className="max-w-5xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-8 sm:mb-10 md:mb-14"
        >
          <p className="text-primary text-[10px] sm:text-xs tracking-widest uppercase mb-3">Try it out</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium leading-tight">
            Predict sentiment in real time
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm md:text-base mt-2 sm:mt-3 max-w-xl mx-auto">
            Type any text below and watch both models analyze its emotional tone instantly.
          </p>
        </motion.div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ delay: 0.15, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="bg-[#101010] rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6"
        >
          <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
            {EXAMPLES.map((ex) => (
              <button
                key={ex.text}
                onClick={() => setText(ex.text)}
                className="text-[10px] sm:text-xs bg-[#212121] hover:bg-[#2a2a2a] text-gray-400 hover:text-primary px-2.5 py-1 rounded-full transition-all duration-200 border border-transparent hover:border-primary/20"
              >
                {ex.label}
              </button>
            ))}
          </div>

          <div className="relative">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type or paste text to analyze..."
              rows={3}
              className="w-full bg-[#212121] text-primary rounded-xl p-3 sm:p-4 text-sm sm:text-base resize-none outline-none border border-transparent focus:border-primary/30 transition-all duration-300 placeholder:text-gray-600"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handlePredict()
              }}
            />
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mt-3 sm:mt-4">
            <div className="flex items-center gap-2">
              {(['svm', 'lr', 'both'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`text-[10px] sm:text-xs px-3 py-1.5 rounded-full transition-all duration-300 border ${
                    mode === m
                      ? 'bg-primary/10 text-primary border-primary/40'
                      : 'bg-[#212121] text-gray-400 border-transparent hover:border-gray-600'
                  }`}
                >
                  {m === 'svm' ? 'SVM' : m === 'lr' ? 'LR' : 'Both'}
                </button>
              ))}
            </div>

            <button
              onClick={handlePredict}
              disabled={!text.trim() || loading}
              className="group inline-flex items-center gap-2 bg-primary text-black font-medium text-xs sm:text-sm rounded-full px-4 sm:px-5 py-2 sm:py-2.5 transition-all duration-300 hover:gap-3 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-900/20 border border-red-500/20 rounded-xl p-3 sm:p-4 mb-4"
          >
            <p className="text-red-400 text-xs sm:text-sm">{error}</p>
          </motion.div>
        )}

        {results.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-3 sm:space-y-4"
          >
            <div className="flex items-center gap-2 text-gray-500 text-[10px] sm:text-xs">
              <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
              Results for: <span className="text-primary/70 truncate max-w-[200px] sm:max-w-[300px]">{response?.data?.text}</span>
              {response?.data?.truncated && <span className="text-yellow-500">(truncated)</span>}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              {results.map((result) => (
                <ResultCard
                  key={result.model}
                  result={result}
                  isWinner={bestResult?.model === result.model && results.length > 1}
                  icon={result.model === 'svm' ? Cpu : Brain}
                />
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </section>
  )
}
