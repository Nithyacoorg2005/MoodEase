import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User, ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { FloatingBubbles } from '../components/FloatingBubbles';

// --- CONFIGURATION ---
// 1. Go to openrouter.ai to get a free key
// 2. Paste it here inside the quotes
const OPENROUTER_API_KEY = "API KEY"; 

const SYSTEM_PROMPT = `You are MooDEase, a compassionate, empathetic, and friendly mental wellness AI companion. 
Your goal is to listen, offer comfort, and provide gentle, non-medical advice. 
Keep responses concise (2-3 sentences max) and warm. 
If someone seems in immediate danger, advise them to seek professional help.`;

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
};

export function AIChat({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'assistant', 
      text: "Hi! I'm here to listen. How are you feeling right now? 💙" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          "model": "mistralai/mistral-7b-instruct:free", // This model is FREE
          "messages": [
            { "role": "system", "content": SYSTEM_PROMPT },
            ...messages.map(m => ({ role: m.role, content: m.text })),
            { "role": "user", "content": input }
          ],
        })
      });

      const data = await response.json();
      
      if (data.choices && data.choices.length > 0) {
        const aiText = data.choices[0].message.content;
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: aiText }]);
      } else {
        throw new Error('No response from AI');
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'assistant', text: "I'm having a little trouble connecting right now. Please check your internet or API Key." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pt-20 pb-4 px-4 flex flex-col">
      <FloatingBubbles />
      
      <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col bg-white/60 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-white/50 relative z-10">
        
        {/* Header */}
        <div className="p-4 border-b border-gray-100 flex items-center gap-4 bg-white/50">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shadow-lg">
              <Bot size={20} />
            </div>
            <div>
              <h2 className="font-bold text-gray-800">MooDEase AI</h2>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-gray-500 font-medium">Online & Listening</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shrink-0 shadow-md">
                  <Bot size={14} />
                </div>
              )}
              
              <div 
                className={`max-w-[80%] p-4 rounded-2xl shadow-sm text-sm md:text-base leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-purple-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'
                }`}
              >
                {msg.text}
              </div>

              {msg.role === 'user' && (
                 <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 shrink-0">
                   <User size={14} />
                 </div>
              )}
            </motion.div>
          ))}
          
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3 justify-start">
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white shrink-0">
                  <Bot size={14} />
               </div>
               <div className="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 flex items-center gap-2">
                 <Loader2 className="animate-spin text-purple-500" size={16} />
                 <span className="text-xs text-gray-400 font-medium">Thinking...</span>
               </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white/80 border-t border-gray-100">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your message here..."
              className="w-full pl-6 pr-14 py-4 rounded-full border border-gray-200 focus:border-purple-400 focus:ring-4 focus:ring-purple-100 outline-none transition-all bg-gray-50/50 shadow-inner"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 p-2.5 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg shadow-purple-200 hover:shadow-xl hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-2 flex items-center justify-center gap-1">
            <Sparkles size={10} /> AI can make mistakes. Consider checking important info.
          </p>
        </div>

      </div>
    </div>
  );
}
