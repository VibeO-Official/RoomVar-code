export type ReplyLanguage = 'ru' | 'uz' | 'en';

export function detectReplyLanguage(text: string, fallback: ReplyLanguage = 'ru'): ReplyLanguage {
  if (/[а-яё]/iu.test(text)) return 'ru';
  if (/[ʻʼ‘’]/u.test(text) || /\b(salom|rahmat|qanday|menga|xonam|xona|rasm|kerak|yordam|assalomu|al[ae]ykum)\b/iu.test(text)) return 'uz';
  if (/\b(hello|hi|hey|please|thanks|thank|help|my|the|what|how|can|design|room)\b/iu.test(text)) return 'en';
  return fallback;
}

export function languageInstruction(language: ReplyLanguage) {
  const names = { ru: 'Russian', uz: 'Uzbek (Latin script)', en: 'English' };
  return `The latest user message determines the response language. For this turn, respond entirely in ${names[language]}. Never mix languages in a sentence or greeting. Ignore the language of earlier assistant replies. Do not insert Spanish or Portuguese phrases. A Russian greeting such as "привет" requires a fully Russian response. Translate explanatory prose into the selected language; preserve only proper names, URLs and code.`;
}