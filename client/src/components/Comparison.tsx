import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { Brain, Cpu, Database, BarChart3, TrendingUp, Target } from 'lucide-react'

const modelData = [
  {
    name: 'Linear SVM',
    icon: Cpu,
    color: '#4ade80',
    brief: 'Finds the optimal hyperplane that best separates classes in high-dimensional space.',
    howItWorks: [
      'Projects text into TF-IDF feature space (15K dimensions)',
      'Finds the hyperplane that maximizes the margin between classes',
      'Uses squared hinge loss with L2 regularization',
      'Applies a softmax to decision scores for probability estimates',
    ],
    pros: ['Effective in high-dimensional spaces', 'Memory efficient (uses support vectors)', 'Less prone to overfitting'],
    cons: ['No native probability estimates', 'Less interpretable than LR', 'Requires feature scaling'],
  },
  {
    name: 'Logistic Regression',
    icon: Brain,
    color: '#60a5fa',
    brief: 'Models class probability via a logistic function applied to a linear decision boundary.',
    howItWorks: [
      'Projects text into TF-IDF feature space (15K dimensions)',
      'Applies a sigmoid function to the weighted sum of features',
      'Optimizes cross-entropy loss via L-BFGS',
      'Outputs well-calibrated probabilities directly',
    ],
    pros: ['Natively calibrated probabilities', 'Highly interpretable coefficients', 'Fast training and inference'],
    cons: ['Assumes linear decision boundary', 'Can struggle with complex feature interactions', 'More sensitive to outliers'],
  },
]

const metricsTable = [
  { metric: 'Macro F1', svmBefore: '0.760', svmAfter: '0.871', lrBefore: '0.751', lrAfter: '0.868' },
  { metric: 'Accuracy', svmBefore: '0.765', svmAfter: '0.872', lrBefore: '0.755', lrAfter: '0.869' },
  { metric: 'Precision (macro)', svmBefore: '0.761', svmAfter: '0.871', lrBefore: '0.752', lrAfter: '0.868' },
  { metric: 'Recall (macro)', svmBefore: '0.760', svmAfter: '0.870', lrBefore: '0.750', lrAfter: '0.868' },
  { metric: 'Neutral F1', svmBefore: '0.707', svmAfter: '0.853', lrBefore: '0.698', lrAfter: '0.851' },
]

const perClass = [
  { class: 'Negative', svmPrec: '0.889', svmRec: '0.891', svmF1: '0.890', lrPrec: '0.888', lrRec: '0.885', lrF1: '0.886' },
  { class: 'Neutral', svmPrec: '0.863', svmRec: '0.843', svmF1: '0.853', lrPrec: '0.858', lrRec: '0.845', lrF1: '0.851' },
  { class: 'Positive', svmPrec: '0.862', svmRec: '0.876', svmF1: '0.869', lrPrec: '0.859', lrRec: '0.875', lrF1: '0.867' },
]

const configTable = [
  { param: 'TF-IDF Features', svm: '15,000', lr: '15,000' },
  { param: 'N-gram Range', svm: 'Unigrams + Bigrams + Trigrams', lr: 'Unigrams + Bigrams + Trigrams' },
  { param: 'Regularization', svm: 'L2 (squared hinge)', lr: 'L2 (L-BFGS)' },
  { param: 'C (inverse reg. strength)', svm: '10.0 (grid-searched)', lr: '10.0 (grid-searched)' },
  { param: 'Class Weight', svm: 'Balanced', lr: 'Balanced' },
  { param: 'Max Iterations', svm: '5,000', lr: '2,000' },
  { param: 'Feature Engineering', svm: 'Word count, avg word len, !/?, negation ratio', lr: 'Word count, avg word len, !/?, negation ratio' },
  { param: 'Preprocessing', svm: 'Stemming, stopwords, negation handling, emoji→text', lr: 'Stemming, stopwords, negation handling, emoji→text' },
  { param: 'Inference Speed', svm: '~1-2ms', lr: '~1ms' },
]

