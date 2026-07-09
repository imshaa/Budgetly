import React from 'react';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line } from
'recharts';
import {
  Wallet,
  TrendingDown,
  PiggyBank,
  AlertCircle,
  Lightbulb,
  Trash2,
  ArrowUpRight,
  ArrowDownRight } from
'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
// Mock Data
const pieData = [
{
  name: 'Housing',
  value: 2000,
  color: '#b0bafb'
},
{
  name: 'Food',
  value: 800,
  color: '#9ba7f9'
},
{
  name: 'Transport',
  value: 400,
  color: '#e6e9fe'
},
{
  name: 'Entertainment',
  value: 300,
  color: '#d1d5db'
}];

const barData = [
{
  name: 'Mon',
  spend: 120
},
{
  name: 'Tue',
  spend: 80
},
{
  name: 'Wed',
  spend: 250
},
{
  name: 'Thu',
  spend: 90
},
{
  name: 'Fri',
  spend: 300
},
{
  name: 'Sat',
  spend: 450
},
{
  name: 'Sun',
  spend: 150
}];

const lineData = [
{
  name: 'Jan',
  balance: 12000
},
{
  name: 'Feb',
  balance: 12500
},
{
  name: 'Mar',
  balance: 11800
},
{
  name: 'Apr',
  balance: 13200
},
{
  name: 'May',
  balance: 14500
},
{
  name: 'Jun',
  balance: 14200
}];

export function Dashboard() {
  const { formatCurrency } = useCurrency();
  return (
    <div className="space-y-6 pb-12">
      <header className="mb-8">
        <h1 className="text-2xl font-heading font-semibold text-gray-900">
          Financial Overview
        </h1>
        <p className="text-gray-500">
          Here's what's happening with your money this month.
        </p>
      </header>

      {/* Top Metrics */}
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
          className="card">
          
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Wallet className="text-gray-700" size={20} />
            </div>
            <span className="flex items-center text-xs font-medium text-positive">
              <ArrowUpRight size={14} className="mr-1" /> +2.4%
            </span>
          </div>
          <p className="text-sm text-gray-500 font-medium mb-1">
            Total Balance
          </p>
          <h2 className="text-3xl font-heading font-semibold text-gray-900">
            {formatCurrency(14200.50)}
          </h2>
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
          className="card">
          
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-alert-light flex items-center justify-center">
              <TrendingDown className="text-alert" size={20} />
            </div>
            <span className="flex items-center text-xs font-medium text-alert">
              <ArrowUpRight size={14} className="mr-1" /> +12%
            </span>
          </div>
          <p className="text-sm text-gray-500 font-medium mb-1">
            Monthly Spending
          </p>
          <h2 className="text-3xl font-heading font-semibold text-gray-900">
            {formatCurrency(3500.00)}
          </h2>
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
          className="card">
          
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-positive-light flex items-center justify-center">
              <PiggyBank className="text-positive" size={20} />
            </div>
            <span className="flex items-center text-xs font-medium text-positive">
              <ArrowUpRight size={14} className="mr-1" /> +5.2%
            </span>
          </div>
          <p className="text-sm text-gray-500 font-medium mb-1">
            Total Savings
          </p>
          <h2 className="text-3xl font-heading font-semibold text-gray-900">
            {formatCurrency(8450.00)}
          </h2>
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Line Chart - Trend */}
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
            delay: 0.4
          }}
          className="card lg:col-span-2">
          
          <h3 className="font-heading font-medium text-gray-900 mb-6">
            Balance Trend
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={lineData}
                margin={{
                  top: 5,
                  right: 20,
                  bottom: 5,
                  left: 0
                }}>
                
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6" />
                
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#6b7280',
                    fontSize: 12
                  }}
                  dy={10} />
                
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#6b7280',
                    fontSize: 12
                  }}
                  tickFormatter={(val) => `$${val / 1000}k`} />
                
                <RechartsTooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)'
                  }}
                  formatter={(value: number) => [`$${value}`, 'Balance']} />
                
                <Line
                  type="monotone"
                  dataKey="balance"
                  stroke="#b0bafb"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: '#b0bafb',
                    strokeWidth: 2,
                    stroke: '#fff'
                  }}
                  activeDot={{
                    r: 6
                  }} />
                
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Pie Chart - Categories */}
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
          
          <h3 className="font-heading font-medium text-gray-900 mb-2">
            Spending by Category
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value">
                  
                  {pieData.map((entry, index) =>
                  <Cell key={`cell-${index}`} fill={entry.color} />
                  )}
                </Pie>
                <RechartsTooltip formatter={(value: number) => `$${value}`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-4">
            {pieData.map((item, idx) =>
            <div
              key={idx}
              className="flex items-center justify-between text-sm">
              
                <div className="flex items-center gap-2">
                  <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor: item.color
                  }} />
                
                  <span className="text-gray-600">{item.name}</span>
                </div>
                <span className="font-medium text-gray-900">${item.value}</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bar Chart & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
          className="card lg:col-span-2">
          
          <h3 className="font-heading font-medium text-gray-900 mb-6">
            Weekly Spending
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{
                  top: 5,
                  right: 0,
                  bottom: 5,
                  left: -20
                }}>
                
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f3f4f6" />
                
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#6b7280',
                    fontSize: 12
                  }}
                  dy={10} />
                
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fill: '#6b7280',
                    fontSize: 12
                  }} />
                
                <RechartsTooltip
                  cursor={{
                    fill: '#f9fafb'
                  }}
                  contentStyle={{
                    borderRadius: '12px',
                    border: 'none',
                    boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)'
                  }} />
                
                <Bar
                  dataKey="spend"
                  fill="#b0bafb"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40} />
                
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Insights */}
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
            delay: 0.7
          }}
          className="space-y-4">
          
          <div className="card p-5 border-l-4 border-l-alert bg-alert-light/30">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-alert shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  Overspending Alert
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  You've spent 40% more on Dining Out this week compared to your
                  average.
                </p>
              </div>
            </div>
          </div>

          <div className="card p-5 border-l-4 border-l-accent bg-accent-light/30">
            <div className="flex items-start gap-3">
              <Lightbulb
                className="text-accent-hover shrink-0 mt-0.5"
                size={20} />
              
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  Recommendation
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Move $200 to your high-yield savings account to hit your
                  monthly goal.
                </p>
              </div>
            </div>
          </div>

          <div className="card p-5 border-l-4 border-l-warning bg-warning-light/30">
            <div className="flex items-start gap-3">
              <Trash2 className="text-warning shrink-0 mt-0.5" size={20} />
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  Top Waste Category
                </h4>
                <p className="text-xs text-gray-600 leading-relaxed">
                  Unused subscriptions cost you $45 this month. Review them in
                  settings.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>);

}