import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Send, Paperclip, MoreHorizontal, Info } from 'lucide-react';
interface ChatMessage {
  id: string;
  type: 'ai' | 'user';
  content: string | React.ReactNode;
}
export function AIChat() {
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([
  {
    id: '1',
    type: 'ai',
    content:
    <>
          Hello! I've analyzed your{' '}
          <span className="font-semibold text-gray-900">June Statement</span>.
          You're doing well, but I noticed a few areas for optimization. How can
          I help you today?
        </>

  }]
  );
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);
  const handleSend = (text: string = input) => {
    if (!text.trim()) return;
    // Add user message
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: text
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    // Simulate AI response based on input
    setTimeout(() => {
      setIsTyping(false);
      let aiResponse: React.ReactNode = '';
      const lowerText = text.toLowerCase();
      if (lowerText.includes('broke') || lowerText.includes('overspend')) {
        aiResponse =
        <>
            Looking at your recent transactions, your biggest drain is{' '}
            <span className="text-alert font-semibold bg-alert-light/50 px-1 rounded">
              Dining Out ($450)
            </span>{' '}
            and{' '}
            <span className="text-alert font-semibold bg-alert-light/50 px-1 rounded">
              Impulse Shopping ($320)
            </span>
            .
            <br />
            <br />
            If you cut dining out by half next month, you could save{' '}
            <span className="text-positive font-semibold bg-positive-light/50 px-1 rounded">
              $225
            </span>{' '}
            immediately.
          </>;

      } else if (lowerText.includes('save') || lowerText.includes('goal')) {
        aiResponse =
        <>
            You're currently saving{' '}
            <span className="font-semibold text-gray-900">15%</span> of your
            income. To reach your goal of a house downpayment faster, I
            recommend setting up an automated transfer of{' '}
            <span className="text-positive font-semibold bg-positive-light/50 px-1 rounded">
              $500
            </span>{' '}
            on payday before you have a chance to spend it.
          </>;

      } else {
        aiResponse =
        "I'm analyzing your data for that. Based on your current spending velocity, you're on track to end the month with a surplus of $450. Would you like me to break down your top categories?";
      }
      setMessages((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: 'ai',
        content: aiResponse
      }]
      );
    }, 1500);
  };
  const suggestions = [
  'Why am I broke?',
  'Top category?',
  'How to save more?',
  'Monthly summary'];

  return (
    <div className="flex flex-col min-h-screen w-full max-w-full lg:max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Top Bar */}
      <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-light flex items-center justify-center text-accent-hover">
            <Sparkles size={16} />
          </div>
          <div>
            <h2 className="font-heading font-medium text-gray-900 text-sm">
              Budgetly Assistant
            </h2>
            <p className="text-xs text-gray-500 flex items-center gap-1">
              <Info size={12} /> June Statement · 143 transactions analyzed
            </p>
          </div>
        </div>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal size={20} />
        </button>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
        <AnimatePresence initial={false}>
          {messages.map((msg) =>
          <motion.div
            key={msg.id}
            initial={{
              opacity: 0,
              y: 10
            }}
            animate={{
              opacity: 1,
              y: 0
            }}
            className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            
              {msg.type === 'ai' &&
            <div className="w-8 h-8 rounded-full bg-accent flex-shrink-0 flex items-center justify-center mr-3 mt-1">
                  <Sparkles size={14} className="text-gray-900" />
                </div>
            }

              <div
              className={`max-w-[80%] rounded-2xl px-5 py-3.5 text-[15px] leading-relaxed ${msg.type === 'user' ? 'bg-accent-light text-gray-900 rounded-tr-sm' : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-sm'}`}>
              
                {msg.content}
              </div>
            </motion.div>
          )}

          {isTyping &&
          <motion.div
            initial={{
              opacity: 0
            }}
            animate={{
              opacity: 1
            }}
            className="flex justify-start">
            
              <div className="w-8 h-8 rounded-full bg-accent flex-shrink-0 flex items-center justify-center mr-3">
                <Sparkles size={14} className="text-gray-900" />
              </div>
              <div className="bg-white border border-gray-100 shadow-sm rounded-2xl rounded-tl-sm px-5 py-4 flex items-center gap-1">
                <motion.div
                className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                animate={{
                  y: [0, -4, 0]
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: 0
                }} />
              
                <motion.div
                className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                animate={{
                  y: [0, -4, 0]
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: 0.2
                }} />
              
                <motion.div
                className="w-1.5 h-1.5 bg-gray-400 rounded-full"
                animate={{
                  y: [0, -4, 0]
                }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  delay: 0.4
                }} />
              
              </div>
            </motion.div>
          }
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-100">
        {/* Suggestions */}
        {messages.length < 3 &&
        <div className="flex flex-wrap gap-2 mb-4 px-2">
            {suggestions.map((sugg, idx) =>
          <button
            key={idx}
            onClick={() => handleSend(sugg)}
            className="text-xs font-medium px-3 py-1.5 rounded-full border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors">
            
                {sugg}
              </button>
          )}
          </div>
        }

        <div className="relative flex items-end gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-2 focus-within:ring-2 focus-within:ring-accent focus-within:border-transparent transition-all">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-xl hover:bg-gray-200/50">
            <Paperclip size={20} />
          </button>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask about your money..."
            className="flex-1 max-h-32 min-h-[40px] bg-transparent resize-none outline-none text-gray-800 py-2 text-sm"
            rows={1} />
          

          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isTyping}
            className={`p-2 rounded-xl transition-colors ${input.trim() && !isTyping ? 'bg-accent text-gray-900 hover:bg-accent-hover' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
            
            <Send
              size={18}
              className={
              input.trim() && !isTyping ?
              'translate-x-0.5 -translate-y-0.5' :
              ''
              } />
            
          </button>
        </div>
        <p className="text-center text-[10px] text-gray-400 mt-2">
          Budgetly can make mistakes. Consider verifying important financial
          information.
        </p>
      </div>
    </div>);

}