
import React from 'react';
import { JournalEntry } from '../types';
import { MOODS } from '../constants';
import { format } from 'date-fns';
import { Calendar, Tag } from 'lucide-react';

interface EntryCardProps {
  entry: JournalEntry;
}

export const EntryCard: React.FC<EntryCardProps> = ({ entry }) => {
  const mood = MOODS[entry.mood];
  
  return (
    <div className="bg-white rounded-3xl p-5 mb-4 shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="text-3xl p-2 rounded-xl" style={{ backgroundColor: mood.bgColor }}>
            {mood.emoji}
          </div>
          <div>
            <h3 className="font-semibold text-slate-800">{mood.label} day</h3>
            <div className="flex items-center text-xs text-slate-400 gap-1">
              <Calendar size={12} />
              {format(new Date(entry.date), 'EEEE, MMMM do')}
            </div>
          </div>
        </div>
      </div>
      
      <p className="text-slate-600 line-clamp-3 leading-relaxed mb-4">
        {entry.text}
      </p>

      {entry.photo && (
        <div className="mb-4 overflow-hidden rounded-2xl aspect-video bg-slate-100">
          <img 
            src={entry.photo} 
            alt="Journal Memory" 
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {entry.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {entry.tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 bg-slate-50 text-slate-500 text-[10px] px-2 py-1 rounded-full border border-slate-100">
              <Tag size={10} />
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
