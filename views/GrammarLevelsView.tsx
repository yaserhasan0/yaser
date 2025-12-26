import React from 'react';
import { GRAMMAR_LEVELS } from '../constants';
import { AppStrings } from '../types';

interface GrammarLevelsViewProps {
  onSelectLevel: (level: string) => void;
  strings: AppStrings;
}

export const GrammarLevelsView: React.FC<GrammarLevelsViewProps> = ({ onSelectLevel, strings }) => {
  const getLevelColor = (level: string) => {
    switch (level.charAt(0)) {
        case 'A': return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
        case 'B': return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
        case 'C': return 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100';
        default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-slate-900">{strings.selectLevel}</h2>
        <p className="text-gray-500 text-sm mt-1">{strings.grammarDesc}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {GRAMMAR_LEVELS.map((level) => (
          <button
            key={level}
            onClick={() => onSelectLevel(level)}
            className={`p-6 rounded-2xl border-2 shadow-sm transition-all transform hover:scale-105 ${getLevelColor(level)}`}
          >
            <span className="text-3xl font-bold font-mono">{level}</span>
          </button>
        ))}
      </div>

      <div className="mt-6 bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm text-yellow-800 leading-relaxed">
        <strong>Info:</strong> AI generated content.
      </div>
    </div>
  );
};