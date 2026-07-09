import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Upload,
  Check,
  Plus,
  Trash2,
  SkipForward,
  AlertCircle,
  Loader2,
} from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

type Step =
  | 'intro'
  | 'income'
  | 'spending'
  | 'debts'
  | 'savings'
  | 'investments'
  | 'balance'
  | 'extra'
  | 'complete';

interface Message {
  id: string;
  type: 'ai' | 'user' | 'widget';
  content?: string;
  widgetType?: Step | 'upload';
}

interface CustomCategory {
  id: number;
  name: string;
  monthly_amount: string;
}

interface MissingFields {
  [key: string]: string;
}

// ── API helpers ────────────────────────────────────────────────────────────

const BASE = '/api/finance';

async function apiPatch(endpoint: string, data: Record<string, string | null>) {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${BASE}${endpoint}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  return res.json();
}

async function apiPost(endpoint: string, data: Record<string, unknown> | FormData) {
  const token = localStorage.getItem('access_token');
  const isFormData = data instanceof FormData;
  const res = await fetch(`${BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      Authorization: `Bearer ${token}`,
    },
    body: isFormData ? data : JSON.stringify(data),
  });
  return res.json();
}

async function apiDelete(endpoint: string) {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${BASE}${endpoint}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
}

async function apiGet(endpoint: string) {
  const token = localStorage.getItem('access_token');
  const res = await fetch(`${BASE}${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.json();
}

// ── Step config ───────────────────────────────────────────────────────────

const STEP_ORDER: Step[] = [
  'income', 'spending', 'debts', 'savings', 'investments', 'balance', 'extra',
];

const STEP_PROGRESS: Record<Step | 'intro', number> = {
  intro: 0, income: 14, spending: 28, debts: 42, savings: 56,
  investments: 70, balance: 84, extra: 92, complete: 100,
};

const STEP_LABELS: Record<string, string> = {
  income: 'Income', spending: 'Spending', debts: 'Debts',
  savings: 'Savings', investments: 'Investments', balance: 'Balance',
  extra: 'Custom', complete: 'Done',
};

// ── Main Component ─────────────────────────────────────────────────────────

export function Onboarding() {
  const navigate = useNavigate();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentStep, setCurrentStep] = useState<Step>('intro');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [progress, setProgress] = useState(0);
  const [customCategories, setCustomCategories] = useState<CustomCategory[]>([]);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryAmount, setNewCategoryAmount] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [missingFields, setMissingFields] = useState<MissingFields>({});
  const [prefillData, setPrefillData] = useState<Record<string, string>>({});

  // Form values keyed by field name
  const [formValues, setFormValues] = useState<Record<string, string>>({});

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(); }, [messages, isTyping]);

  // ── Session resume ──────────────────────────────────────────────────────
  useEffect(() => {
    const init = async () => {
      try {
        const data = await apiGet('/session/');
        const serverStep = data.session?.current_step as Step | undefined;
        const missing: MissingFields = data.missing_fields || {};
        setMissingFields(missing);

        if (serverStep && serverStep !== 'intro' && serverStep !== 'complete') {
          // Resume from where user left off
          addAIMessage(
            `Welcome back! Let's continue your setup. You left off at ${STEP_LABELS[serverStep] || serverStep}.`
          );
          setTimeout(() => {
            const widgetMsg: Message = { id: 'w-resume', type: 'widget', widgetType: serverStep };
            addMessage(widgetMsg);
            setCurrentStep(serverStep);
            setProgress(STEP_PROGRESS[serverStep]);
          }, 1200);
        } else {
          // Fresh start
          addAIMessage(
            "Hi! I'm your FinAI assistant. Let's set up your financial profile so I can give you personalized insights."
          );
          setTimeout(() => {
            addMessage({ id: 'w-upload', type: 'widget', widgetType: 'upload' });
          }, 1200);
        }
      } catch {
        addAIMessage(
          "Hi! I'm your FinAI assistant. Let's set up your financial profile so I can give you personalized insights."
        );
        setTimeout(() => {
          addMessage({ id: 'w-upload', type: 'widget', widgetType: 'upload' });
        }, 1200);
      }
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addMessage = useCallback((msg: Message) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const addAIMessage = useCallback((content: string) => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [...prev, { id: `ai-${Date.now()}`, type: 'ai', content }]);
    }, 900);
  }, []);

  const addUserMessage = (content: string) => {
    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, type: 'user', content }]);
  };

  // ── Step transitions ────────────────────────────────────────────────────

  const goToStep = (step: Step, aiText: string) => {
    setCurrentStep(step);
    setProgress(STEP_PROGRESS[step]);
    addAIMessage(aiText);
    setTimeout(() => {
      addMessage({ id: `w-${step}-${Date.now()}`, type: 'widget', widgetType: step });
    }, 1500);
  };

  // ── Upload ──────────────────────────────────────────────────────────────

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    addUserMessage(`Uploaded: ${file.name}`);
    setIsSubmitting(true);

    const fd = new FormData();
    fd.append('statement', file);

    try {
      const data = await apiPost('/upload/', fd);
      const filled: string[] = data.prefilled_fields || [];
      const missing: MissingFields = data.missing_fields || {};
      setMissingFields(missing);

      // Pre-populate form values from parsed data
      if (data.profile) {
        const pre: Record<string, string> = {};
        for (const key of filled) {
          const val = data.profile[key];
          if (val !== null && val !== undefined) pre[key] = String(val);
        }
        setPrefillData(pre);
        setFormValues((prev) => ({ ...prev, ...pre }));
      }

      const filledCount = filled.length;
      const missingCount = Object.keys(missing).length;

      if (filledCount > 0) {
        addAIMessage(
          `I've analyzed "${file.name}" and pre-filled ${filledCount} field${filledCount > 1 ? 's' : ''}.` +
          (missingCount > 0
            ? ` I just need a few more details from you.`
            : ` Your profile looks complete! Just review and confirm.`)
        );
      } else {
        addAIMessage(
          `I couldn't auto-detect data from "${file.name}". Let's fill in the details together.`
        );
      }

      // Find first missing step and go there
      const firstMissingStep = getFirstMissingStep(missing);
      setTimeout(() => {
        goToStep(
          firstMissingStep,
          getStepPrompt(firstMissingStep, missing)
        );
      }, 1600);
    } catch {
      addAIMessage("There was an issue reading your file. Let's fill in the details manually.");
      setTimeout(() => goToStep('income', getStepPrompt('income', {})), 1600);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUploadSkip = () => {
    addUserMessage("I'll enter details manually");
    setTimeout(() => goToStep('income', getStepPrompt('income', {})), 600);
  };

  // ── Determine next missing step ─────────────────────────────────────────

  const STEP_FIELDS: Record<Step, string[]> = {
    income: ['monthly_salary', 'monthly_side_income'],
    spending: ['spending_food_dining', 'spending_entertainment', 'spending_transport', 'spending_subscriptions', 'spending_housing'],
    debts: ['total_debts'],
    savings: ['emergency_fund', 'total_savings'],
    investments: ['total_investments'],
    balance: ['current_account_balance'],
    extra: [],
    complete: [],
    intro: []
  };

  function getFirstMissingStep(missing: MissingFields): Step {
    for (const step of STEP_ORDER) {
      const fields = STEP_FIELDS[step];
      if (fields.some((f) => f in missing)) return step;
    }
    return 'extra';
  }

  function getStepPrompt(step: Step, _missing: MissingFields): string {
    const isPrefilled = Object.keys(prefillData).length > 0;
    const prefix = isPrefilled ? 'Please confirm or update your ' : "Let's talk about your ";
    const prompts: Record<Step, string> = {
      income: prefix + "monthly income. What's your salary and any side income?",
      spending: prefix + "monthly spending across food, transport, housing, and other categories.",
      debts: prefix + "debts and loans. What's your total outstanding balance?",
      savings: prefix + "savings — your emergency fund and total savings.",
      investments: prefix + "investments. How much do you have invested in total?",
      balance: prefix + "current account balance.",
      extra: "Any other custom spending categories you'd like to track?",
      complete: '',
      intro: ''
    };
    return prompts[step] || '';
  }

  // ── Submit handlers ─────────────────────────────────────────────────────

  const buildPayload = (fields: string[]) => {
    const payload: Record<string, string | null> = {};
    for (const f of fields) {
      const val = formValues[f];
      payload[f] = val && val.trim() !== '' ? val : null;
    }
    return payload;
  };

  const submitStep = async (
    step: Step,
    endpoint: string,
    fields: string[],
    userMsg: string,
    _nextStep: Step,
  ) => {
    setIsSubmitting(true);
    addUserMessage(userMsg);
    try {
      const payload = buildPayload(fields);
      const data = await apiPatch(endpoint, payload);
      if (data.profile) {
        const newMissing: MissingFields = data.profile.missing_fields || {};
        setMissingFields(newMissing);
      }
      const nextMissingStep = getFirstMissingStepAfter(step);
      goToStep(nextMissingStep, getStepPrompt(nextMissingStep, missingFields));
    } catch {
      addAIMessage("Something went wrong saving that. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  function getFirstMissingStepAfter(currentStep: Step): Step {
    const idx = STEP_ORDER.indexOf(currentStep);
    const remaining = STEP_ORDER.slice(idx + 1);
    for (const step of remaining) {
      if (step === 'extra') return 'extra';
      const fields = STEP_FIELDS[step];
      if (fields.some((f) => f in missingFields)) return step;
    }
    return 'extra';
  }

  // ── Complete ────────────────────────────────────────────────────────────

  const handleComplete = async () => {
    setIsSubmitting(true);
    addUserMessage('All done!');
    try {
      await apiPost('/complete/', {});
      setCurrentStep('complete');
      setProgress(100);
      addAIMessage("Your financial profile is ready. Let's head to your dashboard!");
      setTimeout(() => navigate('/dashboard'), 2200);
    } catch {
      addAIMessage("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Custom categories ───────────────────────────────────────────────────

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;
    setIsSubmitting(true);
    try {
      const data = await apiPost('/categories/', {
        name: newCategoryName.trim(),
        monthly_amount: newCategoryAmount || null,
      });
      if (data.id) {
        setCustomCategories((prev) => [...prev, data]);
        setNewCategoryName('');
        setNewCategoryAmount('');
        setIsAddingCategory(false);
      }
    } catch {
      // fail silently
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveCategory = async (id: number) => {
    const ok = await apiDelete(`/categories/${id}/`);
    if (ok) setCustomCategories((prev) => prev.filter((c) => c.id !== id));
  };

  // ── Field helpers ────────────────────────────────────────────────────────

  const setField = (key: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [key]: value }));
  };

  // ── Widgets ──────────────────────────────────────────────────────────────

  const UploadWidget = () => (
    <div className="card p-6 max-w-md w-full my-4 border-dashed border-2 border-gray-200 hover:border-accent transition-colors">
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.csv"
        className="hidden"
        onChange={handleFileChange}
      />
      <div className="flex flex-col items-center text-center">
        <div className="w-12 h-12 bg-accent-light rounded-full flex items-center justify-center mb-4">
          <Upload className="text-accent-hover" size={24} />
        </div>
        <h3 className="font-heading font-medium text-gray-900 mb-1">Upload Bank Statement</h3>
        <p className="text-sm text-gray-500 mb-6">
          PDF or CSV — I'll auto-detect your financial data and only ask for what's missing.
        </p>
        {isSubmitting ? (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" />
            Analyzing your statement…
          </div>
        ) : (
          <div className="flex gap-3 w-full">
            <button className="btn-secondary flex-1 py-2 text-sm" onClick={handleUploadSkip}>
              Skip for now
            </button>
            <button
              className="btn-primary flex-1 py-2 text-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Browse Files
            </button>
          </div>
        )}
      </div>
    </div>
  );

  interface FieldDef {
    key: string;
    label: string;
  }

  const InputWidget = ({
    title,
    subtitle,
    fields,
    onSubmit,
    endpoint,
    fieldKeys,
    userMsg,
    nextStep,
  }: {
    title: string;
    subtitle?: string;
    fields: FieldDef[];
    onSubmit?: () => void;
    endpoint: string;
    fieldKeys: string[];
    userMsg: string;
    nextStep: Step;
  }) => {
    const step = currentStep;
    return (
      <div className="card p-5 max-w-md w-full my-4 shadow-sm">
        <h3 className="font-medium text-gray-900 mb-1">{title}</h3>
        {subtitle && <p className="text-xs text-gray-500 mb-4">{subtitle}</p>}
        <div className="space-y-3 mb-5 mt-3">
          {fields.map(({ key, label }) => (
            <div key={key} className="flex items-center gap-3">
              <span className="text-sm text-gray-600 w-28 flex-shrink-0">{label}</span>
              <div className="relative flex-1">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input-field pl-8 py-2 text-sm"
                  placeholder="0.00"
                  value={formValues[key] || ''}
                  onChange={(e) => setField(key, e.target.value)}
                />
                {prefillData[key] && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-green-500 font-medium">
                    auto-filled
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        <button
          onClick={() => submitStep(step, endpoint, fieldKeys, userMsg, nextStep)}
          disabled={isSubmitting}
          className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : null}
          Save & Continue
        </button>
      </div>
    );
  };

  const ExtraInputWidget = () => (
    <div className="card p-5 max-w-md w-full my-4 shadow-sm">
      <h3 className="font-medium text-gray-900 mb-1">Custom Categories</h3>
      <p className="text-xs text-gray-500 mb-4">
        Add any other spending categories you want to track. This is optional.
      </p>

      {customCategories.length > 0 && (
        <div className="space-y-2 mb-4">
          {customCategories.map((cat) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/40 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5"
            >
              <div>
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{cat.name}</p>
                {cat.monthly_amount && (
                  <p className="text-xs text-gray-500">${cat.monthly_amount}/mo</p>
                )}
              </div>
              <button
                onClick={() => handleRemoveCategory(cat.id)}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {isAddingCategory ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="border border-accent/40 rounded-xl p-4 mb-3 bg-accent-light/10 space-y-3">
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                  Category Name
                </label>
                <input
                  type="text"
                  className="input-field py-2 text-sm"
                  placeholder="e.g. Gym, Pet Care, Hobbies…"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 dark:text-gray-400 mb-1 block">
                  Monthly Amount (optional)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                  <input
                    type="number"
                    min="0"
                    className="input-field pl-8 py-2 text-sm"
                    placeholder="0.00"
                    value={newCategoryAmount}
                    onChange={(e) => setNewCategoryAmount(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setIsAddingCategory(false); setNewCategoryName(''); setNewCategoryAmount(''); }}
                  className="btn-secondary flex-1 py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddCategory}
                  disabled={!newCategoryName.trim() || isSubmitting}
                  className="btn-primary flex-1 py-2 text-sm disabled:opacity-40"
                >
                  {isSubmitting ? <Loader2 size={14} className="animate-spin mx-auto" /> : 'Add Category'}
                </button>
              </div>
            </div>
          </motion.div>
        ) : (
          <button
            onClick={() => setIsAddingCategory(true)}
            className="w-full py-3 border border-dashed border-gray-300 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-gray-700 flex items-center justify-center gap-2 mb-4 transition-colors text-sm"
          >
            <Plus size={16} /> Add Custom Category
          </button>
        )}
      </AnimatePresence>

      <button
        onClick={handleComplete}
        disabled={isSubmitting}
        className="btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-60"
      >
        {isSubmitting ? <Loader2 size={15} className="animate-spin" /> : <Check size={16} />}
        Complete Setup
      </button>
    </div>
  );

  // ── Widget router ────────────────────────────────────────────────────────

  const renderWidget = (widgetType: Step | 'upload') => {
    switch (widgetType) {
      case 'upload':
        return <UploadWidget />;

      case 'income':
        return (
          <InputWidget
            title="Monthly Income"
            subtitle="Enter your regular income sources."
            fields={[
              { key: 'monthly_salary', label: 'Salary' },
              { key: 'monthly_side_income', label: 'Side Income' },
            ]}
            endpoint="/income/"
            fieldKeys={['monthly_salary', 'monthly_side_income']}
            userMsg="Saved income details"
            nextStep="spending"
          />
        );

      case 'spending':
        return (
          <InputWidget
            title="Monthly Spending"
            subtitle="Your average monthly spend per category."
            fields={[
              { key: 'spending_food_dining', label: 'Food & Dining' },
              { key: 'spending_entertainment', label: 'Entertainment' },
              { key: 'spending_transport', label: 'Transport' },
              { key: 'spending_subscriptions', label: 'Subscriptions' },
              { key: 'spending_housing', label: 'Housing' },
            ]}
            endpoint="/spending/"
            fieldKeys={['spending_food_dining','spending_entertainment','spending_transport','spending_subscriptions','spending_housing']}
            userMsg="Saved spending details"
            nextStep="debts"
          />
        );

      case 'debts':
        return (
          <InputWidget
            title="Debts & Loans"
            subtitle="Total outstanding balance across all debts."
            fields={[{ key: 'total_debts', label: 'Total Debts' }]}
            endpoint="/debts/"
            fieldKeys={['total_debts']}
            userMsg="Saved debt details"
            nextStep="savings"
          />
        );

      case 'savings':
        return (
          <InputWidget
            title="Savings"
            fields={[
              { key: 'emergency_fund', label: 'Emergency Fund' },
              { key: 'total_savings', label: 'Total Savings' },
            ]}
            endpoint="/savings/"
            fieldKeys={['emergency_fund', 'total_savings']}
            userMsg="Saved savings details"
            nextStep="investments"
          />
        );

      case 'investments':
        return (
          <InputWidget
            title="Investments"
            subtitle="Stocks, ETFs, crypto, retirement accounts, etc."
            fields={[{ key: 'total_investments', label: 'Total Invested' }]}
            endpoint="/investments/"
            fieldKeys={['total_investments']}
            userMsg="Saved investment details"
            nextStep="balance"
          />
        );

      case 'balance':
        return (
          <InputWidget
            title="Account Balance"
            subtitle="Your current bank account balance."
            fields={[{ key: 'current_account_balance', label: 'Balance' }]}
            endpoint="/balance/"
            fieldKeys={['current_account_balance']}
            userMsg="Saved account balance"
            nextStep="extra"
          />
        );

      case 'extra':
        return <ExtraInputWidget />;

      default:
        return null;
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────

  const currentStepIdx = STEP_ORDER.indexOf(currentStep);
  const totalSteps = STEP_ORDER.length;

  return (
    <div className="min-h-screen w-full max-w-full mx-auto flex flex-col px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-heading font-semibold text-gray-900">Financial Setup</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-colors"
          >
            <SkipForward size={16} />
            Skip
          </button>
        </div>

        {/* Progress bar */}
        <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-500 font-medium">
            {currentStep === 'intro'
              ? 'Getting started'
              : currentStep === 'complete'
              ? 'Complete!'
              : `Step ${Math.max(1, currentStepIdx + 1)} of ${totalSteps}`}
          </p>
          {Object.keys(missingFields).length > 0 && currentStep !== 'intro' && currentStep !== 'complete' && (
            <div className="flex items-center gap-1 text-xs text-amber-600">
              <AlertCircle size={12} />
              {Object.keys(missingFields).length} field{Object.keys(missingFields).length > 1 ? 's' : ''} needed
            </div>
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto pr-1 pb-20 space-y-6">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {(msg.type === 'ai' || msg.type === 'widget') && (
                <div className="w-8 h-8 rounded-full bg-accent flex-shrink-0 flex items-center justify-center mr-3 mt-1">
                  <Sparkles size={14} className="text-gray-900" />
                </div>
              )}

              {msg.type === 'widget' ? (
                <div className="flex-1 max-w-md">
                  {renderWidget(msg.widgetType as Step | 'upload')}
                </div>
              ) : (
                <div
                  className={`max-w-[80%] rounded-2xl px-5 py-3.5 ${
                    msg.type === 'user'
                      ? 'bg-accent-light text-gray-900 rounded-tr-sm'
                      : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100'
                  }`}
                >
                  <p className="text-[15px] leading-relaxed">{msg.content}</p>
                </div>
              )}
            </motion.div>
          ))}

          {isTyping && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="w-8 h-8 rounded-full bg-accent flex-shrink-0 flex items-center justify-center mr-3">
                <Sparkles size={14} className="text-gray-900" />
              </div>
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1 dark:bg-gray-800 dark:border-gray-700">
                {[0, 0.2, 0.4].map((delay, i) => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                    animate={{ y: [0, -5, 0] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}