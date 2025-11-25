// src/screens/NumberMemory.test.js
import React from 'react';
import { render, screen, act } from '@testing-library/react-native';
import NumberMemoryScreen from './NumberMemoryScreen';

// Моки
jest.mock('../lib/sound', () => ({
  match: jest.fn(),
  lose: jest.fn(),
  record: jest.fn()
}));

jest.mock('../lib/storage', () => ({
  saveJSON: jest.fn(),
  loadJSON: jest.fn(() => Promise.resolve(0))
}));

jest.mock('../lib/utils', () => ({
  genNumberOfDigits: jest.fn().mockReturnValue('123'),
  randInt: jest.fn(),
  shuffle: jest.fn(arr => arr),
}));

describe('Number Memory Screen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders initial game state correctly', async () => {
    render(<NumberMemoryScreen />);
    
    // Ожидаем асинхронные обновления
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(screen.getByText(/Level 1/)).toBeTruthy();
    expect(screen.getByText(/Best 0/)).toBeTruthy();
  });

  test('displays target number in show phase', async () => {
    render(<NumberMemoryScreen />);
    
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
    
    expect(screen.getByText('123')).toBeTruthy();
  });
});