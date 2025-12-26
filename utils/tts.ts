
import { Capacitor } from '@capacitor/core';
import { TextToSpeech } from '@capacitor-community/text-to-speech';

export const speakGerman = async (text: string, rate: number = 1.0, pitch: number = 1.0) => {
  // 1. Handle specific pronoun groups first
  let speechText = text.replace(/er\/sie\/es/gi, 'er'); // Case insensitive for safety
  speechText = speechText.replace(/sie\/Sie/g, 'sie');
  
  // 2. Remove all remaining slashes
  speechText = speechText.replace(/\//g, '');
  
  // Check if running on a native platform (Android/iOS)
  if (Capacitor.isNativePlatform()) {
    try {
      // Use the Capacitor Community Plugin
      // Note: Rate in plugin: 1.0 is normal.
      await TextToSpeech.speak({
        text: speechText,
        lang: 'de-DE',
        rate: rate,
        pitch: pitch,
        volume: 1.0,
        category: 'ambient',
      });
    } catch (error) {
      console.error('Native TTS Error:', error);
    }
  } else {
    // --- Existing Web Speech API Logic for Browser/PWA ---
    if (!window.speechSynthesis) return;
    
    // Cancel previous speech to avoid overlapping
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(speechText);
    utterance.lang = 'de-DE';
    
    // Web Speech API rate: 1 is normal, 0.1 is lowest, 10 is highest.
    // We adjust slightly because web voices can be fast.
    // If user wants slow (e.g. 0.5 passed), we use 0.6. Normal 1.0 -> 0.9 for clarity.
    utterance.rate = rate < 1.0 ? 0.6 : 0.9; 
    utterance.pitch = pitch;

    // Android WebViews often return an empty array for getVoices() initially.
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      const germanVoice = voices.find(v => v.lang === 'de-DE' && v.name.includes('Google')) || 
                          voices.find(v => v.lang.startsWith('de'));
      if (germanVoice) {
        utterance.voice = germanVoice;
      }
    }

    window.speechSynthesis.speak(utterance);
  }
};
