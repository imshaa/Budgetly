import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import {
  Wallet, TrendingDown, PiggyBank, AlertCircle, Lightbulb, Trash2,
  ArrowUpRight, ArrowDownRight, Loader2, Pencil, X, Check,
} from 'lucide-react';
import { useCurrency } from '../contexts/CurrencyContext';
import { getDashboardData, updateDashboardData } from '../services/api';

interface Metrics {
  total_balance: number;
  monthly_spending: number;
  total_savings: number;
  balance_change_pct: number | null;
  spending_change_pct: number | null;
}
interface PieSlice { name: string; value: number; color: string; field: string | null; }
interface Insight { type: 'alert' | 'recommendation' | 'waste'; title: string; message: string; }
interface DashboardData {
  metrics: Metrics;
  pie_data: PieSlice[];
  weekly_spending: { name: string; spend: number }[];
  balance_trend: { name: string; balance: number }[];
  insights: Insight[];
}

function DeltaBadge({ pct, invert = false }: { pct: number | null; invert?: boolean }) {
  if (pct === null) return null;
  const isUp = pct >= 0;
  const good = invert ? !isUp : isUp;
  return (
    <span className={`flex items-center text-xs font-medium ${good ? 'text-positive' : 'text-alert'}`}>
      {isUp ? <ArrowUpRight size={14} className="mr-1" /> : <ArrowDownRight size={14} className="mr-1" />}
      {Math.abs(pct)}%
    </span>
  );
}

const INSIGHT_STYLES = {
  alert: { icon: AlertCircle, border: 'border-l-alert', bg: 'bg-alert-light/30', color: 'text-alert' },
  recommendation: { icon: Lightbulb, border: 'border-l-accent', bg: 'bg-accent-light/30', color: 'text-accent-hover' },
  waste: { icon: Trash2, border: 'border-l-warning', bg: 'bg-warning-light/30', color: 'text-warning' },
};

