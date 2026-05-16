"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send, User, Bot, X } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function MeetingChat({ meetingId, onClose }: { meetingId: number, onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId, question: input }),
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.answer }]);
    } catch (error) {
      console.error("Chat failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 w-full md:w-96 bg-[var(--background)] border-l border-[var(--card-border)] z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
      <div className="p-4 border-b border-[var(--card-border)] flex justify-between items-center bg-[var(--card-bg)]">
        <h2 className="font-bold gradient-text">Chat Intelligence</h2>
        <button onClick={onClose} className="p-1 hover:bg-primary/10 rounded-full text-[var(--text-muted)] hover:text-primary transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <p className="text-center text-[var(--text-muted)] mt-10 text-sm leading-relaxed">
            Ask anything about this meeting! <br/> <span className="opacity-60 italic">e.g., "What were Bob's deadlines?"</span>
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-4 rounded-2xl flex gap-3 ${m.role === 'user' ? 'bg-primary/10 border border-primary/20 text-[var(--foreground)]' : 'bg-[var(--card-bg)] border border-[var(--card-border)] text-[var(--foreground)]'}`}>
              <div className="mt-1 flex-shrink-0">
                {m.role === 'user' ? <User size={16} className="text-primary" /> : <Bot size={16} className="text-accent" />}
              </div>
              <p className="text-sm leading-relaxed">{m.content}</p>
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--card-border)] flex gap-3">
              <Bot size={16} className="text-accent" />
              <div className="flex gap-1 items-center mt-1">
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-100"></div>
                <div className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-[var(--card-border)] bg-[var(--card-bg)]">
        <div className="relative">
          <input
            type="text"
            className="input-field pr-12 focus:ring-2 focus:ring-primary/20"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={loading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-primary hover:bg-primary/10 rounded-lg transition-all active:scale-90"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
