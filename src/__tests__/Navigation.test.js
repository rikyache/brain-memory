import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';

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

describe('Navigation', () => {
  test('renders HomeScreen correctly', () => {
    render(<HomeScreen />);
    expect(screen.getByText('Brain Memory')).toBeTruthy();
  });
});