export function Dashboard() {
  const { formatCurrency } = useCurrency();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  // keyed by backend field name: current_account_balance, total_savings, spending_*
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const loadData = () => {
    getDashboardData()
      .then(setData)
      .catch(() => setError('Could not load your dashboard right now.'));
  };

  useEffect(() => { loadData(); }, []);

  const enterEditMode = () => {
    if (!data) return;
    const initial: Record<string, string> = {
      current_account_balance: String(data.metrics.total_balance),
      total_savings: String(data.metrics.total_savings),
    };
    data.pie_data.forEach((slice) => {
      if (slice.field) initial[slice.field] = String(slice.value);
    });
    setEditValues(initial);
    setSaveError(null);
    setEditMode(true);
  };

  const cancelEdit = () => {
    setEditMode(false);
    setSaveError(null);
  };

  const setEditField = (field: string, value: string) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const saveEdits = async () => {
    setSaving(true);
    setSaveError(null);
    try {
      const payload: Record<string, number> = {};
      for (const [field, raw] of Object.entries(editValues)) {
        if (raw.trim() === '') continue;
        const num = Number(raw);
        if (Number.isNaN(num) || num < 0) {
          throw new Error(`"${field}" must be a valid, non-negative number.`);
        }
        payload[field] = num;
      }
      const res = await updateDashboardData(payload);
      setData(res.dashboard);
      setEditMode(false);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : 'Could not save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (error) {
    return <div className="p-8 text-center text-gray-500">{error}</div>;
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <Loader2 className="animate-spin mr-2" size={20} /> Loading your data…
      </div>
    );
  }

  const { metrics, pie_data, weekly_spending, balance_trend, insights } = data;

  return (
    <div className="space-y-6 pb-12">
      <header className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-heading font-semibold text-gray-900">Financial Overview</h1>
          <p className="text-gray-500">Here's what's happening with your money this month.</p>
        </div>

        {!editMode ? (
          <button
            onClick={enterEditMode}
            className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm flex-shrink-0"
          >
            <Pencil size={14} /> Edit Data
          </button>
        ) : (
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={cancelEdit}
              disabled={saving}
              className="btn-secondary flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-60"
            >
              <X size={14} /> Cancel
            </button>
            <button
              onClick={saveEdits}
              disabled={saving}
              className="btn-primary flex items-center gap-2 px-4 py-2 text-sm disabled:opacity-60"
            >
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
              Save Changes
            </button>
          </div>
        )}
      </header>

      {editMode && saveError && (
        <div className="rounded-xl bg-alert-light/40 border border-alert/30 text-alert text-sm px-4 py-3">
          {saveError}
        </div>
      )}

      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
              <Wallet className="text-gray-700" size={20} />
            </div>
            {!editMode && <DeltaBadge pct={metrics.balance_change_pct} />}
          </div>
          <p className="text-sm text-gray-500 font-medium mb-1">Total Balance</p>
          {editMode ? (
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rs</span>
              <input
                type="number" min="0" step="0.01"
                className="input-field pl-10 py-2 text-lg font-semibold"
                value={editValues.current_account_balance ?? ''}
                onChange={(e) => setEditField('current_account_balance', e.target.value)}
              />
            </div>
          ) : (
            <h2 className="text-3xl font-heading font-semibold text-gray-900">{formatCurrency(metrics.total_balance)}</h2>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-alert-light flex items-center justify-center">
              <TrendingDown className="text-alert" size={20} />
            </div>
            {!editMode && <DeltaBadge pct={metrics.spending_change_pct} invert />}
          </div>
          <p className="text-sm text-gray-500 font-medium mb-1">Monthly Spending</p>
          <h2 className="text-3xl font-heading font-semibold text-gray-900">{formatCurrency(metrics.monthly_spending)}</h2>
          {editMode && (
            <p className="text-xs text-gray-400 mt-2">Edit categories below to change this total.</p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-positive-light flex items-center justify-center">
              <PiggyBank className="text-positive" size={20} />
            </div>
          </div>
          <p className="text-sm text-gray-500 font-medium mb-1">Total Savings</p>
          {editMode ? (
            <div className="relative mt-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rs</span>
              <input
                type="number" min="0" step="0.01"
                className="input-field pl-10 py-2 text-lg font-semibold"
                value={editValues.total_savings ?? ''}
                onChange={(e) => setEditField('total_savings', e.target.value)}
              />
            </div>
          ) : (
            <h2 className="text-3xl font-heading font-semibold text-gray-900">{formatCurrency(metrics.total_savings)}</h2>
          )}
        </motion.div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card lg:col-span-2">
          <h3 className="font-heading font-medium text-gray-900 mb-6">Balance Trend</h3>
          <div className="h-64">
            {balance_trend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={balance_trend} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} tickFormatter={(v) => `${v / 1000}k`} />
                  <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }} />
                  <Line type="monotone" dataKey="balance" stroke="#b0bafb" strokeWidth={3}
                    dot={{ r: 4, fill: '#b0bafb', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">
                Balance history will appear here as it's tracked over time.
              </div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="card">
          <h3 className="font-heading font-medium text-gray-900 mb-2">Spending by Category</h3>
          <div className="h-48">
            {pie_data.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pie_data} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {pie_data.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                  </Pie>
                  <RechartsTooltip formatter={(v: number) => formatCurrency(v)} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">
                No category data yet.
              </div>
            )}
          </div>
          <div className="space-y-2 mt-4">
            {pie_data.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-gray-600 truncate">{item.name}</span>
                </div>
                {editMode && item.field ? (
                  <div className="relative flex-shrink-0 w-28">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-xs">Rs</span>
                    <input
                      type="number" min="0" step="0.01"
                      className="input-field pl-7 py-1 text-xs w-full"
                      value={editValues[item.field] ?? ''}
                      onChange={(e) => setEditField(item.field as string, e.target.value)}
                    />
                  </div>
                ) : (
                  <span className="font-medium text-gray-900 flex-shrink-0">{formatCurrency(item.value)}</span>
                )}
              </div>
            ))}
            {editMode && pie_data.some((p) => !p.field) && (
              <p className="text-[11px] text-gray-400 pt-1">
                Custom categories are managed from onboarding settings, not here.
              </p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bar Chart & Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="card lg:col-span-2">
          <h3 className="font-heading font-medium text-gray-900 mb-6">Weekly Spending</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weekly_spending} margin={{ top: 5, right: 0, bottom: 5, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#6b7280', fontSize: 12 }} />
                <RechartsTooltip cursor={{ fill: '#f9fafb' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px -2px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="spend" fill="#b0bafb" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          {editMode && (
            <p className="text-xs text-gray-400 mt-3">
              Editing a category above logs the change against today — today's bar will move once you save.
            </p>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="space-y-4">
          {insights.length === 0 && (
            <div className="card p-5 text-sm text-gray-400">No insights yet — check back after a few days of activity.</div>
          )}
          {insights.map((insight, i) => {
            const style = INSIGHT_STYLES[insight.type];
            const Icon = style.icon;
            return (
              <div key={i} className={`card p-5 border-l-4 ${style.border} ${style.bg}`}>
                <div className="flex items-start gap-3">
                  <Icon className={`${style.color} shrink-0 mt-0.5`} size={20} />
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-1">{insight.title}</h4>
                    <p className="text-xs text-gray-600 leading-relaxed">{insight.message}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </div>
  );
}