
import React, { useState } from 'react';
import { Icons } from '../components/Icon';
import { GRAMMAR_LEVELS } from '../constants';
import { AppStrings } from '../types';

interface ConversationLevelsViewProps {
  onSelectLevel: (level: string, isAustrian: boolean) => void;
  onViewHistory: (isAustrian: boolean) => void; // Updated to accept state
  strings: AppStrings;
}

export const ConversationLevelsView: React.FC<ConversationLevelsViewProps> = ({ 
  onSelectLevel, 
  onViewHistory,
  strings 
}) => {
  const [isAustrian, setIsAustrian] = useState(false);

  const getLevelColor = (level: string) => {
    switch (level) {
        case 'A1': return 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100';
        case 'A2': return 'bg-teal-50 text-teal-700 border-teal-200 hover:bg-teal-100';
        case 'B1': return 'bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100';
        case 'B2': return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
        case 'C1': return 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100';
        case 'C2': return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100';
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="flex justify-between items-start mb-2">
        <div className="text-start">
          <h2 className="text-2xl font-bold text-slate-900">{strings.selectLevel}</h2>
          <p className="text-gray-500 text-sm mt-1">{strings.convDesc}</p>
        </div>
        <button 
          onClick={() => onViewHistory(isAustrian)}
          className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl shadow-sm hover:bg-gray-50 text-gray-600 transition-all"
          title={strings.convHistory}
        >
          <Icons.Time className="w-6 h-6 mb-1" />
          <span className="text-[10px] font-bold">{strings.convHistory}</span>
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {GRAMMAR_LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => onSelectLevel(level, isAustrian)}
            className={`p-6 rounded-2xl border-2 shadow-sm transition-all transform hover:scale-105 ${getLevelColor(level)}`}
          >
            <span className="text-3xl font-bold font-mono">{level}</span>
          </button>
        ))}
      </div>

      {/* Austrian Dialect Toggle - Moved Below Grid */}
      <div className="mt-4 bg-red-50 p-4 rounded-xl border border-red-100 flex items-center justify-between shadow-sm">
         <div className="flex flex-col">
            <span className="text-red-900 font-bold text-sm">
              {strings.convAustrianLabel}
            </span>
            <span className="text-xs text-red-700 opacity-80 mt-1">
               {isAustrian ? "Dialect Enabled (Wienerisch)" : "Standard German"}
            </span>
         </div>
         <div 
             onClick={() => setIsAustrian(!isAustrian)}
             className={`w-12 h-7 rounded-full flex items-center p-1 cursor-pointer transition-colors ${isAustrian ? 'bg-red-600' : 'bg-gray-300'}`}
           >
             <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${isAustrian ? 'translate-x-5' : 'translate-x-0'} rtl:transform rtl:${isAustrian ? '-translate-x-5' : 'translate-x-0'}`}></div>
         </div>
      </div>
    </div>
  );
};
