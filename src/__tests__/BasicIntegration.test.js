import React from 'react';
import { render, screen } from '@testing-library/react-native';
import HomeScreen from '../screens/HomeScreen';

// Простые моки
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    setOptions: jest.fn(),
  }),
}));

describe('Basic Integration Tests', () => {
  test('HomeScreen renders without crashing', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Brain Memory')).toBeTruthy();
  });

  test('HomeScreen displays all game options', () => {
    render(<HomeScreen />);
    
    expect(screen.getByText('Number Memory')).toBeTruthy();
    expect(screen.getByText('Sequence Memory')).toBeTruthy();
    expect(screen.getByText('Chimp Test')).toBeTruthy();
    expect(screen.getByText('Verbal Memory')).toBeTruthy();
    expect(screen.getByText('Card Match (эмодзи)')).toBeTruthy();
  });

  test('HomeScreen displays profile and settings options', () => {
    render(<HomeScreen />);
    
    expect(screen.getByText('Профиль')).toBeTruthy();
    expect(screen.getByText('Настройки')).toBeTruthy();
    expect(screen.getByText('О нас')).toBeTruthy();
  });
});