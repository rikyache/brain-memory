import React from 'react';
import { render, screen } from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen';

// Мокаем навигацию
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    setOptions: jest.fn(),
  }),
}));

// Мокаем хранение данных
jest.mock('../lib/storage', () => ({
  saveJSON: jest.fn(),
  loadJSON: jest.fn(() => Promise.resolve(null)),
  removeKey: jest.fn(),
}));

// Мокаем звуки
jest.mock('../lib/sound', () => ({
  click: jest.fn(),
  play: jest.fn(),
}));

describe('User Flow', () => {
  test('renders HomeScreen with training sections', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Тренировки')).toBeTruthy();
    expect(screen.getByText('Number Memory')).toBeTruthy();
  });
});