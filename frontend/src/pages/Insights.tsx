import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Download,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Flame,
  ArrowRight } from
'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip } from
'recharts';
import { useCurrency } from '../contexts/CurrencyContext';
const pieData = [
{
  name: 'Needs',
  value: 50,
  color: '#b0bafb'
},
{
  name: 'Wants',
  value: 30,
  color: '#fca5a5'
},
{
  name: 'Savings',
  value: 20,
  color: '#4ade80'
}];

export function Insights() {
  const [view, setView] = useState<'weekly' | 'monthly'>('monthly');
  const { formatCurrency } = useCurrency();
  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-gray-900 dark:text-white">
            AI Insights & Reports
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Your financial health analysis for October 2023.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
            <button
              onClick={() => setView('weekly')}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${view === 'weekly' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
              
              Weekly
            </button>
            <button
              onClick={() => setView('monthly')}
              className={`px-4 py-1.5 text-sm font-medium rounded-lg transition-all ${view === 'monthly' ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'}`}>
              
              Monthly
            </button>
          </div>
          <button className="btn-secondary py-2 px-4 text-sm flex items-center gap-2">
            <Download size={16} /> Report PDF
          </button>
        </div>
      </header>

      {/* Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.1
          }}
          className="card flex flex-col justify-center items-center text-center">
          
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-3">
            <TrendingDown className="text-red-500" size={24} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Total Spent
          </p>
          <h3 className="text-2xl font-heading font-semibold text-gray-900 dark:text-white">
            {formatCurrency(3450.20)}
          </h3>
          <p className="text-xs text-red-500 mt-2">+12% from last month</p>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.2
          }}
          className="card flex flex-col justify-center items-center text-center">
          
          <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-3">
            <TrendingUp className="text-green-500" size={24} />
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            Total Saved
          </p>
          <h3 className="text-2xl font-heading font-semibold text-gray-900 dark:text-white">
            {formatCurrency(850.00)}
          </h3>
          <p className="text-xs text-green-500 mt-2">On track for goal</p>
        </motion.div>

        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.3
          }}
          className="card flex flex-col justify-center items-center text-center">
          
          <div className="h-24 w-full mb-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={30}
                  outerRadius={40}
                  paddingAngle={5}
                  dataKey="value">
                  
                  {pieData.map((entry, index) =>
                  <Cell key={`cell-${index}`} fill={entry.color} />
                  )}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
            50/30/20 Rule
          </p>
          <h3 className="text-lg font-heading font-semibold text-gray-900 dark:text-white">
            Slightly Off
          </h3>
        </motion.div>
      </div>

      {/* Finance Roast */}
      <motion.div
        initial={{
          opacity: 0,
          scale: 0.98
        }}
        animate={{
          opacity: 1,
          scale: 1
        }}
        transition={{
          delay: 0.4
        }}
        className="relative overflow-hidden rounded-2xl p-1 bg-gradient-to-r from-orange-400 via-red-500 to-purple-600">
        
        <div className="bg-white dark:bg-gray-900 rounded-xl p-6 h-full flex flex-col md:flex-row items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
            <Flame className="text-orange-500" size={32} />
          </div>
          <div>
            <h3 className="text-xl font-heading font-semibold text-gray-900 dark:text-white mb-2">
              The Finance Roast 🔥
            </h3>
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              You spent more on{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                artisanal coffee ($145)
              </span>{' '}
              this month than your{' '}
              <span className="font-semibold text-gray-900 dark:text-white">
                gym membership ($50)
              </span>
              ... which you only used twice. Also, those 3 AM Amazon purchases
              aren't "investments in your future." Let's tighten it up next
              month.
            </p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bad Habits */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.5
          }}
          className="card">
          
          <h3 className="font-heading font-medium text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <AlertTriangle size={18} className="text-alert" /> Patterns to Watch
          </h3>
          <div className="space-y-4">
            <div className="flex gap-4 items-start p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-red-500 font-bold text-xs">1</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Weekend Splurges
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  70% of your discretionary spending happens between Friday
                  night and Sunday.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-red-500 font-bold text-xs">2</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Subscription Creep
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  You have 4 streaming services active. Consider pausing the
                  ones you use least.
                </p>
              </div>
            </div>
            <div className="flex gap-4 items-start p-3 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30">
              <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/50 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-red-500 font-bold text-xs">3</span>
              </div>
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                  Dining Out Frequency
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Averaging 5 restaurant meals a week. Reducing to 3 could save
                  ~$120/mo.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Recommendations */}
        <motion.div
          initial={{
            opacity: 0,
            y: 20
          }}
          animate={{
            opacity: 1,
            y: 0
          }}
          transition={{
            delay: 0.6
          }}
          className="card">
          
          <h3 className="font-heading font-medium text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-positive" /> Action Plan
          </h3>
          <div className="space-y-4">
            <div className="group flex gap-4 items-start p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={16} className="text-green-500" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-accent transition-colors">
                  Automate Savings
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Set up a $200 auto-transfer on the 1st of every month.
                </p>
              </div>
              <ArrowRight
                size={16}
                className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
              
            </div>
            <div className="group flex gap-4 items-start p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={16} className="text-green-500" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-accent transition-colors">
                  Consolidate Debt
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Move credit card balance to a 0% APR balance transfer card.
                </p>
              </div>
              <ArrowRight
                size={16}
                className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
              
            </div>
            <div className="group flex gap-4 items-start p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer border border-transparent hover:border-gray-200 dark:hover:border-gray-700">
              <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 size={16} className="text-green-500" />
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 group-hover:text-accent transition-colors">
                  Review Insurance
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  You haven't shopped for car insurance in 3 years. Potential
                  savings available.
                </p>
              </div>
              <ArrowRight
                size={16}
                className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity mt-1" />
              
            </div>
          </div>
        </motion.div>
      </div>
    </div>);

}