function ModelCard({ model, index }: { model: typeof modelData[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const Icon = model.icon

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay: index * 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="bg-[#101010] rounded-2xl p-6 sm:p-8 flex-1"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="bg-[#1a1a1a] rounded-xl p-3">
          <Icon className="w-6 h-6" style={{ color: model.color }} />
        </div>
        <h3 className="text-primary text-lg sm:text-xl font-medium">{model.name}</h3>
      </div>

      <p className="text-gray-400 text-sm sm:text-base leading-relaxed mb-5">{model.brief}</p>

      <div className="mb-5">
        <h4 className="text-primary text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
          <Target className="w-3.5 h-3.5" /> How It Works
        </h4>
        <ul className="space-y-2">
          {model.howItWorks.map((step, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-gray-400">
              <span className="text-primary/60 mt-0.5">{'0'}{i + 1}</span>
              {step}
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <h4 className="text-primary text-xs uppercase tracking-widest mb-2">Strengths</h4>
          <ul className="space-y-1.5">
            {model.pros.map((p, i) => (
              <li key={i} className="text-xs sm:text-sm text-gray-400 flex items-start gap-1.5">
                <span className="text-green-500 mt-0.5">+</span> {p}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-primary text-xs uppercase tracking-widest mb-2">Limitations</h4>
          <ul className="space-y-1.5">
            {model.cons.map((c, i) => (
              <li key={i} className="text-xs sm:text-sm text-gray-400 flex items-start gap-1.5">
                <span className="text-red-500/70 mt-0.5">−</span> {c}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  )
}

export default function Comparison() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-100px' })

  return (
    <section id="comparison" className="bg-black py-20 sm:py-28 md:py-36 px-4 sm:px-6">
      <div ref={ref} className="max-w-6xl mx-auto">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={inView ? { y: 0, opacity: 1 } : {}}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center mb-12 sm:mb-16"
        >
          <p className="text-primary text-[10px] sm:text-xs tracking-widest uppercase mb-3">Model Breakdown</p>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium leading-tight">
            Linear SVM vs Logistic Regression
          </h2>
          <p className="text-gray-400 text-xs sm:text-sm md:text-base mt-3 max-w-2xl mx-auto">
            Two fundamentally different approaches to classification, trained side by side on identical data and evaluated with the same metrics.
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6 mb-12 sm:mb-16">
          {modelData.map((m, i) => (
            <ModelCard key={m.name} model={m} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.3, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#101010] rounded-2xl p-6 sm:p-8 mb-6 sm:mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h3 className="text-primary text-lg sm:text-xl font-medium">Before vs After — Macro Metrics</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-3 pr-4 text-gray-500 font-medium">Metric</th>
                  <th className="py-3 px-4 text-gray-500 font-medium text-center" colSpan={2}>Linear SVM</th>
                  <th className="py-3 px-4 text-gray-500 font-medium text-center" colSpan={2}>Logistic Regression</th>
                </tr>
                <tr className="border-b border-white/5 text-[10px] sm:text-xs text-gray-500">
                  <th className="pb-2 pr-4" />
                  <th className="pb-2 px-4 text-center">Before</th>
                  <th className="pb-2 px-4 text-center">After</th>
                  <th className="pb-2 px-4 text-center">Before</th>
                  <th className="pb-2 px-4 text-center">After</th>
                </tr>
              </thead>
              <tbody>
                {metricsTable.map((row) => (
                  <tr key={row.metric} className="border-b border-white/5 last:border-0">
                    <td className="py-3 pr-4 text-primary font-medium">{row.metric}</td>
                    <td className="py-3 px-4 text-center text-gray-500">{row.svmBefore}</td>
                    <td className="py-3 px-4 text-center text-green-400 font-medium">{row.svmAfter}</td>
                    <td className="py-3 px-4 text-center text-gray-500">{row.lrBefore}</td>
                    <td className="py-3 px-4 text-center text-blue-400 font-medium">{row.lrAfter}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#101010] rounded-2xl p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <BarChart3 className="w-5 h-5 text-primary" />
              <h3 className="text-primary text-lg sm:text-xl font-medium">Per-Class Performance</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="py-3 pr-3 text-gray-500 font-medium">Class</th>
                    <th className="py-3 px-3 text-gray-500 font-medium text-center" colSpan={3}>Linear SVM</th>
                    <th className="py-3 px-3 text-gray-500 font-medium text-center" colSpan={3}>Logistic Regression</th>
                  </tr>
                  <tr className="border-b border-white/5 text-[10px] sm:text-xs text-gray-500">
                    <th className="pb-2 pr-3" />
                    <th className="pb-2 px-2 text-center">P</th>
                    <th className="pb-2 px-2 text-center">R</th>
                    <th className="pb-2 px-2 text-center">F1</th>
                    <th className="pb-2 px-2 text-center">P</th>
                    <th className="pb-2 px-2 text-center">R</th>
                    <th className="pb-2 px-2 text-center">F1</th>
                  </tr>
                </thead>
                <tbody>
                  {perClass.map((row) => (
                    <tr key={row.class} className="border-b border-white/5 last:border-0">
                      <td className="py-3 pr-3 text-primary font-medium">{row.class}</td>
                      <td className="py-3 px-2 text-center text-green-400/80">{row.svmPrec}</td>
                      <td className="py-3 px-2 text-center text-green-400/80">{row.svmRec}</td>
                      <td className="py-3 px-2 text-center text-green-400 font-medium">{row.svmF1}</td>
                      <td className="py-3 px-2 text-center text-blue-400/80">{row.lrPrec}</td>
                      <td className="py-3 px-2 text-center text-blue-400/80">{row.lrRec}</td>
                      <td className="py-3 px-2 text-center text-blue-400 font-medium">{row.lrF1}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.5, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="bg-[#101010] rounded-2xl p-6 sm:p-8"
          >
            <div className="flex items-center gap-3 mb-6">
              <Database className="w-5 h-5 text-primary" />
              <h3 className="text-primary text-lg sm:text-xl font-medium">Training Configuration</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="py-3 pr-4 text-gray-500 font-medium">Parameter</th>
                    <th className="py-3 px-4 text-gray-500 font-medium text-center">SVM</th>
                    <th className="py-3 px-4 text-gray-500 font-medium text-center">LR</th>
                  </tr>
                </thead>
                <tbody>
                  {configTable.map((row) => (
                    <tr key={row.param} className="border-b border-white/5 last:border-0">
                      <td className="py-3 pr-4 text-primary/80 text-[10px] sm:text-xs">{row.param}</td>
                      <td className="py-3 px-4 text-center text-gray-400 text-[10px] sm:text-xs">{row.svm}</td>
                      <td className="py-3 px-4 text-center text-gray-400 text-[10px] sm:text-xs">{row.lr}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="bg-[#101010] rounded-2xl p-6 sm:p-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Database className="w-5 h-5 text-primary" />
            <h3 className="text-primary text-lg sm:text-xl font-medium">Dataset</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="py-3 pr-4 text-gray-500 font-medium">Detail</th>
                  <th className="py-3 px-4 text-gray-500 font-medium text-center">Value</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ['Source', 'Twitter sentiment dataset (public)'],
                  ['Raw samples', '75,682 (two CSV files)'],
                  ['After cleaning', '57,490 (24% removed)'],
                  ['Classes', 'Positive, Negative, Neutral'],
                  ['Training set', '40,242 samples (70%)'],
                  ['Validation set', '8,624 samples (15%)'],
                  ['Test set', '8,624 samples (15%)'],
                  ['Splitting', 'Stratified by label'],
                  ['Preprocessing', 'Lowercase, HTML strip, URL removal, emoji→text, stemming, stopword removal, negation handling'],
                  ['Vectorization', 'TF-IDF with 15,000 features, unigram+bigram+trigram, sublinear tf'],
                ].map(([detail, value]) => (
                  <tr key={detail} className="border-b border-white/5 last:border-0">
                    <td className="py-3 pr-4 text-primary/80 font-medium">{detail}</td>
                    <td className="py-3 px-4 text-center text-gray-400">{value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
