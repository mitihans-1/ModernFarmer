import { Language } from '../types';

export function speakMessage(text: string, language: Language = 'en') {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    return;
  }

  try {
    window.speechSynthesis.cancel(); // Stop any pending utterance
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;

    // Map language code
    if (language === 'am') {
      utterance.lang = 'am-ET';
    } else if (language === 'om') {
      utterance.lang = 'om-ET';
    } else if (language === 'ti') {
      utterance.lang = 'ti-ET';
    } else {
      utterance.lang = 'en-US';
    }

    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn('Speech synthesis unavailable:', e);
  }
}

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
