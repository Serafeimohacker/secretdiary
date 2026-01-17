
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  LayoutGrid, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Settings, 
  ArrowLeft,
  Camera,
  Image as ImageIcon,
  Send,
  Sparkles,
  Lock,
  Unlock,
  Search,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { format } from 'date-fns';
import { View, JournalEntry, MoodType, AIInsight } from './types';
import { MOODS, APP_STORAGE_KEY, PWD_STORAGE_KEY } from './constants';
import { MoodPicker } from './components/MoodPicker';
import { EntryCard } from './components/EntryCard';
import { analyzeEntries } from './services/geminiService';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';

const App: React.FC = () => {
  const [view, setView] = useState<View>('feed');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  
  // Security State
  const [isLocked, setIsLocked] = useState(false);
  const [password, setPassword] = useState<string | null>(localStorage.getItem(PWD_STORAGE_KEY));
  const [isSettingPassword, setIsSettingPassword] = useState(false);
  const [unlockInput, setUnlockInput] = useState('');
  const [pwdSetupInput, setPwdSetupInput] = useState('');
  const [unlockError, setUnlockError] = useState(false);

  const [aiInsight, setAiInsight] = useState<AIInsight | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // New Entry State
  const [newMood, setNewMood] = useState<MoodType | null>(null);
  const [newText, setNewText] = useState('');
  const [newPhoto, setNewPhoto] = useState<string | undefined>();
  const [newTags, setNewTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Load Data
  useEffect(() => {
    const saved = localStorage.getItem(APP_STORAGE_KEY);
    if (saved) {
      try {
        setEntries(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load entries", e);
      }
    }
    // Auto-lock on start if password exists
    if (localStorage.getItem(PWD_STORAGE_KEY)) {
      setIsLocked(true);
    }
  }, []);

  // Save Entries
  useEffect(() => {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(entries));
  }, [entries]);

  const handleSavePassword = () => {
    if (pwdSetupInput.length >= 4) {
      localStorage.setItem(PWD_STORAGE_KEY, pwdSetupInput);
      setPassword(pwdSetupInput);
      setIsSettingPassword(false);
      setPwdSetupInput('');
      alert("Password set successfully!");
    } else {
      alert("Password must be at least 4 characters.");
    }
  };

  const handleUnlock = () => {
    if (unlockInput === password) {
      setIsLocked(false);
      setUnlockInput('');
      setUnlockError(false);
    } else {
      setUnlockError(true);
      setUnlockInput('');
      setTimeout(() => setUnlockError(false), 2000);
    }
  };

  const handleLockToggle = () => {
    if (!password) {
      setIsSettingPassword(true);
    } else {
      setIsLocked(true);
    }
  };

  const handleSaveEntry = () => {
    if (!newMood || !newText.trim()) return;

    const entry: JournalEntry = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      mood: newMood,
      text: newText,
      photo: newPhoto,
      tags: newTags,
    };

    setEntries(prev => [entry, ...prev]);
    setNewMood(null);
    setNewText('');
    setNewPhoto(undefined);
    setNewTags([]);
    setView('feed');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !newTags.includes(tagInput.trim())) {
      setNewTags([...newTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleAIInsight = async () => {
    if (entries.length < 3) {
      alert("Please create at least 3 entries to get meaningful AI insights.");
      return;
    }
    setIsAnalyzing(true);
    const insight = await analyzeEntries(entries);
    setAiInsight(insight);
    setIsAnalyzing(false);
  };

  const filteredEntries = entries.filter(e => 
    e.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getStatsData = () => {
    const counts: Record<string, number> = {};
    Object.keys(MOODS).forEach(m => counts[m] = 0);
    entries.forEach(e => counts[e.mood]++);
    return Object.keys(counts).map(k => ({
      name: MOODS[k as MoodType].label,
      count: counts[k],
      color: MOODS[k as MoodType].color
    }));
  };

  // Setup Password View
  const renderPasswordSetup = () => (
    <div className="p-8 flex flex-col items-center justify-center h-full bg-white">
      <div className="p-6 bg-indigo-50 rounded-full mb-6">
        <ShieldCheck size={48} className="text-indigo-600" />
      </div>
      <h2 className="text-2xl font-serif text-slate-800 mb-2">Secure Your Journal</h2>
      <p className="text-slate-400 text-center mb-8 text-sm">Create a password to keep your memories private. This password is stored locally on your device.</p>
      
      <input 
        type="password"
        placeholder="Enter at least 4 characters"
        className="w-full p-4 rounded-2xl border border-slate-200 mb-4 text-center text-lg tracking-widest focus:ring-2 focus:ring-indigo-100 focus:outline-none"
        value={pwdSetupInput}
        onChange={e => setPwdSetupInput(e.target.value)}
      />

      <div className="flex gap-4 w-full">
        <button 
          onClick={() => setIsSettingPassword(false)}
          className="flex-1 py-4 text-slate-400 font-medium"
        >
          Cancel
        </button>
        <button 
          onClick={handleSavePassword}
          className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:bg-indigo-700"
        >
          Set Password
        </button>
      </div>
    </div>
  );

  // Unlock View
  const renderUnlockScreen = () => (
    <div className="p-8 flex flex-col items-center justify-center h-full bg-slate-50">
      <div className={`p-6 bg-white rounded-3xl shadow-xl transition-all duration-300 ${unlockError ? 'animate-bounce border-red-200 border-2' : ''}`}>
        <KeyRound size={48} className={`${unlockError ? 'text-red-500' : 'text-indigo-600'}`} />
      </div>
      
      <h2 className="text-2xl font-serif text-slate-800 mt-8 mb-2">Locked Journal</h2>
      <p className="text-slate-400 mb-8 text-sm">Enter your password to continue</p>

      <div className="w-full max-w-[280px]">
        <input 
          type="password"
          placeholder="••••"
          autoFocus
          className="w-full p-6 rounded-3xl border border-slate-200 mb-6 text-center text-3xl tracking-widest bg-white shadow-sm focus:ring-2 focus:ring-indigo-100 focus:outline-none"
          value={unlockInput}
          onChange={e => setUnlockInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleUnlock()}
        />
        
        <button 
          onClick={handleUnlock}
          className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg flex items-center justify-center gap-2 hover:bg-indigo-700 active:scale-95 transition-all"
        >
          <Unlock size={20} />
          Unlock
        </button>

        {unlockError && (
          <p className="text-red-500 text-sm mt-4 text-center font-medium">Incorrect Password</p>
        )}
      </div>
    </div>
  );

  const renderNewEntry = () => (
    <div className="p-6 pb-32 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4 mb-8">
        <button onClick={() => setView('feed')} className="p-2 hover:bg-slate-100 rounded-full">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-serif">Write Today</h1>
      </div>

      <div className="mb-8">
        <p className="text-sm font-medium text-slate-400 mb-4 uppercase tracking-wider">How are you feeling?</p>
        <MoodPicker selectedMood={newMood} onSelect={setNewMood} />
      </div>

      <div className="mb-6">
        <textarea
          placeholder="What's on your mind? Don't hold back..."
          className="w-full h-40 p-6 rounded-3xl bg-white border border-slate-100 shadow-sm focus:ring-2 focus:ring-indigo-100 focus:outline-none resize-none leading-relaxed text-slate-700"
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
        />
      </div>

      <div className="mb-6 flex gap-3">
        <label className="flex-1 flex items-center justify-center gap-2 p-4 bg-white border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 hover:border-indigo-200 hover:text-indigo-400 cursor-pointer transition-all">
          <ImageIcon size={20} />
          <span className="text-sm">Add Photo</span>
          <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} />
        </label>
        {newPhoto && (
          <div className="relative w-16 h-16 rounded-2xl overflow-hidden border border-slate-200">
            <img src={newPhoto} className="w-full h-full object-cover" />
            <button 
              onClick={() => setNewPhoto(undefined)}
              className="absolute top-0 right-0 p-1 bg-red-500 text-white rounded-bl-lg"
            >
              ×
            </button>
          </div>
        )}
      </div>

      <div className="mb-8">
        <div className="flex gap-2 mb-2">
          <input 
            type="text" 
            placeholder="Add tags..." 
            className="flex-1 px-4 py-2 rounded-xl border border-slate-100"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTag()}
          />
          <button onClick={addTag} className="bg-slate-100 px-4 rounded-xl text-slate-600">+</button>
        </div>
        <div className="flex flex-wrap gap-2">
          {newTags.map(tag => (
            <span key={tag} className="px-3 py-1 bg-indigo-50 text-indigo-500 rounded-full text-xs">
              #{tag}
              <button onClick={() => setNewTags(newTags.filter(t => t !== tag))} className="ml-1 opacity-50">&times;</button>
            </span>
          ))}
        </div>
      </div>

      <button 
        onClick={handleSaveEntry}
        disabled={!newMood || !newText.trim()}
        className={`w-full py-4 rounded-3xl flex items-center justify-center gap-2 font-semibold shadow-lg transition-all ${
          !newMood || !newText.trim() 
          ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
          : 'bg-indigo-600 text-white hover:bg-indigo-700 hover:-translate-y-1'
        }`}
      >
        <Send size={20} />
        Keep this Memory
      </button>
    </div>
  );

  const renderStats = () => {
    const stats = getStatsData();
    return (
      <div className="p-6 pb-32 overflow-y-auto h-full">
        <h1 className="text-3xl font-serif mb-8 text-slate-800">Your Insights</h1>
        {/* AI Insight Section (omitted for brevity, same as previous) */}
        <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white mb-8 shadow-xl">
           <div className="flex items-center gap-2 mb-4">
              <Sparkles size={20} className="text-yellow-300" />
              <h2 className="font-semibold uppercase tracking-widest text-xs opacity-90">AI Emotional Analysis</h2>
            </div>
            {!aiInsight ? (
              <div className="text-center py-4">
                <button onClick={handleAIInsight} disabled={isAnalyzing} className="px-6 py-3 bg-white text-indigo-600 rounded-2xl font-bold shadow-lg">
                  {isAnalyzing ? 'Analyzing...' : 'Generate Zen Insight'}
                </button>
              </div>
            ) : (
              <p className="text-sm leading-relaxed">"{aiInsight.summary}"</p>
            )}
        </div>
        
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-64">
           <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={stats} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="count">
                  {stats.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
        </div>
      </div>
    );
  };

  const renderFeed = () => (
    <div className="p-6 pb-32 h-full overflow-y-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-serif text-slate-800">Hello,</h1>
          <p className="text-slate-400">{format(new Date(), 'MMMM d, yyyy')}</p>
        </div>
        <div className="flex gap-2">
           <button 
            onClick={handleLockToggle} 
            className={`p-3 rounded-2xl border transition-colors ${password ? 'bg-indigo-50 border-indigo-100 text-indigo-500' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'}`}
          >
            {password ? <Lock size={20} /> : <ShieldCheck size={20} />}
          </button>
          <div className="p-2 rounded-2xl bg-white border border-slate-100 w-10 h-10 overflow-hidden">
            <img src="https://picsum.photos/100" className="w-full h-full object-cover rounded-xl" />
          </div>
        </div>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
        <input 
          type="text" 
          placeholder="Search memories..."
          className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white border border-slate-100 shadow-sm focus:ring-2 focus:ring-indigo-100 focus:outline-none"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        {filteredEntries.length > 0 ? (
          filteredEntries.map(entry => <EntryCard key={entry.id} entry={entry} />)
        ) : (
          <div className="text-center py-20 text-slate-400">
            <div className="mb-4 inline-block p-4 bg-slate-100 rounded-full">
              <Plus size={32} />
            </div>
            <p>Your journal is waiting.</p>
          </div>
        )}
      </div>
    </div>
  );

  // Security Logic Gate
  if (isSettingPassword) return (
    <div className="max-w-md mx-auto h-screen bg-white shadow-2xl overflow-hidden">
      {renderPasswordSetup()}
    </div>
  );
  
  if (isLocked) return (
    <div className="max-w-md mx-auto h-screen bg-slate-50 shadow-2xl overflow-hidden">
      {renderUnlockScreen()}
    </div>
  );

  return (
    <div className="max-w-md mx-auto h-screen bg-slate-50 flex flex-col relative shadow-2xl overflow-hidden border-x border-slate-200">
      
      {/* View Content */}
      <main className="flex-1 overflow-hidden">
        {view === 'feed' && renderFeed()}
        {view === 'stats' && renderStats()}
        {view === 'new' && renderNewEntry()}
        {view === 'calendar' && (
          <div className="p-6 text-center flex flex-col items-center justify-center h-full">
            <CalendarIcon size={64} className="text-slate-200 mb-4" />
            <h2 className="text-xl font-serif text-slate-400">Calendar View</h2>
            <button onClick={() => setView('feed')} className="mt-4 text-indigo-500">Go Back</button>
          </div>
        )}
      </main>

      {/* Floating Plus Button */}
      {(view === 'feed' || view === 'stats' || view === 'calendar') && (
        <button 
          onClick={() => setView('new')}
          className="absolute bottom-24 right-6 w-16 h-16 bg-indigo-600 text-white rounded-2xl shadow-2xl flex items-center justify-center transform transition-transform hover:scale-110 active:scale-95 z-20"
        >
          <Plus size={32} />
        </button>
      )}

      {/* Navigation */}
      <nav className="bg-white border-t border-slate-100 p-4 flex justify-around items-center rounded-t-[3rem] shadow-[0_-10px_30px_rgba(0,0,0,0.03)] z-10">
        <button onClick={() => setView('feed')} className={`p-3 rounded-2xl transition-all ${view === 'feed' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-300'}`}>
          <LayoutGrid size={24} />
        </button>
        <button onClick={() => setView('calendar')} className={`p-3 rounded-2xl transition-all ${view === 'calendar' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-300'}`}>
          <CalendarIcon size={24} />
        </button>
        <div className="w-12" />
        <button onClick={() => setView('stats')} className={`p-3 rounded-2xl transition-all ${view === 'stats' ? 'bg-indigo-50 text-indigo-600' : 'text-slate-300'}`}>
          <BarChart3 size={24} />
        </button>
        <button onClick={() => setIsSettingPassword(true)} className={`p-3 rounded-2xl text-slate-300 hover:text-indigo-400`}>
          <Settings size={24} />
        </button>
      </nav>
    </div>
  );
};

export default App;
