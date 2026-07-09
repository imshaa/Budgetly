import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Target,
  TrendingUp,
  Calendar,
  ArrowRight,
  Sparkles,
  Plus,
  Trash2,
  DollarSign,
  Clock,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';

interface SavingsGoalItem {
  id: string;
  name: string;
  purpose: string;
  targetAmount: number;
  currentSaved: number;
  timelineMonths: number;
  priority: 'high' | 'medium' | 'low';
}

const PRIORITY_COLORS = {
  high: 'text-red-500 bg-red-50 dark:bg-red-900/20',
  medium: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20',
  low: 'text-positive bg-positive-light dark:bg-positive/10',
};

const EMPTY_GOAL: Omit<SavingsGoalItem, 'id'> = {
  name: '',
  purpose: '',
  targetAmount: 0,
  currentSaved: 0,
  timelineMonths: 12,
  priority: 'medium',
};

export function SavingsGoal() {
  const [goals, setGoals] = useState<SavingsGoalItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({ ...EMPTY_GOAL });
  const [activeGoalId, setActiveGoalId] = useState<string | null>(null);
  const [expandedGoalId, setExpandedGoalId] = useState<string | null>(null);

  // What-if sliders per active goal
  const [sliders, setSliders] = useState({
    food: 0,
    entertainment: 0,
    transport: 0,
    subscriptions: 0,
  });

  const baseMonthlySavings = 500;

  const activeGoal = goals.find((g) => g.id === activeGoalId) ?? null;

  const extraSavings = Object.values(sliders).reduce((a, b) => a + b, 0);
  const projectedSavings = baseMonthlySavings + extraSavings;

  const requiredMonthly = activeGoal
    ? Math.ceil((activeGoal.targetAmount - activeGoal.currentSaved) / activeGoal.timelineMonths)
    : 0;

  const projectedMonths = activeGoal
    ? Math.ceil((activeGoal.targetAmount - activeGoal.currentSaved) / projectedSavings)
    : 0;

  const monthsSaved = activeGoal
    ? Math.max(0, activeGoal.timelineMonths - projectedMonths)
    : 0;

  const projectedDate = activeGoal
    ? new Date(new Date().setMonth(new Date().getMonth() + projectedMonths))
    : new Date();

  const { formatCurrency } = useCurrency();

  const AI_SUGGESTIONS = [
    {
      title: 'Reduce food spending by 20%',
      detail: `You spent ${formatCurrency(800)} on food last month. Cutting back could save ${formatCurrency(160)}/mo.`,
      action: 'Apply to simulation',
      savings: 160,
      category: 'food',
    },
    {
      title: 'Cancel unused subscriptions',
      detail: `We found 3 subscriptions unused in 2 months. Potential savings: ${formatCurrency(45)}/mo.`,
      action: 'Review subscriptions',
      savings: 45,
      category: 'subscriptions',
    },
    {
      title: 'Switch to a cheaper phone plan',
      detail: `Your current plan is ${formatCurrency(80)}/mo. Similar plans available for ${formatCurrency(60)}/mo.`,
      action: 'View alternatives',
      savings: 20,
      category: 'transport',
    },
  ];

  const handleSliderChange = (cat: keyof typeof sliders, value: number) => {
    setSliders((prev) => ({ ...prev, [cat]: value }));
  };

  const handleApplySuggestion = (cat: string, savings: number) => {
    if (cat in sliders) {
      setSliders((prev) => ({ ...prev, [cat]: savings }));
    }
  };

  const addGoal = () => {
    if (!newGoal.name || !newGoal.targetAmount) return;
    const goal: SavingsGoalItem = { ...newGoal, id: Date.now().toString() };
    setGoals((prev) => [...prev, goal]);
    if (!activeGoalId) setActiveGoalId(goal.id);
    setNewGoal({ ...EMPTY_GOAL });
    setShowAddForm(false);
  };

  const removeGoal = (id: string) => {
    setGoals((prev) => prev.filter((g) => g.id !== id));
    if (activeGoalId === id) setActiveGoalId(goals.find((g) => g.id !== id)?.id ?? null);
  };

  const progressPct = (goal: SavingsGoalItem) =>
    Math.min(100, (goal.currentSaved / goal.targetAmount) * 100);

  // Monthly plan array
  const getMonthlyPlan = (goal: SavingsGoalItem) => {
    const needed = goal.targetAmount - goal.currentSaved;
    const months = goal.timelineMonths;
    const perMonth = Math.ceil(needed / months);
    return Array.from({ length: Math.min(months, 12) }, (_, i) => ({
      month: i + 1,
      label: new Date(new Date().setMonth(new Date().getMonth() + i + 1)).toLocaleDateString(
        'en-US',
        { month: 'short', year: '2-digit' }
      ),
      amount: perMonth,
      cumulative: Math.min(goal.currentSaved + perMonth * (i + 1), goal.targetAmount),
    }));
  };

  return (
    <div className="space-y-6 pb-12 max-w-5xl mx-auto">
      {/* Header */}
      <header className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-gray-900 dark:text-white">
            Savings Goals
          </h1>
          <p className="text-gray-500 dark:text-gray-400">
            Set targets, track progress, and hit them faster.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary py-2.5 px-5 text-sm gap-2"
        >
          <Plus size={16} /> New Goal
        </button>
      </header>

      {/* ── Add Goal Form ── */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="card border-accent/30"
          >
            <h2 className="font-heading font-semibold text-gray-900 dark:text-white mb-5 flex items-center gap-2">
              <Target size={18} className="text-accent" /> Create a New Savings Goal
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                  Goal Name *
                </label>
                <input
                  type="text"
                  className="input-field py-2.5 text-sm"
                  placeholder="e.g. House Down Payment, New Car, Vacation..."
                  value={newGoal.name}
                  onChange={(e) => setNewGoal((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                  Purpose / Why this goal?
                </label>
                <input
                  type="text"
                  className="input-field py-2.5 text-sm"
                  placeholder="Describe why this matters to you..."
                  value={newGoal.purpose}
                  onChange={(e) => setNewGoal((p) => ({ ...p, purpose: e.target.value }))}
                />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                  Target Amount ($) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    className="input-field pl-8 py-2.5 text-sm"
                    placeholder="25,000"
                    value={newGoal.targetAmount || ''}
                    onChange={(e) =>
                      setNewGoal((p) => ({ ...p, targetAmount: parseFloat(e.target.value) || 0 }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                  Already Saved ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
                  <input
                    type="number"
                    className="input-field pl-8 py-2.5 text-sm"
                    placeholder="0"
                    value={newGoal.currentSaved || ''}
                    onChange={(e) =>
                      setNewGoal((p) => ({ ...p, currentSaved: parseFloat(e.target.value) || 0 }))
                    }
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                  Timeline: {newGoal.timelineMonths} months
                </label>
                <input
                  type="range"
                  min="3"
                  max="60"
                  step="1"
                  value={newGoal.timelineMonths}
                  onChange={(e) =>
                    setNewGoal((p) => ({ ...p, timelineMonths: parseInt(e.target.value) }))
                  }
                  className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>3 months</span>
                  <span>60 months</span>
                </div>
              </div>
              <div>
                <label className="text-xs font-medium text-gray-600 dark:text-gray-400 mb-1 block">
                  Priority
                </label>
                <div className="flex gap-2">
                  {(['high', 'medium', 'low'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setNewGoal((prev) => ({ ...prev, priority: p }))}
                      className={`flex-1 py-2 rounded-xl text-sm font-medium capitalize transition-all border ${
                        newGoal.priority === p
                          ? 'border-accent bg-accent-light text-gray-900'
                          : 'border-gray-200 dark:border-gray-700 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Preview required monthly savings */}
            {newGoal.targetAmount > 0 && newGoal.timelineMonths > 0 && (
              <div className="bg-accent-light/20 border border-accent/20 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-accent" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    To hit your goal, save approximately
                  </span>
                </div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  $
                  {Math.ceil(
                    (newGoal.targetAmount - newGoal.currentSaved) / newGoal.timelineMonths
                  ).toLocaleString()}
                  /mo
                </span>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setShowAddForm(false); setNewGoal({ ...EMPTY_GOAL }); }}
                className="btn-secondary flex-1 py-2.5 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={addGoal}
                disabled={!newGoal.name || !newGoal.targetAmount}
                className="btn-primary flex-1 py-2.5 text-sm disabled:opacity-40"
              >
                Add Goal
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty state ── */}
      {goals.length === 0 && !showAddForm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="card flex flex-col items-center justify-center py-16 text-center"
        >
          <div className="w-14 h-14 rounded-2xl bg-accent-light flex items-center justify-center mb-4">
            <Target size={24} className="text-accent-hover" />
          </div>
          <h3 className="font-heading font-semibold text-gray-900 dark:text-white mb-2">
            No savings goals yet
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs mb-6">
            Create your first goal and let FinAI build a personalized monthly plan to get you there.
          </p>
          <button onClick={() => setShowAddForm(true)} className="btn-primary py-2.5 px-6 text-sm gap-2">
            <Plus size={16} /> Create First Goal
          </button>
        </motion.div>
      )}

      {/* ── Goals List ── */}
      {goals.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {goals.map((goal) => {
              const pct = progressPct(goal);
              const monthlyNeeded = Math.ceil(
                (goal.targetAmount - goal.currentSaved) / goal.timelineMonths
              );
              return (
                <motion.div
                  key={goal.id}
                  layout
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`card cursor-pointer transition-all hover:shadow-md ${
                    activeGoalId === goal.id
                      ? 'ring-2 ring-accent'
                      : 'ring-1 ring-gray-100 dark:ring-gray-700'
                  }`}
                  onClick={() => { setActiveGoalId(goal.id); setSliders({ food: 0, entertainment: 0, transport: 0, subscriptions: 0 }); }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <span
                        className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${PRIORITY_COLORS[goal.priority]}`}
                      >
                        {goal.priority}
                      </span>
                      <h3 className="font-heading font-semibold text-gray-900 dark:text-white mt-2">
                        {goal.name}
                      </h3>
                      {goal.purpose && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">
                          {goal.purpose}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeGoal(goal.id); }}
                      className="text-gray-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>

                  <p className="text-2xl font-heading font-semibold text-gray-900 dark:text-white mb-1">
                    ${goal.currentSaved.toLocaleString()}
                    <span className="text-sm font-normal text-gray-400">
                      {' '}/ ${goal.targetAmount.toLocaleString()}
                    </span>
                  </p>

                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
                    <motion.div
                      className="h-full bg-positive"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span className="text-positive font-medium">{pct.toFixed(1)}%</span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} /> {goal.timelineMonths}mo · ${monthlyNeeded}/mo
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* ── Active Goal Detail ── */}
          <AnimatePresence>
            {activeGoal && (
              <motion.div
                key={activeGoal.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 16 }}
                className="space-y-6"
              >
                {/* Monthly Savings Plan */}
                <div className="card">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-heading font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Calendar size={18} className="text-accent" /> Monthly Savings Plan
                      <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
                        — {activeGoal.name}
                      </span>
                    </h3>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 dark:text-gray-400">Required/month</p>
                      <p className="text-xl font-semibold text-gray-900 dark:text-white">
                        ${requiredMonthly.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  {/* Monthly bars */}
                  <div className="overflow-x-auto pb-2">
                    <div className="flex gap-2 min-w-max">
                      {getMonthlyPlan(activeGoal).map((month) => {
                        const barPct = (month.cumulative / activeGoal.targetAmount) * 100;
                        const isGoalMet = month.cumulative >= activeGoal.targetAmount;
                        return (
                          <div key={month.month} className="flex flex-col items-center gap-1 w-14">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              ${(month.amount / 1000).toFixed(1)}k
                            </span>
                            <div className="w-full h-24 bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-end">
                              <motion.div
                                className={`w-full rounded-lg ${isGoalMet ? 'bg-positive' : 'bg-accent'}`}
                                initial={{ height: 0 }}
                                animate={{ height: `${barPct}%` }}
                                transition={{ duration: 0.6, delay: month.month * 0.04 }}
                              />
                            </div>
                            <span className="text-[10px] text-gray-400">{month.label}</span>
                            {isGoalMet && (
                              <CheckCircle2 size={12} className="text-positive" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-4">
                    {[
                      { label: 'Target', value: `$${activeGoal.targetAmount.toLocaleString()}`, color: '' },
                      { label: 'Saved so far', value: `$${activeGoal.currentSaved.toLocaleString()}`, color: 'text-positive' },
                      { label: 'Remaining', value: `$${(activeGoal.targetAmount - activeGoal.currentSaved).toLocaleString()}`, color: 'text-red-500' },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-gray-50 dark:bg-gray-900/40 rounded-xl p-3 text-center">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                        <p className={`font-semibold text-gray-900 dark:text-white ${stat.color}`}>
                          {stat.value}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* What-if + AI Suggestions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* AI Suggestions */}
                  <div className="lg:col-span-1 space-y-4">
                    <h3 className="font-heading font-medium text-gray-900 dark:text-white flex items-center gap-2">
                      <Sparkles size={18} className="text-accent" /> AI Suggestions
                    </h3>
                    {AI_SUGGESTIONS.map((s, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * i }}
                        className="card p-4 border-l-4 border-l-accent bg-accent-light/10"
                      >
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                          {s.title}
                        </h4>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">{s.detail}</p>
                        <button
                          onClick={() => handleApplySuggestion(s.category, s.savings)}
                          className="text-xs font-medium text-accent-hover flex items-center gap-1 hover:text-accent transition-colors"
                        >
                          {s.action} <ArrowRight size={12} />
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  {/* What-If Simulation */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="card lg:col-span-2"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-heading font-medium text-gray-900 dark:text-white flex items-center gap-2">
                        <TrendingUp size={18} className="text-positive" /> "What If" Simulation
                      </h3>
                      <div className="text-right">
                        <p className="text-xs text-gray-500 dark:text-gray-400">New Monthly Savings</p>
                        <p className="text-xl font-semibold text-positive">${projectedSavings}</p>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                      Adjust sliders to see how small cuts can fast-track your <strong>{activeGoal.name}</strong> goal.
                    </p>

                    <div className="space-y-5 mb-6">
                      {[
                        { id: 'food', label: 'Food & Dining', max: 200 },
                        { id: 'entertainment', label: 'Entertainment', max: 150 },
                        { id: 'transport', label: 'Transport', max: 100 },
                        { id: 'subscriptions', label: 'Subscriptions', max: 50 },
                      ].map((item) => (
                        <div key={item.id} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium text-gray-700 dark:text-gray-300">
                              {item.label}
                            </span>
                            <span className="text-positive font-medium">
                              +${sliders[item.id as keyof typeof sliders]}/mo
                            </span>
                          </div>
                          <input
                            type="range"
                            min="0"
                            max={item.max}
                            step="10"
                            value={sliders[item.id as keyof typeof sliders]}
                            onChange={(e) =>
                              handleSliderChange(
                                item.id as keyof typeof sliders,
                                parseInt(e.target.value)
                              )
                            }
                            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-accent"
                          />
                          <div className="flex justify-between text-xs text-gray-400">
                            <span>$0</span>
                            <span>Up to ${item.max}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-5 border border-gray-100 dark:border-gray-700 flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">
                          Projected Goal Date
                        </p>
                        <p className="text-lg font-semibold text-gray-900 dark:text-white">
                          {projectedDate.toLocaleDateString('en-US', {
                            month: 'short',
                            year: 'numeric',
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Time Saved</p>
                        <p className="text-lg font-semibold text-positive">{monthsSaved} months</p>
                      </div>
                    </div>

                    <div className="mt-5 flex justify-end">
                      <button className="btn-primary py-2.5 px-6 text-sm">Apply New Budget</button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
