import { 
  initSound, 
  play, 
  setSoundEnabled, 
  setVolume,
  getState 
} from './sound';

// Мокаем Expo зависимости
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

jest.mock('./storage', () => ({
  saveJSON: jest.fn(),
  loadJSON: jest.fn(() => Promise.resolve(true)),
  removeKey: jest.fn(),
}));

describe('Sound System', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initializes sound settings correctly', async () => {
    await initSound();
    
    const state = getState();
    expect(state).toHaveProperty('soundEnabled');
    expect(state).toHaveProperty('hapticsEnabled');
    expect(state).toHaveProperty('volume');
  });

  test('toggles sound enabled state', async () => {
    await setSoundEnabled(false);
    expect(getState().soundEnabled).toBe(false);
  });

  test('adjusts volume correctly', async () => {
    await setVolume(0.5);
    expect(getState().volume).toBe(0.5);
  });
});