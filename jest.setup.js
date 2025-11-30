// jest.setup.js
import 'react-native-gesture-handler/jestSetup';
import { jest } from '@jest/globals';

// Мокаем таймеры
jest.useFakeTimers();

// Мокаем нативные модули
jest.mock('expo-av', () => ({
  Audio: {
    setAudioModeAsync: jest.fn(),
    Sound: jest.fn(() => ({
      loadAsync: jest.fn(),
      playAsync: jest.fn(),
      unloadAsync: jest.fn(),
      setVolumeAsync: jest.fn(),
      setPositionAsync: jest.fn(),
    })),
  },
}));

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(),
  ImpactFeedbackStyle: {
    Medium: 'medium'
  }
}));