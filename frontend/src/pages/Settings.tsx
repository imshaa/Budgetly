import { motion } from 'framer-motion';
import {
  User,
  DollarSign,
  Target,
  Upload,
  Bell,
  CreditCard,
  Settings as SettingsIcon } from
'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
export function Settings() {
  const { formatCurrency } = useCurrency();
  return (
    <div className="space-y-8 pb-12 max-w-4xl mx-auto">
      <header>
        <h1 className="text-2xl font-heading font-semibold text-gray-900 dark:text-white">
          Settings
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Manage your account, financial data, and preferences.
        </p>
      </header>

      {/* Profile Section */}
      <motion.section
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
        
        <h2 className="text-lg font-heading font-medium text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <User size={20} className="text-accent" /> Profile Information
        </h2>
        <div className="flex flex-col md:flex-row gap-8 items-start">
          <div className="flex flex-col items-center gap-3">
            <div className="w-24 h-24 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80"
                alt="Profile"
                className="w-full h-full object-cover" />
              
            </div>
            <button className="text-sm font-medium text-accent hover:text-accent-hover transition-colors">
              Change Photo
            </button>
          </div>
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                Full Name
              </label>
              <input
                type="text"
                defaultValue="Alex Morgan"
                className="input-field" />
              
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
                Email Address
              </label>
              <input
                type="email"
                defaultValue="alex@example.com"
                className="input-field" />
              
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <button className="btn-primary py-2.5 px-6 text-sm mt-2 w-full md:w-auto">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Financial Data Section */}
      <motion.section
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
        
        <h2 className="text-lg font-heading font-medium text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <DollarSign size={20} className="text-accent" /> Financial Data
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
              Monthly Income
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-24">
                  Primary Salary
                </span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    defaultValue="4250"
                    className="input-field pl-8 py-2 text-sm" />
                  
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-24">
                  Side Hustle
                </span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    defaultValue="850"
                    className="input-field pl-8 py-2 text-sm" />
                  
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white border-b border-gray-100 dark:border-gray-700 pb-2">
              Fixed Expenses
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-24">
                  Rent/Mortgage
                </span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    defaultValue="1800"
                    className="input-field pl-8 py-2 text-sm" />
                  
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 dark:text-gray-400 w-24">
                  Utilities
                </span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    $
                  </span>
                  <input
                    type="number"
                    defaultValue="250"
                    className="input-field pl-8 py-2 text-sm" />
                  
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button className="btn-secondary py-2 px-4 text-sm">
            Update Financials
          </button>
        </div>
      </motion.section>

      {/* Goals & Statements */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.section
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
          
          <h2 className="text-lg font-heading font-medium text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Target size={20} className="text-accent" /> Active Goals
          </h2>
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  House Downpayment
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatCurrency(8450)} / {formatCurrency(25000)}
                </p>
              </div>
              <button className="text-sm font-medium text-accent hover:text-accent-hover">
                Edit
              </button>
            </div>
            <div className="p-4 rounded-xl border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Emergency Fund
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {formatCurrency(10000)} / {formatCurrency(10000)} (Completed)
                </p>
              </div>
              <button className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                View
              </button>
            </div>
            <button className="w-full py-3 border border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium">
              + Add New Goal
            </button>
          </div>
        </motion.section>

        <motion.section
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
          className="card">
          
          <h2 className="text-lg font-heading font-medium text-gray-900 dark:text-white mb-6 flex items-center gap-2">
            <Upload size={20} className="text-accent" /> Bank Statements
          </h2>
          <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-accent dark:hover:border-accent transition-colors cursor-pointer group">
            <div className="w-12 h-12 bg-accent-light dark:bg-accent/20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Upload
                className="text-accent-hover dark:text-accent-light"
                size={24} />
              
            </div>
            <h3 className="font-medium text-gray-900 dark:text-white mb-1">
              Upload New Statement
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Drag and drop PDF or CSV files here
            </p>
          </div>
          <div className="mt-4">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wider">
              Recent Uploads
            </p>
            <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                chase_statement_oct.pdf
              </span>
              <span className="text-xs text-gray-400">Oct 1, 2023</span>
            </div>
          </div>
        </motion.section>
      </div>

      {/* Preferences Section */}
      <motion.section
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
        
        <h2 className="text-lg font-heading font-medium text-gray-900 dark:text-white mb-6 flex items-center gap-2">
          <SettingsIcon size={20} className="text-accent" /> Preferences
        </h2>
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <CreditCard
                  size={20}
                  className="text-gray-600 dark:text-gray-300" />
                
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Currency
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Set your primary currency
                </p>
              </div>
            </div>
            <select className="input-field py-2 px-3 w-32 text-sm">
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Bell size={20} className="text-gray-600 dark:text-gray-300" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">
                  Notifications
                </h4>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Weekly reports and alerts
                </p>
              </div>
            </div>
            <button className="w-12 h-6 rounded-full bg-accent relative transition-colors">
              <div className="w-4 h-4 rounded-full bg-white absolute top-1 left-7 transition-transform" />
            </button>
          </div>
        </div>
      </motion.section>
    </div>);

}