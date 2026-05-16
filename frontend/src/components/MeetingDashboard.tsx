"use client";

import React, { useState } from 'react';
import { Download, MessageSquare, Mail, CheckCircle, ListTodo, Lightbulb, FileText } from 'lucide-react';
import MeetingChat from './MeetingChat';

interface ActionItem {
  description: string;
  assignee: string;
  deadline: string;
}

interface MeetingData {
  id: number;
  summary: string;
  action_items: ActionItem[];
  decisions: string[];
}

export default function MeetingDashboard({ data }: { data: MeetingData }) {
  const [email, setEmail] = useState<string | null>(null);
  const [loadingEmail, setLoadingEmail] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const generateEmail = async () => {
    setLoadingEmail(true);
    try {
      const response = await fetch('http://localhost:8000/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          summary: data.summary,
          action_items: data.action_items
        }),
      });
      const result = await response.json();
      setEmail(result.email);
    } catch (error) {
      console.error("Email generation failed", error);
    } finally {
      setLoadingEmail(false);
    }
  };

  const exportMarkdown = () => {
    const content = `
# Meeting Summary
${data.summary}

## Action Items
${data.action_items.map(item => `- [ ] **${item.description}** (Assignee: ${item.assignee}, Deadline: ${item.deadline})`).join('\n')}

## Key Decisions
${(data.decisions || []).map(d => `- ${d}`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-summary-${data.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-1000 relative pb-20">
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div className="flex flex-wrap gap-4">
          <button onClick={exportMarkdown} className="flex items-center gap-2 px-6 py-3 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl hover:bg-primary/5 transition-all font-bold text-sm tracking-wide text-[var(--foreground)]">
            <Download size={18} className="text-primary" /> Export MD
          </button>
          <button onClick={() => setShowChat(true)} className="flex items-center gap-2 px-6 py-3 bg-primary/10 border border-primary/20 rounded-2xl hover:bg-primary/20 transition-all text-primary font-bold text-sm tracking-wide shadow-xl shadow-primary/5">
            <MessageSquare size={18} /> Chat with Meeting
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <section className="lg:col-span-8 glass-card p-8 border-t-4 border-t-primary shadow-2xl shadow-primary/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-primary/10 rounded-lg">
              <FileText size={24} className="text-primary" />
            </div>
            <h2 className="text-2xl font-black gradient-text">Executive Summary</h2>
          </div>
          <p className="text-[var(--foreground)] leading-relaxed text-xl font-medium opacity-90">{data.summary}</p>
        </section>

        <section className="lg:col-span-4 glass-card p-8 border-t-4 border-t-accent shadow-2xl shadow-accent/5">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-accent/10 rounded-lg">
              <Lightbulb size={24} className="text-accent" />
            </div>
            <h2 className="text-2xl font-black gradient-text">Key Decisions</h2>
          </div>
          <ul className="space-y-4">
            {(data.decisions || []).map((decision, index) => (
              <li key={index} className="flex gap-4 group">
                <div className="w-1.5 h-1.5 bg-accent rounded-full mt-2.5 flex-shrink-0 group-hover:scale-150 transition-transform" />
                <span className="text-[var(--foreground)] font-bold text-sm opacity-80 group-hover:opacity-100 transition-opacity">{decision}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="lg:col-span-12 glass-card p-8 border-t-4 border-t-indigo-500 shadow-2xl shadow-indigo-500/5">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-2 bg-indigo-500/10 rounded-lg">
              <ListTodo size={24} className="text-indigo-500" />
            </div>
            <h2 className="text-2xl font-black gradient-text">Action Items & Tasks</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(data.action_items || []).map((item, index) => (
              <div key={index} className="bg-[var(--background)]/40 p-6 rounded-3xl border border-[var(--card-border)] hover:border-indigo-500/30 transition-all group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <CheckCircle size={48} className="text-indigo-500" />
                </div>
                <p className="font-bold text-[var(--foreground)] text-lg mb-4 pr-10">{item.description}</p>
                <div className="space-y-2 mt-auto">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)] uppercase font-black tracking-widest">Assignee</span>
                    <span className="text-indigo-500 font-bold">{item.assignee}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--text-muted)] uppercase font-black tracking-widest">Deadline</span>
                    <span className="text-[var(--foreground)] font-bold">{item.deadline}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="flex flex-col items-center gap-6 pt-12">
        <button 
          onClick={generateEmail}
          disabled={loadingEmail}
          className="btn-primary flex items-center gap-3 text-lg px-12 py-4 shadow-2xl shadow-primary/30 active:scale-95 transition-transform"
        >
          <Mail size={22} />
          {loadingEmail ? "Drafting Email..." : "Generate Professional Follow-up"}
        </button>

        {email && (
          <section className="glass-card p-8 w-full animate-in slide-in-from-bottom duration-700 bg-gradient-to-br from-white/[0.03] to-transparent">
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Mail size={20} className="text-primary" />
                </div>
                <h2 className="text-xl font-black gradient-text uppercase tracking-widest">Email Intelligence</h2>
              </div>
              <button 
                onClick={() => {
                  navigator.clipboard.writeText(email);
                  alert("Email copied!");
                }}
                className="text-xs font-black uppercase tracking-widest bg-primary text-white px-6 py-2 rounded-full hover:opacity-90 transition-opacity"
              >
                Copy to Clipboard
              </button>
            </div>
            <textarea 
              readOnly 
              value={email}
              className="input-field h-80 font-mono text-sm leading-relaxed border-[var(--card-border)] bg-[var(--background)]/30"
            />
          </section>
        )}
      </div>

      {showChat && (
        <MeetingChat meetingId={data.id} onClose={() => setShowChat(false)} />
      )}
    </div>
  );
}
