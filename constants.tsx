
import React from 'react';
import { MoodType, MoodConfig } from './types';

export const MOODS: Record<MoodType, MoodConfig> = {
  [MoodType.RAD]: {
    type: MoodType.RAD,
    emoji: '🤩',
    label: 'Rad',
    color: '#8b5cf6', // violet-500
    bgColor: '#f5f3ff'
  },
  [MoodType.GOOD]: {
    type: MoodType.GOOD,
    emoji: '😊',
    label: 'Good',
    color: '#10b981', // emerald-500
    bgColor: '#ecfdf5'
  },
  [MoodType.MEH]: {
    type: MoodType.MEH,
    emoji: '😐',
    label: 'Meh',
    color: '#f59e0b', // amber-500
    bgColor: '#fffbeb'
  },
  [MoodType.BAD]: {
    type: MoodType.BAD,
    emoji: '😔',
    label: 'Bad',
    color: '#f97316', // orange-500
    bgColor: '#fff7ed'
  },
  [MoodType.AWFUL]: {
    type: MoodType.AWFUL,
    emoji: '😫',
    label: 'Awful',
    color: '#ef4444', // red-500
    bgColor: '#fef2f2'
  }
};

export const APP_STORAGE_KEY = 'zenjournal_data_v1';
export const PWD_STORAGE_KEY = 'zenjournal_pwd_v1';
