
import React from 'react';
import { MOODS } from '../constants';
import { MoodType } from '../types';

interface MoodPickerProps {
  selectedMood: MoodType | null;
  onSelect: (mood: MoodType) => void;
}

export const MoodPicker: React.FC<MoodPickerProps> = ({ selectedMood, onSelect }) => {
  return (
    <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
      {(Object.keys(MOODS) as MoodType[]).map((moodType) => {
        const mood = MOODS[moodType];
        const isSelected = selectedMood === moodType;
        
        return (
          <button
            key={moodType}
            onClick={() => onSelect(moodType)}
            className={`flex flex-col items-center transition-all duration-300 transform ${
              isSelected ? 'scale-110' : 'scale-100 opacity-60 hover:opacity-100'
            }`}
          >
            <div 
              className={`text-4xl mb-2 p-3 rounded-2xl transition-all ${
                isSelected ? 'shadow-lg bg-opacity-100' : 'bg-opacity-20'
              }`}
              style={{ 
                backgroundColor: isSelected ? mood.bgColor : 'transparent',
              }}
            >
              {mood.emoji}
            </div>
            <span className={`text-xs font-medium ${isSelected ? 'text-slate-900' : 'text-slate-400'}`}>
              {mood.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};
