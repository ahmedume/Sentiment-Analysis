import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Check, ArrowRight, BarChart3, Brain, Cpu, Shield } from 'lucide-react'
import WordsPullUpMultiStyle from './WordsPullUpMultiStyle'

const features = [
  {
    id: 'comparison',
    icon: Brain,
    title: 'Two-Model Comparison',
    num: '01',
    desc: 'Train and compare Linear SVM vs Logistic Regression.',
    items: ['Linear SVM (76.0% macro F1)', 'Logistic Regression (75.1% macro F1)', 'Side-by-side prediction mode'],
    link: 'Compare models',
  },
  {
    id: 'inference',
    icon: Cpu,
    title: 'Real-Time Inference',
    num: '02',
    desc: 'Sub-millisecond predictions via FastAPI.',
    items: ['RESTful API with POST /predict', 'Singleton model loader', '0–1ms CPU inference'],
    link: 'Try the API',
  },
  {
    id: 'preprocessing',
    icon: Shield,
    title: 'Robust Preprocessing',
    num: '03',
    desc: 'Clean text before it reaches the model.',
    items: ['HTML & URL stripping', 'Emoji-to-text conversion', 'Special character filtering'],
    link: 'View pipeline',
  },
  {
    id: 'evaluation',
    icon: BarChart3,
    title: 'Full Evaluation Suite',
    num: '04',
    desc: 'Comprehensive metrics and visualizations.',
    items: ['Accuracy, Precision, Recall, F1', 'Confusion matrix heatmap', 'Class distribution & word clouds'],
    link: 'See reports',
  },
]

function FeatureCard({
  id,
  icon: Icon,
  title,
  num,
  items,
  link,
  index,
}: {
  id: string
  icon: typeof Brain
  title: string
  num: string
  items: string[]
  link: string
  index: number
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <motion.div
      id={id}
      ref={ref}
      initial={{ scale: 0.95, opacity: 0 }}
      animate={inView ? { scale: 1, opacity: 1 } : {}}
      transition={{ delay: index * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group bg-[#212121] rounded-xl sm:rounded-2xl p-4 sm:p-5 md:p-6 flex flex-col cursor-default"
    >
      <div className="flex items-start justify-between mb-3 sm:mb-4">
        <div className="bg-[#2a2a2a] rounded-lg p-2 sm:p-3">
          <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 text-primary/60 -rotate-45 transition-all duration-300 group-hover:rotate-0 group-hover:text-primary" />
          <span className="text-gray-500 text-xs sm:text-sm font-mono">{num}</span>
        </div>
      </div>

      <h3 className="text-primary text-sm sm:text-base md:text-lg font-medium mb-2 sm:mb-3">{title}</h3>

      <div className="flex-1 space-y-1.5 sm:space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2">
            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary mt-0.5 shrink-0" />
            <span className="text-gray-400 text-[11px] sm:text-xs md:text-sm">{item}</span>
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export default function Features() {
  const headerRef = useRef<HTMLDivElement>(null)
  useInView(headerRef, { once: true, margin: '-100px' })

  return (
    <section id="features" className="relative min-h-screen bg-black py-16 sm:py-20 md:py-28 px-4 sm:px-6 overflow-hidden">
      <div className="bg-noise" />

      <div ref={headerRef} className="text-center mb-10 sm:mb-14 md:mb-18">
        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal leading-tight">
          <WordsPullUpMultiStyle
            segments={[
              { text: 'Production-grade ML workflows', className: '' },
            ]}
          />
        </div>
        <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-normal leading-tight mt-1">
          <WordsPullUpMultiStyle
            segments={[
              { text: 'for emotion-aware applications.', className: 'text-gray-500' },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 max-w-7xl mx-auto">
        {features.map((feature, i) => (
          <FeatureCard key={feature.title} {...feature} index={i} />
        ))}
      </div>
    </section>
  )
}
