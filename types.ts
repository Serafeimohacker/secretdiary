
export enum MoodType {
  RAD = 'RAD',
  GOOD = 'GOOD',
  MEH = 'MEH',
  BAD = 'BAD',
  AWFUL = 'AWFUL'
}

export interface JournalEntry {
  id: string;
  date: string; // ISO string
  mood: MoodType;
  text: string;
  photo?: string; // base64
  tags: string[];
}

export interface MoodConfig {
  type: MoodType;
  emoji: string;
  label: string;
  color: string;
  bgColor: string;
}

export type View = 'feed' | 'calendar' | 'stats' | 'new' | 'settings';

export interface AIInsight {
  summary: string;
  dominantMood: string;
  recommendations: string[];
  growthFocus: string;
}
