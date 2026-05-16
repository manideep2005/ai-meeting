"use client";

import { useState } from "react";
import MeetingDashboard from "@/components/MeetingDashboard";
import MeetingHistory from "@/components/MeetingHistory";
import LiveMeeting from "@/components/LiveMeeting";
import { Plus, History, Loader2, Video, FileUp, Sparkles } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

type Tab = "new" | "history" | "live";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("new");
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleProcess = async (rawText?: string, manualTitle?: string) => {
    const textToProcess = rawText || text;
    const titleToProcess = manualTitle || title;
    if (!textToProcess) return;
    
    setLoading(true);
    try {
      const response = await fetch("http://localhost:8000/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: textToProcess, title: titleToProcess }),
      });
      const data = await response.json();
      setResult(data);
      setTitle("");
      setActiveTab("new");
    } catch (error) {
      console.error("Processing failed", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    if (title) formData.append("title", title);

    try {
      const response = await fetch("http://localhost:8000/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      setResult(data);
      setTitle("");
      setActiveTab("new");
    } catch (error) {
      console.error("Upload failed", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMeetingFromHistory = async (id: number) => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/meetings/${id}`);
      const data = await response.json();
      setResult(data);
      setActiveTab("new");
    } catch (error) {
      console.error("Failed to load meeting", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto">
      <header className="flex flex-col lg:flex-row items-center justify-between gap-8 mb-16 animate-in fade-in slide-in-from-top duration-1000">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="p-3 bg-primary/10 rounded-2xl">
            <Sparkles className="text-primary w-8 h-8" />
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-6xl font-black mb-1 gradient-text tracking-tighter">
              Syncra
            </h1>
            <p className="text-[var(--text-muted)] font-medium text-lg">
              Intelligent meeting distillation
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-[var(--card-bg)] p-1.5 rounded-2xl border border-[var(--card-border)] shadow-sm overflow-x-auto max-w-full">
            <button 
              onClick={() => { setActiveTab("new"); setResult(null); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all whitespace-nowrap font-bold text-sm ${activeTab === 'new' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}
            >
              <Plus size={18} /> New Analysis
            </button>
            <button 
              onClick={() => { setActiveTab("live"); setResult(null); }}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all whitespace-nowrap font-bold text-sm ${activeTab === 'live' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}
            >
              <Video size={18} /> Live Meeting
            </button>
            <button 
              onClick={() => setActiveTab("history")}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl transition-all whitespace-nowrap font-bold text-sm ${activeTab === 'history' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-[var(--text-muted)] hover:text-[var(--foreground)]'}`}
            >
              <History size={18} /> History
            </button>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {activeTab === "history" && <MeetingHistory onSelect={loadMeetingFromHistory} />}
      
      {activeTab === "live" && <LiveMeeting onFinished={(t, title) => {
        setTitle(title);
        handleProcess(t, title);
      }} />}

      {activeTab === "new" && (
        <>
          {!result ? (
            <div className="space-y-8 animate-in fade-in zoom-in duration-700">
              <div className="flex flex-col gap-4">
                <div className="relative group">
                  <input
                    type="text"
                    className="input-field py-4 text-xl font-bold bg-[var(--card-bg)] border-[var(--card-border)] focus:border-primary/50"
                    placeholder="Enter Meeting Title (Optional)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-xs font-bold text-[var(--text-muted)] uppercase">Title</span>
                  </div>
                </div>
              </div>

              <div className="glass-card overflow-hidden">
                <div className="relative group">
                  <textarea
                    className="input-field h-80 border-none bg-transparent resize-none text-xl p-8 focus:ring-0 shadow-none placeholder:text-[var(--text-muted)]"
                    placeholder="Paste meeting notes or Google Meet transcripts here..."
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                  <div className="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-focus-within:opacity-100 transition-opacity">
                    <span className="text-xs font-bold text-[var(--text-muted)] bg-[var(--background)] px-2 py-1 rounded-md border border-[var(--card-border)]">
                      {text.length} characters
                    </span>
                  </div>
                </div>

                <div className="p-6 bg-[var(--background)]/50 backdrop-blur-sm flex flex-col md:flex-row items-center justify-between gap-6 border-t border-[var(--card-border)]">
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <input
                      type="file"
                      id="file-upload"
                      className="hidden"
                      accept=".txt,.vtt,.md"
                      onChange={handleFileUpload}
                    />
                    <label
                      htmlFor="file-upload"
                      className="group flex items-center gap-3 px-5 py-3 rounded-2xl border-2 border-dashed border-[var(--card-border)] hover:border-primary hover:bg-primary/5 transition-all cursor-pointer w-full md:w-auto"
                    >
                      <div className="p-2 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                        <FileUp className="text-primary w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-[var(--foreground)]">Upload Document</span>
                        <span className="text-xs text-[var(--text-muted)]">.txt, .vtt, .md</span>
                      </div>
                    </label>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto">
                    {text && (
                      <button 
                        onClick={() => setText("")}
                        className="px-6 py-3 text-sm font-bold text-[var(--text-muted)] hover:text-red-500 transition-colors"
                      >
                        Clear
                      </button>
                    )}
                    <button
                      onClick={() => handleProcess()}
                      disabled={loading || !text}
                      className="btn-primary flex-1 md:flex-none flex items-center justify-center gap-3 px-8 py-3.5"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="animate-spin" size={20} /> Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles size={20} /> Process Analysis
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 opacity-60">
                <div className="p-6 rounded-2xl border border-[var(--card-border)] space-y-2">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-500">
                    <FileUp size={16} />
                  </div>
                  <h3 className="font-bold text-sm">Upload Anything</h3>
                  <p className="text-xs text-[var(--text-muted)]">Drop your .txt or .vtt files directly for instant processing.</p>
                </div>
                <div className="p-6 rounded-2xl border border-[var(--card-border)] space-y-2">
                  <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Sparkles size={16} />
                  </div>
                  <h3 className="font-bold text-sm">AI Distillation</h3>
                  <p className="text-xs text-[var(--text-muted)]">Our models extract decisions and action items automatically.</p>
                </div>
                <div className="p-6 rounded-2xl border border-[var(--card-border)] space-y-2">
                  <div className="w-8 h-8 rounded-full bg-pink-500/10 flex items-center justify-center text-pink-500">
                    <History size={16} />
                  </div>
                  <h3 className="font-bold text-sm">Save History</h3>
                  <p className="text-xs text-[var(--text-muted)]">Everything is stored locally for your future reference.</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom duration-700">
              <button 
                onClick={() => setResult(null)}
                className="mb-8 text-[var(--text-muted)] hover:text-[var(--foreground)] font-bold flex items-center gap-2 transition-colors group"
              >
                <span className="group-hover:-translate-x-1 transition-transform">←</span> Back to Analysis
              </button>
              <MeetingDashboard data={result} />
            </div>
          )}
        </>
      )}

      {loading && !result && (
        <div className="fixed inset-0 bg-[var(--background)]/80 backdrop-blur-md flex items-center justify-center z-[100]">
          <div className="text-center space-y-6">
            <div className="relative w-24 h-24 mx-auto">
              <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="space-y-4">
              <p className="text-3xl font-black gradient-text">Distilling Insights</p>
              <p className="text-[var(--text-muted)] font-medium">Powering up AI core modules...</p>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
