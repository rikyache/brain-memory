import { randInt, shuffle, genNumberOfDigits } from './utils';

describe('randInt', () => {
  test('generates random integer between min and max', () => {
    const result = randInt(1, 10);
    expect(result).toBeGreaterThanOrEqual(1);
    expect(result).toBeLessThanOrEqual(10);
  });

  test('works with negative numbers', () => {
    const result = randInt(-5, 5);
    expect(result).toBeGreaterThanOrEqual(-5);
    expect(result).toBeLessThanOrEqual(5);
  });
});

describe('shuffle', () => {
  test('shuffles array elements', () => {
    const original = [1, 2, 3, 4, 5];
    const shuffled = shuffle(original);
    
    expect(shuffled).not.toEqual(original);
    expect(shuffled.length).toBe(original.length);
    expect(shuffled.sort()).toEqual(original.sort());
  });

  test('returns empty array when given empty array', () => {
    expect(shuffle([])).toEqual([]);
  });
});

describe('genNumberOfDigits', () => {
  test('generates number with correct number of digits', () => {
    const result = genNumberOfDigits(3);
    expect(result.length).toBe(3);
    const num = parseInt(result);
    expect(num).toBeGreaterThanOrEqual(100);
    expect(num).toBeLessThanOrEqual(999);
  });

  test('handles single digit correctly', () => {
    const result = genNumberOfDigits(1);
    expect(result.length).toBe(1);
    const num = parseInt(result);
    expect(num).toBeGreaterThanOrEqual(0);
    expect(num).toBeLessThanOrEqual(9);
  });
});