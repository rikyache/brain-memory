const mockAudio = {
  Sound: jest.fn(() => ({
    loadAsync: jest.fn(),
    playAsync: jest.fn(),
    setPositionAsync: jest.fn(),
    setVolumeAsync: jest.fn(),
    unloadAsync: jest.fn(),
  })),
  setAudioModeAsync: jest.fn(),
};

export const Audio = mockAudio;