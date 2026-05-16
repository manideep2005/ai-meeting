"use client";

import React, { useState, useEffect } from 'react';
import { Search, Calendar, ChevronRight, Trash2 } from 'lucide-react';

interface Meeting {
  id: number;
  title: string;
  summary: string;
  created_at: string;
}

export default function MeetingHistory({ onSelect }: { onSelect: (id: number) => void }) {
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, [query]);

  const fetchMeetings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/meetings?q=${query}`);
      const data = await response.json();
      setMeetings(data);
    } catch (error) {
      console.error("Failed to fetch meetings", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    if (!window.confirm("Are you sure you want to delete this meeting?")) return;
    
    try {
      await fetch(`http://localhost:8000/meetings/${id}`, { method: 'DELETE' });
      fetchMeetings();
    } catch (error) {
      console.error("Failed to delete meeting", error);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
        <input
          type="text"
          className="input-field pl-12"
          placeholder="Search past meetings..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="grid gap-4">
        {loading && <p className="text-center text-[var(--text-muted)]">Loading history...</p>}
        {!loading && meetings.length === 0 && (
          <p className="text-center text-[var(--text-muted)] mt-10">No meetings found.</p>
        )}
        {meetings.map((meeting) => (
          <div
            key={meeting.id}
            onClick={() => onSelect(meeting.id)}
            className="glass-card p-5 text-left flex items-center justify-between group cursor-pointer"
          >
            <div className="space-y-1">
              <h3 className="font-bold text-lg group-hover:text-primary transition-colors text-[var(--foreground)]">
                {meeting.title}
              </h3>
              <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {new Date(meeting.created_at).toLocaleDateString()}
                </span>
                <p className="truncate max-w-xs md:max-w-md">{meeting.summary}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={(e) => handleDelete(e, meeting.id)}
                className="p-2 text-[var(--text-muted)] hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                title="Delete Meeting"
              >
                <Trash2 size={18} />
              </button>
              <ChevronRight className="text-[var(--text-muted)] group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
