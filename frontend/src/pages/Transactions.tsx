import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  ChevronDown,
  MoreHorizontal,
  Calendar as CalendarIcon } from
'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
// Mock Data
const initialTransactions = [
{
  id: 1,
  date: '2023-10-24',
  description: 'Whole Foods Market',
  category: 'Groceries',
  amount: -124.5,
  color: 'bg-blue-500'
},
{
  id: 2,
  date: '2023-10-23',
  description: 'TechCorp Salary',
  category: 'Income',
  amount: 4250.0,
  color: 'bg-green-500'
},
{
  id: 3,
  date: '2023-10-22',
  description: 'Netflix Subscription',
  category: 'Entertainment',
  amount: -15.99,
  color: 'bg-purple-500'
},
{
  id: 4,
  date: '2023-10-21',
  description: 'Uber Rides',
  category: 'Transport',
  amount: -24.5,
  color: 'bg-yellow-500'
},
{
  id: 5,
  date: '2023-10-20',
  description: 'Starbucks',
  category: 'Dining',
  amount: -5.4,
  color: 'bg-orange-500'
},
{
  id: 6,
  date: '2023-10-19',
  description: 'Amazon Prime',
  category: 'Shopping',
  amount: -119.0,
  color: 'bg-pink-500'
},
{
  id: 7,
  date: '2023-10-18',
  description: 'City Water Bill',
  category: 'Utilities',
  amount: -45.2,
  color: 'bg-cyan-500'
},
{
  id: 8,
  date: '2023-10-17',
  description: 'Gym Membership',
  category: 'Health',
  amount: -50.0,
  color: 'bg-red-500'
},
{
  id: 9,
  date: '2023-10-16',
  description: "Trader Joe's",
  category: 'Groceries',
  amount: -89.3,
  color: 'bg-blue-500'
},
{
  id: 10,
  date: '2023-10-15',
  description: 'Spotify Premium',
  category: 'Entertainment',
  amount: -9.99,
  color: 'bg-purple-500'
},
{
  id: 11,
  date: '2023-10-14',
  description: 'Shell Station',
  category: 'Transport',
  amount: -40.0,
  color: 'bg-yellow-500'
},
{
  id: 12,
  date: '2023-10-13',
  description: 'Local Restaurant',
  category: 'Dining',
  amount: -65.0,
  color: 'bg-orange-500'
},
{
  id: 13,
  date: '2023-10-12',
  description: 'Electric Bill',
  category: 'Utilities',
  amount: -85.5,
  color: 'bg-cyan-500'
},
{
  id: 14,
  date: '2023-10-11',
  description: 'Pharmacy',
  category: 'Health',
  amount: -22.4,
  color: 'bg-red-500'
},
{
  id: 15,
  date: '2023-10-10',
  description: 'Freelance Payment',
  category: 'Income',
  amount: 850.0,
  color: 'bg-green-500'
}];

const categories = [
'Groceries',
'Income',
'Entertainment',
'Transport',
'Dining',
'Shopping',
'Utilities',
'Health'];

export function Transactions() {
  const [transactions, setTransactions] = useState(initialTransactions);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const { formatCurrency } = useCurrency();
  const filteredTransactions = transactions.filter(
    (t) =>
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.category.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const handleCategoryChange = (id: number, newCategory: string) => {
    setTransactions(
      transactions.map((t) =>
      t.id === id ?
      {
        ...t,
        category: newCategory
      } :
      t
      )
    );
    setEditingId(null);
  };
  return (
    <div className="space-y-6 pb-12">
      <header className="mb-8">
        <h1 className="text-2xl font-heading font-semibold text-gray-900 dark:text-white">
          Transactions
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage and categorize your recent financial activity.
        </p>
      </header>

      <div className="card p-0 overflow-hidden">
        {/* Filters & Search */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18} />
              
              <input
                type="text"
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input-field pl-10 py-2 text-sm" />
              
            </div>
            <button className="btn-secondary py-2 px-3 text-sm flex items-center gap-2">
              <Filter size={16} /> Filters
            </button>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex items-center gap-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
              <CalendarIcon size={16} className="text-gray-400" />
              <span>Oct 1 - Oct 31</span>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Description</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium w-10"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {filteredTransactions.map((transaction, idx) =>
              <motion.tr
                key={transaction.id}
                initial={{
                  opacity: 0,
                  y: 10
                }}
                animate={{
                  opacity: 1,
                  y: 0
                }}
                transition={{
                  delay: idx * 0.05
                }}
                className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors group">
                
                  <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {new Date(transaction.date).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric'
                  })}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="relative">
                      {editingId === transaction.id ?
                    <select
                      className="input-field py-1 px-2 text-xs w-32 bg-white dark:bg-gray-900"
                      value={transaction.category}
                      onChange={(e) =>
                      handleCategoryChange(transaction.id, e.target.value)
                      }
                      onBlur={() => setEditingId(null)}
                      autoFocus>
                      
                          {categories.map((c) =>
                      <option key={c} value={c}>
                              {c}
                            </option>
                      )}
                        </select> :

                    <button
                      onClick={() => setEditingId(transaction.id)}
                      className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                      
                          <span
                        className={`w-2 h-2 rounded-full ${transaction.color}`}>
                      </span>
                          {transaction.category}
                          <ChevronDown
                        size={12}
                        className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      
                        </button>
                    }
                    </div>
                  </td>
                  <td
                  className={`px-6 py-4 text-sm font-medium text-right whitespace-nowrap ${transaction.amount > 0 ? 'text-positive' : 'text-gray-900 dark:text-white'}`}>
                  
                    {transaction.amount > 0 ? '+' : ''}
                    {formatCurrency(Math.abs(transaction.amount))}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal size={18} />
                    </button>
                  </td>
                </motion.tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50">
          <span>Showing 1 to 15 of 42 entries</span>
          <div className="flex gap-1">
            <button className="px-3 py-1 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50">
              Prev
            </button>
            <button className="px-3 py-1 border border-gray-200 dark:border-gray-600 rounded-md bg-accent text-gray-900 font-medium">
              1
            </button>
            <button className="px-3 py-1 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              2
            </button>
            <button className="px-3 py-1 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              3
            </button>
            <button className="px-3 py-1 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>);

}