import { fetchWords } from './api';

// Мокаем fetch глобально
global.fetch = jest.fn();

describe('API Integration', () => {
  beforeEach(() => {
    fetch.mockClear();
  });

  test('fetches words from API successfully', async () => {
    const mockWords = ['apple', 'banana', 'orange'];
    fetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockWords)
    });

    const controller = new AbortController();
    const words = await fetchWords(controller.signal);
    
    expect(words).toEqual(mockWords);
    expect(fetch).toHaveBeenCalledWith(
      'https://random-word-api.herokuapp.com/word?number=150',
      { signal: controller.signal }
    );
  });

  test('uses fallback on API failure', async () => {
    fetch.mockRejectedValueOnce(new Error('API Error'));

    const controller = new AbortController();
    const words = await fetchWords(controller.signal);
    
    expect(words.length).toBeGreaterThan(0);
    expect(words.every(word => typeof word === 'string')).toBe(true);
  });
});