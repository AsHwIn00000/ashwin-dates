import { useState, useRef, useEffect } from 'react';
import api from '../api/axios';
import { FiMessageCircle, FiX, FiSend } from 'react-icons/fi';

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm AshwinBot 🌴 How can I help you today? Ask me about our dates, dry fruits, spices, seeds or anything else!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = { role: 'user', content: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const { data } = await api.post('/chatbot', {
        messages: [...messages, userMsg].map(m => ({ role: m.role, content: m.content })),
      });
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Connection error. Please try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: `⚠️ ${errMsg}` }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {open && (
        <div className="mb-3 w-80 bg-white dark:bg-gray-950 rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-gray-200 dark:border-gray-800">
          {/* Header */}
          <div className="bg-black dark:bg-white text-white dark:text-black px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/10 dark:bg-black/10 rounded-full flex items-center justify-center text-base">🌴</div>
              <div>
                <p className="font-semibold text-sm">AshwinBot</p>
                <p className="text-xs opacity-60">Always here to help</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="hover:opacity-60 transition">
              <FiX />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 max-h-80 bg-gray-50 dark:bg-gray-900">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[82%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-black dark:bg-white text-white dark:text-black rounded-br-sm'
                    : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 shadow rounded-bl-sm'
                }`}>
                  {m.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white dark:bg-gray-800 shadow px-4 py-2 rounded-2xl rounded-bl-sm flex gap-1 items-center">
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-100 dark:border-gray-800 flex gap-2 bg-white dark:bg-gray-950">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Ask me anything..."
              className="flex-1 border border-gray-200 dark:border-gray-700 rounded-full px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600 bg-white dark:bg-gray-900 dark:text-gray-100"
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className="bg-black dark:bg-white text-white dark:text-black p-2 rounded-full hover:opacity-70 disabled:opacity-30 transition"
            >
              <FiSend size={14} />
            </button>
          </div>
        </div>
      )}

      <button
        onClick={() => setOpen(!open)}
        className="bg-black dark:bg-white text-white dark:text-black p-4 rounded-full shadow-lg hover:opacity-80 transition hover:scale-105"
      >
        {open ? <FiX size={22} /> : <FiMessageCircle size={22} />}
      </button>
    </div>
  );
}
