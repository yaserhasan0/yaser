
import React, { useState, useEffect } from 'react';
import { Icons } from '../components/Icon';
import { LANGUAGES } from '../constants';
import { AppStrings, LanguageCode, AudioSetting } from '../types';

interface SettingsViewProps {
  currentKey: string;
  onSave: (key: string) => void;
  currentLanguage: LanguageCode;
  onLanguageChange: (code: LanguageCode) => void;
  strings: AppStrings;
  smartStorageEnabled: boolean;
  onSmartStorageChange: (enabled: boolean) => void;
  audioSetting: AudioSetting;
  onAudioSettingChange: (setting: AudioSetting) => void;
  srsEnabled: boolean;
  onSrsChange: (enabled: boolean) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  currentKey, 
  onSave, 
  currentLanguage, 
  onLanguageChange,
  strings,
  smartStorageEnabled,
  onSmartStorageChange,
  audioSetting,
  onAudioSettingChange,
  srsEnabled,
  onSrsChange
}) => {
  const [key, setKey] = useState(currentKey);

  useEffect(() => {
    setKey(currentKey);
  }, [currentKey]);

  const handleSave = () => {
    onSave(key);
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 animate-fade-in space-y-8">
      <h3 className="text-lg font-bold text-slate-900 border-b border-gray-100 pb-2">{strings.settings}</h3>
      
      {/* API Key Section */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {strings.apiKeyLabel}
        </label>
        <input
          type="password"
          value={key}
          onChange={(e) => setKey(e.target.value)}
          placeholder={strings.apiKeyPlaceholder}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all text-left"
          dir="ltr"
        />
        
        {/* Helper Link */}
        <div className="mt-3 flex items-start gap-2 text-sm bg-blue-50 p-3 rounded-lg border border-blue-100">
          <Icons.Book className="w-5 h-5 text-blue-600 shrink-0" />
          <div className="flex flex-col gap-1">
            <span className="text-blue-800 font-medium">{strings.needKeyTitle}</span>
            <a 
              href="https://aistudio.google.com/app/apikey" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              {strings.getKeyLink}
            </a>
            <a 
              href="https://how-to-get-your-google-api-key.blogspot.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800"
            >
              {strings.howToGetKeyLink}
            </a>
          </div>
        </div>
      </div>

      {/* Language Section */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">
          {strings.selectLanguage}
        </label>
        <div className="grid grid-cols-2 gap-3">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => onLanguageChange(lang.code)}
              className={`p-3 rounded-xl border text-sm font-medium transition-all flex items-center justify-center gap-2 ${
                currentLanguage === lang.code
                  ? 'bg-slate-800 text-white border-slate-800 shadow-md transform scale-105'
                  : 'bg-white text-slate-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {lang.name}
              {currentLanguage === lang.code && <Icons.Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </div>

      {/* Smart Storage Section */}
      <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
        <div className="flex items-center justify-between mb-2">
           <label className="font-bold text-slate-800">{strings.smartStorage}</label>
           <div 
             onClick={() => onSmartStorageChange(!smartStorageEnabled)}
             className={`w-12 h-7 rounded-full flex items-center p-1 cursor-pointer transition-colors ${smartStorageEnabled ? 'bg-amber-500' : 'bg-gray-300'}`}
           >
             <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${smartStorageEnabled ? 'translate-x-5' : 'translate-x-0'} rtl:transform rtl:${smartStorageEnabled ? '-translate-x-5' : 'translate-x-0'}`}></div>
           </div>
        </div>
        <p className="text-xs text-amber-800 flex items-start gap-1">
          {strings.smartStorageDesc}
        </p>
      </div>

      {/* Audio Settings Section */}
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-3">{strings.audioSettings}</label>
        <div className="flex flex-col gap-2">
           {[
             { id: 'preload', label: strings.audioPreload },
             { id: 'ondemand', label: strings.audioOnDemand },
             { id: 'disabled', label: strings.audioDisabled }
           ].map((opt) => (
             <label key={opt.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer hover:bg-gray-100">
               <input 
                 type="radio" 
                 name="audioSetting" 
                 value={opt.id} 
                 checked={audioSetting === opt.id}
                 onChange={() => onAudioSettingChange(opt.id as AudioSetting)}
                 className="w-4 h-4 text-red-600 focus:ring-red-500"
               />
               <span className="text-slate-700">{opt.label}</span>
             </label>
           ))}
        </div>
      </div>

       {/* SRS Section */}
       <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-200">
         <div>
            <div className="font-bold text-slate-800">{strings.srsSystem}</div>
            <div className="text-xs text-slate-500">{strings.srsDesc}</div>
         </div>
         <div 
             onClick={() => onSrsChange(!srsEnabled)}
             className={`w-12 h-7 rounded-full flex items-center p-1 cursor-pointer transition-colors ${srsEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
           >
             <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${srsEnabled ? 'translate-x-5' : 'translate-x-0'} rtl:transform rtl:${srsEnabled ? '-translate-x-5' : 'translate-x-0'}`}></div>
         </div>
      </div>

      <button
        onClick={handleSave}
        className="w-full bg-red-700 text-white font-bold py-3 px-4 rounded-xl hover:bg-red-800 transition-colors shadow-sm"
      >
        {strings.save}
      </button>
      
      {/* Footer / Legal */}
      <div className="pt-8 border-t border-gray-100 text-center space-y-2">
         <p className="text-xs text-slate-400">{strings.copyright}</p>
         <p className="text-[10px] text-slate-400">{strings.disclaimer}</p>
         <p className="text-[10px] text-slate-400">{strings.privacy}</p>
      </div>
    </div>
  );
};