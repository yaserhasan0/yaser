import React, { useState, useMemo } from 'react';
import { Icons } from '../components/Icon';
import { COMMON_VERBS } from '../constants';
import { AppStrings } from '../types';

interface VerbsViewProps {
  onSelect: (verb: string) => void;
  strings: AppStrings;
}

export const VerbsView: React.FC<VerbsViewProps> = ({ onSelect, strings }) => {
  const [verb, setVerb] = useState('');

  // Filter verbs based on input
  const suggestions = useMemo(() => {
    if (!verb || verb.length < 1) return [];
    const lower = verb.toLowerCase();
    return COMMON_VERBS.filter(v => v.toLowerCase().startsWith(lower)).slice(0, 5);
  }, [verb]);

  const handleVerbSubmit = () => {
    if (verb.trim()) {
      onSelect(verb.trim());
    }
  };

  const handleSuggestionClick = (selectedVerb: string) => {
    setVerb(selectedVerb);
    onSelect(selectedVerb);
  };

  return (
    <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200 text-center animate-fade-in relative">
      <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center text-slate-800 mx-auto mb-6">
        <Icons.Verb className="w-8 h-8" />
      </div>
      <label className="block text-lg font-bold text-slate-800 mb-4">
        {strings.enterVerb}
      </label>
      
      <div className="relative mb-6">
        <input
          type="text"
          value={verb}
          onChange={(e) => setVerb(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 outline-none text-center text-xl"
          placeholder="e.g. gehen"
          dir="ltr"
          autoComplete="off"
          onKeyDown={(e) => e.key === 'Enter' && handleVerbSubmit()}
        />

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-10 overflow-hidden">
             {suggestions.map((s) => (
               <button
                 key={s}
                 onClick={() => handleSuggestionClick(s)}
                 className="w-full p-3 text-left hover:bg-red-50 text-slate-700 hover:text-red-700 transition-colors border-b border-gray-100 last:border-0"
                 dir="ltr"
               >
                 {s}
               </button>
             ))}
          </div>
        )}
      </div>

      <button
        onClick={handleVerbSubmit}
        disabled={!verb.trim()}
        className="w-full bg-red-700 text-white py-3 rounded-xl font-bold hover:bg-red-800 disabled:opacity-50 transition-colors shadow-sm"
      >
        {strings.continue}
      </button>
    </div>
  );
};