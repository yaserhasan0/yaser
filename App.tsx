
import React, { useState, useEffect, useRef } from 'react';
import { App as CapApp } from '@capacitor/app';
import { Layout } from './components/Layout';
import { HomeView } from './views/HomeView';
import { SettingsView } from './views/SettingsView';
import { NounsView } from './views/NounsView';
import { NounExamplesView } from './views/NounExamplesView';
import { VerbsView } from './views/VerbsView';
import { VerbsMenuView } from './views/VerbsMenuView';
import { VerbDetailView } from './views/VerbDetailView';
import { VerbMeaningsView } from './views/VerbMeaningsView';
import { GrammarLevelsView } from './views/GrammarLevelsView';
import { GrammarTopicsView } from './views/GrammarTopicsView';
import { GrammarDetailView } from './views/GrammarDetailView';
import { ToolsCategoriesView } from './views/ToolsCategoriesView';
import { ToolsListView } from './views/ToolsListView';
import { ToolDetailView } from './views/ToolDetailView';
import { ChatView } from './views/ChatView';
import { ConversationLevelsView } from './views/ConversationLevelsView';
import { ConversationSetupView } from './views/ConversationSetupView';
import { ConversationResultView } from './views/ConversationResultView';
import { ConversationHistoryView } from './views/ConversationHistoryView';
import { AppState, ViewState, DataCache, LanguageCode, AudioSetting, SavedConversationMetadata } from './types';
import { getAppStrings, LANGUAGES } from './constants';

