import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { MessageSquare, Send, X, Bot, Loader2, Mic, MicOff, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const ChatWidget = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: "Hi! I am your AI Nutrition Assistant. Ask me anything about recipes, health goals, calorie targets, or dietary restrictions!", isBot: true }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  
  const messagesEndRef = useRef(null);

  // Suggested prompts chips
  const suggestedPrompts = [
    "Check daily calorie target",
    "Show custom macro splits",
    "Managing hypertension diet",
    "Low glycemic index foods"
  ];

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, loading]);

  if (!user) return null; // Only show for logged-in users

  const handleSend = async (textToSend) => {
    const text = textToSend || input.trim();
    if (!text || loading) return;

    setInput('');
    setMessages(prev => [...prev, { text, isBot: false }]);
    setLoading(true);

    try {
      const res = await api.post('/chat', { message: text });
      const botResponse = res.data?.data?.response || res.data?.response || "I generated an analysis for your parameters.";
      setMessages(prev => [...prev, { text: botResponse, isBot: true }]);
    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { text: "I'm sorry, I am having trouble connecting to the AI helper. Please try again in a moment.", isBot: true }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSend();
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      setIsListening(false);
    } else {
      setIsListening(true);
      toast.success("Voice recognition simulated. Speak now!");
      // Simulate voice typing after 2 seconds
      setTimeout(() => {
        setInput("How much protein do I need today?");
        setIsListening(false);
        toast("Voice input processed: 'How much protein do I need today?'", { icon: '🎙️' });
      }, 2500);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      
      {/* Floating Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/50 dark:border-white/10 rounded-3xl shadow-2xl w-[360px] sm:w-[400px] h-[550px] flex flex-col overflow-hidden mb-4 backdrop-blur-2xl"
          >
            {/* Header banner */}
            <div className="bg-gradient-to-r from-amber-450 to-orange-500 p-4 text-white flex justify-between items-center shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white border border-white/10 shadow-inner">
                  <Bot size={22} className="animate-bounce" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm flex items-center gap-1.5">
                    NutriAI Companion
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-300 animate-ping"></span>
                  </h3>
                  <span className="text-[10px] text-amber-100 font-bold uppercase tracking-wider">Clinical Diet Advisor</span>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-2xl transition-colors text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Chat Body messages */}
            <div className="flex-grow p-4 overflow-y-auto space-y-4 bg-slate-50/40 dark:bg-slate-950/20 scrollbar-none">
              {messages.map((msg, index) => (
                <div key={index} className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}>
                  <div className={`max-w-[80%] rounded-3xl px-4.5 py-3 text-sm font-semibold shadow-sm leading-relaxed ${
                    msg.isBot 
                      ? 'bg-white dark:bg-slate-855 text-slate-800 dark:text-slate-205 border border-slate-100 dark:border-slate-800/80 rounded-tl-none' 

                      : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-tr-none'

                  }`}>
                    {msg.text.split('\n').map((line, i) => (
                      <p key={i} className={i > 0 ? 'mt-1.5' : ''}>{line}</p>
                    ))}
                  </div>
                </div>
              ))}
              
              {/* Typing Animation */}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-855 border border-slate-100 dark:border-slate-800/80 rounded-3xl rounded-tl-none px-4.5 py-3.5 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggested prompts chips area */}
            <div className="px-4 py-2 bg-slate-50/50 dark:bg-slate-950/10 border-t border-slate-100 dark:border-white/5 flex gap-2 overflow-x-auto scrollbar-none shrink-0">
              {suggestedPrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(p)}
                  className="px-3 py-1.5 rounded-full bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-white/5 text-[10px] font-bold text-slate-600 dark:text-slate-400 hover:text-amber-500 dark:hover:text-amber-400 hover:border-amber-500/20 whitespace-nowrap transition-colors flex items-center gap-1.5"
                >
                  <Sparkles size={10} className="text-amber-500" />
                  {p}
                </button>
              ))}
            </div>

            {/* Voice input banner if active */}
            {isListening && (
              <div className="bg-amber-500/10 border-t border-amber-500/20 px-4 py-2.5 flex items-center justify-between text-xs font-bold text-amber-600 dark:text-amber-400 shrink-0">
                <span className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping"></span>
                  Listening to your query...
                </span>
                <button onClick={() => setIsListening(false)} className="text-red-500 hover:underline">
                  Cancel
                </button>
              </div>
            )}

            {/* Input Form */}
            <form 
              onSubmit={handleFormSubmit} 
              className="p-3.5 border-t border-slate-100 dark:border-white/5 bg-white dark:bg-slate-900 flex gap-2 items-center shrink-0"
            >
              <button
                type="button"
                onClick={toggleVoiceInput}
                className={`p-2.5 rounded-2xl transition-all ${
                  isListening 
                    ? 'bg-red-500 text-white animate-pulse' 
                    : 'bg-slate-50 dark:bg-white/5 text-slate-450 hover:text-slate-800 dark:hover:text-white'
                }`}
                title="Speak question"
              >
                {isListening ? <MicOff size={18} /> : <Mic size={18} />}
              </button>

              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about calories, macros..."
                className="flex-grow bg-slate-50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 dark:text-slate-100"
              />

              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-amber-450 to-orange-500 hover:from-amber-400 hover:to-orange-450 text-white disabled:opacity-50 transition-all flex items-center justify-center shrink-0 shadow-md shadow-amber-500/10"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-900 shadow-xl shadow-amber-500/20 hover:shadow-amber-500/40 border border-white/10 transition-all relative group"
      >
        {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        
        {/* Glow badge indicator */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center text-[9px] font-black text-white shadow-sm border border-white">
            1
          </span>
        )}
      </motion.button>

    </div>
  );
};

export default ChatWidget;
