import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import Navigator from '../navigation';

// Моки
jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn(),
    Sound: jest.fn(() => ({
      loadAsync: jest.fn(),
      playAsync: jest.fn(),
      unloadAsync: jest.fn(),
    })),
  },
}));

jest.mock('../lib/sound', () => ({
  initSoundSettings: jest.fn(),
  click: jest.fn(),
  play: jest.fn(),
  getState: jest.fn(() => ({
    soundEnabled: true,
    hapticsEnabled: true,
    volume: 1.0
  })),
  setSoundEnabled: jest.fn(),
  setHapticsEnabled: jest.fn(),
  setVolume: jest.fn(),
}));

jest.mock('../lib/storage', () => ({
  saveJSON: jest.fn(),
  loadJSON: jest.fn(() => Promise.resolve(null)),
  removeKey: jest.fn(),
}));

describe('Navigation Integration', () => {
  test('navigates from Home to Number Memory game', async () => {
    render(
      <NavigationContainer>
        <Navigator />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(screen.getByText('Brain Memory')).toBeTruthy();
    });

    const numberMemoryButton = screen.getByText('Number Memory');
    fireEvent.press(numberMemoryButton);

    await waitFor(() => {
      expect(screen.getByText(/Level \d+/)).toBeTruthy();
    });
  });

  test('navigates from Home to Settings', async () => {
    render(
      <NavigationContainer>
        <Navigator />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(screen.getByText('Brain Memory')).toBeTruthy();
    });

    const settingsButton = screen.getByText('Настройки');
    fireEvent.press(settingsButton);

    await waitFor(() => {
      expect(screen.getByText('Звук интерфейса')).toBeTruthy();
    });
  });

  test('navigates from Home to Profile', async () => {
    render(
      <NavigationContainer>
        <Navigator />
      </NavigationContainer>
    );

    await waitFor(() => {
      expect(screen.getByText('Brain Memory')).toBeTruthy();
    });

    const profileButton = screen.getByText('Профиль');
    fireEvent.press(profileButton);

    await waitFor(() => {
      expect(screen.getByText('Number Memory: 0')).toBeTruthy();
    });
  });
});