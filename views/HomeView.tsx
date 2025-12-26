
import React from 'react';
import { Icons } from '../components/Icon';
import { AppStrings } from '../types';

interface HomeViewProps {
  onNavigate: (to: 'NOUNS' | 'VERBS_INPUT' | 'GRAMMAR_LEVELS' | 'TOOLS_CATEGORIES' | 'CONV_LEVELS') => void;
  strings: AppStrings;
}

export const HomeView: React.FC<HomeViewProps> = ({ onNavigate, strings }) => {
  return (
    <div className="flex flex-col gap-4 animate-fade-in pb-8">
      <div className="text-center py-6">
        <h2 className="text-3xl font-bold text-slate-900 mb-2">{strings.appName}</h2>
        <p className="text-slate-600">{strings.tagline}</p>
        
        {/* Decorative Flag Strip */}
        <div className="flex justify-center mt-4 gap-0 h-1 w-24 mx-auto rounded-full overflow-hidden opacity-80">
          <div className="flex-1 bg-slate-900"></div>
          <div className="flex-1 bg-red-600"></div>
          <div className="flex-1 bg-amber-400"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {/* Conversation Generator Card (NEW) */}
        <button
          onClick={() => onNavigate('CONV_LEVELS')}
          className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-emerald-200 transition-all flex flex-col items-center gap-3 group"
        >
          <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform border border-emerald-100">
            <Icons.Conv className="w-7 h-7" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-800">{strings.convTitle}</h3>
            <p className="text-sm text-gray-500 mt-1">{strings.convDesc}</p>
          </div>
        </button>

        {/* Verbs Card */}
        <button
          onClick={() => onNavigate('VERBS_INPUT')}
          className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-red-200 transition-all flex flex-col items-center gap-3 group"
        >
          <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center text-red-600 group-hover:scale-110 transition-transform border border-red-100">
            <Icons.Verb className="w-7 h-7" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-800">{strings.verbs}</h3>
            <p className="text-sm text-gray-500 mt-1">{strings.verbsDesc}</p>
          </div>
        </button>

        {/* Nouns Card */}
        <button
          onClick={() => onNavigate('NOUNS')}
          className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-amber-200 transition-all flex flex-col items-center gap-3 group"
        >
          <div className="w-14 h-14 bg-amber-50 rounded-full flex items-center justify-center text-amber-600 group-hover:scale-110 transition-transform border border-amber-100">
            <Icons.Noun className="w-7 h-7" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-800">{strings.nouns}</h3>
            <p className="text-sm text-gray-500 mt-1">{strings.nounsDesc}</p>
          </div>
        </button>

        {/* Grammar Card */}
        <button
          onClick={() => onNavigate('GRAMMAR_LEVELS')}
          className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-indigo-200 transition-all flex flex-col items-center gap-3 group"
        >
          <div className="w-14 h-14 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 group-hover:scale-110 transition-transform border border-indigo-100">
            <Icons.School className="w-7 h-7" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-800">{strings.grammar}</h3>
            <p className="text-sm text-gray-500 mt-1">{strings.grammarDesc}</p>
          </div>
        </button>

        {/* Tools Card */}
        <button
          onClick={() => onNavigate('TOOLS_CATEGORIES')}
          className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-teal-200 transition-all flex flex-col items-center gap-3 group"
        >
          <div className="w-14 h-14 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 group-hover:scale-110 transition-transform border border-teal-100">
            <Icons.Tools className="w-7 h-7" />
          </div>
          <div className="text-center">
            <h3 className="text-xl font-bold text-slate-800">{strings.tools}</h3>
            <p className="text-sm text-gray-500 mt-1">{strings.toolsDesc}</p>
          </div>
        </button>
      </div>
    </div>
  );
};
