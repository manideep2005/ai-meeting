"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Mic, Video, Square, Play, Copy, Check, MessageSquare, AlertCircle, Loader2 } from 'lucide-react';

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    JitsiMeetExternalAPI: any;
  }
}

export default function LiveMeeting({ onFinished }: { onFinished: (text: string, title: string) => void }) {
  const [isMeetingActive, setIsMeetingActive] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [roomName, setRoomName] = useState(`Syncra-${Math.floor(Math.random() * 9000) + 1000}`);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isTranscribingRef = useRef(false);
  const recognitionRef = useRef<any>(null);
  const jitsiContainerRef = useRef<HTMLDivElement>(null);
  const jitsiApiRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll transcript
  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  useEffect(() => {
    const SpeechRecognition = window.webkitSpeechRecognition || (window as any).SpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript + ' ';
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript);
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        // 'no-speech' is a common, non-critical error that occurs when silence is detected
        if (event.error === 'no-speech') return;
        
        console.error("Speech Recognition Error", event.error);
        if (event.error === 'not-allowed') {
          setError("Microphone access denied. Please enable it to use live transcription.");
          setIsTranscribing(false);
          isTranscribingRef.current = false;
        }
      };

      recognitionRef.current.onend = () => {
        // Restart recognition if it was supposed to be transcribing
        if (isTranscribingRef.current && recognitionRef.current) {
          try {
            recognitionRef.current.start();
          } catch (e) {
            // Already started or failed to restart
          }
        }
      };
    } else {
      setError("Your browser doesn't support live transcription. Please use Chrome or Edge.");
    }

    return () => {
      if (jitsiApiRef.current) jitsiApiRef.current.dispose();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  const copyLink = () => {
    navigator.clipboard.writeText(`https://meet.jit.si/${roomName}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startMeeting = () => {
    setError(null);
    setIsMeetingActive(true);
    setIsTranscribing(true);
    isTranscribingRef.current = true;
    
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = initJitsi;
      document.body.appendChild(script);
    } else {
      setTimeout(initJitsi, 100);
    }

    if (recognitionRef.current) {
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.warn("Recognition already started");
      }
    }
  };

  const initJitsi = () => {
    if (!jitsiContainerRef.current) return;
    
    const domain = 'meet.jit.si';
    const options = {
      roomName: roomName,
      width: '100%',
      height: '100%',
      parentNode: jitsiContainerRef.current,
      configOverwrite: { 
        startWithAudioMuted: false,
        disableDeepLinking: true,
        prejoinPageEnabled: false
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        GENERATE_ROOMNAMES_ON_WELCOME_PAGE: false,
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
          'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
          'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
          'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
          'security'
        ],
      }
    };
    jitsiApiRef.current = new window.JitsiMeetExternalAPI(domain, options);
  };

  const handleFinish = () => {
    if (jitsiApiRef.current) jitsiApiRef.current.dispose();
    if (recognitionRef.current) recognitionRef.current.stop();
    isTranscribingRef.current = false;
    setIsTranscribing(false);
    
    if (transcript.trim().length < 50) {
      const confirmEnd = window.confirm("The transcript is very short. AI might not produce a good summary. Continue anyway?");
      if (!confirmEnd) return;
    }
    
    onFinished(transcript, roomName);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {!isMeetingActive ? (
        <div className="glass-card p-8 md:p-16 text-center max-w-2xl mx-auto shadow-2xl shadow-primary/5">
          <div className="w-24 h-24 bg-gradient-to-tr from-primary to-accent rounded-3xl flex items-center justify-center mx-auto mb-8 rotate-3 hover:rotate-0 transition-transform duration-500">
            <Video className="text-white" size={48} />
          </div>
          <h2 className="text-4xl font-black gradient-text mb-4">Live Meeting Space</h2>
          <p className="text-[var(--text-muted)] text-lg mb-10 leading-relaxed">
            Collaborate in real-time. We'll capture the conversation and transform it into structured notes automatically.
          </p>
          
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-stretch justify-center gap-3">
              <div className="relative flex-1 max-w-sm mx-auto md:mx-0">
                <input 
                  type="text" 
                  className="input-field pl-4 text-center md:text-left font-bold tracking-wide" 
                  placeholder="Enter Room Name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value.replace(/\s+/g, '-'))}
                />
              </div>
              <button 
                onClick={startMeeting} 
                className="btn-primary flex items-center justify-center gap-3 px-10 shadow-lg shadow-primary/25"
              >
                <Play size={20} fill="currentColor" /> Start Meeting
              </button>
            </div>
            
            {error && (
              <div className="flex items-center justify-center gap-2 text-red-500 text-sm font-medium bg-red-500/10 py-2 rounded-lg border border-red-500/20">
                <AlertCircle size={16} /> {error}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--card-border)]">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute inset-0"></div>
                  <div className="w-3 h-3 bg-red-500 rounded-full relative"></div>
                </div>
                <span className="font-black text-sm tracking-widest text-red-500">LIVE TRANSCRIPTION</span>
              </div>
              
              <div className="h-4 w-[1px] bg-white/10 hidden md:block"></div>
              
              <div className="flex items-center gap-2">
                <span className="text-[var(--text-muted)] text-xs font-bold uppercase tracking-tighter">Room:</span>
                <span className="font-mono text-sm font-bold text-primary">{roomName}</span>
                <button 
                  onClick={copyLink} 
                  className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors text-[var(--text-muted)] hover:text-primary"
                  title="Copy Invite Link"
                >
                  {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                </button>
              </div>
            </div>
            
            <button 
              onClick={handleFinish} 
              className="bg-red-500 hover:bg-red-600 text-white px-8 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-red-500/20"
            >
              <Square size={18} fill="currentColor" /> End & Generate Insights
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[600px]">
            <div className="lg:col-span-3 glass-card overflow-hidden bg-black flex items-center justify-center relative" ref={jitsiContainerRef}>
              <div className="text-center space-y-4 animate-pulse">
                <Loader2 className="animate-spin text-primary mx-auto" size={48} />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">Initializing Secure Bridge...</p>
              </div>
            </div>
            
            <div className="glass-card flex flex-col bg-[var(--background)]/40 border-[var(--card-border)]">
              <div className="p-4 border-b border-[var(--card-border)] flex items-center justify-between">
                <h3 className="font-bold text-sm flex items-center gap-2 uppercase tracking-widest text-[var(--text-muted)]">
                  <MessageSquare size={16} className="text-primary" />
                  Transcript
                </h3>
                <div className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-black">AI ENGINES ON</div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {transcript ? (
                  <p className="text-sm leading-relaxed text-[var(--foreground)] font-medium whitespace-pre-wrap opacity-90">
                    {transcript}
                  </p>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-3 opacity-30">
                    <Mic size={32} />
                    <p className="text-xs font-bold uppercase tracking-widest">Listening for audio...</p>
                  </div>
                )}
                <div ref={transcriptEndRef} />
              </div>
              
              <div className="p-4 bg-[var(--background)]/50 text-[10px] text-[var(--text-muted)] font-bold uppercase text-center border-t border-[var(--card-border)]">
                Real-time processing active
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
