import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  SparklesIcon,
  BarChart3Icon,
  MessageSquareIcon,
  TargetIcon,
  MenuIcon,
  XIcon,
  ArrowRightIcon,
  UploadCloudIcon,
  ZapIcon,
  LineChartIcon,
} from 'lucide-react'
const fadeInUp = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: 'easeOut',
    },
  },
}
const staggerContainer = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
}
export function LandingPage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  return (
    <div className="min-h-screen bg-brand-bg font-sans text-brand-text selection:bg-brand selection:text-brand-text">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-brand-bg/80 backdrop-blur-md border-b border-gray-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="bg-brand/30 p-2 rounded-xl text-brand-hover">
                <SparklesIcon size={22} />
              </div>
              <span className="font-heading font-bold text-xl tracking-tight">
                Budgetly
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              <a
                href="#features"
                className="text-brand-muted hover:text-brand-text transition-colors text-sm font-medium"
              >
                Features
              </a>
              <a
                href="#how-it-works"
                className="text-brand-muted hover:text-brand-text transition-colors text-sm font-medium"
              >
                How It Works
              </a>
              <Link to="/login" className="bg-brand hover:bg-brand-hover text-brand-text font-medium px-5 py-2 rounded-xl transition-all shadow-sm hover:shadow-md text-sm flex items-center gap-2">
                Get Started <ArrowRightIcon size={16} />
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-brand-muted"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <XIcon size={24} /> : <MenuIcon size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b border-gray-100 px-4 pt-2 pb-4 space-y-1 shadow-lg">
            <a
              href="#features"
              className="block px-3 py-2 text-brand-muted hover:bg-brand-bg rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="block px-3 py-2 text-brand-muted hover:bg-brand-bg rounded-md"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <Link to="/login" className="w-full mt-2 bg-brand text-brand-text font-medium px-5 py-2 rounded-xl flex justify-center items-center gap-2">
              Get Started <ArrowRightIcon size={16} />
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto overflow-hidden">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-2xl"
          >
            <motion.div
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/20 text-brand-hover text-sm font-medium mb-6 border border-brand/30"
            >
              <SparklesIcon size={14} />
              <span>AI-Powered Finance</span>
            </motion.div>
            <motion.h1
              variants={fadeInUp}
              className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold leading-[1.1] tracking-tight mb-6 text-brand-text"
            >
              Your intelligent <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-hover to-brand-text">
                financial companion.
              </span>
            </motion.h1>
            <motion.p
              variants={fadeInUp}
              className="text-lg text-brand-muted mb-8 leading-relaxed max-w-lg"
            >
              Budgetly uses advanced AI to analyze your real financial data,
              providing personalized insights, smart categorization, and
              actionable savings strategies.
            </motion.p>
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link to="/login" className="bg-brand hover:bg-brand-hover text-brand-text font-medium px-6 py-3 rounded-xl transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2">
                Get Started Free <ArrowRightIcon size={18} />
              </Link>
              <button className="bg-white hover:bg-gray-50 text-brand-text border border-gray-200 font-medium px-6 py-3 rounded-xl transition-all flex items-center justify-center shadow-sm">
                See How It Works
              </button>
            </motion.div>
          </motion.div>

          {/* Hero Mockup — Chat Interface */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.8,
              delay: 0.2,
              ease: 'easeOut',
            }}
            className="relative w-full bg-white rounded-3xl shadow-float border border-gray-100 overflow-hidden flex flex-col"
          >
            {/* Chat Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-brand-bg/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand/30 flex items-center justify-center text-brand-hover">
                  <SparklesIcon size={20} />
                </div>
                <div>
                  <div className="font-heading font-semibold text-sm text-brand-text">
                    Budgetly Assistant
                  </div>
                  <div className="text-xs text-brand-muted flex items-center gap-1">
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-brand-muted/40" />
                    June Statement · 143 transactions analyzed
                  </div>
                </div>
              </div>
              <div className="flex gap-0.5">
                <span className="w-1 h-1 rounded-full bg-brand-muted/50" />
                <span className="w-1 h-1 rounded-full bg-brand-muted/50" />
                <span className="w-1 h-1 rounded-full bg-brand-muted/50" />
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 px-5 py-5 space-y-5">
              {/* AI Message 1 */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.5,
                  duration: 0.5,
                }}
                className="flex gap-3"
              >
                <div className="w-7 h-7 rounded-full bg-brand/25 flex items-center justify-center text-brand-hover shrink-0 mt-0.5">
                  <SparklesIcon size={14} />
                </div>
                <div className="bg-brand-bg/60 border border-brand/10 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-brand-text leading-relaxed max-w-[85%]">
                  Hello! I've analyzed your{' '}
                  <span className="font-semibold">June Statement</span>. You're
                  doing well, but I noticed a few areas for optimization. How
                  can I help you today?
                </div>
              </motion.div>

              {/* User Message */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 0.8,
                  duration: 0.5,
                }}
                className="flex justify-end"
              >
                <div className="bg-brand text-brand-text rounded-2xl rounded-tr-sm px-4 py-3 text-sm font-medium">
                  Why am I broke?
                </div>
              </motion.div>

              {/* AI Message 2 */}
              <motion.div
                initial={{
                  opacity: 0,
                  y: 10,
                }}
                animate={{
                  opacity: 1,
                  y: 0,
                }}
                transition={{
                  delay: 1.1,
                  duration: 0.5,
                }}
                className="flex gap-3"
              >
                <div className="w-7 h-7 rounded-full bg-brand/25 flex items-center justify-center text-brand-hover shrink-0 mt-0.5">
                  <SparklesIcon size={14} />
                </div>
                <div className="bg-brand-bg/60 border border-brand/10 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-brand-text leading-relaxed max-w-[85%]">
                  Looking at your recent transactions, your biggest drain is{' '}
                  <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium text-xs">
                    Dining Out ($450)
                  </span>{' '}
                  and{' '}
                  <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-medium text-xs">
                    Impulse Shopping ($320)
                  </span>
                  .
                  <br />
                  <br />
                  If you cut dining out by half next month, you could save{' '}
                  <span className="text-emerald-600 font-semibold">
                    $225
                  </span>{' '}
                  immediately.
                </div>
              </motion.div>
            </div>

            {/* Chat Input */}
            <div className="px-5 pb-4 pt-2">
              <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3">
                <div className="text-brand-muted/50">
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
                  </svg>
                </div>
                <span className="text-sm text-brand-muted/60 flex-1">
                  Ask about your money...
                </span>
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-brand-muted/50">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <line x1="22" y1="2" x2="11" y2="13" />
                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                  </svg>
                </div>
              </div>
              <p className="text-center text-[10px] text-brand-muted/50 mt-2">
                Budgetly can make mistakes. Consider verifying{' '}
                <span className="text-brand-hover/60">
                  important financial information
                </span>
                .
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section
        id="features"
        className="py-24 bg-white border-y border-gray-100"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-heading font-bold mb-4">
              Intelligent features for smarter money
            </h2>
            <p className="text-brand-muted text-lg">
              Everything you need to understand your spending, plan for the
              future, and achieve your financial goals.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <SparklesIcon size={24} />,
                title: 'AI-Powered Insights',
                desc: 'RAG-based analysis of your spending habits to uncover hidden patterns.',
              },
              {
                icon: <BarChart3Icon size={24} />,
                title: 'Smart Dashboard',
                desc: 'Beautiful, interactive visualizations of your financial health and trends.',
              },
              {
                icon: <MessageSquareIcon size={24} />,
                title: 'Chat with Finances',
                desc: 'Ask questions in plain English and get answers based on your real data.',
              },
              {
                icon: <TargetIcon size={24} />,
                title: 'Savings Planner',
                desc: 'Goal-oriented, personalized strategies to help you save more effectively.',
              },
            ].map((feature, idx) => (
              <motion.div
                key={idx}
                initial={{
                  opacity: 0,
                  y: 20,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  delay: idx * 0.1,
                  duration: 0.5,
                }}
                className="bg-brand-bg/50 border border-gray-100 rounded-2xl p-6 hover:shadow-soft transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-brand-hover mb-5">
                  {feature.icon}
                </div>
                <h3 className="font-heading font-semibold text-lg mb-2">
                  {feature.title}
                </h3>
                <p className="text-brand-muted text-sm leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-24 bg-brand-bg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-heading font-bold mb-4">
              How Budgetly Works
            </h2>
            <p className="text-brand-muted text-lg">
              From raw data to actionable insights in three simple steps.
            </p>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gray-200" />

            <div className="grid md:grid-cols-3 gap-12 relative z-10">
              {[
                {
                  step: '01',
                  icon: <UploadCloudIcon size={24} />,
                  title: 'Connect & Upload',
                  desc: 'Securely connect your accounts or upload bank statements in seconds.',
                },
                {
                  step: '02',
                  icon: <ZapIcon size={24} />,
                  title: 'AI Analyzes',
                  desc: 'Our engine categorizes transactions and builds your financial context.',
                },
                {
                  step: '03',
                  icon: <LineChartIcon size={24} />,
                  title: 'Get Insights',
                  desc: 'Receive personalized recommendations and track your goals effortlessly.',
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    delay: idx * 0.2,
                    duration: 0.5,
                  }}
                  className="flex flex-col items-center text-center"
                >
                  <div className="w-24 h-24 bg-white rounded-full shadow-soft border-4 border-brand-bg flex items-center justify-center text-brand-hover mb-6 relative">
                    {item.icon}
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-brand text-brand-text rounded-full flex items-center justify-center text-xs font-bold shadow-sm">
                      {item.step}
                    </div>
                  </div>
                  <h3 className="font-heading font-semibold text-xl mb-3">
                    {item.title}
                  </h3>
                  <p className="text-brand-muted text-sm px-4">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-brand/20 to-brand/5 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            whileInView={{
              opacity: 1,
              scale: 1,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              duration: 0.5,
            }}
          >
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-6">
              Take control of your finances today
            </h2>
            <p className="text-lg text-brand-text/80 mb-10 max-w-2xl mx-auto">
              Join thousands of users who are making smarter financial decisions
              with the power of AI. Setup takes less than 2 minutes.
            </p>
            <button className="bg-brand hover:bg-brand-hover text-brand-text font-semibold px-8 py-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mx-auto text-lg">
              Get Started Free <ArrowRightIcon size={20} />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-brand/20 p-1.5 rounded-md text-brand-hover">
                  <SparklesIcon size={20} />
                </div>
                <span className="font-heading font-bold text-lg">Budgetly</span>
              </div>
              <p className="text-brand-muted text-sm max-w-xs">
                The intelligent financial companion that helps you understand,
                manage, and grow your wealth using AI.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Product</h4>
              <ul className="space-y-3 text-sm text-brand-muted">
                <li>
                  <a
                    href="#"
                    className="hover:text-brand-hover transition-colors"
                  >
                    Features
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-brand-hover transition-colors"
                  >
                    Security
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-brand-hover transition-colors"
                  >
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-sm">Company</h4>
              <ul className="space-y-3 text-sm text-brand-muted">
                <li>
                  <a
                    href="#"
                    className="hover:text-brand-hover transition-colors"
                  >
                    About
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-brand-hover transition-colors"
                  >
                    Blog
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-brand-hover transition-colors"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-brand-muted">
            <p>
              © {new Date().getFullYear()} Budgetly Inc. All rights reserved.
            </p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-brand-hover transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-brand-hover transition-colors">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