const App: React.FC = () => {
  // Initialize state from local storage if available
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('gemini_api_key') || '';
  });

  const [language, setLanguage] = useState<LanguageCode>(() => {
    // 1. Check Local Storage for previously saved language
    const savedLang = localStorage.getItem('app_language');
    if (savedLang) {
      return savedLang as LanguageCode;
    }

    // 2. Auto-detect System Language
    try {
      const fullLang = navigator.language; // e.g. "zh-CN" or "en-US"
      const shortLang = fullLang.split('-')[0].toLowerCase(); // "zh" or "en"
      
      // Check for exact full match (e.g. zh-CN)
      if (LANGUAGES.some(l => l.code === fullLang)) {
        const detected = fullLang as LanguageCode;
        localStorage.setItem('app_language', detected);
        return detected;
      }

      // Check for short match (e.g. it, ja)
      // Special case for Chinese: if system is 'zh', map to 'zh-CN'
      if (shortLang === 'zh') {
         localStorage.setItem('app_language', 'zh-CN');
         return 'zh-CN';
      }

      if (LANGUAGES.some(l => l.code === shortLang)) {
        const detected = shortLang as LanguageCode;
        localStorage.setItem('app_language', detected);
        return detected;
      }
      
      // 3. Fallback to English
      localStorage.setItem('app_language', 'en');
      return 'en';
    } catch (e) {
      // Fallback safe default
      return 'en';
    }
  });

  // NEW: Settings States
  const [smartStorageEnabled, setSmartStorageEnabled] = useState<boolean>(() => {
    return localStorage.getItem('smart_storage') === 'true';
  });

  const [audioSetting, setAudioSetting] = useState<AudioSetting>(() => {
    return (localStorage.getItem('audio_setting') as AudioSetting) || 'ondemand';
  });

  const [srsEnabled, setSrsEnabled] = useState<boolean>(() => {
    return localStorage.getItem('srs_enabled') === 'true';
  });

  // Conversation History
  const [conversationHistory, setConversationHistory] = useState<SavedConversationMetadata[]>(() => {
    try {
      const saved = localStorage.getItem('conv_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Centralized Cache State (Persistent)
  const [dataCache, setDataCache] = useState<DataCache>(() => {
    try {
      const savedCache = localStorage.getItem('app_persistent_cache');
      return savedCache ? JSON.parse(savedCache) : {};
    } catch (e) {
      console.error("Failed to load cache", e);
      return {};
    }
  });

  const [viewStack, setViewStack] = useState<ViewState[]>([{ name: 'HOME' }]);

  // Reference to track viewStack inside event listeners
  const viewStackRef = useRef(viewStack);

  // Update ref whenever viewStack changes
  useEffect(() => {
    viewStackRef.current = viewStack;
  }, [viewStack]);

  // Derived strings based on current language
  const strings = getAppStrings(language);
  
  // Handle Direction
  useEffect(() => {
    const langInfo = LANGUAGES.find(l => l.code === language);
    if (langInfo) {
       document.documentElement.dir = langInfo.dir;
       document.documentElement.lang = langInfo.code;
    }
  }, [language]);

  // Handle Browser History (popstate)
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // When the user presses the hardware back button (or calls window.history.back),
      // the browser pops the history. We catch this event and update our React state.
      setViewStack(prev => {
        if (prev.length > 1) {
          // Remove the last item
          return prev.slice(0, -1);
        }
        return prev;
      });
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle Capacitor Hardware Back Button (Android)
  useEffect(() => {
    let listenerHandle: any = null;

    const setupListener = async () => {
      listenerHandle = await CapApp.addListener('backButton', ({ canGoBack }) => {
        // Use ref to check current stack length without needing dependency array
        if (viewStackRef.current.length > 1) {
          // Go back in App history (triggers popstate)
          window.history.back();
        } else {
          // If on Home screen, exit the app
          CapApp.exitApp();
        }
      });
    };

    setupListener();

    return () => {
      if (listenerHandle) {
        listenerHandle.remove();
      }
    };
  }, []);

  // --- NEW: Ad Logic Placeholders ---
  const initAds = () => {
    console.log('Ads Initialized (Placeholder)');
  };
  
  const showFullAd = () => {
    console.log('Show Full Ad (Placeholder)');
  };

  useEffect(() => {
    initAds();
  }, []);
  // ----------------------------------

  // --- NEW: SRS Logic Placeholder ---
  useEffect(() => {
    if (srsEnabled) {
      // Simple algorithm logic: Check if items are due for review
      // For now, we just initialize the system.
      // In a real implementation, this would check localStorage for due dates.
      console.log('SRS System Active: Checking due items...');
    }
  }, [srsEnabled]);
  // ----------------------------------

  // Persist API Key
  const handleSaveKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
    handleBack();
  };

  const handleLanguageChange = (code: LanguageCode) => {
    setLanguage(code);
    localStorage.setItem('app_language', code);
    // Note: We do NOT clear dataCache here anymore to respect persistence requirements.
    // The keys include language code, so mixing isn't an issue.
  }

  // Settings Handlers
  const handleSmartStorageChange = (enabled: boolean) => {
    setSmartStorageEnabled(enabled);
    localStorage.setItem('smart_storage', String(enabled));
  };

  const handleAudioSettingChange = (setting: AudioSetting) => {
    setAudioSetting(setting);
    localStorage.setItem('audio_setting', setting);
  };

  const handleSrsChange = (enabled: boolean) => {
    setSrsEnabled(enabled);
    localStorage.setItem('srs_enabled', String(enabled));
  };

  // Cache Update Handler (With Persistence)
  const handleCacheUpdate = (key: string, data: any) => {
    setDataCache(prev => {
      const newCache = { ...prev, [key]: data };
      try {
        localStorage.setItem('app_persistent_cache', JSON.stringify(newCache));
      } catch (e) {
        console.error("Failed to save cache", e);
      }
      return newCache;
    });
  };

  // History Update Handler
  const handleSaveConversation = (meta: SavedConversationMetadata) => {
    setConversationHistory(prev => {
      // Avoid duplicates based on ID (cacheKey)
      if (prev.some(item => item.id === meta.id)) {
        return prev;
      }
      const newHistory = [meta, ...prev];
      localStorage.setItem('conv_history', JSON.stringify(newHistory));
      return newHistory;
    });
  };

  // Navigation Logic
  const pushView = (view: ViewState) => {
    // Push a new entry to the browser history
    // This allows the Android back button to "go back" to the previous state
    window.history.pushState({ name: view.name }, '', '');
    setViewStack(prev => [...prev, view]);
  };

  const handleBack = () => {
    // Instead of manipulating state directly, we tell the browser to go back.
    // This triggers the 'popstate' event listener defined in useEffect.
    if (viewStack.length > 1) {
      window.history.back();
    }
  };

  const currentView = viewStack[viewStack.length - 1];

  // Helper to get title based on view
  const getTitle = () => {
    switch (currentView.name) {
      case 'HOME': return strings.appName;
      case 'SETTINGS': return strings.settings;
      case 'NOUNS': return strings.nouns;
      case 'NOUN_EXAMPLES': return strings.nounCasesTitle;
      case 'VERBS_INPUT': return strings.verbs;
      case 'VERBS_MENU': return currentView.verb;
      case 'VERBS_DETAIL': return currentView.subcategory;
      case 'VERBS_MEANINGS': return strings.meaningsTitle;
      case 'GRAMMAR_LEVELS': return strings.selectLevel;
      case 'GRAMMAR_TOPICS': return `${strings.topicsFor} ${currentView.level}`;
      case 'GRAMMAR_DETAIL': return currentView.topic.titleAr;
      case 'TOOLS_CATEGORIES': return strings.tools;
      case 'TOOLS_LIST': return currentView.categoryName;
      case 'TOOL_DETAIL': return currentView.tool.word;
      case 'CHAT': return strings.chatTitle;
      case 'CONV_LEVELS': return strings.convTitle;
      case 'CONV_SETUP': return `${strings.convTitle} (${currentView.level})`;
      case 'CONV_RESULT': return currentView.topic;
      case 'CONV_HISTORY': return strings.convHistory;
      default: return strings.appName;
    }
  };

  const audioEnabled = audioSetting !== 'disabled';

  // Render content based on current view state
  const renderContent = () => {
    switch (currentView.name) {
      case 'HOME':
        return (
          <HomeView 
            onNavigate={(to) => pushView({ name: to })} 
            strings={strings}
          />
        );
      case 'SETTINGS':
        return (
          <SettingsView 
            currentKey={apiKey} 
            onSave={handleSaveKey} 
            currentLanguage={language}
            onLanguageChange={handleLanguageChange}
            strings={strings}
            smartStorageEnabled={smartStorageEnabled}
            onSmartStorageChange={handleSmartStorageChange}
            audioSetting={audioSetting}
            onAudioSettingChange={handleAudioSettingChange}
            srsEnabled={srsEnabled}
            onSrsChange={handleSrsChange}
          />
        );
      case 'NOUNS':
        return (
          <NounsView 
            apiKey={apiKey}
            lang={language}
            strings={strings}
            onShowExamples={(noun, article) => 
              pushView({ name: 'NOUN_EXAMPLES', noun, article })
            }
            audioEnabled={audioEnabled}
            cache={dataCache}
            onCacheUpdate={handleCacheUpdate}
            smartStorage={smartStorageEnabled}
          />
        );
      case 'NOUN_EXAMPLES':
        return (
          <NounExamplesView
            noun={currentView.noun}
            article={currentView.article}
            apiKey={apiKey}
            lang={language}
            strings={strings}
            onChat={(de, ar) => 
              pushView({ name: 'CHAT', contextDe: de, contextAr: ar })
            }
            cache={dataCache}
            onCacheUpdate={handleCacheUpdate}
            smartStorage={smartStorageEnabled}
            audioEnabled={audioEnabled}
          />
        );
      case 'VERBS_INPUT':
        return (
          <VerbsView 
            onSelect={(verb) => 
              pushView({ name: 'VERBS_MENU', verb })
            } 
            strings={strings}
          />
        );
      case 'VERBS_MENU':
        return (
          <VerbsMenuView 
            verb={currentView.verb}
            strings={strings}
            onShowMeanings={() => 
              pushView({ name: 'VERBS_MEANINGS', verb: currentView.verb })
            }
            onSelect={(category, subcategory) => 
               pushView({ 
                 name: 'VERBS_DETAIL', 
                 verb: currentView.verb,
                 category,
                 subcategory
               })
            }
          />
        );
      case 'VERBS_MEANINGS':
        return (
          <VerbMeaningsView 
            verb={currentView.verb}
            apiKey={apiKey}
            lang={language}
            strings={strings}
            cache={dataCache}
            onCacheUpdate={handleCacheUpdate}
            smartStorage={smartStorageEnabled}
            audioEnabled={audioEnabled}
          />
        );
      case 'VERBS_DETAIL':
        return (
          <VerbDetailView 
            verb={currentView.verb}
            category={currentView.category}
            subcategory={currentView.subcategory}
            apiKey={apiKey}
            lang={language}
            strings={strings}
            onChat={(de, ar) => 
              pushView({ name: 'CHAT', contextDe: de, contextAr: ar })
            }
            cache={dataCache}
            onCacheUpdate={handleCacheUpdate}
            smartStorage={smartStorageEnabled}
            audioEnabled={audioEnabled}
          />
        );
      case 'GRAMMAR_LEVELS':
        return (
          <GrammarLevelsView 
            strings={strings}
            onSelectLevel={(level) => 
              pushView({ name: 'GRAMMAR_TOPICS', level })
            }
          />
        );
      case 'GRAMMAR_TOPICS':
        return (
          <GrammarTopicsView 
            level={currentView.level}
            apiKey={apiKey}
            lang={language}
            strings={strings}
            onSelectTopic={(topic) => 
              pushView({ name: 'GRAMMAR_DETAIL', level: currentView.level, topic })
            }
            cache={dataCache}
            onCacheUpdate={handleCacheUpdate}
          />
        );
      case 'GRAMMAR_DETAIL':
        return (
          <GrammarDetailView 
            level={currentView.level}
            topic={currentView.topic}
            apiKey={apiKey}
            lang={language}
            strings={strings}
            onTestMe={(contextDe, contextAr) => 
              pushView({ name: 'CHAT', contextDe, contextAr })
            }
            cache={dataCache}
            onCacheUpdate={handleCacheUpdate}
            audioEnabled={audioEnabled}
          />
        );
      case 'TOOLS_CATEGORIES':
        return (
          <ToolsCategoriesView 
            strings={strings}
            onSelectCategory={(id, name) => 
              pushView({ name: 'TOOLS_LIST', categoryId: id, categoryName: name })
            }
          />
        );
      case 'TOOLS_LIST':
        return (
          <ToolsListView 
            categoryId={currentView.categoryId}
            categoryName={currentView.categoryName}
            apiKey={apiKey}
            lang={language}
            strings={strings}
            onSelectTool={(tool) => 
              pushView({ name: 'TOOL_DETAIL', tool, categoryName: currentView.categoryName })
            }
            cache={dataCache}
            onCacheUpdate={handleCacheUpdate}
          />
        );
      case 'TOOL_DETAIL':
        return (
          <ToolDetailView 
            tool={currentView.tool}
            categoryName={currentView.categoryName}
            apiKey={apiKey}
            lang={language}
            strings={strings}
            onChat={(de, ar) => 
              pushView({ name: 'CHAT', contextDe: de, contextAr: ar })
            }
            cache={dataCache}
            onCacheUpdate={handleCacheUpdate}
            smartStorage={smartStorageEnabled}
            audioEnabled={audioEnabled}
          />
        );
      case 'CHAT':
        return (
          <ChatView 
            contextDe={currentView.contextDe}
            contextAr={currentView.contextAr}
            apiKey={apiKey}
            lang={language}
            strings={strings}
          />
        );
      case 'CONV_LEVELS':
        return (
          <ConversationLevelsView 
            strings={strings}
            onSelectLevel={(level, isAustrian) => 
              pushView({ name: 'CONV_SETUP', level, isAustrian })
            }
            onViewHistory={(isAustrian) => pushView({ name: 'CONV_HISTORY', isAustrian })}
          />
        );
      case 'CONV_HISTORY':
        return (
          <ConversationHistoryView 
            history={conversationHistory}
            strings={strings}
            isAustrian={currentView.isAustrian}
            onSelect={(meta) => 
              pushView({ 
                name: 'CONV_RESULT', 
                level: meta.level, 
                topic: meta.topic, 
                length: meta.length,
                isAustrian: meta.isAustrian || false // Fallback for old records
              })
            }
          />
        );
      case 'CONV_SETUP':
        return (
          <ConversationSetupView 
            level={currentView.level}
            isAustrian={currentView.isAustrian}
            strings={strings}
            onStart={(topic, length) => 
              pushView({ 
                name: 'CONV_RESULT', 
                level: currentView.level, 
                topic, 
                length,
                isAustrian: currentView.isAustrian
              })
            }
          />
        );
      case 'CONV_RESULT':
        return (
          <ConversationResultView
            level={currentView.level}
            topic={currentView.topic}
            length={currentView.length}
            isAustrian={currentView.isAustrian}
            apiKey={apiKey}
            lang={language}
            strings={strings}
            cache={dataCache}
            onCacheUpdate={handleCacheUpdate}
            audioEnabled={audioEnabled}
            onSaveHistory={handleSaveConversation}
          />
        );
      default:
        return <div>Unknown View</div>;
    }
  };

  return (
    <Layout
      title={getTitle()}
      onBack={viewStack.length > 1 ? handleBack : undefined}
      onSettings={() => pushView({ name: 'SETTINGS' })}
      showBack={viewStack.length > 1}
      isChat={currentView.name === 'CHAT' || currentView.name === 'CONV_RESULT'} // Handle conversation like chat
      strings={strings}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;
