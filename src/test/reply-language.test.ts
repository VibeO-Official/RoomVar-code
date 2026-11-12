import { describe, expect, it } from 'vitest';
import { detectReplyLanguage, languageInstruction } from '../lib/reply-language';

describe('reply language follows the latest user message', () => {
  it('keeps Russian greetings Russian even with an English preference', () => {
    expect(detectReplyLanguage('привет', 'en')).toBe('ru');
  });
  it('recognizes Uzbek and English', () => {
    expect(detectReplyLanguage('Salom, menga yordam kerak')).toBe('uz');
    expect(detectReplyLanguage('Hello, can you help me?')).toBe('en');
  });
  it('uses the configured fallback for ambiguous messages', () => {
    expect(detectReplyLanguage('123?', 'uz')).toBe('uz');
    expect(languageInstruction('ru')).toContain('respond entirely in Russian');
  });
});