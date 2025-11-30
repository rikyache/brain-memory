import React from 'react';
import { render, screen } from '@testing-library/react-native';
import HomeScreen from './HomeScreen';

// Мока навигации
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    setOptions: jest.fn(),
  }),
}));

describe('HomeScreen', () => {
  test('renders title correctly', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Brain Memory')).toBeTruthy();
  });

  test('displays training sections', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Тренировки')).toBeTruthy();
    expect(screen.getByText('Number Memory')).toBeTruthy();
    expect(screen.getByText('Sequence Memory')).toBeTruthy();
    expect(screen.getByText('Chimp Test')).toBeTruthy();
  });

  test('displays profile section', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Профиль и настройки')).toBeTruthy();
    expect(screen.getByText('Профиль')).toBeTruthy();
    expect(screen.getByText('Настройки')).toBeTruthy();
    expect(screen.getByText('О нас')).toBeTruthy();
  });
});