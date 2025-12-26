
import React, { useState } from 'react';
import { Icons } from '../components/Icon';
import { AppStrings, ConversationLength } from '../types';

interface ConversationSetupViewProps {
  level: string;
  isAustrian: boolean;
  strings: AppStrings;
  onStart: (topic: string, length: ConversationLength) => void;
}

export const ConversationSetupView: React.FC<ConversationSetupViewProps> = ({ level, isAustrian, strings, onStart }) => {
  const [topic, setTopic] = useState('');
  const [length, setLength] = useState<ConversationLength>('medium');

  const handleStart = () => {
    if (topic.trim()) {
      onStart(topic.trim(), length);
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in pb-8">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-4">
           <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold">{level}</span>
           {isAustrian && (
             <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">Austrian</span>
           )}
           <h2 className="text-xl font-bold text-slate-900">{strings.convTitle}</h2>
        </div>

        {/* Topic Input */}
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {strings.convTopicLabel}
        </label>
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder={strings.convTopicPlaceholder}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 outline-none text-start"
        />

        {/* Suggested Topics */}
        <div className="mt-4">
           <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block mb-2">{strings.convSuggestedTopics}</span>
           <div className="flex flex-wrap gap-2">
              {strings.convTopicsList.map((t) => (
                <button 
                  key={t}
                  onClick={() => setTopic(t)}
                  className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-slate-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors"
                >
                  {t}
                </button>
              ))}
           </div>
        </div>

        {/* Length Selection */}
        <div className="mt-6">
           <span className="block text-sm font-medium text-slate-700 mb-2">{strings.convLengthLabel}</span>
           <div className="flex bg-gray-100 p-1 rounded-xl">
              {[
                { id: 'short', label: strings.convShort },
                { id: 'medium', label: strings.convMedium },
                { id: 'long', label: strings.convLong },
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setLength(opt.id as ConversationLength)}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                    length === opt.id 
                    ? 'bg-white text-emerald-700 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
           </div>
        </div>

        {/* Start Button */}
        <button
          onClick={handleStart}
          disabled={!topic.trim()}
          className="w-full mt-8 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md flex items-center justify-center gap-2"
        >
          <span>{strings.convStart}</span>
          <Icons.Chat className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
